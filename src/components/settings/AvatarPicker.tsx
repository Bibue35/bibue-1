import { useState, useRef } from "react";
import { Search, Upload, X, Check, Loader2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useDebounce } from "@/hooks/useDebounce";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { createPortal } from "react-dom";

// Popular anime/manga character avatars - using AniList CDN
const PRESET_AVATARS = [
  { name: "Goku", series: "Dragon Ball", url: "https://s4.anilist.co/file/anilistcdn/character/large/b2-g2rvOo1HfNAd.png" },
  { name: "Naruto", series: "Naruto", url: "https://s4.anilist.co/file/anilistcdn/character/large/b17-IazKGogQwJ1p.png" },
  { name: "Luffy", series: "One Piece", url: "https://s4.anilist.co/file/anilistcdn/character/large/b40-WCU7IoxUC7cW.png" },
  { name: "Gojo Satoru", series: "Jujutsu Kaisen", url: "https://s4.anilist.co/file/anilistcdn/character/large/b127518-nkWS8ULBXW3U.png" },
  { name: "Levi Ackerman", series: "Attack on Titan", url: "https://s4.anilist.co/file/anilistcdn/character/large/b45627-CR68RyZmddGG.png" },
  { name: "Tanjiro", series: "Demon Slayer", url: "https://s4.anilist.co/file/anilistcdn/character/large/b126071-BTfbv7pJzRlY.png" },
  { name: "Itachi Uchiha", series: "Naruto", url: "https://s4.anilist.co/file/anilistcdn/character/large/b1115-sxM7C1wL69qk.png" },
  { name: "Saitama", series: "One Punch Man", url: "https://s4.anilist.co/file/anilistcdn/character/large/b73935-XI2pFgWFVSdu.png" },
  { name: "Eren Yeager", series: "Attack on Titan", url: "https://s4.anilist.co/file/anilistcdn/character/large/b40882-dsj7IP943WFF.jpg" },
  { name: "Mikasa", series: "Attack on Titan", url: "https://s4.anilist.co/file/anilistcdn/character/large/b40881-F3gr1PkreDvj.png" },
  { name: "Anya Forger", series: "Spy x Family", url: "https://s4.anilist.co/file/anilistcdn/character/large/b138101-Kp2aGr3dqS5W.png" },
  { name: "Chainsaw Man", series: "Chainsaw Man", url: "https://s4.anilist.co/file/anilistcdn/character/large/b127051-V1djMvuRWNma.png" },
  { name: "Sung Jin-Woo", series: "Solo Leveling", url: "https://s4.anilist.co/file/anilistcdn/character/large/b127690-b3xNJf19PQ6e.png" },
  { name: "Makima", series: "Chainsaw Man", url: "https://s4.anilist.co/file/anilistcdn/character/large/b137606-lLqH8dLcUkEB.png" },
  { name: "Zero Two", series: "Darling in the Franxx", url: "https://s4.anilist.co/file/anilistcdn/character/large/b89231-hXLdeIXjgVmW.png" },
  { name: "Killua", series: "Hunter x Hunter", url: "https://s4.anilist.co/file/anilistcdn/character/large/b27-uN0kE5J7Shxn.png" },
  { name: "Gon Freecss", series: "Hunter x Hunter", url: "https://s4.anilist.co/file/anilistcdn/character/large/b30-US8GUmNIxmAe.png" },
  { name: "Edward Elric", series: "Fullmetal Alchemist", url: "https://s4.anilist.co/file/anilistcdn/character/large/b11-k2b2HuDMhL1C.png" },
  { name: "Light Yagami", series: "Death Note", url: "https://s4.anilist.co/file/anilistcdn/character/large/b80-k8WRqcU3d8Dn.png" },
  { name: "L", series: "Death Note", url: "https://s4.anilist.co/file/anilistcdn/character/large/71-HXKUsuwL0eQk.png" },
];

interface AvatarPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentAvatar?: string | null;
  onSelect: (url: string) => void;
  isUploading?: boolean;
  onUpload: (file: File) => Promise<void>;
}

interface SearchResult {
  id: number;
  name: { full: string };
  image: { large: string };
  media: { nodes: { title: { romaji: string } }[] };
}

