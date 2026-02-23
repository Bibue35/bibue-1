import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  MessageSquare, MessageCircle, Award, ThumbsUp, Star, 
  Tv, BookOpen, Zap, BadgeCheck, Shield 
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Badge as BadgeType } from "@/hooks/useUserBadges";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  MessageSquare,
  MessageCircle,
  Award,
  ThumbsUp,
  Star,
  Tv,
  BookOpen,
  Zap,
  BadgeCheck,
  Shield,
};

const colorMap: Record<string, string> = {
  blue: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  green: "bg-green-500/20 text-green-400 border-green-500/30",
  purple: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  yellow: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  orange: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  pink: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  cyan: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  amber: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  red: "bg-red-500/20 text-red-400 border-red-500/30",
  primary: "bg-primary/20 text-primary border-primary/30",
};

interface UserBadgeProps {
  badge: BadgeType;
  showLabel?: boolean;
  size?: "sm" | "default" | "lg";
}

export function UserBadge({ badge, showLabel = false, size = "default" }: UserBadgeProps) {
  const Icon = iconMap[badge.icon] || Award;
  const colorClass = colorMap[badge.color] || colorMap.primary;

  const sizeClasses = {
    sm: "h-5 px-1.5 text-xs",
    default: "h-6 px-2 text-xs",
    lg: "h-8 px-3 text-sm",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    default: "w-3.5 h-3.5",
    lg: "w-4 h-4",
  };

  return (
    <Tooltip>
      <TooltipTrigger>
        <Badge
          variant="outline"
          className={cn(
            "gap-1 border",
            colorClass,
            sizeClasses[size]
          )}
        >
          <Icon className={iconSizes[size]} />
          {showLabel && <span>{badge.name}</span>}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <p className="font-medium">{badge.name}</p>
        <p className="text-xs text-muted-foreground">{badge.description}</p>
      </TooltipContent>
    </Tooltip>
  );
}
