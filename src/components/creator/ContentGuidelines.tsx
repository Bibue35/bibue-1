import { AlertTriangle, Shield, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ContentGuidelines() {
  return (
    <Card className="border-destructive/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Content Guidelines
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="space-y-2">
          <h4 className="font-semibold text-destructive flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Prohibited Content
          </h4>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>No pornographic or sexually explicit content</li>
            <li>No graphic violence/gore beyond typical shounen manga</li>
            <li>No hate speech or discriminatory content</li>
            <li>No copyrighted content you don't own</li>
          </ul>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            Requirements
          </h4>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>You must own or have rights to everything you upload</li>
            <li>All content must be rated: Everyone, Teen (13+), or Mature (16+)</li>
            <li>No 18+/Adult content — this rating does not exist on our platform</li>
            <li>New series require moderation approval before going public</li>
            <li>First 3 chapters of any series require manual review</li>
          </ul>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold">Moderation Policy</h4>
          <p className="text-muted-foreground">
            3 rejected uploads will result in an account review. Repeated violations may lead to account suspension.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
