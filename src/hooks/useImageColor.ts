import { useState, useEffect, useRef } from "react";

/**
 * Extract the dominant color from an image URL using a canvas.
 * Returns an HSL string and RGB values for use as CSS custom properties.
 */
export function useImageColor(imageUrl?: string | null) {
  const [color, setColor] = useState<{
    hsl: string;
    rgb: string;
    h: number;
    s: number;
    l: number;
  } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!imageUrl) return;

    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        if (!canvasRef.current) {
          canvasRef.current = document.createElement("canvas");
        }
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;

        // Sample at small size for speed
        const size = 16;
        canvas.width = size;
        canvas.height = size;
        ctx.drawImage(img, 0, 0, size, size);

        const data = ctx.getImageData(0, 0, size, size).data;

        // Weighted average, skipping very dark/light pixels
        let rSum = 0, gSum = 0, bSum = 0, count = 0;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2];
          const brightness = (r + g + b) / 3;
          if (brightness > 30 && brightness < 230) {
            // Weight by saturation to get the most vibrant color
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            const sat = max === 0 ? 0 : (max - min) / max;
            const weight = 1 + sat * 2;
            rSum += r * weight;
            gSum += g * weight;
            bSum += b * weight;
            count += weight;
          }
        }

        if (count === 0) return;

        const r = Math.round(rSum / count);
        const g = Math.round(gSum / count);
        const b = Math.round(bSum / count);

        // Convert to HSL
        const rn = r / 255, gn = g / 255, bn = b / 255;
        const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
        const l = (max + min) / 2;
        let h = 0, s = 0;

        if (max !== min) {
          const d = max - min;
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
          switch (max) {
            case rn: h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6; break;
            case gn: h = ((bn - rn) / d + 2) / 6; break;
            case bn: h = ((rn - gn) / d + 4) / 6; break;
          }
        }

        const hDeg = Math.round(h * 360);
        const sPct = Math.round(s * 100);
        const lPct = Math.round(l * 100);

        setColor({
          hsl: `${hDeg} ${sPct}% ${lPct}%`,
          rgb: `${r}, ${g}, ${b}`,
          h: hDeg,
          s: sPct,
          l: lPct,
        });
      } catch {
        // CORS or other canvas error — silently ignore
      }
    };

    img.src = imageUrl;
  }, [imageUrl]);

  return color;
}
