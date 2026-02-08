import { useState, useEffect, useCallback } from "react";
import { Link2, Unlink, ExternalLink, Loader2, CheckCircle2, RefreshCw, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";

interface LinkedAccount {
  id: string;
  provider: string;
  provider_username: string | null;
  provider_user_id: string;
  created_at: string;
}

interface SyncResult {
  added: number;
  updated: number;
  skipped: number;
  errors: number;
  total: number;
}

const PROVIDERS = [
  {
    id: "anilist",
    name: "AniList",
    icon: "https://anilist.co/img/icons/icon.svg",
    color: "bg-[#02A9FF]/10 text-[#02A9FF]",
    profileUrl: (username: string) => `https://anilist.co/user/${username}`,
  },
  {
    id: "mal",
    name: "MyAnimeList",
    icon: "https://cdn.myanimelist.net/images/favicon.ico",
    color: "bg-[#2E51A2]/10 text-[#2E51A2]",
    profileUrl: (username: string) => `https://myanimelist.net/profile/${username}`,
  },
] as const;

export function LinkedAccounts() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);

  const fetchLinkedAccounts = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("linked_accounts" as any)
        .select("id, provider, provider_username, provider_user_id, created_at")
        .eq("user_id", user.id);

      if (error) throw error;
      setLinkedAccounts((data as any[]) || []);
    } catch (err) {
      console.error("Failed to fetch linked accounts:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchLinkedAccounts();
  }, [fetchLinkedAccounts]);

  // Handle redirect-based OAuth callbacks (mobile flow)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthSuccess = params.get("oauth_success");
    const oauthError = params.get("oauth_error");
    const username = params.get("username");

    if (oauthSuccess) {
      const providerName = oauthSuccess === "anilist" ? "AniList" : "MyAnimeList";
      toast({
        title: `${providerName} connected`,
        description: username ? `Linked as ${username}` : "Account linked successfully",
      });
      fetchLinkedAccounts();
      // Clean URL params
      window.history.replaceState({}, "", window.location.pathname);
    } else if (oauthError) {
      toast({
        variant: "destructive",
        title: "Connection failed",
        description: oauthError,
      });
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [fetchLinkedAccounts, toast]);

  // Handle popup-based OAuth callbacks (desktop flow)
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      const expectedOrigin = new URL(import.meta.env.VITE_SUPABASE_URL).origin;
      if (event.origin !== expectedOrigin) {
        return;
      }

      if (event.data?.type === "anilist-oauth-callback") {
        try {
          const session = await supabase.auth.getSession();
          const token = session.data.session?.access_token;
          if (!token) throw new Error("Not authenticated");

          const res = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/anilist-oauth-callback`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                accessToken: event.data.accessToken,
                refreshToken: event.data.refreshToken,
                expiresIn: event.data.expiresIn,
                userId: event.data.userId,
                username: event.data.username,
              }),
            }
          );

          const result = await res.json();
          if (!res.ok) throw new Error(result.error || "Failed to link");

          toast({ title: "AniList connected", description: `Linked as ${event.data.username}` });
          fetchLinkedAccounts();
        } catch (err: any) {
          toast({ variant: "destructive", title: "Connection failed", description: err.message });
        } finally {
          setConnecting(null);
        }
      }

      if (event.data?.type === "mal-oauth-code") {
        try {
          const codeVerifier = sessionStorage.getItem("mal_code_verifier");
          if (!codeVerifier) throw new Error("Missing PKCE verifier");

          const session = await supabase.auth.getSession();
          const token = session.data.session?.access_token;
          if (!token) throw new Error("Not authenticated");

          const res = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mal-oauth-callback?action=exchange`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                code: event.data.code,
                codeVerifier,
              }),
            }
          );

          const result = await res.json();
          if (!res.ok) throw new Error(result.error || "Failed to link");

          sessionStorage.removeItem("mal_code_verifier");
          toast({ title: "MyAnimeList connected", description: `Linked as ${result.username}` });
          fetchLinkedAccounts();
        } catch (err: any) {
          toast({ variant: "destructive", title: "Connection failed", description: err.message });
        } finally {
          setConnecting(null);
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [fetchLinkedAccounts, toast]);

  const handleConnect = async (providerId: string) => {
    if (!user) return;
    setConnecting(providerId);

    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      if (!token) throw new Error("Not authenticated");

      const functionName = providerId === "anilist" ? "anilist-oauth-callback" : "mal-oauth-callback";
      const mode = isMobile ? "redirect" : "popup";
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${functionName}?initiate=true&mode=${mode}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to initiate");

      if (isMobile) {
        // Redirect flow for mobile - navigate directly
        window.location.href = data.url;
        return;
      }

      // Popup flow for desktop
      if (providerId === "mal" && data.codeVerifier) {
        sessionStorage.setItem("mal_code_verifier", data.codeVerifier);
      }

      const width = 500;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      const popup = window.open(
        data.url,
        `${providerId}_oauth`,
        `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no`
      );

      if (popup) {
        const interval = setInterval(() => {
          if (popup.closed) {
            clearInterval(interval);
            setConnecting(null);
          }
        }, 500);
      } else {
        // Popup blocked - fallback to redirect
        window.location.href = data.url;
      }
    } catch (err: any) {
      toast({ variant: "destructive", title: "Connection failed", description: err.message });
      setConnecting(null);
    }
  };

  const handleDisconnect = async (providerId: string) => {
    if (!user) return;
    setDisconnecting(providerId);

    try {
      const { error } = await supabase
        .from("linked_accounts" as any)
        .delete()
        .eq("user_id", user.id)
        .eq("provider", providerId);

      if (error) throw error;

      toast({ title: "Account disconnected", description: `${providerId === "anilist" ? "AniList" : "MyAnimeList"} has been unlinked.` });
      fetchLinkedAccounts();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Disconnect failed", description: err.message });
    } finally {
      setDisconnecting(null);
    }
  };

  const handleSync = async (providerId: string) => {
    if (!user) return;
    setSyncing(providerId);
    setSyncResult(null);

    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      if (!token) throw new Error("Not authenticated");

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/watchlist-sync`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            provider: providerId,
            mediaTypes: ["anime", "manga"],
            mode: "merge",
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sync failed");

      const result = data.result as SyncResult;
      setSyncResult(result);

      toast({
        title: "Sync complete!",
        description: `Added ${result.added}, updated ${result.updated} of ${result.total} items`,
      });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Sync failed", description: err.message });
    } finally {
      setSyncing(null);
    }
  };

  const getLinkedAccount = (providerId: string) =>
    linkedAccounts.find((a) => a.provider === providerId);

  if (loading) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="w-5 h-5" />
            Connected Accounts
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="w-5 h-5" />
          Connected Accounts
        </CardTitle>
        <CardDescription>
          Link your anime & manga tracking accounts to sync your lists
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {PROVIDERS.map((provider, index) => {
          const linked = getLinkedAccount(provider.id);
          const isConnecting = connecting === provider.id;
          const isDisconnecting = disconnecting === provider.id;
          const isSyncing = syncing === provider.id;

          return (
            <div key={provider.id}>
              {index > 0 && <Separator className="mb-4" />}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`p-2 rounded-lg ${provider.color}`}>
                    <img
                      src={provider.icon}
                      alt={provider.name}
                      className="w-5 h-5"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{provider.name}</span>
                      {linked && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                      )}
                    </div>
                    {linked ? (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span className="truncate">@{linked.provider_username}</span>
                        <a
                          href={provider.profileUrl(linked.provider_username || linked.provider_user_id)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 hover:text-foreground transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">Not connected</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {linked && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSync(provider.id)}
                      disabled={isSyncing || !!syncing}
                    >
                      {isSyncing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                          Syncing...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-1.5" />
                          Import
                        </>
                      )}
                    </Button>
                  )}

                  {linked ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDisconnect(provider.id)}
                      disabled={isDisconnecting || isSyncing}
                      className="text-destructive hover:text-destructive"
                    >
                      {isDisconnecting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Unlink className="w-4 h-4 mr-1.5" />
                          Disconnect
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleConnect(provider.id)}
                      disabled={isConnecting}
                    >
                      {isConnecting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <Link2 className="w-4 h-4 mr-1.5" />
                          Connect
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>

              {/* Sync progress / result */}
              {isSyncing && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Importing your list from {provider.name}...</span>
                  </div>
                  <Progress value={undefined} className="h-1.5" />
                </div>
              )}

              {syncResult && syncing === null && !isSyncing && (
                <div className="mt-3 p-3 rounded-lg bg-muted/50 text-xs space-y-1">
                  <p className="font-medium text-sm">Import Complete</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground">
                    <span>📥 {syncResult.added} added</span>
                    <span>🔄 {syncResult.updated} updated</span>
                    {syncResult.skipped > 0 && <span>⏭️ {syncResult.skipped} skipped</span>}
                    {syncResult.errors > 0 && <span className="text-destructive">❌ {syncResult.errors} errors</span>}
                    <span>📊 {syncResult.total} total</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}