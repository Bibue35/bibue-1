import { useIncognito } from "@/contexts/IncognitoContext";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";

export function IncognitoOverlay() {
  const { user } = useAuth();
  const { isIncognito } = useIncognito();
  const isMobile = useIsMobile();

  // Only show when user is logged in and incognito mode is active
  if (!user || !isIncognito) return null;

  // On mobile, don't render the corner vignettes — navbar icon handles it
  if (isMobile) return null;

  return (
    <>
      {/* Blue corner vignettes for incognito mode (desktop only) */}
      <div 
        className="fixed top-0 left-0 w-40 h-40 pointer-events-none z-[99]"
        style={{
          background: "radial-gradient(ellipse at top left, rgba(59, 130, 246, 0.35) 0%, transparent 70%)",
        }}
      />
      <div 
        className="fixed top-0 right-0 w-40 h-40 pointer-events-none z-[99]"
        style={{
          background: "radial-gradient(ellipse at top right, rgba(59, 130, 246, 0.35) 0%, transparent 70%)",
        }}
      />
      <div 
        className="fixed bottom-0 left-0 w-40 h-40 pointer-events-none z-[99]"
        style={{
          background: "radial-gradient(ellipse at bottom left, rgba(59, 130, 246, 0.35) 0%, transparent 70%)",
        }}
      />
      <div 
        className="fixed bottom-0 right-0 w-40 h-40 pointer-events-none z-[99]"
        style={{
          background: "radial-gradient(ellipse at bottom right, rgba(59, 130, 246, 0.35) 0%, transparent 70%)",
        }}
      />
    </>
  );
}
