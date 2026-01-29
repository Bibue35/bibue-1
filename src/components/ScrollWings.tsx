import { cn } from "@/lib/utils";

interface ScrollWingsProps {
  direction: "up" | "down";
  className?: string;
  label?: string;
  onClick?: () => void;
}

export function ScrollWings({ direction, className, label, onClick }: ScrollWingsProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex flex-col items-center gap-2 py-6 w-full transition-all duration-500",
        "hover:scale-105 cursor-pointer",
        className
      )}
    >
      {/* Wings container */}
      <div className={cn(
        "relative flex items-center justify-center",
        direction === "down" && "animate-bounce-slow"
      )}>
        {/* Left Wing */}
        <svg
          viewBox="0 0 80 100"
          className={cn(
            "w-12 h-16 sm:w-16 sm:h-20 transition-transform duration-500",
            "opacity-60 group-hover:opacity-90",
            direction === "up" && "rotate-180"
          )}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="wingGradientL" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(48, 90%, 92%)" />
              <stop offset="40%" stopColor="hsl(45, 80%, 85%)" />
              <stop offset="100%" stopColor="hsl(42, 60%, 75%)" />
            </linearGradient>
            <filter id="wingGlowL">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          {/* Main wing shape */}
          <path
            d="M75 50C75 50 65 15 40 8C15 1 5 25 5 42C5 59 18 75 30 82C42 89 62 82 70 70C78 58 75 50 75 50Z"
            fill="url(#wingGradientL)"
            filter="url(#wingGlowL)"
            className="drop-shadow-lg"
          />
          {/* Feather lines */}
          <path d="M70 45C60 25 45 15 30 12" stroke="hsl(48, 100%, 95%)" strokeWidth="1.5" opacity="0.7" strokeLinecap="round"/>
          <path d="M65 50C55 32 42 22 28 18" stroke="hsl(48, 100%, 93%)" strokeWidth="1.5" opacity="0.5" strokeLinecap="round"/>
          <path d="M60 55C50 40 38 30 25 25" stroke="hsl(48, 100%, 90%)" strokeWidth="1.5" opacity="0.4" strokeLinecap="round"/>
          <path d="M55 60C48 48 38 40 25 35" stroke="hsl(48, 100%, 88%)" strokeWidth="1" opacity="0.3" strokeLinecap="round"/>
        </svg>

        {/* Center glow orb */}
        <div className={cn(
          "w-8 h-8 rounded-full",
          "bg-gradient-to-br from-accent via-muted to-transparent",
          "shadow-[0_0_20px_hsl(var(--divine-glow))]",
          "flex items-center justify-center",
          "group-hover:shadow-[0_0_30px_hsl(var(--divine-radiance))]",
          "transition-shadow duration-500"
        )}>
          {direction === "down" ? (
            <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          )}
        </div>

        {/* Right Wing (mirrored) */}
        <svg
          viewBox="0 0 80 100"
          className={cn(
            "w-12 h-16 sm:w-16 sm:h-20 transition-transform duration-500 -scale-x-100",
            "opacity-60 group-hover:opacity-90",
            direction === "up" && "rotate-180"
          )}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="wingGradientR" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(48, 90%, 92%)" />
              <stop offset="40%" stopColor="hsl(45, 80%, 85%)" />
              <stop offset="100%" stopColor="hsl(42, 60%, 75%)" />
            </linearGradient>
          </defs>
          <path
            d="M75 50C75 50 65 15 40 8C15 1 5 25 5 42C5 59 18 75 30 82C42 89 62 82 70 70C78 58 75 50 75 50Z"
            fill="url(#wingGradientR)"
            className="drop-shadow-lg"
          />
          <path d="M70 45C60 25 45 15 30 12" stroke="hsl(48, 100%, 95%)" strokeWidth="1.5" opacity="0.7" strokeLinecap="round"/>
          <path d="M65 50C55 32 42 22 28 18" stroke="hsl(48, 100%, 93%)" strokeWidth="1.5" opacity="0.5" strokeLinecap="round"/>
          <path d="M60 55C50 40 38 30 25 25" stroke="hsl(48, 100%, 90%)" strokeWidth="1.5" opacity="0.4" strokeLinecap="round"/>
        </svg>
      </div>

      {/* Label */}
      {label && (
        <span className="text-sm font-sacred text-muted-foreground group-hover:text-foreground transition-colors">
          {label}
        </span>
      )}
    </button>
  );
}

export function FloatingHalo({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none", className)}>
      <svg
        viewBox="0 0 200 60"
        className="w-full h-auto opacity-50"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="floatingHaloGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(48, 100%, 80%)" stopOpacity="0.2" />
            <stop offset="50%" stopColor="hsl(45, 100%, 85%)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="hsl(48, 100%, 80%)" stopOpacity="0.2" />
          </linearGradient>
          <filter id="floatingHaloBlur">
            <feGaussianBlur stdDeviation="2"/>
          </filter>
        </defs>
        <ellipse
          cx="100"
          cy="30"
          rx="90"
          ry="20"
          stroke="url(#floatingHaloGrad)"
          strokeWidth="3"
          fill="none"
          filter="url(#floatingHaloBlur)"
        />
        <ellipse
          cx="100"
          cy="30"
          rx="80"
          ry="16"
          stroke="hsl(48, 100%, 90%)"
          strokeWidth="1"
          fill="none"
          opacity="0.4"
        />
      </svg>
    </div>
  );
}

export function AmbientClouds({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {/* Top left cloud */}
      <svg
        viewBox="0 0 200 80"
        className="absolute top-10 -left-10 w-40 h-16 opacity-30"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="cloudGrad1" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor="hsl(48, 60%, 98%)" />
            <stop offset="100%" stopColor="hsl(45, 40%, 94%)" stopOpacity="0.3" />
          </radialGradient>
        </defs>
        <ellipse cx="50" cy="50" rx="40" ry="25" fill="url(#cloudGrad1)" />
        <ellipse cx="100" cy="40" rx="50" ry="30" fill="url(#cloudGrad1)" />
        <ellipse cx="150" cy="50" rx="40" ry="25" fill="url(#cloudGrad1)" />
      </svg>

      {/* Top right cloud */}
      <svg
        viewBox="0 0 200 80"
        className="absolute top-20 -right-20 w-48 h-20 opacity-25"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="cloudGrad2" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor="hsl(48, 60%, 98%)" />
            <stop offset="100%" stopColor="hsl(45, 40%, 94%)" stopOpacity="0.3" />
          </radialGradient>
        </defs>
        <ellipse cx="50" cy="50" rx="40" ry="25" fill="url(#cloudGrad2)" />
        <ellipse cx="100" cy="40" rx="50" ry="30" fill="url(#cloudGrad2)" />
        <ellipse cx="150" cy="50" rx="40" ry="25" fill="url(#cloudGrad2)" />
      </svg>
    </div>
  );
}
