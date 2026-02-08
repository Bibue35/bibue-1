import * as React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogOverlay,
  DialogPortal,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
} from "@/components/ui/drawer";
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
 * Responsive modal that renders as a bottom-sheet Drawer on mobile
 * and a centered Dialog on desktop. The Drawer supports native
 * swipe-to-dismiss via vaul.
 */
export function ResponsiveModal({
  open,
  onOpenChange,
  title,
  children,
  className,
}: ResponsiveModalProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent
          className={cn(
            "max-h-[96vh] p-0 border-border/50 bg-background/95 backdrop-blur-xl rounded-t-2xl",
            className
          )}
        >
          <VisuallyHidden>
            <DrawerTitle>{title}</DrawerTitle>
          </VisuallyHidden>
          <ScrollArea className="max-h-[calc(96vh-16px)] overflow-y-auto">
            {children}
          </ScrollArea>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        hideCloseButton
        className={cn(
          "max-w-5xl w-[95vw] max-h-[90vh] p-0 gap-0 bg-background/95 backdrop-blur-xl border-border/50 overflow-hidden rounded-2xl",
          className
        )}
      >
        <VisuallyHidden>
          <DialogTitle>{title}</DialogTitle>
        </VisuallyHidden>
        <ScrollArea className="max-h-[90vh]">
          {children}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
