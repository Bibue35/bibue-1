import { useState } from "react";
import { SEO } from "@/components/SEO";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CollapsibleNavbar } from "@/components/CollapsibleNavbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Heart, ArrowLeft, Plus, Trash2, Loader2, Lock, Globe, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { searchAnime } from "@/lib/api";

export default function ListDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [addingEntry, setAddingEntry] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (q.length < 2) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const results = await searchAnime(q);
      setSearchResults(results.slice(0, 8));
    } catch { setSearchResults([]); }
    finally { setSearching(false); }
  };

  const { data: list, isLoading } = useQuery({
    queryKey: ["list", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_lists")
        .select("*, profiles:user_id (username, avatar_url, user_id)")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: entries, isLoading: entriesLoading } = useQuery({
    queryKey: ["list-entries", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("list_entries")
        .select("*")
        .eq("list_id", id)
        .order("position", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const isOwner = user?.id === (list?.profiles as any)?.user_id;

  // Like logic
  const { data: userLiked } = useQuery({
    queryKey: ["list-like", id, user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data } = await supabase
        .from("list_likes")
        .select("id")
        .eq("list_id", id)
        .eq("user_id", user.id)
        .maybeSingle();
      return !!data;
    },
    enabled: !!user && !!id,
  });

  const toggleLike = useMutation({
    mutationFn: async () => {
      if (!user || !id) throw new Error("Sign in required");
      if (userLiked) {
        await supabase.from("list_likes").delete().eq("list_id", id).eq("user_id", user.id);
      } else {
        await supabase.from("list_likes").insert({ list_id: id, user_id: user.id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["list-like", id] });
      queryClient.invalidateQueries({ queryKey: ["list", id] });
    },
  });

  const addEntry = useMutation({
    mutationFn: async (item: { mal_id: number; title: string; image_url?: string; media_type?: string }) => {
      if (!user || !id) throw new Error("Sign in required");
      const position = (entries?.length || 0) + 1;
      const { error } = await supabase.from("list_entries").insert({
        list_id: id, mal_id: item.mal_id, title: item.title, image_url: item.image_url || null,
        media_type: item.media_type || "anime", position,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["list-entries", id] });
      setAddingEntry(false);
      toast({ title: "Entry added!" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const removeEntry = useMutation({
    mutationFn: async (entryId: string) => {
      const { error } = await supabase.from("list_entries").delete().eq("id", entryId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["list-entries", id] });
      toast({ title: "Entry removed" });
    },
  });

  const deleteList = useMutation({
    mutationFn: async () => {
      if (!id) return;
      const { error } = await supabase.from("user_lists").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "List deleted" });
      navigate("/lists");
    },
  });

  if (isLoading) return (
    <div className="min-h-screen bg-background">
      <CollapsibleNavbar />
      <main className="pt-24 pb-16 container mx-auto px-4">
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-4 w-96 mb-8" />
        {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 w-full mb-3 rounded-xl" />)}
      </main>
    </div>
  );

  if (!list) return (
    <div className="min-h-screen bg-background">
      <CollapsibleNavbar />
      <main className="pt-24 pb-16 container mx-auto px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">List not found</h1>
        <Button onClick={() => navigate("/lists")}>Back to Lists</Button>
      </main>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <SEO title={`${list.title} — Bibue`} description={list.description || `A curated list on Bibue.`} url={`/list/${id}`} />
      <CollapsibleNavbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-3 sm:px-4 max-w-3xl">
          {/* Header */}
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl font-bold font-sacred">{list.title}</h1>
                {list.is_public ? <Globe className="w-4 h-4 text-muted-foreground" /> : <Lock className="w-4 h-4 text-muted-foreground" />}
              </div>
              {list.description && <p className="text-muted-foreground text-sm mb-2">{list.description}</p>}
              {(list as any).profiles && (
                <p className="text-xs text-muted-foreground">by @{(list as any).profiles.username}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {user && (
                <Button variant={userLiked ? "default" : "outline"} size="sm" onClick={() => toggleLike.mutate()} className="gap-1.5">
                  <Heart className={cn("w-4 h-4", userLiked && "fill-current")} />
                  {list.likes_count}
                </Button>
              )}
            </div>
          </div>

          {/* Entries */}
          <div className="space-y-2 mb-6">
            {entriesLoading ? (
              Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)
            ) : entries?.length ? (
              entries.map((entry, idx) => (
                <div key={entry.id} className="flex items-center gap-3 liquid-glass rounded-xl p-3">
                  <span className="text-lg font-bold text-muted-foreground w-8 text-center">{idx + 1}</span>
                  {entry.image_url && (
                    <img src={entry.image_url} alt={entry.title} className="w-10 h-14 rounded-lg object-cover" />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">{entry.title}</h3>
                    <p className="text-xs text-muted-foreground capitalize">{entry.media_type}{entry.entry_type ? ` • ${entry.entry_type}` : ""}</p>
                    {entry.note && <p className="text-xs text-muted-foreground mt-0.5 italic">{entry.note}</p>}
                  </div>
                  {isOwner && (
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeEntry.mutate(entry.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">No entries yet.</p>
            )}
          </div>

          {/* Add entry (owner only) */}
          {isOwner && (
            <div className="space-y-3">
              {addingEntry ? (
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={searchQuery}
                      onChange={e => handleSearch(e.target.value)}
                      placeholder="Search anime to add..."
                      className="pl-9"
                      autoFocus
                    />
                  </div>
                  {searching && <div className="text-xs text-muted-foreground p-2"><Loader2 className="w-3 h-3 animate-spin inline mr-1" />Searching...</div>}
                  {searchResults.map(item => (
                    <button
                      key={item.anilist_id}
                      onClick={() => {
                        addEntry.mutate({ mal_id: item.anilist_id, title: item.title, image_url: item.images?.webp?.large_image_url });
                        setSearchQuery("");
                        setSearchResults([]);
                      }}
                      className="flex items-center gap-2 w-full p-2 rounded-lg hover:bg-muted text-left text-sm"
                    >
                      <img src={item.images?.webp?.large_image_url} alt="" className="w-8 h-10 rounded object-cover" />
                      <span className="truncate">{item.title}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <Button variant="outline" onClick={() => setAddingEntry(true)} className="gap-2 w-full">
                  <Plus className="w-4 h-4" /> Add Entry
                </Button>
              )}

              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => {
                if (confirm("Delete this list?")) deleteList.mutate();
              }}>
                <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete List
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
