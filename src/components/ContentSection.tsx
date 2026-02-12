import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface ContentSectionProps {
  title: string;
  titleJp?: string;
  icon?: LucideIcon;
  linkTo?: string;
  linkText?: string;
  children: ReactNode;
  className?: string;
  compact?: boolean;
}

export function ContentSection({
  title,
  titleJp,
  icon: Icon,
  linkTo,
  linkText,
  children,
  className,
  compact = false,
}: ContentSectionProps) {
  const { t } = useLanguage();
  const defaultLinkText = linkText || t("section.seeAll");
  return (
    <section className={cn(compact ? "py-4 sm:py-6" : "py-6 sm:py-10", className)}>
      <div className="container mx-auto px-3 sm:px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            {Icon && (
              <div className="p-1.5 sm:p-2 rounded-xl bg-primary/10">
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
            )}
            <div>
              <h2 className="text-base sm:text-lg md:text-xl font-bold tracking-tight">
                {title}
              </h2>
              {titleJp && (
                <p className="font-jp text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                  {titleJp}
                </p>
              )}
            </div>
          </div>

          {linkTo && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-1 text-xs h-8 px-2 sm:px-3 rounded-full" 
              asChild
            >
              <Link to={linkTo}>
                <span className="hidden xs:inline">{defaultLinkText}</span>
                <span className="xs:hidden">{t("common.all")}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          )}
        </div>

        {/* Content */}
        {children}
      </div>
    </section>
  );
}
