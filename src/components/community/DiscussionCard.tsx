import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { lazy, Suspense, useState } from "react";
const MarkdownContent = lazy(() => import("@/components/MarkdownContent").then(m => ({ default: m.MarkdownContent })));
import { MessageCircle, ThumbsUp, Clock, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DiscussionCardProps {
  discussion: {
    id: string;
    title: string;
    content: string;
    category: string;
    created_at: string;
    user_id: string;
    profiles?: {
      username: string | null;
      avatar_url: string | null;
      display_name?: string | null;
    } | null;
    _count?: {
      replies: number;
      likes: number;
    };
  };
}

const categoryColors: Record<string, string> = {
  general: "bg-foreground/8 text-foreground/80",
  anime: "bg-foreground/8 text-foreground/80",
  manga: "bg-foreground/8 text-foreground/80",
  recommendations: "bg-foreground/8 text-foreground/80",
  news: "bg-foreground/8 text-foreground/80",
  spoilers: "bg-destructive/10 text-destructive",
};

export function DiscussionCard({ discussion }: DiscussionCardProps) {
  const profile = discussion.profiles;
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isOwner = user?.id === discussion.user_id;
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(discussion.title);
  const [editContent, setEditContent] = useState(discussion.content);
  const [showDelete, setShowDelete] = useState(false);

  const editMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("discussions").update({ title: editTitle, content: editContent }).eq("id", discussion.id).eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["discussions"] });
      toast({ title: "Discussion updated" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      // Delete replies first
      await supabase.from("discussion_replies").delete().eq("discussion_id", discussion.id);
      const { error } = await supabase.from("discussions").delete().eq("id", discussion.id).eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      setShowDelete(false);
      queryClient.invalidateQueries({ queryKey: ["discussions"] });
      toast({ title: "Discussion deleted" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  return (
    <>
      <article className="bg-card rounded-2xl p-6 border border-border/5 transition-all cursor-pointer group hover:border-border/15">
        {isEditing ? (
          <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full text-lg font-semibold bg-transparent border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="resize-none"
              rows={4}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={() => editMutation.mutate()} disabled={editMutation.isPending}>Save</Button>
              <Button size="sm" variant="ghost" onClick={() => { setIsEditing(false); setEditTitle(discussion.title); setEditContent(discussion.content); }}>Cancel</Button>
            </div>
          </div>
        ) : (
          <Link to={`/community/discussion/${discussion.id}`} className="block">
            <div className="flex items-start gap-4">
              <Link 
                to={`/user/${discussion.user_id}`} 
                onClick={(e) => e.stopPropagation()}
                className="flex-shrink-0"
              >
                <Avatar className="h-10 w-10 ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="text-sm">
                    {(profile?.username || "U").slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                    {discussion.title}
                  </h3>
                  {isOwner && (
                    <div onClick={(e) => e.preventDefault()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full flex-shrink-0 ml-2">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setIsEditing(true)}>
                            <Pencil className="w-3.5 h-3.5 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => setShowDelete(true)}>
                            <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </div>
                
                <Suspense fallback={<p className="text-muted-foreground text-sm line-clamp-2 mt-1">{discussion.content.slice(0, 200)}</p>}>
                  <MarkdownContent 
                    content={discussion.content.slice(0, 200) + (discussion.content.length > 200 ? "..." : "")} 
                    className="text-muted-foreground text-sm line-clamp-2 mt-1"
                  />
                </Suspense>

                <div className="flex flex-wrap items-center gap-3 mt-3 text-sm">
                  <Badge variant="secondary" className={categoryColors[discussion.category] || categoryColors.general}>
                    {discussion.category}
                  </Badge>
                  <Link 
                    to={`/user/${discussion.user_id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {profile?.display_name || profile?.username || "Anonymous"}
                  </Link>
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDistanceToNow(new Date(discussion.created_at), { addSuffix: true })}
                  </span>
                  {discussion._count && (
                    <>
                      <span className="text-muted-foreground flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" /> {discussion._count.replies}
                      </span>
                      <span className="text-muted-foreground flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3" /> {discussion._count.likes}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Link>
        )}
      </article>

      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete discussion?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete this discussion and all its replies.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteMutation.mutate()} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}