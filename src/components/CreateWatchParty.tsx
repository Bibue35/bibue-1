import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface CreateWatchPartyProps {
  animeId: number;
  animeTitle: string;
  animeImage?: string;
}

export function CreateWatchParty({ animeId, animeTitle, animeImage }: CreateWatchPartyProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(`${animeTitle} Watch Party`);
  const [loading, setLoading] = useState(false);

  const create = async () => {
    if (!user || !title.trim()) return;
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("watch_parties")
        .insert({
          host_id: user.id,
          title: title.trim(),
          anime_id: animeId,
          anime_title: animeTitle,
          anime_image: animeImage || null,
        })
        .select("share_code")
        .single();

      if (error) throw error;
      setOpen(false);
      navigate(`/party/${data.share_code}`);
    } catch (err: any) {
      toast({ title: "Failed to create party", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 rounded-full">
          <Users className="w-3.5 h-3.5" />
          Watch Party
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Watch Party</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            {animeImage && <img src={animeImage} alt="" className="w-12 h-16 rounded-lg object-cover" />}
            <p className="text-sm text-muted-foreground">{animeTitle}</p>
          </div>
          <Input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Party name..."
          />
          <Button onClick={create} disabled={loading || !title.trim()} className="w-full gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
            Create & Share
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
