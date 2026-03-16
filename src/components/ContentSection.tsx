import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { useInView } from "@/hooks/useInView";

interface ContentSectionProps {
  title: string;
  titleJp?: string;
  icon?: any; // kept for backwards compat, but not rendered
  linkTo?: string;
  linkText?: string;
  children: ReactNode;
  className?: string;
  compact?: boolean;
  headerExtra?: ReactNode;
}

export function ContentSection({
  title,
  titleJp,
  linkTo,
  linkText,
  children,
  className,
  compact = false,
  headerExtra,
}: ContentSectionProps) {
  const { language, t } = useLanguage();
  const defaultLinkText = linkText || t("section.seeAll");
  const { ref, isInView } = useInView({ threshold: 0.1, rootMargin: "0px 0px -20px 0px" });

  return (
    <section className={cn(compact ? "py-12 sm:py-14" : "py-16 sm:py-24 lg:py-28", className)}>
      <div className="container mx-auto px-4 sm:px-6">
        {/* Header */}
        <div
          ref={ref}
          className={cn(
            "flex items-end justify-between mb-10 sm:mb-12 section-reveal",
            isInView && "revealed"
          )}
        >
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-sacred font-bold tracking-tight">
              {title}
            </h2>
            {titleJp && language === "ja" && (
              <p className="font-jp text-[10px] sm:text-xs text-muted-foreground mt-1">
                {titleJp}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            {headerExtra}
            {linkTo && (
              <Link
                to={linkTo}
                className="text-xs sm:text-sm font-medium tracking-wide uppercase text-muted-foreground hover:text-foreground transition-colors duration-300 group btn-press"
              >
                {defaultLinkText}
                <span className="inline-block ml-2 w-4 h-px bg-muted-foreground group-hover:w-6 group-hover:bg-foreground transition-all duration-300 align-middle" />
              </Link>
            )}
          </div>
        </div>

        <div className={cn("transition-opacity duration-500", isInView ? "entrance-stagger opacity-100" : "opacity-0")}>
          {children}
        </div>
      </div>
    </section>
  );
}
