import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useConversations, useConversation } from "@/hooks/useMessages";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Send, MessageCircle, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface MessageInboxProps {
  initialPartnerId?: string;
}

export function MessageInbox({ initialPartnerId }: MessageInboxProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(
    initialPartnerId || null
  );
  const [newMessage, setNewMessage] = useState("");
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { data: conversations, isLoading: conversationsLoading } = useConversations();
  const { 
    messages, 
    isLoading: messagesLoading, 
    sendMessage, 
    isSending,
    isPartnerTyping,
    sendTypingIndicator,
    sendStopTyping,
  } = useConversation(selectedPartnerId);

  // Handle typing indicator
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    // Send typing indicator
    sendTypingIndicator();
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Stop typing after 2 seconds of no input
    typingTimeoutRef.current = setTimeout(() => {
      sendStopTyping();
    }, 2000);
  };

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    sendMessage(newMessage.trim());
    setNewMessage("");
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Conversation list view
  if (!selectedPartnerId) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Messages
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {conversationsLoading ? (
            <div className="p-4 text-center text-muted-foreground">Loading...</div>
          ) : !conversations || conversations.length === 0 ? (
            <div className="p-8 text-center">
              <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No conversations yet</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Start a conversation from a user's profile
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              {conversations.map((conv) => (
                <button
                  key={conv.partnerId}
                  onClick={() => setSelectedPartnerId(conv.partnerId)}
                  className="w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors border-b border-border/50 text-left"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={conv.partnerAvatar || undefined} />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium truncate">
                        {conv.partnerUsername || "Unknown"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <Badge variant="default" className="ml-2">
                      {conv.unreadCount}
                    </Badge>
                  )}
                </button>
              ))}
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    );
  }

  // Conversation view
  const partner = conversations?.find((c) => c.partnerId === selectedPartnerId);

  const handleBack = () => {
    if (initialPartnerId) {
      // Navigated here via URL, go back to messages list
      navigate("/messages");
    }
    setSelectedPartnerId(null);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-row items-center gap-3 space-y-0 border-b">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Avatar className="h-8 w-8">
          <AvatarImage src={partner?.partnerAvatar || undefined} />
          <AvatarFallback>
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        <CardTitle className="text-base">{partner?.partnerUsername || "User"}</CardTitle>
      </CardHeader>

      <ScrollArea className="flex-1 p-4">
        {messagesLoading ? (
          <div className="text-center text-muted-foreground">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <p>No messages yet</p>
            <p className="text-sm">Send a message to start the conversation</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => {
              const isOwn = msg.sender_id === user?.id;
              return (
                <div
                  key={msg.id}
                  className={cn("flex", isOwn ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[75%] rounded-lg px-4 py-2",
                      isOwn
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                    <p
                      className={cn(
                        "text-xs mt-1",
                        isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                      )}
                    >
                      {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              );
            })}
            
            {/* Typing Indicator */}
            {isPartnerTyping && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-4 py-2">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      <div className="p-4 border-t">
        {isPartnerTyping && (
          <p className="text-xs text-muted-foreground mb-2">
            {partner?.partnerUsername || "User"} is typing...
          </p>
        )}
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            disabled={isSending}
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={isSending || !newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
