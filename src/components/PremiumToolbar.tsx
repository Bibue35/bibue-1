import { useIsMobile } from "@/hooks/use-mobile";

// PremiumToolbar removed — functionality merged into CollapsibleNavbar
export function PremiumToolbar() {
  const isMobile = useIsMobile();
  // Only rendered on desktop, but now disabled to declutter
  if (isMobile) return null;
  return null;
}
