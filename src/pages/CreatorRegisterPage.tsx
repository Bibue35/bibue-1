import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCreatorProfile, useRegisterCreator } from "@/hooks/useCreator";
import { ContentGuidelines } from "@/components/creator/ContentGuidelines";
import { CollapsibleNavbar } from "@/components/CollapsibleNavbar";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Pen, Globe, Twitter } from "lucide-react";
import { toast } from "sonner";

export default function CreatorRegisterPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { data: existingProfile, isLoading } = useCreatorProfile();
  const registerMutation = useRegisterCreator();

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [twitter, setTwitter] = useState("");
  const [guidelinesAccepted, setGuidelinesAccepted] = useState(false);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <CollapsibleNavbar />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <CollapsibleNavbar />
        <div className="container mx-auto py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Sign in Required</h1>
          <p className="text-muted-foreground">You must be signed in to register as a creator.</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (existingProfile) {
    navigate("/creator/dashboard", { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guidelinesAccepted) {
      toast.error("You must accept the content guidelines");
      return;
    }
    if (!displayName.trim()) {
      toast.error("Display name is required");
      return;
    }
    await registerMutation.mutateAsync({
      display_name: displayName.trim(),
      bio: bio.trim() || undefined,
      social_links: {
        ...(website && { website }),
        ...(twitter && { twitter }),
      },
    });
    navigate("/creator/dashboard");
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Become a Creator - Bibue" description="Register as a creator on Bibue" url="/creator/register" />
      <CollapsibleNavbar />
      <main className="container mx-auto py-8 px-4 max-w-2xl">
        <div className="mb-8 text-center">
          <Pen className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold">Become a Creator</h1>
          <p className="text-muted-foreground mt-2">
            Share your original manga, manhwa, or manhua with the world
          </p>
        </div>

        <ContentGuidelines />

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Creator Profile</CardTitle>
            <CardDescription>Set up your creator profile to start uploading</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name *</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your creator name"
                  required
                  maxLength={50}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell readers about yourself..."
                  maxLength={500}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="website" className="flex items-center gap-1">
                    <Globe className="h-3 w-3" /> Website
                  </Label>
                  <Input
                    id="website"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://yoursite.com"
                    type="url"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twitter" className="flex items-center gap-1">
                    <Twitter className="h-3 w-3" /> Twitter/X
                  </Label>
                  <Input
                    id="twitter"
                    value={twitter}
                    onChange={(e) => setTwitter(e.target.value)}
                    placeholder="@username"
                  />
                </div>
              </div>

              <div className="flex items-start gap-2 pt-4 border-t">
                <Checkbox
                  id="guidelines"
                  checked={guidelinesAccepted}
                  onCheckedChange={(v) => setGuidelinesAccepted(v === true)}
                />
                <Label htmlFor="guidelines" className="text-sm leading-relaxed cursor-pointer">
                  I have read and agree to the Content Guidelines. I understand that violating these guidelines may result in my content being removed and my account being suspended.
                </Label>
              </div>

              <Button type="submit" className="w-full" disabled={registerMutation.isPending || !guidelinesAccepted}>
                {registerMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Register as Creator
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
