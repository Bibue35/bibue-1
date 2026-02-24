import { useEffect, useRef, useCallback } from "react";

// Seeded random for consistent wobble
function createRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// Hand-drawn line with wobble
function sketchLine(
  ctx: CanvasRenderingContext2D,
  x1: number, y1: number, x2: number, y2: number,
  rn: () => number, wobble = 2
) {
  const d = Math.hypot(x2 - x1, y2 - y1);
  const steps = Math.max(Math.floor(d / 4), 3);
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    ctx.lineTo(
      x1 + (x2 - x1) * t + (rn() - 0.5) * wobble,
      y1 + (y2 - y1) * t + (rn() - 0.5) * wobble
    );
  }
  ctx.stroke();
}

// Cross-hatching fill
function crossHatch(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  rn: () => number,
  density = 8, angle = 0.6, alpha = 0.1
) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  const cos = Math.cos(angle), sin = Math.sin(angle);
  const diag = Math.sqrt(w * w + h * h);
  for (let i = -diag; i < diag; i += density) {
    const sx = x + w / 2 + cos * i - sin * diag;
    const sy = y + h / 2 + sin * i + cos * diag;
    const ex = x + w / 2 + cos * i + sin * diag;
    const ey = y + h / 2 + sin * i - cos * diag;
    ctx.beginPath();
    ctx.moveTo(sx + (rn() - 0.5), sy + (rn() - 0.5));
    ctx.lineTo(ex + (rn() - 0.5), ey + (rn() - 0.5));
    ctx.stroke();
  }
  ctx.restore();
}

// Ink drip
function inkDrip(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, length: number,
  rn: () => number, width = 2
) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x, y);
  for (let i = 0; i < length; i++) {
    const t = i / length;
    const w = width * (1 - t * t);
    ctx.lineTo(x + (rn() - 0.5) * w * 0.5, y + i);
  }
  ctx.lineWidth = width;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, y + length, width * 0.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

interface CachedRect { x: number; y: number; w: number; h: number }

export function SketchOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const cachedRects = useRef<CachedRect[]>([]);
  const needsRedraw = useRef(true);
  const dripTime = useRef(0);

  // Cache card rects on scroll/resize/mutation — not every frame
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

    // Debounced scroll handler
    let scrollTimer: ReturnType<typeof setTimeout>;
    const onScroll = () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(cacheRects, 80);
    };

    // MutationObserver for DOM changes (lazy-loaded cards)
    const observer = new MutationObserver(() => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(cacheRects, 200);
    });
    observer.observe(document.body, { childList: true, subtree: true });

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", resize);

    // Static layer (cards) drawn to offscreen canvas, only when rects change
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

      staticCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      staticCtx.clearRect(0, 0, W, H);

      const rn = createRng(100);
      staticCtx.lineCap = "round";

      // Card cross-hatching
      cachedRects.current.forEach(({ x, y, w, h }) => {
        (staticCtx as CanvasRenderingContext2D).strokeStyle = "rgba(40,35,50,0.03)";
        (staticCtx as CanvasRenderingContext2D).lineWidth = 0.5;
        crossHatch(staticCtx as CanvasRenderingContext2D, x - 2, y - 2, w + 4, h + 4, rn, 14, 0.5, 0.02);
        crossHatch(staticCtx as CanvasRenderingContext2D, x - 2, y - 2, w + 4, h + 4, rn, 16, 2.1, 0.012);

        (staticCtx as CanvasRenderingContext2D).strokeStyle = "rgba(40,35,50,0.04)";
        (staticCtx as CanvasRenderingContext2D).lineWidth = 0.6;
        sketchLine(staticCtx as CanvasRenderingContext2D, x, y, x + w, y, rn, 1.5);
        sketchLine(staticCtx as CanvasRenderingContext2D, x + w, y, x + w, y + h, rn, 1.5);
        sketchLine(staticCtx as CanvasRenderingContext2D, x + w, y + h, x, y + h, rn, 1.5);
        sketchLine(staticCtx as CanvasRenderingContext2D, x, y + h, x, y, rn, 1.5);
      });

      // Edge pen marks & dots (static)
      (staticCtx as CanvasRenderingContext2D).strokeStyle = "rgba(30,25,40,0.02)";
      (staticCtx as CanvasRenderingContext2D).lineWidth = 0.4;
      const markRn = createRng(700);
      for (let i = 0; i < 12; i++) {
        const sx = markRn() * W;
        const sy = markRn() * H;
        if (sx > W * 0.15 && sx < W * 0.85 && sy > H * 0.15 && sy < H * 0.85) continue;
        const len = 3 + markRn() * 6;
        const angle = markRn() * Math.PI * 2;
        sketchLine(staticCtx as CanvasRenderingContext2D, sx, sy, sx + Math.cos(angle) * len, sy + Math.sin(angle) * len, markRn, 0.5);
      }
      (staticCtx as CanvasRenderingContext2D).fillStyle = "rgba(30,25,40,0.02)";
      for (let i = 0; i < 15; i++) {
        const dx = markRn() * W;
        const dy = markRn() * H;
        if (dx > W * 0.2 && dx < W * 0.8 && dy > H * 0.2 && dy < H * 0.8) continue;
        staticCtx.beginPath();
        staticCtx.arc(dx, dy, 0.5 + markRn() * 1.2, 0, Math.PI * 2);
        staticCtx.fill();
      }

      needsRedraw.current = false;
    }

    // Animation loop — only redraws drips at ~8fps, composites static layer
    function frame(time: number) {
      const W = innerWidth, H = innerHeight;

      if (needsRedraw.current || !staticCanvas) {
        drawStatic(W, H);
      }

      // Throttle drip animation to ~8fps
      if (time - dripTime.current < 125) {
        animRef.current = requestAnimationFrame(frame);
        return;
      }
      dripTime.current = time;

      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx!.clearRect(0, 0, W, H);

      // Composite static layer
      if (staticCanvas) {
        ctx!.setTransform(1, 0, 0, 1, 0, 0);
        ctx!.drawImage(staticCanvas as any, 0, 0);
        ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      // Animated ink drips only
      ctx!.strokeStyle = "rgba(30,25,40,0.025)";
      ctx!.fillStyle = "rgba(30,25,40,0.02)";
      ctx!.lineWidth = 0.8;
      ctx!.lineCap = "round";

      const dripRn = createRng(500 + Math.floor(time * 0.0002));
      const dripX1 = W * 0.12 + Math.sin(time * 0.0003) * 20;
      inkDrip(ctx!, dripX1, 0, ((time * 0.0002) % 1) * H * 0.18, dripRn, 1.2);

      const dripX2 = W * 0.88 + Math.cos(time * 0.00025) * 15;
      inkDrip(ctx!, dripX2, 0, ((time * 0.00018 + 0.5) % 1) * H * 0.14, dripRn, 1.0);

      const dripX3 = W * 0.5 + Math.sin(time * 0.0002 + 2) * 30;
      inkDrip(ctx!, dripX3, 0, ((time * 0.00015 + 0.3) % 1) * H * 0.1, dripRn, 0.8);

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
