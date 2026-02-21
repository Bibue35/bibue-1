import { useState } from "react";
import { Share2, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";

interface ShareButtonProps {
  title: string;
  url: string;
  size?: "sm" | "icon";
}

export function ShareButton({ title, url, size = "icon" }: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const fullUrl = `https://bibue.net${url}`;

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url: fullUrl });
        setOpen(false);
      } catch {
        // User cancelled
      }
    }
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(fullUrl);
    toast({ title: "Link copied!" });
    setOpen(false);
  };

  const shareToTwitter = () => {
    const text = `Check out ${title} on Bibue!`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(fullUrl)}`, "_blank");
    setOpen(false);
  };

  const shareToReddit = () => {
    window.open(`https://www.reddit.com/submit?url=${encodeURIComponent(fullUrl)}&title=${encodeURIComponent(title)}`, "_blank");
    setOpen(false);
  };

  // Use native share on mobile if available
  if (navigator.share && size === "icon") {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full h-8 w-8 sm:h-9 sm:w-9"
        onClick={handleNativeShare}
        aria-label="Share"
      >
        <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </Button>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 sm:h-9 sm:w-9" aria-label="Share">
          <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-1.5" align="start">
        <button
          onClick={handleCopyLink}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors"
        >
          <Copy className="w-4 h-4" /> Copy link
        </button>
        <button
          onClick={shareToTwitter}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors"
        >
          <ExternalLink className="w-4 h-4" /> Share on X
        </button>
        <button
          onClick={shareToReddit}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors"
        >
          <ExternalLink className="w-4 h-4" /> Share on Reddit
        </button>
      </PopoverContent>
    </Popover>
  );
}
