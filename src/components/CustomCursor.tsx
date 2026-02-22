import { useEffect, useRef, useState, memo } from "react";

/**
 * Custom cursor — desktop only. Small glowing circle that follows the mouse.
 * Scales up when hovering clickable elements.
 */
export const CustomCursor = memo(function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isClickable, setIsClickable] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const posRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef(0);

  useEffect(() => {
    // Don't run on touch devices
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const onMove = (e: MouseEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);
    };

    const update = () => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${posRef.current.x}px, ${posRef.current.y}px)`;
      }
      rafRef.current = requestAnimationFrame(update);
    };

    const onOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const clickable = target.closest("a, button, [role='button'], input, select, textarea, label, [data-clickable]");
      setIsClickable(!!clickable);
    };

    const onLeave = () => setIsVisible(false);
    const onEnter = () => setIsVisible(true);

    document.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", onOver, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);
    rafRef.current = requestAnimationFrame(update);

    // Add cursor-none to body
    document.body.classList.add("custom-cursor-active");

    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
      cancelAnimationFrame(rafRef.current);
      document.body.classList.remove("custom-cursor-active");
    };
  }, [isVisible]);

  // Don't render on touch/mobile
  if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
    return null;
  }

  return (
    <div
      ref={cursorRef}
      className={`fixed top-0 left-0 pointer-events-none z-[9999] transition-opacity duration-200 ${isVisible ? "opacity-100" : "opacity-0"}`}
      style={{ willChange: "transform" }}
    >
      <div
        className={`-translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/40 transition-all duration-200 ease-out ${
          isClickable
            ? "w-10 h-10 bg-primary/10 shadow-[0_0_20px_hsl(var(--primary)/0.3)]"
            : "w-5 h-5 bg-primary/5 shadow-[0_0_12px_hsl(var(--primary)/0.2)]"
        }`}
      />
    </div>
  );
});
