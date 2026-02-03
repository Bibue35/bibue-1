import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

const categories = [
  { value: "general", label: "General Discussion" },
  { value: "anime", label: "Anime" },
  { value: "manga", label: "Manga" },
  { value: "recommendations", label: "Recommendations" },
  { value: "news", label: "News & Updates" },
  { value: "spoilers", label: "Spoilers" },
];

interface CreateDiscussionDialogProps {
  children?: React.ReactNode;
}

export function CreateDiscussionDialog({ children }: CreateDiscussionDialogProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("general");

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Not authenticated");

      const { error } = await supabase.from("discussions").insert({
        user_id: user.id,
        title: title.trim(),
        content: content.trim(),
        category,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Discussion created!");
      queryClient.invalidateQueries({ queryKey: ["discussions"] });
      setOpen(false);
      setTitle("");
      setContent("");
      setCategory("general");
    },
    onError: (error) => {
      toast.error("Failed to create discussion");
      console.error(error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    createMutation.mutate();
  };

  if (!user) {
    return (
      <Button onClick={() => toast.error("Please sign in to create discussions")}>
        {children || (
          <>
            <Plus className="w-4 h-4 mr-2" />
            New Discussion
          </>
        )}
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          {children || (
            <>
              <Plus className="w-4 h-4" />
              New Discussion
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Discussion</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="What's on your mind?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              placeholder="Share your thoughts... (Markdown supported)"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Supports Markdown: **bold**, *italic*, [links](url), &gt;!spoilers!&lt;
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Discussion"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
