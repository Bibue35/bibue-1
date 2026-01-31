import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

interface AdUnitProps {
  slot: string;
  format?: "auto" | "fluid" | "rectangle" | "horizontal" | "vertical";
  responsive?: boolean;
  className?: string;
}

export function AdUnit({ 
  slot, 
  format = "auto", 
  responsive = true,
  className 
}: AdUnitProps) {
  const adRef = useRef<HTMLModElement>(null);
  const isLoaded = useRef(false);

  useEffect(() => {
    if (isLoaded.current) return;
    
    try {
      if (adRef.current && window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        isLoaded.current = true;
      }
    } catch (error) {
      console.error("AdSense error:", error);
    }
  }, []);

  return (
    <div className={cn("ad-container my-6 flex justify-center", className)}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-2458670095989987"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
    </div>
  );
}

// Placeholder component for development/testing
export function AdPlaceholder({ 
  className,
  size = "banner" 
}: { 
  className?: string;
  size?: "banner" | "rectangle" | "leaderboard";
}) {
  const sizeClasses = {
    banner: "h-[90px] max-w-[728px]",
    rectangle: "h-[250px] max-w-[300px]",
    leaderboard: "h-[90px] max-w-[970px]",
  };

  return (
    <div 
      className={cn(
        "w-full bg-foreground/5 border border-dashed border-foreground/10 rounded-xl flex items-center justify-center text-muted-foreground text-sm my-6 mx-auto",
        sizeClasses[size],
        className
      )}
    >
      <span className="opacity-50">Ad Space</span>
    </div>
  );
}
