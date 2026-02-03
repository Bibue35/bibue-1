import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Camera, Save, Loader2, ArrowLeft, Check, X } from "lucide-react";
import { FloatingNav } from "@/components/FloatingNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AvatarPicker } from "@/components/settings/AvatarPicker";

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading, refreshProfile } = useAuth();
  const { toast } = useToast();

  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/");
    }
  }, [user, authLoading, navigate]);

  // Initialize form with profile data
  useEffect(() => {
    if (profile) {
      setUsername(profile.username || "");
      setAvatarUrl(profile.avatar_url);
    }
  }, [profile]);

  // Track changes
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

    // Validate file
    if (file.size > 2 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Please choose an image under 2MB",
      });
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please choose an image file",
      });
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `avatars/${user.id}/${Date.now()}.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("bibue-files")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("bibue-files")
        .getPublicUrl(filePath);

      setAvatarUrl(urlData.publicUrl);
      setAvatarPickerOpen(false);

      toast({
        title: "Avatar uploaded",
        description: "Don't forget to save your changes!",
      });
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "Could not upload avatar. Please try again.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    // Validate username
    if (username.trim().length < 2) {
      toast({
        variant: "destructive",
        title: "Invalid username",
        description: "Username must be at least 2 characters",
      });
      return;
    }

    if (username.length > 50) {
      toast({
        variant: "destructive",
        title: "Invalid username",
        description: "Username must be under 50 characters",
      });
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          username: username.trim(),
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (error) throw error;

      await refreshProfile();

      toast({
        title: "Profile updated",
        description: "Your changes have been saved successfully.",
      });
      setHasChanges(false);
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        variant: "destructive",
        title: "Save failed",
        description: "Could not save your profile. Please try again.",
      });
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

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <FloatingNav />

      <div className="container max-w-2xl mx-auto px-4 pt-24 pb-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Account Settings</h1>
            <p className="text-sm text-muted-foreground">Manage your profile and preferences</p>
          </div>
        </div>

        {/* Profile Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile
            </CardTitle>
            <CardDescription>
              Update your public profile information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar */}
            <div className="flex items-center gap-6">
              <div className="relative group">
                <Avatar className="w-24 h-24 border-2 border-border">
                  <AvatarImage src={avatarUrl || undefined} alt="Profile avatar" />
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <button
                  onClick={() => setAvatarPickerOpen(true)}
                  className="absolute inset-0 flex items-center justify-center bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                >
                  <Camera className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1">
                <h3 className="font-medium mb-1">Profile Picture</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Choose from popular characters, search for your favorite, or upload your own
                </p>
                <Button variant="outline" size="sm" onClick={() => setAvatarPickerOpen(true)}>
                  <Camera className="w-4 h-4 mr-2" />
                  Change Avatar
                </Button>
              </div>
            </div>

            <Separator />

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                maxLength={50}
              />
              <p className="text-xs text-muted-foreground">
                This is your public display name. 2-50 characters.
              </p>
            </div>

            {/* Email (read-only) */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={user.email || ""}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Your email address cannot be changed here.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Save Actions */}
        {hasChanges && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-card border border-border shadow-lg rounded-full px-6 py-3 z-50">
            <span className="text-sm text-muted-foreground">Unsaved changes</span>
            <Button variant="ghost" size="sm" onClick={handleReset}>
              <X className="w-4 h-4 mr-1" />
              Reset
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Avatar Picker Modal */}
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
