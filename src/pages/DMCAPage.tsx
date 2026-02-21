import { useState } from "react";
import { CollapsibleNavbar } from "@/components/CollapsibleNavbar";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Shield, Scale } from "lucide-react";

export default function DMCAPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [contentUrl, setContentUrl] = useState("");
  const [originalUrl, setOriginalUrl] = useState("");
  const [description, setDescription] = useState("");
  const [sworn, setSworn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sworn) { toast.error("You must confirm the sworn statement"); return; }
    
    setLoading(true);
    try {
      const { error } = await supabase.from("dmca_requests").insert({
        claimant_name: name.trim(),
        claimant_email: email.trim(),
        claimant_company: company.trim() || null,
        content_url: contentUrl.trim(),
        original_work_url: originalUrl.trim() || null,
        description: description.trim(),
        sworn_statement: true,
      });
      if (error) throw error;
      setSubmitted(true);
      toast.success("DMCA takedown request submitted");
    } catch (err: any) {
      toast.error("Failed to submit: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title="DMCA Takedown - Bibue" description="Submit a DMCA takedown request for copyrighted content" url="/dmca" />
      <CollapsibleNavbar />
      <main className="container mx-auto py-8 px-4 max-w-2xl">
        <div className="mb-8 text-center">
          <Scale className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold">DMCA Takedown Request</h1>
          <p className="text-muted-foreground mt-2">
            If you believe content on Bibue infringes your copyright, submit a takedown request below.
            We respond to all valid requests within 48 hours.
          </p>
        </div>

        {submitted ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Request Submitted</h3>
              <p className="text-muted-foreground">
                We've received your DMCA takedown request and will respond within 48 hours.
                You'll receive a response at {email}.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Copyright Infringement Report</CardTitle>
              <CardDescription>All fields marked with * are required</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name *</Label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} required maxLength={200} />
                  </div>
                  <div className="space-y-2">
                    <Label>Email Address *</Label>
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={255} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Company/Organization</Label>
                  <Input value={company} onChange={(e) => setCompany(e.target.value)} maxLength={200} />
                </div>

                <div className="space-y-2">
                  <Label>URL of Infringing Content on Bibue *</Label>
                  <Input value={contentUrl} onChange={(e) => setContentUrl(e.target.value)} placeholder="https://bibue.net/..." required type="url" />
                </div>

                <div className="space-y-2">
                  <Label>URL of Your Original Work</Label>
                  <Input value={originalUrl} onChange={(e) => setOriginalUrl(e.target.value)} placeholder="https://..." type="url" />
                </div>

                <div className="space-y-2">
                  <Label>Description of Infringement *</Label>
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} required maxLength={5000}
                    placeholder="Describe your copyrighted work and how it's being infringed..." />
                </div>

                <div className="flex items-start gap-2 pt-4 border-t">
                  <Checkbox id="sworn" checked={sworn} onCheckedChange={(v) => setSworn(v === true)} />
                  <Label htmlFor="sworn" className="text-sm cursor-pointer leading-relaxed">
                    I swear, under penalty of perjury, that the information in this notification is accurate and that I am the copyright owner, or am authorized to act on behalf of the owner, of an exclusive right that is allegedly infringed.
                  </Label>
                </div>

                <Button type="submit" className="w-full" disabled={loading || !sworn}>
                  {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Submit Takedown Request
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  );
}
