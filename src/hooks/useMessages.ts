import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, useCallback, useRef } from "react";
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

interface ProfileInfo {
  user_id: string;
  username: string | null;
  avatar_url: string | null;
}

export function useConversations() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Set up realtime subscription for conversations
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`conversations-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "direct_messages",
          filter: `recipient_id=eq.${user.id}`,
        },
        () => {
          // Invalidate conversations when we receive a new message
          queryClient.invalidateQueries({ queryKey: ["conversations", user.id] });
          queryClient.invalidateQueries({ queryKey: ["unread-count", user.id] });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "direct_messages",
          filter: `sender_id=eq.${user.id}`,
        },
        () => {
          // Also refresh when we send messages
          queryClient.invalidateQueries({ queryKey: ["conversations", user.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  return useQuery({
    queryKey: ["conversations", user?.id],
    queryFn: async (): Promise<Conversation[]> => {
      if (!user?.id) return [];

      // Get all messages involving the user
      const { data: messages, error } = await supabase
        .from("direct_messages")
        .select("*")
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (!messages || messages.length === 0) return [];

      // Get unique partner IDs
      const partnerIds = new Set<string>();
      messages.forEach((msg) => {
        const partnerId = msg.sender_id === user.id ? msg.recipient_id : msg.sender_id;
        partnerIds.add(partnerId);
      });

      // Fetch profiles for all partners
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username, avatar_url")
        .in("user_id", Array.from(partnerIds));

      const profileMap = new Map<string, ProfileInfo>();
      profiles?.forEach((p) => profileMap.set(p.user_id, p));

      // Group by conversation partner
      const conversationMap = new Map<string, Conversation>();

      messages.forEach((msg) => {
        const partnerId = msg.sender_id === user.id ? msg.recipient_id : msg.sender_id;
        const partner = profileMap.get(partnerId);

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
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Set up realtime subscription for this conversation
  useEffect(() => {
    if (!user?.id || !partnerId) return;

    // Create a unique channel for this conversation pair
    const channelName = [user.id, partnerId].sort().join("-");
    const channel = supabase.channel(`typing-${channelName}`);
    channelRef.current = channel;

    channel
      .on("broadcast", { event: "typing" }, (payload) => {
        // Only show typing if it's from the partner
        if (payload.payload?.userId === partnerId) {
          setIsPartnerTyping(true);
          
          // Clear existing timeout
          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
          }
          
          // Hide typing indicator after 3 seconds of no typing events
          typingTimeoutRef.current = setTimeout(() => {
            setIsPartnerTyping(false);
          }, 3000);
        }
      })
      .on("broadcast", { event: "stop_typing" }, (payload) => {
        if (payload.payload?.userId === partnerId) {
          setIsPartnerTyping(false);
          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
          }
        }
      })
      .subscribe();

    // Also subscribe to message changes
    const messageChannel = supabase
      .channel(`messages-${user.id}-${partnerId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "direct_messages",
        },
        (payload) => {
          const newMsg = payload.new as Message;
          if (
            (newMsg.sender_id === user.id && newMsg.recipient_id === partnerId) ||
            (newMsg.sender_id === partnerId && newMsg.recipient_id === user.id)
          ) {
            queryClient.invalidateQueries({ queryKey: ["messages", user.id, partnerId] });
            queryClient.invalidateQueries({ queryKey: ["unread-count", user.id] });
            // Stop showing typing when message is received
            if (newMsg.sender_id === partnerId) {
              setIsPartnerTyping(false);
            }
          }
        }
      )
      .subscribe();

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      supabase.removeChannel(channel);
      supabase.removeChannel(messageChannel);
      channelRef.current = null;
    };
  }, [user?.id, partnerId, queryClient]);

  // Function to broadcast typing status
  const sendTypingIndicator = useCallback(() => {
    if (!user?.id || !partnerId || !channelRef.current) return;
    
    channelRef.current.send({
      type: "broadcast",
      event: "typing",
      payload: { userId: user.id },
    });
  }, [user?.id, partnerId]);

  // Function to broadcast stop typing
  const sendStopTyping = useCallback(() => {
    if (!user?.id || !partnerId || !channelRef.current) return;
    
    channelRef.current.send({
      type: "broadcast",
      event: "stop_typing",
      payload: { userId: user.id },
    });
  }, [user?.id, partnerId]);

  const messagesQuery = useQuery({
    queryKey: ["messages", user?.id, partnerId],
    queryFn: async (): Promise<Message[]> => {
      if (!user?.id || !partnerId) return [];

      const { data, error } = await supabase
        .from("direct_messages")
        .select("*")
        .or(
          `and(sender_id.eq.${user.id},recipient_id.eq.${partnerId}),and(sender_id.eq.${partnerId},recipient_id.eq.${user.id})`
        )
        .order("created_at", { ascending: true });

      if (error) throw error;
      if (!data || data.length === 0) return [];

      // Fetch profiles for sender and recipient
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username, avatar_url")
        .in("user_id", [user.id, partnerId]);

      const profileMap = new Map<string, ProfileInfo>();
      profiles?.forEach((p) => profileMap.set(p.user_id, p));

      // Mark messages as read
      const unreadIds = data
        .filter((m) => m.recipient_id === user.id && !m.read_at)
        .map((m) => m.id);

      if (unreadIds.length > 0) {
        await supabase
          .from("direct_messages")
          .update({ read_at: new Date().toISOString() })
          .in("id", unreadIds);
      }

      // Enrich messages with profile info
      return data.map((msg) => ({
        ...msg,
        sender: profileMap.get(msg.sender_id) || undefined,
        recipient: profileMap.get(msg.recipient_id) || undefined,
      }));
    },
    enabled: !!user?.id && !!partnerId,
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
      sendStopTyping();
      queryClient.invalidateQueries({ queryKey: ["messages", user?.id, partnerId] });
      queryClient.invalidateQueries({ queryKey: ["conversations", user?.id] });
    },
  });

  return {
    messages: messagesQuery.data || [],
    isLoading: messagesQuery.isLoading,
    sendMessage: sendMessage.mutate,
    isSending: sendMessage.isPending,
    isPartnerTyping,
    sendTypingIndicator,
    sendStopTyping,
  };
}

export function useUnreadCount() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Set up realtime subscription for unread count
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`unread-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "direct_messages",
          filter: `recipient_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["unread-count", user.id] });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "direct_messages",
          filter: `recipient_id=eq.${user.id}`,
        },
        () => {
          // When messages are marked as read
          queryClient.invalidateQueries({ queryKey: ["unread-count", user.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

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
  });
}
