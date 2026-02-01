import { EyeOff, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useIncognito } from "@/contexts/IncognitoContext";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

export function IncognitoToggle() {
  const { user } = useAuth();
  const { isIncognito, toggleIncognito } = useIncognito();

  if (!user) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleIncognito}
          className={cn(
            "rounded-full transition-colors",
            isIncognito && "bg-primary/10 text-primary"
          )}
        >
          {isIncognito ? (
            <EyeOff className="h-5 w-5" />
          ) : (
            <Eye className="h-5 w-5" />
          )}
          <span className="sr-only">{isIncognito ? "Disable" : "Enable"} incognito mode</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{isIncognito ? "Incognito mode active" : "Enable incognito mode"}</p>
        <p className="text-xs text-muted-foreground">
          {isIncognito ? "Your activity is hidden" : "Hide your activity from others"}
        </p>
      </TooltipContent>
    </Tooltip>
  );
}
