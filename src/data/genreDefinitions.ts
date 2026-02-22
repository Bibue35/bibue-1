export interface GenreDefinition {
  slug: string;
  name: string;
  emoji: string;
  description: string;
  anilistGenre: string;
}

export const genreDefinitions: GenreDefinition[] = [
  { slug: "action", name: "Action", emoji: "⚔️", description: "High-energy battles, thrilling fights, and adrenaline-pumping adventures.", anilistGenre: "Action" },
  { slug: "adventure", name: "Adventure", emoji: "🗺️", description: "Epic journeys, exploration, and discovery across vast worlds.", anilistGenre: "Adventure" },
  { slug: "comedy", name: "Comedy", emoji: "😂", description: "Hilarious gags, witty humor, and feel-good laughs.", anilistGenre: "Comedy" },
  { slug: "drama", name: "Drama", emoji: "🎭", description: "Emotionally gripping stories with complex characters and powerful narratives.", anilistGenre: "Drama" },
  { slug: "fantasy", name: "Fantasy", emoji: "🧙", description: "Magical worlds, mythical creatures, and supernatural powers.", anilistGenre: "Fantasy" },
  { slug: "horror", name: "Horror", emoji: "👻", description: "Terrifying tales, psychological dread, and spine-chilling suspense.", anilistGenre: "Horror" },
  { slug: "mystery", name: "Mystery", emoji: "🔍", description: "Puzzling cases, detective work, and thrilling revelations.", anilistGenre: "Mystery" },
  { slug: "psychological", name: "Psychological", emoji: "🧠", description: "Mind-bending narratives that explore the depths of the human psyche.", anilistGenre: "Psychological" },
  { slug: "romance", name: "Romance", emoji: "💕", description: "Heartwarming love stories, emotional connections, and beautiful relationships.", anilistGenre: "Romance" },
  { slug: "sci-fi", name: "Sci-Fi", emoji: "🚀", description: "Futuristic technology, space exploration, and scientific wonders.", anilistGenre: "Sci-Fi" },
  { slug: "slice-of-life", name: "Slice of Life", emoji: "☀️", description: "Everyday moments, relatable stories, and the beauty of ordinary life.", anilistGenre: "Slice of Life" },
  { slug: "sports", name: "Sports", emoji: "⚽", description: "Competitive spirit, teamwork, and the pursuit of athletic excellence.", anilistGenre: "Sports" },
  { slug: "supernatural", name: "Supernatural", emoji: "👁️", description: "Otherworldly phenomena, spirits, and forces beyond human understanding.", anilistGenre: "Supernatural" },
  { slug: "thriller", name: "Thriller", emoji: "😰", description: "Edge-of-your-seat tension, suspenseful plots, and unexpected twists.", anilistGenre: "Thriller" },
  { slug: "mecha", name: "Mecha", emoji: "🤖", description: "Giant robots, mechanical battles, and futuristic warfare.", anilistGenre: "Mecha" },
];
