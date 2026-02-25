import * as React from "react";
import { createPortal } from "react-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { cn } from "@/lib/utils";

interface ResponsiveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Responsive modal: full-screen Netflix-style page on mobile,
 * centered Dialog on desktop.
 */
export function ResponsiveModal({
  open,
  onOpenChange,
  title,
  children,
  className,
}: ResponsiveModalProps) {
  const isMobile = useIsMobile();

  // Lock body scroll when open on mobile
  React.useEffect(() => {
    if (!isMobile || !open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isMobile, open]);

  if (isMobile) {
    if (!open) return null;
    return createPortal(
      <div
        className={cn(
          "fixed inset-0 z-50 bg-background overflow-y-auto overscroll-y-contain",
          className
        )}
        style={{
          WebkitOverflowScrolling: "touch",
          animation: "slideUpFull 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <VisuallyHidden>
          <h2>{title}</h2>
        </VisuallyHidden>
        {children}
      </div>,
      document.body
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          hideCloseButton
          className={cn(
            "max-w-5xl w-[95vw] max-h-[90vh] p-0 gap-0 bg-background/95 backdrop-blur-xl border-border/50 overflow-y-auto rounded-2xl",
            className
          )}
        >
          <VisuallyHidden>
            <DialogTitle>{title}</DialogTitle>
          </VisuallyHidden>
          {children}
        </DialogContent>
    </Dialog>
  );
}
