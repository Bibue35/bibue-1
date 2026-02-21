import { useState } from "react";
import { SEO } from "@/components/SEO";
import { useNavigate } from "react-router-dom";
import { CollapsibleNavbar } from "@/components/CollapsibleNavbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Download, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

const STATUS_MAP: Record<string, string> = {
  watching: "watching", completed: "completed", on_hold: "on_hold",
  dropped: "dropped", plan_to_watch: "plan_to_watch",
  // MAL statuses
  "Watching": "watching", "Completed": "completed", "On-Hold": "on_hold",
  "Dropped": "dropped", "Plan to Watch": "plan_to_watch",
  // AniList statuses
  CURRENT: "watching", COMPLETED: "completed", PAUSED: "on_hold",
  DROPPED: "dropped", PLANNING: "plan_to_watch", REPEATING: "watching",
};

interface ImportResult {
  added: number;
  skipped: number;
  errors: number;
  total: number;
}

export default function ImportPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [source, setSource] = useState<"mal" | "anilist" | null>(null);
  const [username, setUsername] = useState("");
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState("");
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const importFromMAL = async () => {
    if (!user || !username.trim()) return;
    setImporting(true);
    setError(null);
    setResult(null);
    setProgress(0);

    try {
      // Fetch anime list from Jikan
      setProgressText("Fetching anime list...");
      const res = await fetch(`https://api.jikan.moe/v4/users/${encodeURIComponent(username.trim())}/animelist?limit=300`);
      if (res.status === 404) throw new Error("Username not found on MyAnimeList");
      if (res.status === 403) throw new Error("This profile is private");
      if (!res.ok) throw new Error("Failed to fetch from MyAnimeList");

      const data = await res.json();
      const items = data.data || [];
      const total = items.length;
      let added = 0, skipped = 0, errors = 0;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        setProgress(Math.round(((i + 1) / total) * 100));
        setProgressText(`Importing... ${i + 1}/${total} anime`);

        try {
          const { error: upsertErr } = await supabase.from("watchlist").upsert({
            user_id: user.id,
            mal_id: item.anime?.mal_id || item.mal_id,
            media_type: "anime",
            title: item.anime?.title || item.title || "Unknown",
            image_url: item.anime?.images?.jpg?.large_image_url || null,
            status: STATUS_MAP[item.watching_status_string || item.status] || "plan_to_watch",
            score: item.score || null,
            episodes_watched: item.episodes_watched || 0,
          }, { onConflict: "user_id,mal_id,media_type" });

          if (upsertErr) { errors++; } else { added++; }
        } catch { errors++; }
      }

      // Also try manga
      setProgressText("Fetching manga list...");
      try {
        await new Promise(r => setTimeout(r, 1000)); // Rate limit
        const mangaRes = await fetch(`https://api.jikan.moe/v4/users/${encodeURIComponent(username.trim())}/mangalist?limit=300`);
        if (mangaRes.ok) {
          const mangaData = await mangaRes.json();
          const mangaItems = mangaData.data || [];
          for (let i = 0; i < mangaItems.length; i++) {
            const item = mangaItems[i];
            setProgressText(`Importing manga... ${i + 1}/${mangaItems.length}`);
            try {
              await supabase.from("watchlist").upsert({
                user_id: user.id,
                mal_id: item.manga?.mal_id || item.mal_id,
                media_type: "manga",
                title: item.manga?.title || item.title || "Unknown",
                image_url: item.manga?.images?.jpg?.large_image_url || null,
                status: STATUS_MAP[item.reading_status_string || item.status] || "plan_to_watch",
                score: item.score || null,
                chapters_read: item.chapters_read || 0,
              }, { onConflict: "user_id,mal_id,media_type" });
              added++;
            } catch { errors++; }
          }
        }
      } catch { /* manga fetch failed, that's ok */ }

      setResult({ added, skipped, errors, total: added + skipped + errors });
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
      toast({ title: "Import complete!", description: `Added ${added} entries to your library.` });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setImporting(false);
      setProgressText("");
    }
  };

  const importFromAniList = async () => {
    if (!user || !username.trim()) return;
    setImporting(true);
    setError(null);
    setResult(null);
    setProgress(0);

    try {
      setProgressText("Fetching from AniList...");
      const query = `
        query ($username: String) {
          MediaListCollection(userName: $username, type: ANIME) {
            lists { entries { mediaId status score progress media { title { romaji english } coverImage { large } } } }
          }
        }
      `;
      const res = await fetch("https://graphql.anilist.co", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, variables: { username: username.trim() } }),
      });
      const json = await res.json();
      if (json.errors) {
        const errMsg = json.errors[0]?.message || "Failed to fetch";
        if (errMsg.includes("not found")) throw new Error("Username not found on AniList");
        if (errMsg.includes("private")) throw new Error("This profile is private");
        throw new Error(errMsg);
      }

      const lists = json.data?.MediaListCollection?.lists || [];
      const allEntries = lists.flatMap((l: any) => l.entries);
      const total = allEntries.length;
      let added = 0, skipped = 0, errors = 0;

      for (let i = 0; i < allEntries.length; i++) {
        const entry = allEntries[i];
        setProgress(Math.round(((i + 1) / total) * 100));
        setProgressText(`Importing... ${i + 1}/${total} anime`);

        try {
          const { error: upsertErr } = await supabase.from("watchlist").upsert({
            user_id: user.id,
            mal_id: entry.mediaId,
            media_type: "anime",
            title: entry.media?.title?.english || entry.media?.title?.romaji || "Unknown",
            image_url: entry.media?.coverImage?.large || null,
            status: STATUS_MAP[entry.status] || "plan_to_watch",
            score: entry.score || null,
            episodes_watched: entry.progress || 0,
          }, { onConflict: "user_id,mal_id,media_type" });

          if (upsertErr) { errors++; } else { added++; }
        } catch { errors++; }
      }

      // Also try manga
      setProgressText("Fetching manga...");
      try {
        const mangaQuery = `
          query ($username: String) {
            MediaListCollection(userName: $username, type: MANGA) {
              lists { entries { mediaId status score progress media { title { romaji english } coverImage { large } } } }
            }
          }
        `;
        const mangaRes = await fetch("https://graphql.anilist.co", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: mangaQuery, variables: { username: username.trim() } }),
        });
        const mangaJson = await mangaRes.json();
        const mangaLists = mangaJson.data?.MediaListCollection?.lists || [];
        const mangaEntries = mangaLists.flatMap((l: any) => l.entries);
        for (let i = 0; i < mangaEntries.length; i++) {
          const entry = mangaEntries[i];
          setProgressText(`Importing manga... ${i + 1}/${mangaEntries.length}`);
          try {
            await supabase.from("watchlist").upsert({
              user_id: user.id,
              mal_id: entry.mediaId,
              media_type: "manga",
              title: entry.media?.title?.english || entry.media?.title?.romaji || "Unknown",
              image_url: entry.media?.coverImage?.large || null,
              status: STATUS_MAP[entry.status] || "plan_to_watch",
              score: entry.score || null,
              chapters_read: entry.progress || 0,
            }, { onConflict: "user_id,mal_id,media_type" });
            added++;
          } catch { errors++; }
        }
      } catch { /* manga fetch failed */ }

      setResult({ added, skipped, errors, total: added + skipped + errors });
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
      toast({ title: "Import complete!", description: `Added ${added} entries to your library.` });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setImporting(false);
      setProgressText("");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <CollapsibleNavbar />
        <main className="pt-24 pb-16 container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">Sign in to import your list</h1>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Import Your List — Bibue" description="Import your anime and manga list from MyAnimeList or AniList." url="/import" noIndex />
      <CollapsibleNavbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-3 sm:px-4 max-w-lg">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <h1 className="text-2xl sm:text-3xl font-bold font-sacred mb-2">Import Your List</h1>
          <p className="text-muted-foreground text-sm mb-8">Import anime and manga from MyAnimeList or AniList</p>

          {/* Source selection */}
          {!source && !importing && !result && (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSource("mal")}
                className="liquid-glass rounded-xl p-6 text-center hover:bg-accent/5 transition-colors"
              >
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#2E51A2]/10 flex items-center justify-center">
                  <Download className="w-6 h-6 text-[#2E51A2]" />
                </div>
                <h3 className="font-semibold">MyAnimeList</h3>
                <p className="text-xs text-muted-foreground mt-1">Import via username</p>
              </button>
              <button
                onClick={() => setSource("anilist")}
                className="liquid-glass rounded-xl p-6 text-center hover:bg-accent/5 transition-colors"
              >
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#02A9FF]/10 flex items-center justify-center">
                  <Download className="w-6 h-6 text-[#02A9FF]" />
                </div>
                <h3 className="font-semibold">AniList</h3>
                <p className="text-xs text-muted-foreground mt-1">Import via username</p>
              </button>
            </div>
          )}

          {/* Username input */}
          {source && !importing && !result && (
            <div className="liquid-glass rounded-xl p-6 space-y-4">
              <h3 className="font-semibold">{source === "mal" ? "MyAnimeList" : "AniList"} Import</h3>
              <div>
                <Label>Username</Label>
                <Input
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder={`Enter your ${source === "mal" ? "MAL" : "AniList"} username`}
                  maxLength={50}
                />
              </div>
              {error && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="w-4 h-4" /> {error}
                </div>
              )}
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => { setSource(null); setError(null); }}>Cancel</Button>
                <Button
                  onClick={source === "mal" ? importFromMAL : importFromAniList}
                  disabled={!username.trim()}
                  className="flex-1 gap-2"
                >
                  <Download className="w-4 h-4" /> Start Import
                </Button>
              </div>
            </div>
          )}

          {/* Progress */}
          {importing && (
            <div className="liquid-glass rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <span className="font-semibold">Importing...</span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-muted-foreground">{progressText}</p>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="liquid-glass rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-semibold">Import Complete!</span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold">{result.added}</div>
                  <div className="text-xs text-muted-foreground">Added</div>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold">{result.total}</div>
                  <div className="text-xs text-muted-foreground">Total</div>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold">{result.errors}</div>
                  <div className="text-xs text-muted-foreground">Errors</div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => { setResult(null); setSource(null); setUsername(""); setError(null); }}>Import More</Button>
                <Button onClick={() => navigate("/watchlist")} className="flex-1">View Library</Button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
