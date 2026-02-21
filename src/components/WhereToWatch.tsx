import { ExternalLink } from "lucide-react";

interface StreamingPlatform {
  name: string;
  color: string;
  bgClass: string;
  searchUrl: (title: string) => string;
}

const PLATFORMS: StreamingPlatform[] = [
  {
    name: "Crunchyroll",
    color: "text-[hsl(25,95%,53%)]",
    bgClass: "bg-[hsl(25,95%,53%)]/10 hover:bg-[hsl(25,95%,53%)]/20 border-[hsl(25,95%,53%)]/20",
    searchUrl: (title) => `https://www.crunchyroll.com/search?q=${encodeURIComponent(title)}`,
  },
  {
    name: "Netflix",
    color: "text-[hsl(0,75%,50%)]",
    bgClass: "bg-[hsl(0,75%,50%)]/10 hover:bg-[hsl(0,75%,50%)]/20 border-[hsl(0,75%,50%)]/20",
    searchUrl: (title) => `https://www.netflix.com/search?q=${encodeURIComponent(title)}`,
  },
  {
    name: "Hulu",
    color: "text-[hsl(145,65%,45%)]",
    bgClass: "bg-[hsl(145,65%,45%)]/10 hover:bg-[hsl(145,65%,45%)]/20 border-[hsl(145,65%,45%)]/20",
    searchUrl: (title) => `https://www.hulu.com/search?q=${encodeURIComponent(title)}`,
  },
  {
    name: "Disney+",
    color: "text-[hsl(220,80%,55%)]",
    bgClass: "bg-[hsl(220,80%,55%)]/10 hover:bg-[hsl(220,80%,55%)]/20 border-[hsl(220,80%,55%)]/20",
    searchUrl: (title) => `https://www.disneyplus.com/search?q=${encodeURIComponent(title)}`,
  },
  {
    name: "Prime Video",
    color: "text-[hsl(195,80%,55%)]",
    bgClass: "bg-[hsl(195,80%,55%)]/10 hover:bg-[hsl(195,80%,55%)]/20 border-[hsl(195,80%,55%)]/20",
    searchUrl: (title) => `https://www.amazon.com/s?k=${encodeURIComponent(title)}&i=instant-video`,
  },
  {
    name: "HiDive",
    color: "text-[hsl(270,60%,55%)]",
    bgClass: "bg-[hsl(270,60%,55%)]/10 hover:bg-[hsl(270,60%,55%)]/20 border-[hsl(270,60%,55%)]/20",
    searchUrl: (title) => `https://www.hidive.com/search?q=${encodeURIComponent(title)}`,
  },
];

interface WhereToWatchProps {
  title: string;
}

export function WhereToWatch({ title }: WhereToWatchProps) {
  return (
    <div>
      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2.5">
        Where to Watch
      </h3>
      <div className="flex flex-wrap gap-1.5">
        {PLATFORMS.map((platform) => (
          <a
            key={platform.name}
            href={platform.searchUrl(title)}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${platform.bgClass} ${platform.color}`}
          >
            {platform.name}
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        ))}
      </div>
    </div>
  );
}