function AvatarGrid({
  items,
  selectedAvatar,
  onSelect,
  getUrl,
  getName,
  getSeries,
}: {
  items: any[];
  selectedAvatar: string | null;
  onSelect: (url: string) => void;
  getUrl: (item: any) => string;
  getName: (item: any) => string;
  getSeries: (item: any) => string;
}) {
  return (
    <div className="grid grid-cols-4 gap-3">
      {items.map((item, i) => {
        const url = getUrl(item);
        const name = getName(item);
        const series = getSeries(item);
        return (
          <button
            key={url + i}
            onClick={() => onSelect(url)}
            className={cn(
              "relative group rounded-lg overflow-hidden border-2 transition-all active:scale-95",
              selectedAvatar === url
                ? "border-primary ring-2 ring-primary/20"
                : "border-transparent hover:border-muted-foreground/30"
            )}
          >
            <Avatar className="w-full h-auto aspect-square rounded-none">
              <AvatarImage src={url} alt={name} className="object-cover" />
              <AvatarFallback className="rounded-none">{name[0]}</AvatarFallback>
            </Avatar>
            {selectedAvatar === url && (
              <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                <Check className="w-6 h-6 text-primary" />
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 to-transparent p-1.5 opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity">
              <p className="text-[10px] font-medium truncate">{name}</p>
              <p className="text-[9px] text-muted-foreground truncate">{series}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export function AvatarPicker({
  open,
  onOpenChange,
  currentAvatar,
  onSelect,
  isUploading,
  onUpload,
}: AvatarPickerProps) {
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const debouncedSearch = useDebounce(searchQuery, 500);
  const isMobile = useIsMobile();
  const { t } = useLanguage();

  const searchCharacters = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const response = await fetch("https://graphql.anilist.co", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `
            query ($search: String) {
              Page(page: 1, perPage: 20) {
                characters(search: $search) {
                  id
                  name { full }
                  image { large }
                  media(page: 1, perPage: 1) {
                    nodes { title { romaji } }
                  }
                }
              }
            }
          `,
          variables: { search: query },
        }),
      });
      const data = await response.json();
      setSearchResults(data.data?.Page?.characters || []);
    } catch (error) {
      console.error("Error searching characters:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  useState(() => {
    if (debouncedSearch) {
      searchCharacters(debouncedSearch);
    }
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await onUpload(file);
    }
    e.target.value = "";
  };

  const handleConfirm = () => {
    if (selectedAvatar) {
      onSelect(selectedAvatar);
      onOpenChange(false);
      setSelectedAvatar(null);
    }
  };

  const pickerContent = (
    <Tabs defaultValue="presets" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="presets">{t("nav.popular") || "Popular"}</TabsTrigger>
        <TabsTrigger value="search">{t("nav.search")}</TabsTrigger>
        <TabsTrigger value="upload">Upload</TabsTrigger>
      </TabsList>

      <TabsContent value="presets" className="mt-4">
        <AvatarGrid
          items={PRESET_AVATARS}
          selectedAvatar={selectedAvatar}
          onSelect={setSelectedAvatar}
          getUrl={(a) => a.url}
          getName={(a) => a.name}
          getSeries={(a) => a.series}
        />
      </TabsContent>

      <TabsContent value="search" className="mt-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search anime/manga characters..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              searchCharacters(e.target.value);
            }}
            className="pl-10"
          />
        </div>
        {isSearching ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : searchResults.length > 0 ? (
          <AvatarGrid
            items={searchResults}
            selectedAvatar={selectedAvatar}
            onSelect={setSelectedAvatar}
            getUrl={(c) => c.image.large}
            getName={(c) => c.name.full}
            getSeries={(c) => c.media.nodes[0]?.title.romaji || "Unknown"}
          />
        ) : searchQuery ? (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
            <p className="text-sm">No characters found</p>
            <p className="text-xs">Try a different search term</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
            <Search className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm">Search for your favorite character</p>
          </div>
        )}
      </TabsContent>

      <TabsContent value="upload" className="mt-4">
        <div className="flex flex-col items-center justify-center h-48 sm:h-64 border-2 border-dashed border-muted-foreground/30 rounded-lg">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <Upload className="w-10 h-10 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground mb-4">Upload your own avatar</p>
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Choose File
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground mt-3">
            Recommended: Square image, max 2MB
          </p>
        </div>
      </TabsContent>
    </Tabs>
  );

  // Mobile: full-screen slide-up
  if (isMobile) {
    if (!open) return null;
    return createPortal(
      <div
        className="fixed inset-0 z-50 bg-background overflow-y-auto overscroll-y-contain"
        style={{
          WebkitOverflowScrolling: "touch",
          animation: "slideUpFull 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => onOpenChange(false)}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted transition-colors active:scale-95"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
            <h1 className="text-base font-semibold">{t("settings.changeAvatar")}</h1>
            <Button
              size="sm"
              onClick={handleConfirm}
              disabled={!selectedAvatar}
              className="h-8 px-3 text-sm"
            >
              <Check className="w-4 h-4 mr-1" />
              {t("settings.save")}
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-4 pb-24">
          {pickerContent}
        </div>
      </div>,
      document.body
    );
  }

  // Desktop: centered dialog
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>{t("settings.changeAvatar")}</DialogTitle>
        </DialogHeader>

        {pickerContent}

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedAvatar}>
            Use This Avatar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
