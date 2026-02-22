// Genre definitions for the genres index and detail pages
export interface GenreDefinition {
  slug: string;
  name: string;
  anilistGenre: string;
  emoji: string;
  description: string;
}

export const genreDefinitions: GenreDefinition[] = [
  { slug: "action", name: "Action", anilistGenre: "Action", emoji: "⚔️", description: "High-energy battles, fights, and intense confrontations." },
  { slug: "adventure", name: "Adventure", anilistGenre: "Adventure", emoji: "🗺️", description: "Epic journeys and exploration of new worlds." },
  { slug: "comedy", name: "Comedy", anilistGenre: "Comedy", emoji: "😂", description: "Laugh-out-loud humor and lighthearted fun." },
  { slug: "drama", name: "Drama", anilistGenre: "Drama", emoji: "🎭", description: "Emotional storytelling and character-driven narratives." },
  { slug: "fantasy", name: "Fantasy", anilistGenre: "Fantasy", emoji: "🧙", description: "Magical worlds, mythical creatures, and supernatural powers." },
  { slug: "horror", name: "Horror", anilistGenre: "Horror", emoji: "👻", description: "Terrifying tales designed to scare and unsettle." },
  { slug: "mystery", name: "Mystery", anilistGenre: "Mystery", emoji: "🔍", description: "Puzzling plots, detective work, and suspenseful twists." },
  { slug: "psychological", name: "Psychological", anilistGenre: "Psychological", emoji: "🧠", description: "Mind-bending stories that challenge perception." },
  { slug: "romance", name: "Romance", anilistGenre: "Romance", emoji: "💕", description: "Love stories, relationships, and heartfelt connections." },
  { slug: "sci-fi", name: "Sci-Fi", anilistGenre: "Sci-Fi", emoji: "🚀", description: "Futuristic technology, space exploration, and scientific concepts." },
  { slug: "slice-of-life", name: "Slice of Life", anilistGenre: "Slice of Life", emoji: "☕", description: "Everyday moments and relatable human experiences." },
  { slug: "sports", name: "Sports", anilistGenre: "Sports", emoji: "⚽", description: "Athletic competition, teamwork, and the thrill of victory." },
  { slug: "supernatural", name: "Supernatural", anilistGenre: "Supernatural", emoji: "👁️", description: "Ghosts, spirits, and phenomena beyond natural explanation." },
  { slug: "thriller", name: "Thriller", anilistGenre: "Thriller", emoji: "😰", description: "Edge-of-your-seat suspense and high-stakes tension." },
  { slug: "mecha", name: "Mecha", anilistGenre: "Mecha", emoji: "🤖", description: "Giant robots, mechanical suits, and epic mech battles." },
  { slug: "music", name: "Music", anilistGenre: "Music", emoji: "🎵", description: "Stories centered around music, bands, and performances." },
];
