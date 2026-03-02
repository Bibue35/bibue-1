import { useEffect, useState, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";

type TransitionDirection = "to-sun" | "to-moon" | null;

interface ThemeTransitionOverlayProps {
  direction: TransitionDirection;
  onComplete: () => void;
}

// Generate stable random positions for particles
function generateParticles(count: number, seed: number) {
  const particles: Array<{ x: number; y: number; size: number; delay: number; duration: number }> = [];
  for (let i = 0; i < count; i++) {
    const s = (seed + i * 7919) % 10000;
    particles.push({
      x: (s % 100),
      y: ((s * 31) % 100),
      size: 1.5 + ((s * 13) % 30) / 10,
      delay: ((s * 17) % 500) / 1000,
      duration: 0.6 + ((s * 23) % 800) / 1000,
    });
  }
  return particles;
}

export function ThemeTransitionOverlay({ direction, onComplete }: ThemeTransitionOverlayProps) {
  const [phase, setPhase] = useState<"enter" | "hold" | "exit" | "done">("enter");

  const sunParticles = useMemo(() => generateParticles(25, 42), []);
  const moonParticles = useMemo(() => generateParticles(30, 99), []);

  useEffect(() => {
    if (!direction) return;
    setPhase("enter");

    const enterTimer = setTimeout(() => {
      setPhase("hold");
      const holdTimer = setTimeout(() => {
        setPhase("exit");
        const exitTimer = setTimeout(() => {
          setPhase("done");
          onComplete();
        }, 600);
        return () => clearTimeout(exitTimer);
      }, 700);
      return () => clearTimeout(holdTimer);
    }, 900);

    return () => clearTimeout(enterTimer);
  }, [direction, onComplete]);

  if (!direction || phase === "done") return null;

  const isSun = direction === "to-sun";
  const particles = isSun ? sunParticles : moonParticles;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      {/* Main gradient wash */}
      <div
        className="absolute inset-0"
        style={{
          opacity: phase === "exit" ? 0 : 1,
          transition: `opacity ${phase === "exit" ? "600ms" : "900ms"} cubic-bezier(0.4, 0, 0.2, 1)`,
          background: isSun
            ? "radial-gradient(ellipse at 50% -20%, hsla(45,100%,70%,0.8) 0%, hsla(36,93%,50%,0.5) 30%, hsla(24,90%,55%,0.2) 60%, transparent 100%)"
            : "radial-gradient(ellipse at 50% 120%, hsla(228,33%,10%,0.9) 0%, hsla(258,35%,20%,0.5) 35%, hsla(255,22%,30%,0.15) 65%, transparent 100%)",
        }}
      />

      {/* Orb — sun or moon */}
      <div
        className="absolute left-1/2 -translate-x-1/2 rounded-full"
        style={{
          width: "140px",
          height: "140px",
          top: isSun
            ? (phase === "enter" ? "-140px" : "15%")
            : undefined,
          bottom: !isSun
            ? (phase === "enter" ? "-140px" : "18%")
            : undefined,
          opacity: phase === "exit" ? 0 : 1,
          transition: "all 1.1s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s ease",
          background: isSun
            ? "radial-gradient(circle, hsla(45,100%,80%,1) 0%, hsla(36,93%,55%,0.7) 50%, transparent 100%)"
            : "radial-gradient(circle, hsla(210,30%,92%,0.95) 0%, hsla(225,25%,78%,0.5) 50%, transparent 100%)",
          boxShadow: isSun
            ? "0 0 100px 50px hsla(45,100%,65%,0.5), 0 0 200px 100px hsla(36,93%,50%,0.2)"
            : "0 0 80px 40px hsla(214,30%,85%,0.3), 0 0 160px 80px hsla(258,25%,60%,0.12)",
          filter: isSun ? "blur(3px)" : "blur(2px)",
        }}
      />

      {/* Sun rays */}
      {isSun && [...Array(10)].map((_, i) => (
        <div
          key={i}
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            top: phase === "enter" ? "-10%" : "15%",
            width: i % 2 === 0 ? "2px" : "1px",
            height: phase === "hold" || phase === "exit" ? "220px" : "60px",
            background: `linear-gradient(180deg, hsla(45,100%,75%,${phase === "hold" ? 0.5 : 0}) 0%, transparent 100%)`,
            transform: `translateX(-50%) rotate(${i * 36}deg)`,
            transformOrigin: "50% 0%",
            transition: "all 1.2s cubic-bezier(0.16, 1, 0.3, 1)",
            opacity: phase === "exit" ? 0 : 1,
          }}
        />
      ))}

      {/* Particles — golden dust or silver sparkles */}
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            left: `${p.x}%`,
            top: `${p.y}%`,
            opacity: phase === "enter" ? 0 : phase === "hold" ? 0.5 + (p.size / 6) : 0,
            transition: `opacity ${p.duration}s ease ${p.delay}s`,
            background: isSun
              ? `hsla(45, 100%, ${65 + p.size * 5}%, 0.9)`
              : `hsla(214, 30%, ${80 + p.size * 3}%, 0.85)`,
            boxShadow: isSun
              ? `0 0 ${p.size * 3}px ${p.size}px hsla(45, 100%, 70%, 0.4)`
              : `0 0 ${p.size * 2}px ${p.size * 0.5}px hsla(214, 30%, 85%, 0.3)`,
          }}
        />
      ))}
    </div>,
    document.body
  );
}

/** Hook to manage the celestial theme transition */
export function useThemeTransition() {
  const [direction, setDirection] = useState<TransitionDirection>(null);

  const trigger = useCallback((dir: "to-sun" | "to-moon") => {
    setDirection(dir);
  }, []);

  const handleComplete = useCallback(() => {
    setDirection(null);
  }, []);

  return { direction, trigger, handleComplete };
}
