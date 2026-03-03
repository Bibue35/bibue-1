import { ExternalLink } from "lucide-react";

interface ReadingPlatform {
  name: string;
  color: string;
  bgClass: string;
  url: string;
}

const MANGA_PLATFORMS: ReadingPlatform[] = [
  {
    name: "MANGA Plus",
    color: "text-[hsl(0,75%,55%)]",
    bgClass: "bg-[hsl(0,75%,55%)]/10 hover:bg-[hsl(0,75%,55%)]/20 border-[hsl(0,75%,55%)]/20",
    url: "https://mangaplus.shueisha.co.jp",
  },
  {
    name: "VIZ",
    color: "text-[hsl(0,0%,95%)]",
    bgClass: "bg-[hsl(0,0%,50%)]/10 hover:bg-[hsl(0,0%,50%)]/20 border-[hsl(0,0%,50%)]/20",
    url: "https://www.viz.com",
  },
  {
    name: "ComiXology",
    color: "text-[hsl(45,90%,50%)]",
    bgClass: "bg-[hsl(45,90%,50%)]/10 hover:bg-[hsl(45,90%,50%)]/20 border-[hsl(45,90%,50%)]/20",
    url: "https://www.comixology.com",
  },
];

const MANHWA_PLATFORMS: ReadingPlatform[] = [
  {
    name: "WEBTOON",
    color: "text-[hsl(145,65%,45%)]",
    bgClass: "bg-[hsl(145,65%,45%)]/10 hover:bg-[hsl(145,65%,45%)]/20 border-[hsl(145,65%,45%)]/20",
    url: "https://www.webtoons.com",
  },
  {
    name: "Tappytoon",
    color: "text-[hsl(25,95%,53%)]",
    bgClass: "bg-[hsl(25,95%,53%)]/10 hover:bg-[hsl(25,95%,53%)]/20 border-[hsl(25,95%,53%)]/20",
    url: "https://www.tappytoon.com",
  },
  {
    name: "Lezhin",
    color: "text-[hsl(0,75%,55%)]",
    bgClass: "bg-[hsl(0,75%,55%)]/10 hover:bg-[hsl(0,75%,55%)]/20 border-[hsl(0,75%,55%)]/20",
    url: "https://www.lezhin.com",
  },
];

interface WhereToReadProps {
  type?: string;
  countryOfOrigin?: string;
}

export function WhereToRead({ type, countryOfOrigin }: WhereToReadProps) {
  const isKoreanOrChinese =
    type === "Manhwa" || type === "Manhua" ||
    countryOfOrigin === "KR" || countryOfOrigin === "CN";

  const platforms = isKoreanOrChinese ? MANHWA_PLATFORMS : MANGA_PLATFORMS;

  return (
    <div>
      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2.5">
        Where to Read
      </h3>
      <div className="flex flex-wrap gap-1.5">
        {platforms.map((platform) => (
          <a
            key={platform.name}
            href={platform.url}
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
