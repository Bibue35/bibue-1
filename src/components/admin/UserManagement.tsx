import { useState } from "react";
import {
  useUsers,
  useBanUser,
  useUnbanUser,
  useUpdateUserRole,
} from "@/hooks/useModeration";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Users,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Ban,
  UserCheck,
  User,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const roleColors: Record<string, string> = {
  admin: "bg-red-500/20 text-red-500 border-red-500/30",
  moderator: "bg-blue-500/20 text-blue-500 border-blue-500/30",
  user: "bg-muted text-muted-foreground border-muted",
};

const roleIcons: Record<string, React.ReactNode> = {
  admin: <ShieldAlert className="h-3 w-3" />,
  moderator: <ShieldCheck className="h-3 w-3" />,
  user: <User className="h-3 w-3" />,
};

interface BanDialogState {
  open: boolean;
  userId: string;
  username: string;
}

export function UserManagement() {
  const { user: currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [banDialog, setBanDialog] = useState<BanDialogState>({
    open: false,
    userId: "",
    username: "",
  });
  const [banReason, setBanReason] = useState("");
  const [banDuration, setBanDuration] = useState<string>("permanent");

  const { data: users, isLoading } = useUsers(searchQuery || undefined);
  const banUser = useBanUser();
  const unbanUser = useUnbanUser();
  const updateRole = useUpdateUserRole();

  const handleBan = () => {
    if (!banReason.trim()) return;

    let expiresAt: string | null = null;
    if (banDuration !== "permanent") {
      const days = parseInt(banDuration);
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + days);
      expiresAt = expiry.toISOString();
    }

    banUser.mutate(
      { userId: banDialog.userId, reason: banReason, expiresAt },
      {
        onSuccess: () => {
          setBanDialog({ open: false, userId: "", username: "" });
          setBanReason("");
          setBanDuration("permanent");
        },
      }
    );
  };

  const handleRoleChange = (userId: string, role: string) => {
    updateRole.mutate({ userId, role: role as "admin" | "moderator" | "user" });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users by username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* User List */}
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">
              Loading users...
            </div>
          ) : !users || users.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No users found
            </div>
          ) : (
            <ScrollArea className="h-[500px]">
              <div className="space-y-3">
                {users.map((user) => (
                  <div
                    key={user.user_id}
                    className={`p-4 border rounded-lg ${
                      user.is_banned ? "border-red-500/30 bg-red-500/5" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatar_url || undefined} />
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/user/${user.user_id}`}
                              className="font-medium hover:underline truncate"
                            >
                              {user.username || "Unknown"}
                            </Link>
                            <Badge
                              variant="outline"
                              className={roleColors[user.role || "user"]}
                            >
                              {roleIcons[user.role || "user"]}
                              <span className="ml-1 capitalize">
                                {user.role || "user"}
                              </span>
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Joined{" "}
                            {formatDistanceToNow(new Date(user.created_at), {
                              addSuffix: true,
                            })}
                          </p>
                          {user.is_banned && (
                            <p className="text-xs text-red-500 mt-1">
                              Banned: {user.ban_reason}
                              {user.ban_expires_at && (
                                <span>
                                  {" "}
                                  (expires{" "}
                                  {formatDistanceToNow(
                                    new Date(user.ban_expires_at),
                                    { addSuffix: true }
                                  )}
                                  )
                                </span>
                              )}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Role selector (only for admins, can't change own role) */}
                        {user.user_id !== currentUser?.id && (
                          <Select
                            value={user.role || "user"}
                            onValueChange={(role) =>
                              handleRoleChange(user.user_id, role)
                            }
                          >
                            <SelectTrigger className="w-[120px]">
                              <Shield className="h-4 w-4 mr-1" />
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="moderator">Moderator</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        )}

                        {/* Ban/Unban button (can't ban yourself) */}
                        {user.user_id !== currentUser?.id && (
                          <>
                            {user.is_banned ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => unbanUser.mutate(user.user_id)}
                                disabled={unbanUser.isPending}
                              >
                                <UserCheck className="h-4 w-4 mr-1" />
                                Unban
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() =>
                                  setBanDialog({
                                    open: true,
                                    userId: user.user_id,
                                    username: user.username || "this user",
                                  })
                                }
                              >
                                <Ban className="h-4 w-4 mr-1" />
                                Ban
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Ban Dialog */}
      <Dialog
        open={banDialog.open}
        onOpenChange={(open) =>
          setBanDialog((prev) => ({ ...prev, open }))
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ban User</DialogTitle>
            <DialogDescription>
              Ban <strong>{banDialog.username}</strong> from the platform. This
              will prevent them from posting or commenting.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="ban-reason">Reason for ban</Label>
              <Textarea
                id="ban-reason"
                placeholder="Enter the reason for this ban..."
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ban-duration">Duration</Label>
              <Select value={banDuration} onValueChange={setBanDuration}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Day</SelectItem>
                  <SelectItem value="7">7 Days</SelectItem>
                  <SelectItem value="30">30 Days</SelectItem>
                  <SelectItem value="90">90 Days</SelectItem>
                  <SelectItem value="permanent">Permanent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBanDialog({ open: false, userId: "", username: "" })}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleBan}
              disabled={!banReason.trim() || banUser.isPending}
            >
              {banUser.isPending ? "Banning..." : "Confirm Ban"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
