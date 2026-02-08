import { RefreshCw, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SectionErrorProps {
  message?: string;
  onRetry?: () => void;
}

export function SectionError({ 
  message = "Failed to load content", 
  onRetry 
}: SectionErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center gap-3">
      <WifiOff className="w-8 h-8 text-muted-foreground/50" />
      <p className="text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRetry}
          className="gap-2 text-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry
        </Button>
      )}
    </div>
  );
}
