import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useEncryptionKeys } from "@/hooks/useEncryptionKeys";
import { encryptMessage, decryptMessage, type EncryptedPayload } from "@/lib/e2e-crypto";

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
  is_encrypted?: boolean;
  encryption_metadata?: any;
  sender?: {
    username: string | null;
    avatar_url: string | null;
  };
  recipient?: {
    username: string | null;
    avatar_url: string | null;
  };
  decryptionFailed?: boolean;
}

interface Conversation {
  partnerId: string;
  partnerUsername: string | null;
  partnerAvatar: string | null;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  isEncrypted?: boolean;
}

interface ProfileInfo {
  user_id: string;
  username: string | null;
  avatar_url: string | null;
}

export function useConversations() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { privateKey } = useEncryptionKeys();

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

      // Fetch profiles and public keys for all partners
      const [profilesRes, keysRes] = await Promise.all([
        supabase.from("profiles").select("user_id, username, avatar_url").in("user_id", Array.from(partnerIds)),
        supabase.from("user_encryption_keys").select("user_id, public_key").in("user_id", Array.from(partnerIds)),
      ]);

      const profileMap = new Map<string, ProfileInfo>();
      profilesRes.data?.forEach((p) => profileMap.set(p.user_id, p));

      const publicKeyMap = new Map<string, JsonWebKey>();
      keysRes.data?.forEach((k) => {
        try { publicKeyMap.set(k.user_id, JSON.parse(k.public_key)); } catch {}
      });

      // Group by conversation partner
      const conversationMap = new Map<string, Conversation>();

      for (const msg of messages) {
        const partnerId = msg.sender_id === user.id ? msg.recipient_id : msg.sender_id;
        const partner = profileMap.get(partnerId);

        if (!conversationMap.has(partnerId)) {
          let lastMessage = msg.content;

          // Try to decrypt encrypted messages for preview
          if (msg.is_encrypted && msg.encryption_metadata && privateKey) {
            try {
              const senderPublicKey = msg.sender_id === user.id
                ? null // We sent it, need recipient's key
                : publicKeyMap.get(msg.sender_id);
              
              // For sent messages, we need the recipient's public key to derive the same shared secret
              const otherPublicKey = msg.sender_id === user.id
                ? publicKeyMap.get(msg.recipient_id)
                : publicKeyMap.get(msg.sender_id);

              if (otherPublicKey) {
                const metadata = msg.encryption_metadata as unknown as EncryptedPayload;
                lastMessage = await decryptMessage(metadata, privateKey, otherPublicKey);
              } else {
                lastMessage = "🔒 Encrypted message";
              }
            } catch {
              lastMessage = "🔒 Encrypted message";
            }
          }

          conversationMap.set(partnerId, {
            partnerId,
            partnerUsername: partner?.username || "Unknown User",
            partnerAvatar: partner?.avatar_url || null,
            lastMessage,
            lastMessageAt: msg.created_at,
            unreadCount: 0,
            isEncrypted: msg.is_encrypted || false,
          });
        }

        if (msg.recipient_id === user.id && !msg.read_at) {
          const conv = conversationMap.get(partnerId)!;
          conv.unreadCount++;
        }
      }

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
  const { privateKey, getRecipientPublicKey } = useEncryptionKeys();

  // Set up realtime subscription for this conversation
  useEffect(() => {
    if (!user?.id || !partnerId) return;

    const channelName = [user.id, partnerId].sort().join("-");
    const channel = supabase.channel(`typing-${channelName}`);
    channelRef.current = channel;

    channel
      .on("broadcast", { event: "typing" }, (payload) => {
        if (payload.payload?.userId === partnerId) {
          setIsPartnerTyping(true);
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => setIsPartnerTyping(false), 3000);
        }
      })
      .on("broadcast", { event: "stop_typing" }, (payload) => {
        if (payload.payload?.userId === partnerId) {
          setIsPartnerTyping(false);
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        }
      })
      .subscribe();

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
            if (newMsg.sender_id === partnerId) setIsPartnerTyping(false);
          }
        }
      )
      .subscribe();

    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      supabase.removeChannel(channel);
      supabase.removeChannel(messageChannel);
      channelRef.current = null;
    };
  }, [user?.id, partnerId, queryClient]);

  const sendTypingIndicator = useCallback(() => {
    if (!user?.id || !partnerId || !channelRef.current) return;
    channelRef.current.send({ type: "broadcast", event: "typing", payload: { userId: user.id } });
  }, [user?.id, partnerId]);

  const sendStopTyping = useCallback(() => {
    if (!user?.id || !partnerId || !channelRef.current) return;
    channelRef.current.send({ type: "broadcast", event: "stop_typing", payload: { userId: user.id } });
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

      // Fetch profiles
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username, avatar_url")
        .in("user_id", [user.id, partnerId]);

      const profileMap = new Map<string, ProfileInfo>();
      profiles?.forEach((p) => profileMap.set(p.user_id, p));

      // Mark unread as read
      const unreadIds = data
        .filter((m) => m.recipient_id === user.id && !m.read_at)
        .map((m) => m.id);

      if (unreadIds.length > 0) {
        await supabase
          .from("direct_messages")
          .update({ read_at: new Date().toISOString() })
          .in("id", unreadIds);
      }

      // Get partner's public key for decryption
      let partnerPublicKey: JsonWebKey | null = null;
      const hasEncrypted = data.some((m) => m.is_encrypted);
      if (hasEncrypted) {
        partnerPublicKey = await getRecipientPublicKey(partnerId);
      }

      // Decrypt messages
      const enriched: Message[] = [];
      for (const msg of data) {
        let content = msg.content;
        let decryptionFailed = false;

        if (msg.is_encrypted && msg.encryption_metadata && privateKey) {
          try {
            // For messages we sent, we need recipient's public key
            // For messages we received, we need sender's public key
            const otherPublicKey = partnerPublicKey;
            if (otherPublicKey) {
              const metadata = msg.encryption_metadata as unknown as EncryptedPayload;
              content = await decryptMessage(metadata, privateKey, otherPublicKey);
            } else {
              content = "🔒 Unable to decrypt";
              decryptionFailed = true;
            }
          } catch {
            content = "🔒 Unable to decrypt";
            decryptionFailed = true;
          }
        }

        enriched.push({
          ...msg,
          content,
          decryptionFailed,
          sender: profileMap.get(msg.sender_id) || undefined,
          recipient: profileMap.get(msg.recipient_id) || undefined,
        });
      }

      return enriched;
    },
    enabled: !!user?.id && !!partnerId,
  });

  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      if (!user?.id || !partnerId) throw new Error("Not authenticated");

      // Try to encrypt the message
      let messageContent = content;
      let isEncrypted = false;
      let encryptionMetadata: EncryptedPayload | null = null;

      if (privateKey) {
        const recipientPublicKey = await getRecipientPublicKey(partnerId);
        if (recipientPublicKey) {
          try {
            encryptionMetadata = await encryptMessage(content, privateKey, recipientPublicKey);
            messageContent = "[Encrypted]"; // Placeholder stored in content column
            isEncrypted = true;
          } catch (e) {
            console.warn("E2E encryption failed, sending plaintext:", e);
          }
        }
      }

      const { data, error } = await supabase
        .from("direct_messages")
        .insert({
          sender_id: user.id,
          recipient_id: partnerId,
          content: messageContent,
          is_encrypted: isEncrypted,
          encryption_metadata: encryptionMetadata as any,
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
