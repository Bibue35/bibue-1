import { useState } from "react";
import { User, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "./AuthModal";

export function UserMenu() {
  const { user, signOut, loading } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  if (loading) {
    return (
      <div className="w-9 h-9 rounded-full bg-foreground/10 animate-pulse" />
    );
  }

  if (!user) {
    return (
      <>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setAuthModalOpen(true)}
          className="rounded-full gap-2"
        >
          <User className="w-4 h-4" />
          Sign In
        </Button>
        <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
      </>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-foreground/5"
        >
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <User className="w-4 h-4 text-primary" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium truncate">
            {user.email}
          </p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2">
          <Settings className="w-4 h-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut} className="gap-2 text-destructive">
          <LogOut className="w-4 h-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
