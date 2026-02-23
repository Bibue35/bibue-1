import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { CollapsibleNavbar } from "@/components/CollapsibleNavbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, Send, Copy, Play, ChevronUp, ChevronDown, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Party {
  id: string;
  host_id: string;
  title: string;
  anime_id: number;
  anime_title: string;
  anime_image: string | null;
  current_episode: number;
  status: string;
  share_code: string;
}

interface Member {
  id: string;
  user_id: string;
  profile?: { username: string | null; avatar_url: string | null };
}

interface ChatMsg {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  profile?: { username: string | null };
}

export default function WatchPartyPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [party, setParty] = useState<Party | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load party data
  useEffect(() => {
    if (!code) return;
    const load = async () => {
      const { data: p } = await supabase
        .from("watch_parties")
        .select("*")
        .eq("share_code", code)
        .single();

      if (!p) { setLoading(false); return; }
      setParty(p);

      // Load members with profiles
      const { data: m } = await supabase
        .from("watch_party_members")
        .select("id, user_id")
        .eq("party_id", p.id);
      
      if (m) {
        const userIds = m.map(x => x.user_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, username, avatar_url")
          .in("user_id", [...userIds, p.host_id]);
        
        const profileMap = new Map(profiles?.map(pr => [pr.user_id, pr]) || []);
        setMembers(m.map(x => ({ ...x, profile: profileMap.get(x.user_id) as any })));
      }

      // Load chat messages
      const { data: msgs } = await supabase
        .from("watch_party_messages")
        .select("id, user_id, content, created_at")
        .eq("party_id", p.id)
        .order("created_at", { ascending: true })
        .limit(100);

      if (msgs) {
        const uids = [...new Set(msgs.map(m => m.user_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, username")
          .in("user_id", uids);
        const pMap = new Map(profiles?.map(pr => [pr.user_id, pr]) || []);
        setMessages(msgs.map(m => ({ ...m, profile: pMap.get(m.user_id) as any })));
      }

      // Auto-join if authenticated
      if (user) {
        await supabase.from("watch_party_members").upsert(
          { party_id: p.id, user_id: user.id },
          { onConflict: "party_id,user_id" }
        );
      }

      setLoading(false);
    };
    load();
  }, [code, user]);

  // Real-time chat subscription
  useEffect(() => {
    if (!party) return;

    const channel = supabase
      .channel(`party-${party.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "watch_party_messages", filter: `party_id=eq.${party.id}` }, async (payload) => {
        const msg = payload.new as any;
        const { data: profile } = await supabase
          .from("profiles")
          .select("user_id, username")
          .eq("user_id", msg.user_id)
          .single();
        setMessages(prev => [...prev, { ...msg, profile }]);
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "watch_party_members", filter: `party_id=eq.${party.id}` }, () => {
        // Refresh members
        supabase
          .from("watch_party_members")
          .select("id, user_id")
          .eq("party_id", party.id)
          .then(({ data }) => {
            if (data) setMembers(data.map(x => ({ ...x })));
          });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [party]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!message.trim() || !party || !user) return;
    const content = message.trim();
    setMessage("");

    await supabase.from("watch_party_messages").insert({
      party_id: party.id,
      user_id: user.id,
      content,
    });
  };

  const updateEpisode = async (delta: number) => {
    if (!party || !user || party.host_id !== user.id) return;
    const next = Math.max(1, party.current_episode + delta);
    await supabase.from("watch_parties").update({ current_episode: next }).eq("id", party.id);
    setParty(p => p ? { ...p, current_episode: next } : null);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/party/${party?.share_code}`);
    toast({ title: "Link copied!" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <CollapsibleNavbar />
        <div className="pt-28 text-center text-muted-foreground">Loading party...</div>
      </div>
    );
  }

  if (!party) {
    return (
      <div className="min-h-screen bg-background">
        <CollapsibleNavbar />
        <div className="pt-28 text-center">
          <h1 className="text-2xl font-bold mb-2">Party not found</h1>
          <p className="text-muted-foreground mb-4">This watch party doesn't exist or has ended.</p>
          <Button onClick={() => navigate("/")}>Go Home</Button>
        </div>
      </div>
    );
  }

  const isHost = user?.id === party.host_id;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO title={`Watch Party: ${party.anime_title}`} description={`Join the watch party for ${party.anime_title}`} noIndex />
      <CollapsibleNavbar />

      <div className="flex-1 pt-20 pb-4 container mx-auto px-4 flex flex-col lg:flex-row gap-4 max-h-screen">
        {/* Main content */}
        <div className="flex-1 space-y-4">
          {/* Party header */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/40 border border-border/30">
            {party.anime_image && (
              <img src={party.anime_image} alt="" className="w-16 h-20 rounded-lg object-cover" />
            )}
            <div className="flex-1 min-w-0">
              <h1 className="font-bold text-lg truncate">{party.title}</h1>
              <p className="text-sm text-muted-foreground truncate">{party.anime_title}</p>
            </div>
            <Button variant="outline" size="sm" onClick={copyLink} className="gap-1.5 shrink-0">
              <Copy className="w-3.5 h-3.5" /> Invite
            </Button>
          </div>

          {/* Episode tracker */}
          <div className="flex items-center justify-center gap-4 p-6 rounded-xl bg-muted/40 border border-border/30">
            <div className="text-center">
              <div className="flex items-center gap-3">
                {isHost && (
                  <Button variant="ghost" size="icon" onClick={() => updateEpisode(-1)} className="rounded-full h-8 w-8">
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                )}
                <div>
                  <Play className="w-8 h-8 text-primary mx-auto mb-1" />
                  <span className="text-3xl font-bold">Episode {party.current_episode}</span>
                </div>
                {isHost && (
                  <Button variant="ghost" size="icon" onClick={() => updateEpisode(1)} className="rounded-full h-8 w-8">
                    <ChevronUp className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {isHost ? "You control the episode" : "Synced by host"}
              </p>
            </div>
          </div>

          {/* Members */}
          <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/40 border border-border/30">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{members.length + 1} watching</span>
            <div className="flex -space-x-2 ml-2">
              {members.slice(0, 8).map(m => (
                <Avatar key={m.id} className="w-7 h-7 border-2 border-background">
                  <AvatarFallback className="text-[10px]">
                    {(m.profile?.username || "U")[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
          </div>
        </div>

        {/* Chat sidebar */}
        <div className="w-full lg:w-96 flex flex-col rounded-xl bg-muted/40 border border-border/30 overflow-hidden" style={{ height: "calc(100vh - 120px)" }}>
          <div className="p-3 border-b border-border/30 font-semibold text-sm">
            Party Chat
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {messages.map(msg => (
              <div key={msg.id} className={cn("flex gap-2", msg.user_id === user?.id && "flex-row-reverse")}>
                <div className={cn(
                  "max-w-[80%] px-3 py-2 rounded-xl text-sm",
                  msg.user_id === user?.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}>
                  {msg.user_id !== user?.id && (
                    <span className="text-[10px] font-medium text-muted-foreground block mb-0.5">
                      {msg.profile?.username || "User"}
                    </span>
                  )}
                  {msg.content}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          {user && (
            <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="p-3 border-t border-border/30 flex gap-2">
              <Input
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Say something..."
                className="flex-1 rounded-full h-9 text-sm"
              />
              <Button type="submit" size="icon" className="rounded-full h-9 w-9 shrink-0" disabled={!message.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
