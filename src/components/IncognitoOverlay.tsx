import { useIncognito } from "@/contexts/IncognitoContext";
import { useAuth } from "@/contexts/AuthContext";

export function IncognitoOverlay() {
  const { user } = useAuth();
  const { isIncognito } = useIncognito();

  // Only show when user is logged in and incognito mode is active
  if (!user || !isIncognito) return null;

  return (
    <>
      {/* Top-left corner vignette */}
      <div 
        className="fixed top-0 left-0 w-48 h-48 pointer-events-none z-[100]"
        style={{
          background: "radial-gradient(ellipse at top left, rgba(0,0,0,0.6) 0%, transparent 70%)",
        }}
      />
      {/* Top-right corner vignette */}
      <div 
        className="fixed top-0 right-0 w-48 h-48 pointer-events-none z-[100]"
        style={{
          background: "radial-gradient(ellipse at top right, rgba(0,0,0,0.6) 0%, transparent 70%)",
        }}
      />
      {/* Bottom-left corner vignette */}
      <div 
        className="fixed bottom-0 left-0 w-48 h-48 pointer-events-none z-[100]"
        style={{
          background: "radial-gradient(ellipse at bottom left, rgba(0,0,0,0.6) 0%, transparent 70%)",
        }}
      />
      {/* Bottom-right corner vignette */}
      <div 
        className="fixed bottom-0 right-0 w-48 h-48 pointer-events-none z-[100]"
        style={{
          background: "radial-gradient(ellipse at bottom right, rgba(0,0,0,0.6) 0%, transparent 70%)",
        }}
      />
    </>
  );
}
