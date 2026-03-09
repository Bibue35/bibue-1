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
  const { language, t } = useLanguage();
  const defaultLinkText = linkText || t("section.seeAll");
  return (
    <section className={cn(compact ? "py-8 sm:py-10" : "py-12 sm:py-16 lg:py-20", className)}>
      <div className="container mx-auto px-3 sm:px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div className="flex items-center gap-2.5 sm:gap-3">
            {Icon && (
              <div className="p-1.5 sm:p-2 rounded-xl bg-primary/10 icon-premium">
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
            )}
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight heading-premium">
                {title}
              </h2>
              {titleJp && language === "ja" && (
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
              className="gap-1 text-xs h-8 px-2 sm:px-3 rounded-full text-muted-foreground hover:text-foreground transition-colors duration-300" 
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
