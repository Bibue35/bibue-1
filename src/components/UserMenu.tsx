import { useState } from "react";
import { User, LogOut, Settings, EyeOff, Eye, Globe, Check } from "lucide-react";
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
import { useAuth } from "@/contexts/AuthContext";
import { useIncognito } from "@/contexts/IncognitoContext";
import { useLanguage, Language } from "@/contexts/LanguageContext";
import { AuthModal } from "./AuthModal";
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
  const { user, signOut, loading } = useAuth();
  const { isIncognito, toggleIncognito } = useIncognito();
  const { language, setLanguage } = useLanguage();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const currentLanguage = languages.find((l) => l.code === language);

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
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium truncate">
            {user.email}
          </p>
        </div>
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
          Settings
        </DropdownMenuLabel>
        
        {/* Incognito Toggle */}
        <DropdownMenuItem 
          onClick={toggleIncognito}
          className={cn(
            "gap-2 cursor-pointer",
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
          <DropdownMenuSubTrigger className="gap-2">
            <Globe className="w-4 h-4" />
            <span className="flex-1">Language</span>
            <span className="text-xs text-muted-foreground">{currentLanguage?.flag}</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-48">
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

        <DropdownMenuItem className="gap-2">
          <Settings className="w-4 h-4" />
          More Settings
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
