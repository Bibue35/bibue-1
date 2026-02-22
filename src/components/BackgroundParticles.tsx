import { memo, useMemo } from "react";

/**
 * Subtle floating particles on dark backgrounds — CSS-only for performance.
 * Respects prefers-reduced-motion automatically via CSS.
 */
export const BackgroundParticles = memo(function BackgroundParticles() {
  const particles = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => ({
      id: i,
      size: 2 + Math.random() * 3,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: 15 + Math.random() * 25,
      delay: Math.random() * -20,
      opacity: 0.08 + Math.random() * 0.12,
    }));
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    >
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-primary particle-float"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            opacity: p.opacity,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
});
