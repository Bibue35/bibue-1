import { EyeOff } from "lucide-react";
import { useIncognito } from "@/contexts/IncognitoContext";
import { useAuth } from "@/contexts/AuthContext";

export function IncognitoOverlay() {
  const { user } = useAuth();
  const { isIncognito } = useIncognito();

  // Only show when user is logged in and incognito mode is active
  if (!user || !isIncognito) return null;

  return (
    <>
      {/* Incognito indicator badge - fixed at top center */}
      <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[100] pointer-events-none">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 shadow-lg">
          <EyeOff className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-medium text-muted-foreground">Incognito</span>
        </div>
      </div>

      {/* Subtle corner vignettes */}
      <div 
        className="fixed top-0 left-0 w-32 h-32 pointer-events-none z-[99]"
        style={{
          background: "radial-gradient(ellipse at top left, rgba(0,0,0,0.4) 0%, transparent 70%)",
        }}
      />
      <div 
        className="fixed top-0 right-0 w-32 h-32 pointer-events-none z-[99]"
        style={{
          background: "radial-gradient(ellipse at top right, rgba(0,0,0,0.4) 0%, transparent 70%)",
        }}
      />
      <div 
        className="fixed bottom-0 left-0 w-32 h-32 pointer-events-none z-[99]"
        style={{
          background: "radial-gradient(ellipse at bottom left, rgba(0,0,0,0.4) 0%, transparent 70%)",
        }}
      />
      <div 
        className="fixed bottom-0 right-0 w-32 h-32 pointer-events-none z-[99]"
        style={{
          background: "radial-gradient(ellipse at bottom right, rgba(0,0,0,0.4) 0%, transparent 70%)",
        }}
      />
    </>
  );
}
