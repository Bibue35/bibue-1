import { Button } from "@/components/ui/button";
import { UserPlus, UserMinus, Loader2 } from "lucide-react";
import { useFollow } from "@/hooks/useFollow";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface FollowButtonProps {
  userId: string;
  className?: string;
  size?: "sm" | "default" | "lg";
}

export function FollowButton({ userId, className, size = "default" }: FollowButtonProps) {
  const { user } = useAuth();
  const { isFollowing, toggleFollow, isToggling } = useFollow(userId);

  // Don't show button for own profile
  if (user?.id === userId) {
    return null;
  }

  return (
    <Button
      variant={isFollowing ? "outline" : "default"}
      size={size}
      onClick={toggleFollow}
      disabled={isToggling || !user}
      className={cn(
        "gap-2 transition-all",
        isFollowing && "hover:bg-destructive/10 hover:text-destructive hover:border-destructive",
        className
      )}
    >
      {isToggling ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isFollowing ? (
        <>
          <UserMinus className="w-4 h-4" />
          <span className="hidden sm:inline">Following</span>
        </>
      ) : (
        <>
          <UserPlus className="w-4 h-4" />
          <span className="hidden sm:inline">Follow</span>
        </>
      )}
    </Button>
  );
}
