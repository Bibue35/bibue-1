import { cn } from "@/lib/utils";

// Divine decorative elements for the biblical theme
export function HaloRing({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 40"
      className={cn("w-full h-auto", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <ellipse
        cx="60"
        cy="20"
        rx="55"
        ry="15"
        stroke="url(#haloGradient)"
        strokeWidth="3"
        className="animate-pulse"
      />
      <ellipse
        cx="60"
        cy="20"
        rx="50"
        ry="12"
        stroke="url(#haloInnerGradient)"
        strokeWidth="1.5"
        opacity="0.6"
      />
      <defs>
        <linearGradient id="haloGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="hsl(45, 100%, 70%)" stopOpacity="0.3" />
          <stop offset="50%" stopColor="hsl(45, 100%, 80%)" stopOpacity="0.9" />
          <stop offset="100%" stopColor="hsl(45, 100%, 70%)" stopOpacity="0.3" />
        </linearGradient>
        <linearGradient id="haloInnerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="hsl(48, 100%, 90%)" stopOpacity="0.2" />
          <stop offset="50%" stopColor="hsl(48, 100%, 95%)" stopOpacity="0.7" />
          <stop offset="100%" stopColor="hsl(48, 100%, 90%)" stopOpacity="0.2" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function AngelWings({ className, side = "both" }: { className?: string; side?: "left" | "right" | "both" }) {
  const leftWing = (
    <svg
      viewBox="0 0 100 120"
      className={cn("w-16 h-20 opacity-60", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M95 60C95 60 80 20 50 10C20 0 5 30 5 50C5 70 20 90 35 100C50 110 75 100 85 85C95 70 95 60 95 60Z"
        fill="url(#wingGradientLeft)"
        className="drop-shadow-lg"
      />
      <path
        d="M90 55C85 30 60 15 40 12"
        stroke="hsl(45, 100%, 85%)"
        strokeWidth="1"
        opacity="0.5"
      />
      <path
        d="M85 60C75 35 55 25 35 20"
        stroke="hsl(45, 100%, 85%)"
        strokeWidth="1"
        opacity="0.4"
      />
      <path
        d="M80 65C70 45 50 35 30 30"
        stroke="hsl(45, 100%, 85%)"
        strokeWidth="1"
        opacity="0.3"
      />
      <defs>
        <linearGradient id="wingGradientLeft" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(45, 80%, 95%)" />
          <stop offset="50%" stopColor="hsl(45, 60%, 90%)" />
          <stop offset="100%" stopColor="hsl(45, 40%, 85%)" />
        </linearGradient>
      </defs>
    </svg>
  );

  const rightWing = (
    <svg
      viewBox="0 0 100 120"
      className={cn("w-16 h-20 opacity-60 scale-x-[-1]", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M95 60C95 60 80 20 50 10C20 0 5 30 5 50C5 70 20 90 35 100C50 110 75 100 85 85C95 70 95 60 95 60Z"
        fill="url(#wingGradientRight)"
        className="drop-shadow-lg"
      />
      <path
        d="M90 55C85 30 60 15 40 12"
        stroke="hsl(45, 100%, 85%)"
        strokeWidth="1"
        opacity="0.5"
      />
      <defs>
        <linearGradient id="wingGradientRight" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(45, 80%, 95%)" />
          <stop offset="50%" stopColor="hsl(45, 60%, 90%)" />
          <stop offset="100%" stopColor="hsl(45, 40%, 85%)" />
        </linearGradient>
      </defs>
    </svg>
  );

  if (side === "left") return leftWing;
  if (side === "right") return rightWing;
  
  return (
    <div className="flex items-center justify-center gap-0">
      {leftWing}
      {rightWing}
    </div>
  );
}

export function HeavenlyCloud({ className, variant = "default" }: { className?: string; variant?: "default" | "small" | "large" }) {
  const sizes = {
    small: "w-20 h-8",
    default: "w-32 h-12",
    large: "w-48 h-16"
  };

  return (
    <svg
      viewBox="0 0 200 80"
      className={cn(sizes[variant], "opacity-40", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <ellipse cx="50" cy="50" rx="40" ry="25" fill="url(#cloudGradient)" />
      <ellipse cx="100" cy="40" rx="50" ry="30" fill="url(#cloudGradient)" />
      <ellipse cx="150" cy="50" rx="40" ry="25" fill="url(#cloudGradient)" />
      <ellipse cx="75" cy="35" rx="35" ry="22" fill="url(#cloudHighlight)" />
      <ellipse cx="125" cy="35" rx="35" ry="22" fill="url(#cloudHighlight)" />
      <defs>
        <radialGradient id="cloudGradient" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="hsl(45, 50%, 98%)" />
          <stop offset="100%" stopColor="hsl(45, 30%, 92%)" />
        </radialGradient>
        <radialGradient id="cloudHighlight" cx="50%" cy="0%" r="100%">
          <stop offset="0%" stopColor="hsl(45, 100%, 98%)" stopOpacity="0.8" />
          <stop offset="100%" stopColor="hsl(45, 50%, 95%)" stopOpacity="0.2" />
        </radialGradient>
      </defs>
    </svg>
  );
}

export function LightBeams({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 200"
      className={cn("w-full h-auto absolute top-0 left-0 pointer-events-none", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="beam1" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="hsl(45, 100%, 85%)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="hsl(45, 100%, 85%)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="beam2" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="hsl(48, 100%, 90%)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="hsl(48, 100%, 90%)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points="180,0 200,200 160,200" fill="url(#beam1)" />
      <polygon points="200,0 230,200 170,200" fill="url(#beam2)" />
      <polygon points="220,0 250,200 190,200" fill="url(#beam1)" />
      <polygon points="150,0 180,200 120,200" fill="url(#beam2)" />
      <polygon points="250,0 290,200 210,200" fill="url(#beam1)" />
    </svg>
  );
}

export function DivineCard({ children, className, showHalo = true, showWings = false }: { 
  children: React.ReactNode; 
  className?: string;
  showHalo?: boolean;
  showWings?: boolean;
}) {
  return (
    <div className={cn("relative", className)}>
      {/* Halo above card - only in divine theme */}
      {showHalo && (
        <div className="hidden divine:block absolute -top-6 left-1/2 -translate-x-1/2 w-3/4">
          <HaloRing />
        </div>
      )}
      
      {/* Wings on sides - only in divine theme */}
      {showWings && (
        <>
          <div className="hidden divine:block absolute -left-12 top-1/2 -translate-y-1/2 opacity-40">
            <AngelWings side="left" />
          </div>
          <div className="hidden divine:block absolute -right-12 top-1/2 -translate-y-1/2 opacity-40">
            <AngelWings side="right" />
          </div>
        </>
      )}
      
      {children}
    </div>
  );
}

export function DivineBadge({ children, rank, className }: { 
  children: React.ReactNode; 
  rank?: number;
  className?: string;
}) {
  const isTop3 = rank && rank <= 3;
  
  return (
    <div className={cn("relative inline-flex items-center", className)}>
      {/* Halo for top 3 in divine theme */}
      {isTop3 && (
        <div className="hidden divine:block absolute -top-4 left-1/2 -translate-x-1/2 w-full">
          <HaloRing className="opacity-80" />
        </div>
      )}
      {children}
    </div>
  );
}
