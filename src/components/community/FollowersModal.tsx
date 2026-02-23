import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useFollowList } from "@/hooks/useFollow";
import { FollowButton } from "./FollowButton";
import { Link } from "react-router-dom";

interface FollowersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  username: string;
  defaultTab?: "followers" | "following";
}

export function FollowersModal({
  open,
  onOpenChange,
  userId,
  username,
  defaultTab = "followers",
}: FollowersModalProps) {
  const { data: followers, isLoading: followersLoading } = useFollowList(userId, "followers");
  const { data: following, isLoading: followingLoading } = useFollowList(userId, "following");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{username}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue={defaultTab} className="mt-2">
          <TabsList className="w-full">
            <TabsTrigger value="followers" className="flex-1">
              Followers ({followers?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="following" className="flex-1">
              Following ({following?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="followers" className="mt-4 max-h-[60vh] overflow-y-auto">
            <UserList users={followers || []} isLoading={followersLoading} onClose={() => onOpenChange(false)} />
          </TabsContent>

          <TabsContent value="following" className="mt-4 max-h-[60vh] overflow-y-auto">
            <UserList users={following || []} isLoading={followingLoading} onClose={() => onOpenChange(false)} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

interface UserListProps {
  users: any[];
  isLoading: boolean;
  onClose: () => void;
}

function UserList({ users, isLoading, onClose }: UserListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    );
  }

  if (!users.length) {
    return (
      <p className="text-center text-muted-foreground py-8">
        No users to show
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {users.map((user) => (
        <div key={user.user_id} className="flex items-center justify-between p-2 rounded-lg hover:bg-foreground/5">
          <Link
            to={`/user/${user.user_id}`}
            onClick={onClose}
            className="flex items-center gap-3 flex-1"
          >
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatar_url || undefined} />
              <AvatarFallback>
                {(user.username || "U").slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{user.display_name || user.username || "User"}</p>
              {user.username && user.display_name && (
                <p className="text-xs text-muted-foreground">@{user.username}</p>
              )}
            </div>
          </Link>
          <FollowButton userId={user.user_id} size="sm" />
        </div>
      ))}
    </div>
  );
}
