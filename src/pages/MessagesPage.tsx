import { useParams } from "react-router-dom";
import { MessageInbox } from "@/components/messages/MessageInbox";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "@/components/AuthModal";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

export default function MessagesPage() {
  const { partnerId } = useParams();
  const { user, loading } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="h-[500px] flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="h-[500px] flex flex-col items-center justify-center gap-4">
            <p className="text-muted-foreground">Please sign in to view your messages</p>
            <Button onClick={() => setShowAuth(true)}>
              <LogIn className="h-4 w-4 mr-2" />
              Sign In
            </Button>
          </div>
          <AuthModal open={showAuth} onOpenChange={setShowAuth} />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="h-[600px]">
          <MessageInbox initialPartnerId={partnerId} />
        </div>
      </div>
    </div>
  );
}
