import { Monitor } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type Resolution = "360p" | "480p" | "720p" | "1080p" | "1440p" | "4K";

interface ResolutionSelectorProps {
  value: Resolution;
  onChange: (value: Resolution) => void;
  className?: string;
}

const resolutions: { value: Resolution; label: string }[] = [
  { value: "360p", label: "360p" },
  { value: "480p", label: "480p" },
  { value: "720p", label: "720p HD" },
  { value: "1080p", label: "1080p FHD" },
  { value: "1440p", label: "1440p QHD" },
  { value: "4K", label: "4K UHD" },
];

export function ResolutionSelector({ value, onChange, className }: ResolutionSelectorProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        className={cn(
          "h-10 w-auto gap-2 border-0 bg-white/10 hover:bg-white/20 text-white/70 hover:text-white rounded-full px-3 focus:ring-0 focus:ring-offset-0",
          className
        )}
      >
        <Monitor className="w-4 h-4" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="bg-background/95 backdrop-blur-md border-border">
        {resolutions.map((res) => (
          <SelectItem key={res.value} value={res.value} className="cursor-pointer">
            {res.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
