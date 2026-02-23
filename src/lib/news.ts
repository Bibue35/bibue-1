import { Anime, Manga, SupportedLanguage } from "./api";

export interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  content?: string;
  date: string;
  author: string;
  category: "Seasonal" | "Announcement" | "Review" | "Industry" | "Trending" | "New Release";
  image: string;
  relatedMedia?: {
    type: "anime" | "manga";
    id: number;
    title: string;
  };
}

// Generate news articles from trending/seasonal anime data
export function generateNewsFromAnime(anime: Anime[], category: NewsArticle["category"]): NewsArticle[] {
  return anime.slice(0, 6).map((item, index) => {
    const templates = getNewsTemplates(item, category);
    const template = templates[index % templates.length];
    
    return {
      id: `${category.toLowerCase()}-${item.anilist_id}`,
      title: template.title,
      excerpt: template.excerpt,
      date: getRelativeDate(index),
      author: getRandomAuthor(),
      category,
      image: item.images.jpg.large_image_url,
      relatedMedia: {
        type: "anime",
        id: item.anilist_id,
        title: item.title,
      },
    };
  });
}

export function generateNewsFromManga(manga: Manga[], category: NewsArticle["category"]): NewsArticle[] {
  return manga.slice(0, 4).map((item, index) => {
    const templates = getMangaNewsTemplates(item, category);
    const template = templates[index % templates.length];
    
    return {
      id: `manga-${category.toLowerCase()}-${item.anilist_id}`,
      title: template.title,
      excerpt: template.excerpt,
      date: getRelativeDate(index + 3),
      author: getRandomAuthor(),
      category,
      image: item.images.jpg.large_image_url,
      relatedMedia: {
        type: "manga",
        id: item.anilist_id,
        title: item.title,
      },
    };
  });
}

function getNewsTemplates(anime: Anime, category: NewsArticle["category"]): Array<{ title: string; excerpt: string }> {
  const title = anime.title;
  const score = anime.score ? `${anime.score.toFixed(1)}` : "high";
  const episodes = anime.episodes || "ongoing";
  const studio = anime.studios?.[0]?.name || "the studio";
  const genre = anime.genres?.[0]?.name || "action";
  
  switch (category) {
    case "Seasonal":
      return [
        {
          title: `${title} Dominates This Season's Charts`,
          excerpt: `With a score of ${score}, ${title} has become one of the most talked-about anime of the season. Fans are praising its stunning animation and compelling story.`,
        },
        {
          title: `Why ${title} Is the Must-Watch Anime Right Now`,
          excerpt: `${studio} delivers another masterpiece with ${title}. Here's everything you need to know about the ${genre} series taking the anime community by storm.`,
        },
        {
          title: `${title} Episode Count Revealed: ${episodes} Episodes Confirmed`,
          excerpt: `Fans can look forward to ${episodes} episodes of ${title}. The series continues to build momentum with each new release.`,
        },
      ];
    case "Announcement":
      return [
        {
          title: `${title} New Season Announcement Sends Fans Into Frenzy`,
          excerpt: `${studio} has officially confirmed a new season of ${title}. The announcement came during a special streaming event that drew thousands of viewers.`,
        },
        {
          title: `Breaking: ${title} Gets Major Update from ${studio}`,
          excerpt: `Big news for ${title} fans! The creative team behind the hit ${genre} series has revealed exciting new details about the upcoming content.`,
        },
      ];
    case "Review":
      return [
        {
          title: `${title} Review: A ${score}/10 ${genre.charAt(0).toUpperCase() + genre.slice(1)} Masterpiece`,
          excerpt: `Our in-depth review of ${title} explores what makes this ${studio} production stand out in a crowded season of anime releases.`,
        },
        {
          title: `Is ${title} Worth Your Time? Our Verdict`,
          excerpt: `We've watched all available episodes of ${title} to bring you this comprehensive review. Here's what we think about the latest from ${studio}.`,
        },
      ];
    case "Trending":
      return [
        {
          title: `${title} Breaks Streaming Records This Week`,
          excerpt: `${title} has topped streaming charts worldwide, with fans binge-watching the ${genre} series in record numbers.`,
        },
        {
          title: `Why Everyone Is Talking About ${title}`,
          excerpt: `From social media buzz to forum discussions, ${title} is the anime everyone can't stop discussing. Here's what makes it special.`,
        },
      ];
    default:
      return [
        {
          title: `${title} Latest News and Updates`,
          excerpt: `Stay up to date with the latest developments for ${title}, the popular ${genre} anime from ${studio}.`,
        },
      ];
  }
}

function getMangaNewsTemplates(manga: Manga, category: NewsArticle["category"]): Array<{ title: string; excerpt: string }> {
  const title = manga.title;
  const score = manga.score ? `${manga.score.toFixed(1)}` : "high";
  const chapters = manga.chapters || "ongoing";
  const author = manga.authors?.[0]?.name || "the mangaka";
  const genre = manga.genres?.[0]?.name || "action";
  const type = manga.type || "Manga";
  
  return [
    {
      title: `${title} ${type} Reaches New Milestone`,
      excerpt: `${author}'s ${title} continues to captivate readers with its latest arc. With a score of ${score}, it remains a fan favorite in the ${genre} genre.`,
    },
    {
      title: `${title} Anime Adaptation Rumored`,
      excerpt: `Fans are speculating about a potential anime adaptation of ${title}. The popular ${type} has garnered a massive following since its debut.`,
    },
    {
      title: `Why ${title} Is Essential Reading for ${genre.charAt(0).toUpperCase() + genre.slice(1)} Fans`,
      excerpt: `With ${chapters} chapters and counting, ${title} offers an immersive experience that ${genre} enthusiasts won't want to miss.`,
    },
  ];
}

function getRelativeDate(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
}

function getRandomAuthor(): string {
  const authors = [
    "Bibue Staff",
    "Editorial Team",
    "News Desk",
    "Industry Watch",
    "Anime Insider",
    "Community Editor",
  ];
  return authors[Math.floor(Math.random() * authors.length)];
}

// Format date for display
export function formatNewsDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}
