import { lazy, Suspense } from "react";
import { useThemeContext } from "@/contexts/ThemeContext";

const InkBackground = lazy(() => import("./InkBackground").then(m => ({ default: m.InkBackground })));

export function InkBackgroundWrapper() {
  const { isInk } = useThemeContext();
  
  if (!isInk) return null;
  
  return (
    <Suspense fallback={null}>
      <InkBackground />
    </Suspense>
  );
}
