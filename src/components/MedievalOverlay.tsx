import { useEffect, useRef, useCallback } from "react";

function createRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// Stone crack line — jagged with sharp turns
function stoneCrack(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, length: number, angle: number,
  rn: () => number, depth = 0
) {
  if (depth > 3 || length < 4) return;
  const steps = Math.max(Math.floor(length / 3), 2);
  ctx.beginPath();
  ctx.moveTo(x, y);
  let cx = x, cy = y;
  for (let i = 0; i < steps; i++) {
    const a = angle + (rn() - 0.5) * 1.2;
    const step = length / steps;
    cx += Math.cos(a) * step;
    cy += Math.sin(a) * step;
    ctx.lineTo(cx, cy);
    // Branch with decreasing probability
    if (rn() < 0.2 && depth < 2) {
      const branchAngle = angle + (rn() > 0.5 ? 1 : -1) * (0.5 + rn() * 0.8);
      stoneCrack(ctx, cx, cy, length * 0.4, branchAngle, rn, depth + 1);
    }
  }
  ctx.stroke();
}

// Chain link pattern
function chainLink(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number
) {
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.6, size, 0, 0, Math.PI * 2);
  ctx.stroke();
}

// Torch flicker glow
function torchGlow(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, radius: number,
  time: number, intensity: number
) {
  const flicker = 0.7 + Math.sin(time * 0.005) * 0.15 + Math.sin(time * 0.013) * 0.1 + Math.sin(time * 0.0031) * 0.05;
  const r = radius * flicker;
  const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
  grad.addColorStop(0, `rgba(255, 160, 40, ${0.06 * intensity * flicker})`);
  grad.addColorStop(0.4, `rgba(255, 120, 20, ${0.03 * intensity * flicker})`);
  grad.addColorStop(1, "rgba(255, 100, 10, 0)");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

// Shield/crest outline
function shieldCrest(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number,
  rn: () => number
) {
  ctx.beginPath();
  ctx.moveTo(x, y - size);
  ctx.lineTo(x + size * 0.8, y - size * 0.5);
  ctx.quadraticCurveTo(x + size * 0.8, y + size * 0.3, x, y + size);
  ctx.quadraticCurveTo(x - size * 0.8, y + size * 0.3, x - size * 0.8, y - size * 0.5);
  ctx.closePath();
  ctx.stroke();
  // Inner cross
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.6);
  ctx.lineTo(x, y + size * 0.5);
  ctx.moveTo(x - size * 0.4, y - size * 0.1);
  ctx.lineTo(x + size * 0.4, y - size * 0.1);
  ctx.stroke();
}

interface CachedRect { x: number; y: number; w: number; h: number }

