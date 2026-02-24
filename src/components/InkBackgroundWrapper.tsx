import { lazy, Suspense } from "react";
import { useThemeContext } from "@/contexts/ThemeContext";

const InkBackground = lazy(() => import("./InkBackground").then(m => ({ default: m.InkBackground })));
const SketchOverlay = lazy(() => import("./SketchOverlay").then(m => ({ default: m.SketchOverlay })));
const MedievalOverlay = lazy(() => import("./MedievalOverlay").then(m => ({ default: m.MedievalOverlay })));

export function InkBackgroundWrapper() {
  const { isInk, isMedieval } = useThemeContext();
  
  if (isInk) {
    return (
      <Suspense fallback={null}>
        <InkBackground />
        <SketchOverlay />
      </Suspense>
    );
  }

  if (isMedieval) {
    return (
      <Suspense fallback={null}>
        <MedievalOverlay />
      </Suspense>
    );
  }

  return null;
}
