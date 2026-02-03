import { useState } from "react";
import { Info, Sparkles, Check, AlertCircle, Loader2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface TitleTooltipProps {
  romaji?: string;
  english?: string;
  native?: string;
  className?: string;
}

interface ValidationResult {
  isValid: boolean;
  corrections?: {
    romaji?: string | null;
    english?: string | null;
    native?: string | null;
  };
  alternates?: string[];
  notes?: string;
  error?: string;
}

export function TitleTooltip({ romaji, english, native, className }: TitleTooltipProps) {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  // Only show if we have multiple title variants
  const hasMultipleTitles = [romaji, english, native].filter(Boolean).length > 1;
  
  if (!hasMultipleTitles) return null;

  const handleValidate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsValidating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('validate-title', {
        body: { 
          title: english || romaji || native,
          titleRomaji: romaji,
          titleEnglish: english,
          titleNative: native
        }
      });

      if (error) throw error;
      
      setValidationResult(data);
      
      if (data.isValid) {
        toast({
          title: "Title Verified ✓",
          description: data.notes || "All title variants appear correct.",
        });
      } else {
        toast({
          title: "Corrections Found",
          description: data.notes || "Some title information may need updating.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Validation error:", error);
      toast({
        title: "Validation Failed",
        description: "Could not validate title. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

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
          className="max-w-xs bg-popover border border-border shadow-lg p-3"
        >
          <div className="space-y-2 text-xs">
            <p className="text-muted-foreground font-medium">Title Variants (AniList)</p>
            
            {romaji && (
              <div className="flex gap-2">
                <span className="text-muted-foreground w-14 shrink-0">Romaji:</span>
                <span className="font-medium">{romaji}</span>
                {validationResult?.corrections?.romaji && (
                  <span className="text-destructive ml-1">→ {validationResult.corrections.romaji}</span>
                )}
              </div>
            )}
            {english && (
              <div className="flex gap-2">
                <span className="text-muted-foreground w-14 shrink-0">English:</span>
                <span>{english}</span>
                {validationResult?.corrections?.english && (
                  <span className="text-destructive ml-1">→ {validationResult.corrections.english}</span>
                )}
              </div>
            )}
            {native && (
              <div className="flex gap-2">
                <span className="text-muted-foreground w-14 shrink-0">Native:</span>
                <span className="font-jp">{native}</span>
                {validationResult?.corrections?.native && (
                  <span className="text-destructive ml-1">→ {validationResult.corrections.native}</span>
                )}
              </div>
            )}

            {validationResult?.alternates && validationResult.alternates.length > 0 && (
              <div className="pt-1 border-t border-border/50">
                <span className="text-muted-foreground">Also known as:</span>
                <p className="text-foreground/80">{validationResult.alternates.slice(0, 3).join(", ")}</p>
              </div>
            )}

            {validationResult?.notes && (
              <p className="text-muted-foreground italic pt-1">{validationResult.notes}</p>
            )}

            <Button
              size="sm"
              variant="ghost"
              className="w-full mt-2 h-7 text-xs gap-1.5"
              onClick={handleValidate}
              disabled={isValidating}
            >
              {isValidating ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Validating...
                </>
              ) : validationResult?.isValid ? (
                <>
                  <Check className="w-3 h-3 text-primary" />
                  Verified with AI
                </>
              ) : validationResult?.isValid === false ? (
                <>
                  <AlertCircle className="w-3 h-3 text-destructive" />
                  Issues Found
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3" />
                  Validate with AI
                </>
              )}
            </Button>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
