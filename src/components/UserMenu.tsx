import { useState, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { User, LogOut, Settings, EyeOff, Eye, Globe, Check, Bookmark, Heart, MessageCircle, Users, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useIncognito } from "@/contexts/IncognitoContext";
import { useLanguage, Language } from "@/contexts/LanguageContext";
import { useUnreadCount } from "@/hooks/useMessages";
const AuthModal = lazy(() => import("./AuthModal").then(m => ({ default: m.AuthModal })));
import { cn } from "@/lib/utils";

const languages: { code: Language; flag: string; name: string }[] = [
  { code: "en", flag: "🇺🇸", name: "English" },
  { code: "ja", flag: "🇯🇵", name: "日本語" },
  { code: "es", flag: "🇪🇸", name: "Español" },
  { code: "fr", flag: "🇫🇷", name: "Français" },
  { code: "de", flag: "🇩🇪", name: "Deutsch" },
  { code: "pt", flag: "🇧🇷", name: "Português" },
  { code: "ko", flag: "🇰🇷", name: "한국어" },
  { code: "zh", flag: "🇨🇳", name: "中文" },
];

export function UserMenu() {
  const { user, profile, signOut, loading } = useAuth();
  const { isIncognito, toggleIncognito } = useIncognito();
  const { language, setLanguage } = useLanguage();
  const { data: unreadCount } = useUnreadCount();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const currentLanguage = languages.find((l) => l.code === language);

  // Get user initials for avatar fallback
  const getInitials = () => {
    if (profile?.username) {
      return profile.username.slice(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return "U";
  };

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
          className="hidden md:flex rounded-full gap-2"
        >
          <User className="w-4 h-4" />
          <span className="hidden sm:inline">Sign In</span>
        </Button>
        {authModalOpen && (
          <Suspense fallback={null}>
            <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
          </Suspense>
        )}
      </>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-foreground/5 h-9 w-9 sm:h-10 sm:w-10"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.username || "User"} />
            <AvatarFallback className="bg-primary/20 text-primary text-xs font-medium">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 bg-popover border border-border shadow-lg">
        {/* Profile Header */}
        <div className="px-3 py-3 flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.username || "User"} />
            <AvatarFallback className="bg-primary/20 text-primary font-medium">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {profile?.username || "User"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user.email}
            </p>
          </div>
        </div>
        <DropdownMenuSeparator />
        
        {/* Quick Links */}
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal px-3">
          Library
        </DropdownMenuLabel>
        
        <DropdownMenuItem asChild className="gap-3 cursor-pointer px-3">
          <Link to="/watchlist">
            <Bookmark className="w-4 h-4" />
            <span>My Watchlist</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild className="gap-3 cursor-pointer px-3">
          <Link to="/recommendations">
            <Heart className="w-4 h-4" />
            <span>For You</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild className="gap-3 cursor-pointer px-3">
          <Link to="/messages">
            <MessageCircle className="w-4 h-4" />
            <span className="flex-1">Messages</span>
            {(unreadCount ?? 0) > 0 && (
              <Badge variant="default" className="h-5 min-w-5 px-1.5 text-xs">
                {unreadCount}
              </Badge>
            )}
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild className="gap-3 cursor-pointer px-3">
          <Link to="/community">
            <Users className="w-4 h-4" />
            <span>Community</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild className="gap-3 cursor-pointer px-3">
          <Link to="/stats">
            <BarChart3 className="w-4 h-4" />
            <span>My Stats</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal px-3">
          Settings
        </DropdownMenuLabel>
        
        {/* Incognito Toggle */}
        <DropdownMenuItem 
          onClick={toggleIncognito}
          className={cn(
            "gap-3 cursor-pointer px-3",
            isIncognito && "bg-primary/10"
          )}
        >
          {isIncognito ? (
            <EyeOff className="w-4 h-4 text-primary" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
          <span className="flex-1">Incognito Mode</span>
          {isIncognito && <Check className="w-4 h-4 text-primary" />}
        </DropdownMenuItem>

        {/* Language Submenu */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="gap-3 px-3">
            <Globe className="w-4 h-4" />
            <span className="flex-1">Language</span>
            <span className="text-xs text-muted-foreground">{currentLanguage?.flag}</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-48 bg-popover border border-border shadow-lg">
            {languages.map((lang) => (
              <DropdownMenuItem
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={cn(
                  "flex items-center gap-3 cursor-pointer",
                  language === lang.code && "bg-accent"
                )}
              >
                <span className="text-lg">{lang.flag}</span>
                <span className="flex-1">{lang.name}</span>
                {language === lang.code && (
                  <Check className="w-4 h-4" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuItem asChild className="gap-3 px-3 cursor-pointer">
          <Link to="/settings">
            <Settings className="w-4 h-4" />
            <span>Account Settings</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut} className="gap-3 px-3 text-destructive cursor-pointer focus:text-destructive">
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
