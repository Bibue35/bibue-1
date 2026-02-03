import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TitleTooltipProps {
  romaji?: string;
  english?: string;
  native?: string;
  className?: string;
}

export function TitleTooltip({ romaji, english, native, className }: TitleTooltipProps) {
  // Only show if we have multiple title variants
  const hasMultipleTitles = [romaji, english, native].filter(Boolean).length > 1;
  
  if (!hasMultipleTitles) return null;

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button 
            className={className}
            onClick={(e) => e.stopPropagation()}
          >
            <Info className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground transition-colors" />
          </button>
        </TooltipTrigger>
        <TooltipContent 
          side="top" 
          className="max-w-xs bg-popover border border-border shadow-lg"
        >
          <div className="space-y-1.5 text-xs">
            <p className="text-muted-foreground font-medium mb-2">Title Variants (AniList)</p>
            {romaji && (
              <div className="flex gap-2">
                <span className="text-muted-foreground w-14 shrink-0">Romaji:</span>
                <span className="font-medium">{romaji}</span>
              </div>
            )}
            {english && (
              <div className="flex gap-2">
                <span className="text-muted-foreground w-14 shrink-0">English:</span>
                <span>{english}</span>
              </div>
            )}
            {native && (
              <div className="flex gap-2">
                <span className="text-muted-foreground w-14 shrink-0">Native:</span>
                <span className="font-jp">{native}</span>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
