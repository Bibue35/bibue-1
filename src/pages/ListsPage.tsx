import { useState } from "react";
import { SEO, itemListJsonLd } from "@/components/SEO";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CollapsibleNavbar } from "@/components/CollapsibleNavbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Plus, Heart, Lock, Globe, Loader2, List } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function ListsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  const { data: popularLists, isLoading: popularLoading } = useQuery({
    queryKey: ["lists", "popular"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_lists")
        .select("*, profiles:user_id (username, avatar_url)")
        .eq("is_public", true)
        .order("likes_count", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
  });

  const { data: newLists, isLoading: newLoading } = useQuery({
    queryKey: ["lists", "new"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_lists")
        .select("*, profiles:user_id (username, avatar_url)")
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
  });

  const { data: myLists, isLoading: myLoading } = useQuery({
    queryKey: ["lists", "mine", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("user_lists")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const createList = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Sign in required");
      if (!title.trim()) throw new Error("Title is required");
      const slug = slugify(title);
      const { data, error } = await supabase
        .from("user_lists")
        .insert({ user_id: user.id, title: title.trim(), description: description.trim() || null, slug, is_public: isPublic })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["lists"] });
      setCreateOpen(false);
      setTitle("");
      setDescription("");
      toast({ title: "List created!" });
      navigate(`/list/${data.id}`);
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Anime & Manga Lists — Bibue" description="Browse and create anime & manga lists on Bibue." url="/lists" jsonLd={itemListJsonLd("Anime Lists", "/lists")} />
      <CollapsibleNavbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold font-sacred">Lists</h1>
              <p className="text-muted-foreground mt-1">Curated anime & manga collections</p>
            </div>
            {user && (
              <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2"><Plus className="w-4 h-4" /> Create List</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Create New List</DialogTitle></DialogHeader>
                  <div className="space-y-4 mt-2">
                    <div>
                      <Label>Title</Label>
                      <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="My Top 10 Isekai Anime" maxLength={100} />
                    </div>
                    <div>
                      <Label>Description (optional)</Label>
                      <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="A collection of..." maxLength={500} rows={3} />
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={isPublic} onCheckedChange={setIsPublic} />
                      <Label className="flex items-center gap-1.5">
                        {isPublic ? <><Globe className="w-4 h-4" /> Public</> : <><Lock className="w-4 h-4" /> Private</>}
                      </Label>
                    </div>
                    <Button onClick={() => createList.mutate()} disabled={createList.isPending || !title.trim()} className="w-full">
                      {createList.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Create List
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          <Tabs defaultValue={user ? "my" : "popular"}>
            <TabsList className="mb-6">
              {user && <TabsTrigger value="my">My Lists</TabsTrigger>}
              <TabsTrigger value="popular">Popular</TabsTrigger>
              <TabsTrigger value="new">New</TabsTrigger>
            </TabsList>

            {user && (
              <TabsContent value="my">
                <ListGrid lists={myLists} loading={myLoading} emptyMessage="You haven't created any lists yet." showPrivate />
              </TabsContent>
            )}
            <TabsContent value="popular">
              <ListGrid lists={popularLists} loading={popularLoading} emptyMessage="No lists yet. Be the first!" />
            </TabsContent>
            <TabsContent value="new">
              <ListGrid lists={newLists} loading={newLoading} emptyMessage="No lists yet." />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function ListGrid({ lists, loading, emptyMessage, showPrivate }: { lists: any[] | undefined; loading: boolean; emptyMessage: string; showPrivate?: boolean }) {
  if (loading) return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
    </div>
  );

  if (!lists?.length) return <p className="text-center text-muted-foreground py-12">{emptyMessage}</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {lists.map(list => (
        <Link key={list.id} to={`/list/${list.id}`} className="liquid-glass rounded-xl p-4 hover:bg-accent/5 transition-colors group">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate group-hover:text-primary transition-colors">{list.title}</h3>
              {(list as any).profiles && (
                <p className="text-xs text-muted-foreground">by @{(list as any).profiles.username || "user"}</p>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {!list.is_public && <Lock className="w-3 h-3" />}
              <Heart className="w-3 h-3" />
              <span>{list.likes_count}</span>
            </div>
          </div>
          {list.description && <p className="text-xs text-muted-foreground line-clamp-2">{list.description}</p>}
        </Link>
      ))}
    </div>
  );
}
