import { useState, useEffect } from "react";
import { SEO } from "@/components/SEO";
import { useNavigate } from "react-router-dom";
import { User, Camera, Loader2, ArrowLeft, Check, X, EyeOff } from "lucide-react";
import { FloatingNav } from "@/components/FloatingNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AvatarPicker } from "@/components/settings/AvatarPicker";
import { LinkedAccounts } from "@/components/settings/LinkedAccounts";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSpoilerFree } from "@/contexts/SpoilerFreeContext";

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading, refreshProfile } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const { isSpoilerFree, toggleSpoilerFree } = useSpoilerFree();

  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (profile) {
      setUsername(profile.username || "");
      setAvatarUrl(profile.avatar_url);
    }
  }, [profile]);

  useEffect(() => {
    if (profile) {
      const usernameChanged = username !== (profile.username || "");
      const avatarChanged = avatarUrl !== profile.avatar_url;
      setHasChanges(usernameChanged || avatarChanged);
    }
  }, [username, avatarUrl, profile]);

  const getInitials = () => {
    if (username) return username.slice(0, 2).toUpperCase();
    if (user?.email) return user.email.slice(0, 2).toUpperCase();
    return "U";
  };

  const handleAvatarSelect = async (url: string) => {
    setAvatarUrl(url);
  };

  const handleAvatarUpload = async (file: File) => {
    if (!user) return;

    if (file.size > 2 * 1024 * 1024) {
      toast({ variant: "destructive", title: "File too large", description: "Please choose an image under 2MB" });
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast({ variant: "destructive", title: "Invalid file type", description: "Please choose an image file" });
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `avatars/${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("bibue-files")
        .upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("bibue-files").getPublicUrl(filePath);
      setAvatarUrl(urlData.publicUrl);
      setAvatarPickerOpen(false);
      toast({ title: "Avatar uploaded", description: "Don't forget to save your changes!" });
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast({ variant: "destructive", title: "Upload failed", description: "Could not upload avatar. Please try again." });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    if (username.trim().length < 2) {
      toast({ variant: "destructive", title: "Invalid username", description: "Username must be at least 2 characters" });
      return;
    }
    if (username.length > 50) {
      toast({ variant: "destructive", title: "Invalid username", description: "Username must be under 50 characters" });
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ username: username.trim(), avatar_url: avatarUrl, updated_at: new Date().toISOString() })
        .eq("user_id", user.id);
      if (error) throw error;

      await refreshProfile();
      toast({ title: "Profile updated", description: "Your changes have been saved successfully." });
      setHasChanges(false);
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({ variant: "destructive", title: "Save failed", description: "Could not save your profile. Please try again." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (profile) {
      setUsername(profile.username || "");
      setAvatarUrl(profile.avatar_url);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Settings" description="Manage your Bibue profile settings." url="/settings" noIndex />
      <FloatingNav />

      <div className="max-w-2xl mx-auto px-3 sm:px-4 pt-16 sm:pt-24 pb-24">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold">{t("settings.title")}</h1>
        </div>

        {/* Profile Avatar — centered on mobile */}
        <div className="flex flex-col items-center mb-6">
          <button
            onClick={() => setAvatarPickerOpen(true)}
            className="relative group mb-3"
          >
            <Avatar className="w-20 h-20 sm:w-24 sm:h-24 border-2 border-border">
              <AvatarImage src={avatarUrl || undefined} alt="Profile avatar" />
              <AvatarFallback className="text-xl sm:text-2xl bg-primary/10 text-primary">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 flex items-center justify-center bg-background/70 opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity rounded-full">
              <Camera className="w-5 h-5" />
            </div>
          </button>
          <button
            onClick={() => setAvatarPickerOpen(true)}
            className="text-sm text-primary font-medium"
          >
            {t("settings.changeAvatar")}
          </button>
        </div>

        {/* Profile Fields */}
        <section className="space-y-4 mb-8">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">
            {t("settings.profile")}
          </h2>
          <div className="rounded-xl bg-card border border-border overflow-hidden">
            {/* Username */}
            <div className="px-4 py-3">
              <Label htmlFor="username" className="text-xs text-muted-foreground">
                {t("settings.username")}
              </Label>
              <Input
                id="username"
                placeholder={t("settings.enterUsername")}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                maxLength={50}
                className="mt-1 border-0 bg-transparent px-0 h-8 text-base focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
            <div className="border-t border-border mx-4" />
            {/* Email */}
            <div className="px-4 py-3">
              <Label htmlFor="email" className="text-xs text-muted-foreground">
                {t("settings.email")}
              </Label>
              <Input
                id="email"
                value={user.email || ""}
                disabled
                className="mt-1 border-0 bg-transparent px-0 h-8 text-base text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
          </div>
        </section>

        {/* Connected Accounts */}
        <section className="space-y-4 mb-8">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">
            {t("settings.connectedAccounts")}
          </h2>
          <LinkedAccounts variant="mobile" />
        </section>

        {/* Spoiler-Free Mode */}
        <section className="space-y-4 mb-8">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">
            Privacy & Content
          </h2>
          <div className="rounded-xl bg-card border border-border overflow-hidden">
            <div className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <EyeOff className="w-5 h-5 text-muted-foreground" />
                <div>
                  <Label className="text-sm font-medium">Spoiler-Free Mode</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Hide synopses, reviews, and comments behind spoiler tags
                  </p>
                </div>
              </div>
              <Switch
                checked={isSpoilerFree}
                onCheckedChange={toggleSpoilerFree}
              />
            </div>
          </div>
        </section>
      </div>

      {/* Save bar — fixed bottom */}
      {hasChanges && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-sm px-4 py-3 sm:py-4">
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
            <span className="text-sm text-muted-foreground">{t("settings.unsavedChanges")}</span>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleReset} className="h-9 px-3">
                <X className="w-4 h-4 mr-1" />
                {t("settings.reset")}
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isSaving} className="h-9 px-4">
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                    {t("settings.saving")}
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-1.5" />
                    {t("settings.save")}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      <AvatarPicker
        open={avatarPickerOpen}
        onOpenChange={setAvatarPickerOpen}
        currentAvatar={avatarUrl}
        onSelect={handleAvatarSelect}
        isUploading={isUploading}
        onUpload={handleAvatarUpload}
      />
    </div>
  );
}