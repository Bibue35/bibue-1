import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { MessageCircle } from "lucide-react";

interface MessagePayload {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  created_at: string;
}

export function MessageNotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();
  const queryClient = useQueryClient();
  const senderCacheRef = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`global-messages-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "direct_messages",
          filter: `recipient_id=eq.${user.id}`,
        },
        async (payload) => {
          const newMessage = payload.new as MessagePayload;
          
          // Don't show notification if already on messages page with this conversation
          const isOnMessagesPage = location.pathname.startsWith("/messages");
          const isInConversation = location.pathname === `/messages/${newMessage.sender_id}`;
          
          if (isInConversation) {
            // Just refresh the data, no toast needed
            return;
          }

          // Invalidate unread count
          queryClient.invalidateQueries({ queryKey: ["unread-count", user.id] });
          queryClient.invalidateQueries({ queryKey: ["conversations", user.id] });

          // Get sender username (with caching)
          let senderName = senderCacheRef.current.get(newMessage.sender_id);
          
          if (!senderName) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("username")
              .eq("user_id", newMessage.sender_id)
              .maybeSingle();
            
            senderName = profile?.username || "Someone";
            senderCacheRef.current.set(newMessage.sender_id, senderName);
          }

          // Truncate message for preview
          const preview = newMessage.content.length > 50 
            ? newMessage.content.slice(0, 50) + "..." 
            : newMessage.content;

          // Show toast notification
          toast.message(`New message from ${senderName}`, {
            description: preview,
            icon: <MessageCircle className="h-4 w-4" />,
            action: {
              label: "View",
              onClick: () => {
                window.location.href = `/messages/${newMessage.sender_id}`;
              },
            },
            duration: 5000,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, location.pathname, queryClient]);

  return <>{children}</>;
}