export function MedievalOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const cachedRects = useRef<CachedRect[]>([]);
  const needsRedraw = useRef(true);
  const lastDripTime = useRef(0);

  const cacheRects = useCallback(() => {
    const W = innerWidth, H = innerHeight;
    const cards = document.querySelectorAll(
      ".rounded-xl, .rounded-2xl, [class*='rounded-lg']"
    );
    const rects: CachedRect[] = [];
    cards.forEach((el) => {
      const rect = (el as HTMLElement).getBoundingClientRect();
      if (
        rect.width < 40 || rect.height < 40 ||
        rect.bottom < -50 || rect.top > H + 50 ||
        rect.right < -50 || rect.left > W + 50
      ) return;
      rects.push({ x: rect.left, y: rect.top, w: rect.width, h: rect.height });
    });
    cachedRects.current = rects;
    needsRedraw.current = true;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(devicePixelRatio, 1.5);

    function resize() {
      const W = innerWidth, H = innerHeight;
      canvas!.width = W * dpr;
      canvas!.height = H * dpr;
      canvas!.style.width = W + "px";
      canvas!.style.height = H + "px";
      cacheRects();
    }
    resize();

    let scrollTimer: ReturnType<typeof setTimeout>;
    const onScroll = () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(cacheRects, 80);
    };
    const observer = new MutationObserver(() => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(cacheRects, 200);
    });
    observer.observe(document.body, { childList: true, subtree: true });

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", resize);

    // Static layer — stone cracks, chain borders, shield crests
    let staticCanvas: OffscreenCanvas | HTMLCanvasElement | null = null;
    let staticCtx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null = null;

    function drawStatic(W: number, H: number) {
      if (typeof OffscreenCanvas !== "undefined") {
        staticCanvas = new OffscreenCanvas(W * dpr, H * dpr);
      } else {
        staticCanvas = document.createElement("canvas");
        staticCanvas.width = W * dpr;
        staticCanvas.height = H * dpr;
      }
      staticCtx = staticCanvas.getContext("2d") as any;
      if (!staticCtx) return;
      const sc = staticCtx as CanvasRenderingContext2D;

      sc.setTransform(dpr, 0, 0, dpr, 0, 0);
      sc.clearRect(0, 0, W, H);
      sc.lineCap = "round";

      const rn = createRng(42);

      // Stone cracks from corners and edges
      sc.strokeStyle = "rgba(60, 45, 30, 0.06)";
      sc.lineWidth = 0.7;
      stoneCrack(sc, 0, H * 0.3, 80, 0.2, rn);
      stoneCrack(sc, W, H * 0.6, 70, Math.PI + 0.3, rn);
      stoneCrack(sc, W * 0.4, 0, 60, Math.PI / 2 + 0.1, rn);
      stoneCrack(sc, W * 0.7, H, 55, -Math.PI / 2 - 0.2, rn);

      // Card borders — stone block / chain-link style
      cachedRects.current.forEach(({ x, y, w, h }) => {
        // Corner rivets
        sc.fillStyle = "rgba(80, 60, 30, 0.08)";
        const rivetSize = 3;
        [
          [x + 4, y + 4], [x + w - 4, y + 4],
          [x + 4, y + h - 4], [x + w - 4, y + h - 4]
        ].forEach(([rx, ry]) => {
          sc.beginPath();
          sc.arc(rx, ry, rivetSize, 0, Math.PI * 2);
          sc.fill();
        });

        // Stone block border
        sc.strokeStyle = "rgba(60, 45, 30, 0.06)";
        sc.lineWidth = 1;
        sc.setLineDash([6, 4]);
        sc.strokeRect(x, y, w, h);
        sc.setLineDash([]);

        // Subtle corner cracks
        sc.lineWidth = 0.5;
        sc.strokeStyle = "rgba(60, 45, 30, 0.04)";
        stoneCrack(sc, x, y, 15, 0.3, rn, 1);
        stoneCrack(sc, x + w, y + h, 12, Math.PI + 0.4, rn, 1);
      });

      // Small shield crests near edges
      sc.strokeStyle = "rgba(80, 60, 20, 0.04)";
      sc.lineWidth = 0.8;
      if (W > 600) {
        shieldCrest(sc, W * 0.05, H * 0.15, 12, rn);
        shieldCrest(sc, W * 0.95, H * 0.75, 10, rn);
      }

      // Scattered chain links along bottom
      sc.strokeStyle = "rgba(80, 70, 50, 0.03)";
      sc.lineWidth = 0.6;
      for (let i = 0; i < 6; i++) {
        const cx = W * 0.1 + rn() * W * 0.8;
        const cy = H * 0.92 + rn() * H * 0.06;
        chainLink(sc, cx, cy, 4 + rn() * 3);
      }

      needsRedraw.current = false;
    }

    // Animated layer — torch glows only, ~10fps
    function frame(time: number) {
      const W = innerWidth, H = innerHeight;

      if (needsRedraw.current || !staticCanvas) {
        drawStatic(W, H);
      }

      if (time - lastDripTime.current < 100) {
        animRef.current = requestAnimationFrame(frame);
        return;
      }
      lastDripTime.current = time;

      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx!.clearRect(0, 0, W, H);

      // Composite static
      if (staticCanvas) {
        ctx!.setTransform(1, 0, 0, 1, 0, 0);
        ctx!.drawImage(staticCanvas as any, 0, 0);
        ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      // Torch glows at top corners
      torchGlow(ctx!, 30, 60, 120, time, 1.0);
      torchGlow(ctx!, W - 30, 60, 120, time + 1000, 0.9);

      // Subtle ember particles drifting up
      ctx!.fillStyle = "rgba(255, 140, 30, 0.04)";
      const emberRn = createRng(300 + Math.floor(time * 0.0003));
      for (let i = 0; i < 5; i++) {
        const ex = 20 + emberRn() * 40 + Math.sin(time * 0.001 + i) * 8;
        const ey = 80 - ((time * 0.02 + i * 40) % 120);
        const size = 1 + emberRn() * 1.5;
        ctx!.beginPath();
        ctx!.arc(ex, ey, size, 0, Math.PI * 2);
        ctx!.fill();
        // Mirror on right
        ctx!.beginPath();
        ctx!.arc(W - ex, ey + 10, size * 0.8, 0, Math.PI * 2);
        ctx!.fill();
      }

      animRef.current = requestAnimationFrame(frame);
    }

    animRef.current = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(animRef.current);
      clearTimeout(scrollTimer);
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", resize);
    };
  }, [cacheRects]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 1 }}
      aria-hidden="true"
    />
  );
}
