import { ReactNode } from "react";
import { useDeferredSection } from "@/hooks/useDeferredSection";
import { CardSkeletonRow } from "@/components/skeletons";
import { HorizontalScroll } from "@/components/HorizontalScroll";
import { ContentSection } from "@/components/ContentSection";
import { LucideIcon } from "lucide-react";

interface DeferredAnimeSectionProps {
  title: string;
  titleJp?: string;
  icon?: LucideIcon;
  linkTo?: string;
  linkText?: string;
  compact?: boolean;
  isMobile?: boolean;
  children: (isVisible: boolean) => ReactNode;
}

/**
 * A content section that only renders its children (and triggers data fetching)
 * once the section is within 300px of the viewport. Shows skeletons until then.
 */
export function DeferredAnimeSection({
  title,
  titleJp,
  icon,
  linkTo,
  linkText,
  compact,
  isMobile,
  children,
}: DeferredAnimeSectionProps) {
  const { ref, isVisible } = useDeferredSection("300px");

  return (
    <div ref={ref}>
      <ContentSection
        title={title}
        titleJp={titleJp}
        icon={icon}
        linkTo={linkTo}
        linkText={linkText}
        compact={compact}
      >
        {isVisible ? (
          children(true)
        ) : (
          <HorizontalScroll showArrows={!isMobile}>
            <CardSkeletonRow
              count={6}
              variant={isMobile ? "mobile" : "default"}
              itemClassName="w-28 sm:w-36 md:w-44"
            />
          </HorizontalScroll>
        )}
      </ContentSection>
    </div>
  );
}
