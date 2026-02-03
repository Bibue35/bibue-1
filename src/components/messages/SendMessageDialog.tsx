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
import { User, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

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

  const handleSend = async () => {
    if (!message.trim() || !user?.id) return;

    setSending(true);
    try {
      const { error } = await supabase.from("direct_messages").insert({
        sender_id: user.id,
        recipient_id: recipientId,
        content: message.trim(),
      });

      if (error) throw error;

      toast.success("Message sent!");
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
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
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
