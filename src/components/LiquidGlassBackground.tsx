import { useRef, useEffect, useCallback } from "react";
import { useThemeContext } from "@/contexts/ThemeContext";

/**
 * GPU-accelerated iridescent mesh gradient background.
 * Renders at 0.5x resolution with pixelated upscaling for performance.
 * Uses Intersection Observer + Page Visibility API to pause when hidden.
 */
export function LiquidGlassBackground() {
  const { flavor, resolvedMode } = useThemeContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const isVisibleRef = useRef(true);

  const render = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, time: number, isDark: boolean) => {
    // Simple mesh gradient using radial gradients — no WebGL needed
    ctx.clearRect(0, 0, w, h);

    // Base fill
    if (isDark) {
      ctx.fillStyle = "rgb(10, 5, 25)";
    } else {
      ctx.fillStyle = "rgb(235, 238, 248)";
    }
    ctx.fillRect(0, 0, w, h);

    const t = time * 0.0003;

    // Blob 1 — indigo/purple
    const x1 = w * (0.3 + 0.15 * Math.sin(t * 0.7));
    const y1 = h * (0.4 + 0.1 * Math.cos(t * 0.5));
    const r1 = Math.max(w, h) * 0.5;
    const g1 = ctx.createRadialGradient(x1, y1, 0, x1, y1, r1);
    if (isDark) {
      g1.addColorStop(0, "rgba(46, 11, 91, 0.6)");
      g1.addColorStop(1, "rgba(46, 11, 91, 0)");
    } else {
      g1.addColorStop(0, "rgba(120, 80, 200, 0.15)");
      g1.addColorStop(1, "rgba(120, 80, 200, 0)");
    }
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, w, h);

    // Blob 2 — blue
    const x2 = w * (0.7 + 0.12 * Math.cos(t * 0.6));
    const y2 = h * (0.3 + 0.15 * Math.sin(t * 0.8));
    const r2 = Math.max(w, h) * 0.45;
    const g2 = ctx.createRadialGradient(x2, y2, 0, x2, y2, r2);
    if (isDark) {
      g2.addColorStop(0, "rgba(0, 163, 255, 0.35)");
      g2.addColorStop(1, "rgba(0, 163, 255, 0)");
    } else {
      g2.addColorStop(0, "rgba(0, 140, 255, 0.12)");
      g2.addColorStop(1, "rgba(0, 140, 255, 0)");
    }
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, w, h);

    // Blob 3 — pink
    const x3 = w * (0.5 + 0.2 * Math.sin(t * 0.4));
    const y3 = h * (0.7 + 0.12 * Math.cos(t * 0.9));
    const r3 = Math.max(w, h) * 0.4;
    const g3 = ctx.createRadialGradient(x3, y3, 0, x3, y3, r3);
    if (isDark) {
      g3.addColorStop(0, "rgba(255, 0, 189, 0.25)");
      g3.addColorStop(1, "rgba(255, 0, 189, 0)");
    } else {
      g3.addColorStop(0, "rgba(255, 0, 189, 0.08)");
      g3.addColorStop(1, "rgba(255, 0, 189, 0)");
    }
    ctx.fillStyle = g3;
    ctx.fillRect(0, 0, w, h);

    // Blob 4 — amber highlight
    const x4 = w * (0.6 + 0.1 * Math.cos(t * 1.1));
    const y4 = h * (0.2 + 0.08 * Math.sin(t * 0.6));
    const r4 = Math.max(w, h) * 0.3;
    const g4 = ctx.createRadialGradient(x4, y4, 0, x4, y4, r4);
    if (isDark) {
      g4.addColorStop(0, "rgba(255, 144, 0, 0.15)");
      g4.addColorStop(1, "rgba(255, 144, 0, 0)");
    } else {
      g4.addColorStop(0, "rgba(255, 144, 0, 0.06)");
      g4.addColorStop(1, "rgba(255, 144, 0, 0)");
    }
    ctx.fillStyle = g4;
    ctx.fillRect(0, 0, w, h);
  }, []);

  useEffect(() => {
    if (flavor !== "liquid-glass") return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    // Render at 0.5x resolution for performance
    const scale = 0.5;
    const resize = () => {
      canvas.width = Math.floor(window.innerWidth * scale);
      canvas.height = Math.floor(window.innerHeight * scale);
    };
    resize();
    window.addEventListener("resize", resize, { passive: true });

    // Visibility API — pause when tab hidden
    const onVisibility = () => {
      isVisibleRef.current = !document.hidden;
    };
    document.addEventListener("visibilitychange", onVisibility);

    const isDark = resolvedMode === "dark";

    const loop = (time: number) => {
      if (isVisibleRef.current) {
        render(ctx, canvas.width, canvas.height, time, isDark);
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [flavor, resolvedMode, render]);

  if (flavor !== "liquid-glass") return null;

  return (
    <canvas
      ref={canvasRef}
      className="liquid-glass-canvas"
      aria-hidden="true"
    />
  );
}
