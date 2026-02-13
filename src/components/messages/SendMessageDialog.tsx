import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Send, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useEncryptionKeys } from "@/hooks/useEncryptionKeys";
import { encryptMessage } from "@/lib/e2e-crypto";

interface SendMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipientId: string;
  recipientUsername: string | null;
  recipientAvatar: string | null;
}

export function SendMessageDialog({
  open,
  onOpenChange,
  recipientId,
  recipientUsername,
  recipientAvatar,
}: SendMessageDialogProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const { privateKey, getRecipientPublicKey } = useEncryptionKeys();

  const handleSend = async () => {
    if (!message.trim() || !user?.id) return;

    setSending(true);
    try {
      let content = message.trim();
      let isEncrypted = false;
      let encryptionMetadata: any = null;

      // Try E2E encryption
      if (privateKey) {
        const recipientPublicKey = await getRecipientPublicKey(recipientId);
        if (recipientPublicKey) {
          try {
            encryptionMetadata = await encryptMessage(content, privateKey, recipientPublicKey);
            content = "[Encrypted]";
            isEncrypted = true;
          } catch (e) {
            console.warn("E2E encryption failed, sending plaintext:", e);
          }
        }
      }

      const { error } = await supabase.from("direct_messages").insert({
        sender_id: user.id,
        recipient_id: recipientId,
        content,
        is_encrypted: isEncrypted,
        encryption_metadata: encryptionMetadata,
      });

      if (error) throw error;

      toast.success(isEncrypted ? "Encrypted message sent!" : "Message sent!");
      setMessage("");
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={recipientAvatar || undefined} />
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <span>Message {recipientUsername || "User"}</span>
            {privateKey && (
              <Lock className="h-4 w-4 text-emerald-500 ml-auto" />
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {privateKey && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Lock className="h-3 w-3 text-emerald-500" />
              End-to-end encrypted
            </p>
          )}
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your message..."
            rows={4}
            className="resize-none"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={sending || !message.trim()}>
            <Send className="h-4 w-4 mr-2" />
            Send
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
