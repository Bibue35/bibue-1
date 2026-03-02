/**
 * Chapter Format Standardizer
 * Processes uploaded images into the standard "Traditional Scrolling Format":
 * - Standardizes width to 950px
 * - Splits tall (webtoon-style) images into readable vertical pages
 * - Handles landscape/double-page spreads
 * - Maintains high visual quality
 */

const TARGET_WIDTH = 950;
const MAX_PAGE_HEIGHT = 1400; // Max height per page for comfortable reading
const SPLIT_OVERLAP = 20; // Small overlap to avoid harsh cuts
const QUALITY = 0.92;

export interface StandardizedPage {
  blob: Blob;
  preview: string;
  width: number;
  height: number;
  sourceIndex: number; // Which original image this came from
  pageLabel: string;
}

export interface StandardizeResult {
  pages: StandardizedPage[];
  originalCount: number;
  standardizedCount: number;
  wasModified: boolean;
}

/**
 * Load an image from a File object
 */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${file.name}`));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Detect if an image is a tall webtoon-style strip
 */
function isTallStrip(width: number, height: number): boolean {
  return height > width * 2.2;
}

/**
 * Detect if an image is landscape / double-page spread
 */
function isLandscape(width: number, height: number): boolean {
  return width > height * 1.4;
}

/**
 * Find a good split point in a tall image.
 * Analyzes a horizontal band for uniform color (likely a gutter/gap).
 * Falls back to even splitting if no good point is found.
 */
function findSplitPoints(
  ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D,
  scaledWidth: number,
  scaledHeight: number
): number[] {
  const numPages = Math.ceil(scaledHeight / MAX_PAGE_HEIGHT);
  if (numPages <= 1) return [];

  const idealSegmentHeight = scaledHeight / numPages;
  const points: number[] = [];

  for (let i = 1; i < numPages; i++) {
    const idealY = Math.round(idealSegmentHeight * i);
    // Search in a ±80px window for the best split
    const searchStart = Math.max(0, idealY - 80);
    const searchEnd = Math.min(scaledHeight - 1, idealY + 80);

    let bestY = idealY;
    let bestScore = Infinity;

    for (let y = searchStart; y <= searchEnd; y += 2) {
      // Sample a horizontal strip and measure variance
      const strip = ctx.getImageData(0, y, scaledWidth, 4);
      const data = strip.data;
      let sum = 0;
      let sumSq = 0;
      const n = data.length / 4;

      for (let p = 0; p < data.length; p += 4) {
        const brightness = (data[p] + data[p + 1] + data[p + 2]) / 3;
        sum += brightness;
        sumSq += brightness * brightness;
      }

      const mean = sum / n;
      const variance = sumSq / n - mean * mean;
      // Prefer low variance (uniform strips = gutters) and proximity to ideal
      const distancePenalty = Math.abs(y - idealY) * 0.5;
      const score = variance + distancePenalty;

      if (score < bestScore) {
        bestScore = score;
        bestY = y;
      }
    }

    points.push(bestY);
  }

  return points;
}

/**
 * Resize and convert a canvas region to a Blob
 */
async function canvasToBlob(
  canvas: HTMLCanvasElement | OffscreenCanvas,
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  sx: number,
  sy: number,
  sw: number,
  sh: number,
  targetWidth: number
): Promise<{ blob: Blob; width: number; height: number }> {
  const targetHeight = Math.round((sh / sw) * targetWidth);
  const outCanvas = document.createElement("canvas");
  outCanvas.width = targetWidth;
  outCanvas.height = targetHeight;
  const outCtx = outCanvas.getContext("2d")!;
  outCtx.imageSmoothingEnabled = true;
  outCtx.imageSmoothingQuality = "high";

  // Draw from source canvas
  if (canvas instanceof HTMLCanvasElement) {
    outCtx.drawImage(canvas, sx, sy, sw, sh, 0, 0, targetWidth, targetHeight);
  } else {
    // OffscreenCanvas path
    const bmp = await createImageBitmap(canvas, sx, sy, sw, sh);
    outCtx.drawImage(bmp, 0, 0, targetWidth, targetHeight);
    bmp.close();
  }

  return new Promise((resolve, reject) => {
    outCanvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error("Failed to create blob"));
        resolve({ blob, width: targetWidth, height: targetHeight });
      },
      "image/jpeg",
      QUALITY
    );
  });
}

/**
 * Process a single image into standardized pages
 */
async function processImage(
  file: File,
  sourceIndex: number,
  onProgress?: (msg: string) => void
): Promise<StandardizedPage[]> {
  const img = await loadImage(file);
  const { naturalWidth: w, naturalHeight: h } = img;

  // Draw onto a working canvas at target width
  const scale = TARGET_WIDTH / w;
  const scaledW = TARGET_WIDTH;
  const scaledH = Math.round(h * scale);

  const workCanvas = document.createElement("canvas");
  workCanvas.width = scaledW;
  workCanvas.height = scaledH;
  const workCtx = workCanvas.getContext("2d")!;
  workCtx.imageSmoothingEnabled = true;
  workCtx.imageSmoothingQuality = "high";
  workCtx.drawImage(img, 0, 0, scaledW, scaledH);

  URL.revokeObjectURL(img.src);

  const pages: StandardizedPage[] = [];

  if (isLandscape(w, h)) {
    // Split landscape into two vertical pages (left half, right half)
    onProgress?.(`Splitting landscape image "${file.name}" into two pages...`);
    const halfW = Math.round(scaledW / 2);

    for (let side = 0; side < 2; side++) {
      const sx = side * halfW;
      const { blob, width, height } = await canvasToBlob(
        workCanvas, workCtx, sx, 0, halfW, scaledH, Math.round(TARGET_WIDTH * 0.95)
      );
      pages.push({
        blob,
        preview: URL.createObjectURL(blob),
        width,
        height,
        sourceIndex,
        pageLabel: `${sourceIndex + 1}${side === 0 ? "a" : "b"}`,
      });
    }
  } else if (isTallStrip(w, h)) {
    // Split tall strip into multiple pages at smart cut points
    onProgress?.(`Splitting tall strip "${file.name}" into pages...`);
    const splitPoints = findSplitPoints(workCtx, scaledW, scaledH);

    const yPositions = [0, ...splitPoints, scaledH];
    for (let i = 0; i < yPositions.length - 1; i++) {
      const sy = Math.max(0, yPositions[i] - (i > 0 ? SPLIT_OVERLAP : 0));
      const sh = yPositions[i + 1] - sy;

      const { blob, width, height } = await canvasToBlob(
        workCanvas, workCtx, 0, sy, scaledW, sh, TARGET_WIDTH
      );
      pages.push({
        blob,
        preview: URL.createObjectURL(blob),
        width,
        height,
        sourceIndex,
        pageLabel: `${sourceIndex + 1}.${i + 1}`,
      });
    }
  } else {
    // Standard page — just resize to target width
    if (Math.abs(w - TARGET_WIDTH) > 10) {
      onProgress?.(`Resizing "${file.name}" to standard width...`);
    }
    const { blob, width, height } = await canvasToBlob(
      workCanvas, workCtx, 0, 0, scaledW, scaledH, TARGET_WIDTH
    );
    pages.push({
      blob,
      preview: URL.createObjectURL(blob),
      width,
      height,
      sourceIndex,
      pageLabel: `${sourceIndex + 1}`,
    });
  }

  return pages;
}

/**
 * Main standardization function.
 * Takes an array of image files and returns standardized pages.
 */
export async function standardizeChapter(
  files: File[],
  onProgress?: (percent: number, message: string) => void
): Promise<StandardizeResult> {
  const allPages: StandardizedPage[] = [];
  let wasModified = false;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const pct = Math.round((i / files.length) * 100);
    onProgress?.(pct, `Processing ${file.name}...`);

    const pages = await processImage(file, i, (msg) =>
      onProgress?.(pct, msg)
    );

    if (pages.length !== 1 || pages[0].width !== TARGET_WIDTH) {
      wasModified = true;
    }
    allPages.push(...pages);
  }

  onProgress?.(100, "Standardization complete!");

  return {
    pages: allPages,
    originalCount: files.length,
    standardizedCount: allPages.length,
    wasModified,
  };
}

/**
 * Clean up preview URLs to prevent memory leaks
 */
export function cleanupStandardizedPages(pages: StandardizedPage[]) {
  pages.forEach((p) => URL.revokeObjectURL(p.preview));
}
