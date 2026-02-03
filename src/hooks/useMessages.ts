import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
  sender?: {
    username: string | null;
    avatar_url: string | null;
  };
  recipient?: {
    username: string | null;
    avatar_url: string | null;
  };
}

interface Conversation {
  partnerId: string;
  partnerUsername: string | null;
  partnerAvatar: string | null;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export function useConversations() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["conversations", user?.id],
    queryFn: async (): Promise<Conversation[]> => {
      if (!user?.id) return [];

      // Get all messages involving the user
      const { data: messages, error } = await supabase
        .from("direct_messages")
        .select(`
          *,
          sender:profiles!direct_messages_sender_id_fkey(username, avatar_url),
          recipient:profiles!direct_messages_recipient_id_fkey(username, avatar_url)
        `)
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Group by conversation partner
      const conversationMap = new Map<string, Conversation>();

      messages?.forEach((msg: Message) => {
        const partnerId = msg.sender_id === user.id ? msg.recipient_id : msg.sender_id;
        const partner = msg.sender_id === user.id ? msg.recipient : msg.sender;

        if (!conversationMap.has(partnerId)) {
          conversationMap.set(partnerId, {
            partnerId,
            partnerUsername: partner?.username || "Unknown User",
            partnerAvatar: partner?.avatar_url || null,
            lastMessage: msg.content,
            lastMessageAt: msg.created_at,
            unreadCount: 0,
          });
        }

        // Count unread messages from this partner
        if (msg.recipient_id === user.id && !msg.read_at) {
          const conv = conversationMap.get(partnerId)!;
          conv.unreadCount++;
        }
      });

      return Array.from(conversationMap.values());
    },
    enabled: !!user?.id,
  });
}

export function useConversation(partnerId: string | null) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const messagesQuery = useQuery({
    queryKey: ["messages", user?.id, partnerId],
    queryFn: async (): Promise<Message[]> => {
      if (!user?.id || !partnerId) return [];

      const { data, error } = await supabase
        .from("direct_messages")
        .select(`
          *,
          sender:profiles!direct_messages_sender_id_fkey(username, avatar_url),
          recipient:profiles!direct_messages_recipient_id_fkey(username, avatar_url)
        `)
        .or(
          `and(sender_id.eq.${user.id},recipient_id.eq.${partnerId}),and(sender_id.eq.${partnerId},recipient_id.eq.${user.id})`
        )
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Mark messages as read
      const unreadIds = data
        ?.filter((m: Message) => m.recipient_id === user.id && !m.read_at)
        .map((m: Message) => m.id);

      if (unreadIds && unreadIds.length > 0) {
        await supabase
          .from("direct_messages")
          .update({ read_at: new Date().toISOString() })
          .in("id", unreadIds);
      }

      return data || [];
    },
    enabled: !!user?.id && !!partnerId,
    refetchInterval: 5000, // Poll every 5 seconds for new messages
  });

  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      if (!user?.id || !partnerId) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("direct_messages")
        .insert({
          sender_id: user.id,
          recipient_id: partnerId,
          content,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", user?.id, partnerId] });
      queryClient.invalidateQueries({ queryKey: ["conversations", user?.id] });
    },
  });

  return {
    messages: messagesQuery.data || [],
    isLoading: messagesQuery.isLoading,
    sendMessage: sendMessage.mutate,
    isSending: sendMessage.isPending,
  };
}

export function useUnreadCount() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["unread-count", user?.id],
    queryFn: async (): Promise<number> => {
      if (!user?.id) return 0;

      const { count, error } = await supabase
        .from("direct_messages")
        .select("*", { count: "exact", head: true })
        .eq("recipient_id", user.id)
        .is("read_at", null);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!user?.id,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}
