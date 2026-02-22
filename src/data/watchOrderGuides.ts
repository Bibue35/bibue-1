export interface GuideEntry {
  title: string;
  anilistId: number;
  type: "TV" | "Movie" | "OVA" | "Special" | "ONA";
  episodes?: number | string;
  essential: boolean;
  note?: string;
  fillerNote?: string;
}

export interface WatchOrderGuide {
  slug: string;
  franchise: string;
  bannerColor: string;
  introduction: string;
  hasChronological: boolean;
  releaseOrder: GuideEntry[];
  chronologicalOrder?: GuideEntry[];
}

export const watchOrderGuides: WatchOrderGuide[] = [
  {
    slug: "fate-series",
    franchise: "Fate",
    bannerColor: "from-blue-900/80 to-purple-900/80",
    introduction: "The Fate franchise is one of the most expansive in anime, originating from the visual novel Fate/stay night. With multiple timelines, alternate universes, and spin-offs, knowing where to start can be overwhelming. This guide covers the most common and recommended viewing orders.",
    hasChronological: true,
    releaseOrder: [
      { title: "Fate/stay night", anilistId: 356, type: "TV", episodes: 24, essential: true, note: "The original 2006 adaptation by Studio DEEN. Covers the Fate route." },
      { title: "Fate/Zero", anilistId: 10087, type: "TV", episodes: 25, essential: true, note: "Prequel set 10 years before stay night. Often recommended as a starting point." },
      { title: "Fate/stay night: Unlimited Blade Works", anilistId: 19603, type: "TV", episodes: 25, essential: true, note: "Ufotable's stunning adaptation of the UBW route." },
      { title: "Fate/stay night: Heaven's Feel I", anilistId: 21719, type: "Movie", essential: true, note: "First film of the Heaven's Feel trilogy." },
      { title: "Fate/stay night: Heaven's Feel II", anilistId: 100261, type: "Movie", essential: true, note: "Second film continuing the dark HF route." },
      { title: "Fate/stay night: Heaven's Feel III", anilistId: 113648, type: "Movie", essential: true, note: "Conclusion of the Heaven's Feel trilogy." },
      { title: "Fate/Apocrypha", anilistId: 98035, type: "TV", episodes: 25, essential: false, note: "Alternate timeline with two factions of servants." },
      { title: "Fate/Grand Order: First Order", anilistId: 97815, type: "Special", essential: false, note: "Introduction to the FGO storyline." },
      { title: "Fate/Grand Order: Babylonia", anilistId: 103275, type: "TV", episodes: 21, essential: false, note: "Adaptation of the popular Babylonia singularity." },
    ],
    chronologicalOrder: [
      { title: "Fate/Zero", anilistId: 10087, type: "TV", episodes: 25, essential: true, note: "Fourth Holy Grail War (chronologically first)." },
      { title: "Fate/stay night", anilistId: 356, type: "TV", episodes: 24, essential: true, note: "Fifth Holy Grail War — Fate route." },
      { title: "Fate/stay night: Unlimited Blade Works", anilistId: 19603, type: "TV", episodes: 25, essential: true, note: "Fifth Holy Grail War — UBW route (alt timeline)." },
      { title: "Fate/stay night: Heaven's Feel I", anilistId: 21719, type: "Movie", essential: true, note: "Fifth Holy Grail War — HF route (alt timeline)." },
      { title: "Fate/stay night: Heaven's Feel II", anilistId: 100261, type: "Movie", essential: true, note: "Continuation of HF route." },
      { title: "Fate/stay night: Heaven's Feel III", anilistId: 113648, type: "Movie", essential: true, note: "Conclusion of HF route." },
    ],
  },
  {
    slug: "naruto",
    franchise: "Naruto",
    bannerColor: "from-orange-900/80 to-red-900/80",
    introduction: "Naruto is one of the Big Three shonen anime. The series follows Naruto Uzumaki's journey from outcast to the leader of his village. The anime is notorious for its filler episodes, so this guide includes a filler skip list to help you focus on the canon story.",
    hasChronological: false,
    releaseOrder: [
      { title: "Naruto", anilistId: 20, type: "TV", episodes: 220, essential: true, note: "The original series covering Naruto's childhood.", fillerNote: "Skip episodes: 26, 97, 101-106, 136-220 (heavy filler arc at the end)" },
      { title: "Naruto Shippuden", anilistId: 1735, type: "TV", episodes: 500, essential: true, note: "Continuation after the 2.5 year timeskip.", fillerNote: "Skip episodes: 57-71, 91-112, 144-151, 170-171, 176-196, 223-242, 257-260, 271, 279-281, 284-295, 303-320, 347-361, 376-377, 388-390, 394-413, 416-417, 422-423, 427-450, 464-468, 480-483" },
      { title: "The Last: Naruto the Movie", anilistId: 20553, type: "Movie", essential: true, note: "Canon movie set between Shippuden and Boruto." },
      { title: "Boruto: Naruto Next Generations", anilistId: 97938, type: "TV", episodes: 293, essential: false, note: "Sequel following Naruto's son." },
    ],
  },
  {
    slug: "jojo",
    franchise: "JoJo's Bizarre Adventure",
    bannerColor: "from-yellow-900/80 to-purple-900/80",
    introduction: "JoJo's Bizarre Adventure spans multiple generations of the Joestar family, each part featuring a different protagonist and unique powers. The series is known for its over-the-top action, memorable poses, and creative Stand battles. Watch in release order — each part builds on the last.",
    hasChronological: false,
    releaseOrder: [
      { title: "JoJo's Bizarre Adventure (2012)", anilistId: 14719, type: "TV", episodes: 26, essential: true, note: "Parts 1 (Phantom Blood) & 2 (Battle Tendency)." },
      { title: "JoJo's Bizarre Adventure: Stardust Crusaders", anilistId: 20474, type: "TV", episodes: 24, essential: true, note: "Part 3 — Introduction of Stands." },
      { title: "Stardust Crusaders: Battle in Egypt", anilistId: 20799, type: "TV", episodes: 24, essential: true, note: "Part 3 conclusion — the iconic DIO battle." },
      { title: "JoJo's Bizarre Adventure: Diamond is Unbreakable", anilistId: 21450, type: "TV", episodes: 39, essential: true, note: "Part 4 — small town mystery with Josuke." },
      { title: "JoJo's Bizarre Adventure: Golden Wind", anilistId: 102883, type: "TV", episodes: 39, essential: true, note: "Part 5 — Italian mafia with Giorno Giovanna." },
      { title: "JoJo's Bizarre Adventure: Stone Ocean", anilistId: 131942, type: "ONA", episodes: 38, essential: true, note: "Part 6 — set in a prison with Jolyne Cujoh." },
    ],
  },
  {
    slug: "monogatari",
    franchise: "Monogatari",
    bannerColor: "from-purple-900/80 to-pink-900/80",
    introduction: "The Monogatari series by Nisio Isin is a dialogue-heavy supernatural story centered on Koyomi Araragi and various girls afflicted by oddities. The series is known for its unique visual style by Studio Shaft. There's significant debate on watch order — this guide presents the most common approaches.",
    hasChronological: true,
    releaseOrder: [
      { title: "Bakemonogatari", anilistId: 5081, type: "TV", episodes: 15, essential: true, note: "The starting point — introduces Araragi and the oddities." },
      { title: "Nisemonogatari", anilistId: 11597, type: "TV", episodes: 11, essential: true, note: "Focus on Araragi's sisters." },
      { title: "Nekomonogatari: Kuro", anilistId: 15689, type: "TV", episodes: 4, essential: true, note: "Prequel about Hanekawa's cat oddity." },
      { title: "Monogatari Series: Second Season", anilistId: 17074, type: "TV", episodes: 26, essential: true, note: "Major arcs for multiple characters." },
      { title: "Hanamonogatari", anilistId: 20593, type: "TV", episodes: 5, essential: true, note: "Kanbaru's story, set chronologically later." },
      { title: "Tsukimonogatari", anilistId: 20918, type: "TV", episodes: 4, essential: true, note: "Araragi confronts his vampire nature." },
      { title: "Owarimonogatari", anilistId: 21262, type: "TV", episodes: 12, essential: true, note: "Ougi and Sodachi's mysteries." },
      { title: "Koyomimonogatari", anilistId: 21520, type: "ONA", episodes: 12, essential: false, note: "Short stories — watch before Owarimonogatari S2." },
      { title: "Owarimonogatari Second Season", anilistId: 21745, type: "TV", episodes: 7, essential: true, note: "Climactic conclusion of the main story." },
      { title: "Zoku Owarimonogatari", anilistId: 100815, type: "Movie", essential: false, note: "Epilogue — mirror world story." },
    ],
    chronologicalOrder: [
      { title: "Kizumonogatari I: Tekketsu-hen", anilistId: 5081, type: "Movie", essential: true, note: "Spring break — Araragi becomes a vampire (earliest chronologically)." },
      { title: "Nekomonogatari: Kuro", anilistId: 15689, type: "TV", episodes: 4, essential: true, note: "Golden Week — Hanekawa's first incident." },
      { title: "Bakemonogatari", anilistId: 5081, type: "TV", episodes: 15, essential: true, note: "Summer — meeting the girls and their oddities." },
      { title: "Nisemonogatari", anilistId: 11597, type: "TV", episodes: 11, essential: true, note: "Summer vacation — Karen and Tsukihi arcs." },
      { title: "Monogatari Series: Second Season", anilistId: 17074, type: "TV", episodes: 26, essential: true, note: "Various timelines across the school year." },
    ],
  },
  {
    slug: "dragon-ball",
    franchise: "Dragon Ball",
    bannerColor: "from-orange-900/80 to-yellow-900/80",
    introduction: "Dragon Ball is one of the most influential anime franchises of all time, created by Akira Toriyama. Following Goku from childhood to the cosmic battles of Super, this guide covers the main series and key movies.",
    hasChronological: false,
    releaseOrder: [
      { title: "Dragon Ball", anilistId: 223, type: "TV", episodes: 153, essential: true, note: "Young Goku's adventures and martial arts tournaments." },
      { title: "Dragon Ball Z", anilistId: 813, type: "TV", episodes: 291, essential: true, note: "The legendary continuation — Saiyans, Frieza, Cell, Buu." },
      { title: "Dragon Ball Z: Battle of Gods", anilistId: 14837, type: "Movie", essential: true, note: "Canon movie introducing Beerus — leads into Super." },
      { title: "Dragon Ball Z: Resurrection 'F'", anilistId: 20834, type: "Movie", essential: true, note: "Canon movie — Frieza returns." },
      { title: "Dragon Ball Super", anilistId: 21175, type: "TV", episodes: 131, essential: true, note: "Continues after Z with gods and multiverse arcs." },
      { title: "Dragon Ball Super: Broly", anilistId: 101349, type: "Movie", essential: true, note: "Canon movie reintroducing Broly." },
      { title: "Dragon Ball GT", anilistId: 225, type: "TV", episodes: 64, essential: false, note: "Non-canon sequel. Optional but has fans." },
      { title: "Dragon Ball DAIMA", anilistId: 170083, type: "TV", episodes: 20, essential: false, note: "2024 series — Goku turned into a child again in Demon Realm." },
    ],
  },
  {
    slug: "one-piece",
    franchise: "One Piece",
    bannerColor: "from-red-900/80 to-yellow-900/80",
    introduction: "One Piece is the best-selling manga of all time. Monkey D. Luffy's quest to become King of the Pirates spans 1000+ episodes. While there's no complex watch order, this guide helps you navigate the massive episode count with key arcs and pacing tips.",
    hasChronological: false,
    releaseOrder: [
      { title: "One Piece", anilistId: 21, type: "TV", episodes: "1100+", essential: true, note: "The entire main series. Key saga breaks: East Blue (1-61), Alabasta (62-135), Sky Island (136-206), Water 7/Enies Lobby (207-325), Thriller Bark (326-384), Summit War (385-516), Fish-Man Island (517-574), Dressrosa (575-746), Whole Cake Island (747-877), Wano (878-1085), Egghead (1086+)." },
      { title: "One Piece Film: Strong World", anilistId: 6299, type: "Movie", essential: false, note: "Oda-supervised movie. Watch after Thriller Bark." },
      { title: "One Piece Film: Z", anilistId: 12859, type: "Movie", essential: false, note: "Great standalone movie. Watch after Fish-Man Island." },
      { title: "One Piece Film: Gold", anilistId: 21335, type: "Movie", essential: false, note: "Casino adventure. Watch after Dressrosa." },
      { title: "One Piece Film: Red", anilistId: 139630, type: "Movie", essential: false, note: "Musical film featuring Shanks. Watch after Wano." },
    ],
  },
  {
    slug: "gundam",
    franchise: "Gundam",
    bannerColor: "from-blue-900/80 to-green-900/80",
    introduction: "The Gundam franchise is massive with multiple continuities. The Universal Century (UC) timeline is the main one, but many standalone series are great entry points. This guide focuses on the UC timeline and the best standalone options.",
    hasChronological: true,
    releaseOrder: [
      { title: "Mobile Suit Gundam", anilistId: 80, type: "TV", episodes: 43, essential: true, note: "The original 1979 series that started it all." },
      { title: "Mobile Suit Zeta Gundam", anilistId: 85, type: "TV", episodes: 50, essential: true, note: "Direct sequel — darker tone, complex politics." },
      { title: "Mobile Suit Gundam ZZ", anilistId: 86, type: "TV", episodes: 47, essential: false, note: "Lighter tone sequel to Zeta." },
      { title: "Mobile Suit Gundam: Char's Counterattack", anilistId: 87, type: "Movie", essential: true, note: "Conclusion of the Amuro vs Char rivalry." },
      { title: "Mobile Suit Gundam Unicorn", anilistId: 6336, type: "OVA", episodes: 7, essential: true, note: "Modern UC sequel — stunning visuals." },
      { title: "Mobile Suit Gundam: Hathaway", anilistId: 105595, type: "Movie", essential: false, note: "Sequel to Char's Counterattack." },
      { title: "Mobile Suit Gundam SEED", anilistId: 93, type: "TV", episodes: 50, essential: false, note: "Standalone timeline — great entry point for newcomers." },
      { title: "Mobile Suit Gundam 00", anilistId: 2581, type: "TV", episodes: 25, essential: false, note: "Standalone — modern setting with political themes." },
      { title: "Mobile Suit Gundam: Iron-Blooded Orphans", anilistId: 21268, type: "TV", episodes: 25, essential: false, note: "Standalone — gritty, character-driven story." },
      { title: "Mobile Suit Gundam: The Witch from Mercury", anilistId: 139274, type: "TV", episodes: 24, essential: false, note: "Latest standalone — school setting with great characters." },
    ],
    chronologicalOrder: [
      { title: "Mobile Suit Gundam: The Origin", anilistId: 10937, type: "OVA", episodes: 6, essential: false, note: "Prequel — Char's backstory (UC 0068-0079)." },
      { title: "Mobile Suit Gundam", anilistId: 80, type: "TV", episodes: 43, essential: true, note: "One Year War (UC 0079)." },
      { title: "Mobile Suit Gundam 0080: War in the Pocket", anilistId: 82, type: "OVA", episodes: 6, essential: false, note: "Side story during the One Year War." },
      { title: "Mobile Suit Gundam 0083: Stardust Memory", anilistId: 84, type: "OVA", episodes: 13, essential: false, note: "Bridge between Gundam and Zeta (UC 0083)." },
      { title: "Mobile Suit Zeta Gundam", anilistId: 85, type: "TV", episodes: 50, essential: true, note: "Gryps War (UC 0087)." },
      { title: "Mobile Suit Gundam: Char's Counterattack", anilistId: 87, type: "Movie", essential: true, note: "Second Neo Zeon War (UC 0093)." },
      { title: "Mobile Suit Gundam Unicorn", anilistId: 6336, type: "OVA", episodes: 7, essential: true, note: "Laplace Conflict (UC 0096)." },
    ],
  },
  {
    slug: "evangelion",
    franchise: "Neon Genesis Evangelion",
    bannerColor: "from-green-900/80 to-red-900/80",
    introduction: "Evangelion is a genre-defining mecha series that delves deep into psychology, religion, and the human condition. There are two main ways to experience it: the original series + End of Evangelion, or the Rebuild film tetralogy which retells and diverges from the original.",
    hasChronological: false,
    releaseOrder: [
      { title: "Neon Genesis Evangelion", anilistId: 30, type: "TV", episodes: 26, essential: true, note: "The original masterpiece. Episodes 25-26 are the controversial ending." },
      { title: "The End of Evangelion", anilistId: 32, type: "Movie", essential: true, note: "Alternative ending to episodes 25-26. Essential viewing." },
      { title: "Evangelion: 1.0 You Are (Not) Alone", anilistId: 2759, type: "Movie", essential: false, note: "Rebuild 1 — retells the first 6 episodes." },
      { title: "Evangelion: 2.0 You Can (Not) Advance", anilistId: 3782, type: "Movie", essential: false, note: "Rebuild 2 — begins diverging significantly." },
      { title: "Evangelion: 3.0 You Can (Not) Redo", anilistId: 3783, type: "Movie", essential: false, note: "Rebuild 3 — completely new story." },
      { title: "Evangelion: 3.0+1.0 Thrice Upon a Time", anilistId: 3784, type: "Movie", essential: false, note: "Final Rebuild film — beautiful conclusion." },
    ],
  },
  {
    slug: "sword-art-online",
    franchise: "Sword Art Online",
    bannerColor: "from-cyan-900/80 to-blue-900/80",
    introduction: "Sword Art Online (SAO) follows Kirito through various virtual reality worlds. The series is straightforward in chronological order, with each season building on the last. This guide includes the movies and spin-offs.",
    hasChronological: false,
    releaseOrder: [
      { title: "Sword Art Online", anilistId: 11757, type: "TV", episodes: 25, essential: true, note: "Aincrad and Fairy Dance arcs." },
      { title: "Sword Art Online: Extra Edition", anilistId: 20021, type: "Special", essential: false, note: "Recap with some new content." },
      { title: "Sword Art Online II", anilistId: 20594, type: "TV", episodes: 24, essential: true, note: "Phantom Bullet and Mother's Rosario arcs." },
      { title: "Sword Art Online: Ordinal Scale", anilistId: 21403, type: "Movie", essential: true, note: "Canon movie — augmented reality game." },
      { title: "Sword Art Online: Alicization", anilistId: 100182, type: "TV", episodes: 24, essential: true, note: "Underworld arc — widely considered SAO's best." },
      { title: "SAO: Alicization - War of Underworld", anilistId: 108759, type: "TV", episodes: 23, essential: true, note: "Conclusion of the Alicization arc." },
      { title: "Sword Art Online Alternative: Gun Gale Online", anilistId: 100183, type: "TV", episodes: 12, essential: false, note: "Spin-off with different protagonist. Fun standalone." },
    ],
  },
  {
    slug: "toaru",
    franchise: "A Certain Magical Index / Scientific Railgun",
    bannerColor: "from-indigo-900/80 to-sky-900/80",
    introduction: "The Toaru (A Certain) franchise is set in Academy City where espers and magicians coexist. It has two main series — Index (magic-focused) and Railgun (science-focused) — that interweave. This guide presents the most popular viewing orders.",
    hasChronological: true,
    releaseOrder: [
      { title: "A Certain Magical Index", anilistId: 4654, type: "TV", episodes: 24, essential: true, note: "Introduction to Academy City through Touma's perspective." },
      { title: "A Certain Scientific Railgun", anilistId: 6213, type: "TV", episodes: 24, essential: true, note: "Misaka Mikoto's side of the story — fan favorite." },
      { title: "A Certain Magical Index II", anilistId: 8937, type: "TV", episodes: 24, essential: true, note: "Continuation of the magic side." },
      { title: "A Certain Scientific Railgun S", anilistId: 16049, type: "TV", episodes: 24, essential: true, note: "Sisters arc — one of the best arcs in the franchise." },
      { title: "A Certain Magical Index III", anilistId: 100185, type: "TV", episodes: 26, essential: true, note: "Magic side escalation — pacing is rushed." },
      { title: "A Certain Scientific Railgun T", anilistId: 104462, type: "TV", episodes: 25, essential: true, note: "Daihasei Festival arc — excellent production." },
      { title: "A Certain Scientific Accelerator", anilistId: 104463, type: "TV", episodes: 12, essential: false, note: "Spin-off following the #1 esper." },
    ],
    chronologicalOrder: [
      { title: "A Certain Scientific Railgun", anilistId: 6213, type: "TV", episodes: 24, essential: true, note: "Start here for chronological — Level Upper arc." },
      { title: "A Certain Magical Index (ep 1-9)", anilistId: 4654, type: "TV", episodes: 9, essential: true, note: "Index arc and Deep Blood arc." },
      { title: "A Certain Scientific Railgun S (ep 1-16)", anilistId: 16049, type: "TV", episodes: 16, essential: true, note: "Sisters arc — science side." },
      { title: "A Certain Magical Index (ep 10-14)", anilistId: 4654, type: "TV", episodes: 5, essential: true, note: "Sisters arc — magic side perspective." },
      { title: "A Certain Scientific Railgun S (ep 17-24)", anilistId: 16049, type: "TV", episodes: 8, essential: true, note: "Silent Party arc." },
      { title: "A Certain Magical Index (ep 15-24)", anilistId: 4654, type: "TV", episodes: 10, essential: true, note: "Remaining Index S1 arcs." },
    ],
  },
];

// Genre definitions for genre pages
export interface GenreDefinition {
  slug: string;
  name: string;
  anilistGenre: string;
  description: string;
  emoji: string;
}

export const genreDefinitions: GenreDefinition[] = [
  { slug: "action", name: "Action", anilistGenre: "Action", description: "High-energy battles, intense fight choreography, and adrenaline-pumping sequences define action anime. From martial arts to mecha warfare, these series keep you on the edge of your seat.", emoji: "⚔️" },
  { slug: "romance", name: "Romance", anilistGenre: "Romance", description: "Love stories in all their forms — from sweet high school crushes to complex adult relationships. Romance anime explores the emotional connections between characters.", emoji: "💕" },
  { slug: "comedy", name: "Comedy", anilistGenre: "Comedy", description: "Laughs, gags, and hilarious situations. Comedy anime ranges from slapstick humor to witty dialogue and absurd premises that'll have you in tears of laughter.", emoji: "😂" },
  { slug: "thriller", name: "Thriller", anilistGenre: "Thriller", description: "Suspenseful narratives that keep you guessing. Thriller anime features psychological games, mind-bending plots, and nail-biting tension throughout.", emoji: "🔪" },
  { slug: "horror", name: "Horror", anilistGenre: "Horror", description: "From supernatural hauntings to psychological terror, horror anime pushes boundaries with disturbing imagery, unsettling atmospheres, and genuinely scary moments.", emoji: "👻" },
  { slug: "fantasy", name: "Fantasy", anilistGenre: "Fantasy", description: "Magical worlds, epic quests, and mythical creatures. Fantasy anime transports you to realms of wonder where anything is possible and heroes rise to legendary status.", emoji: "🧙" },
  { slug: "sci-fi", name: "Sci-Fi", anilistGenre: "Sci-Fi", description: "Futuristic technology, space exploration, and cyberpunk worlds. Sci-fi anime explores the possibilities and consequences of scientific advancement.", emoji: "🚀" },
  { slug: "slice-of-life", name: "Slice of Life", anilistGenre: "Slice of Life", description: "Everyday moments made beautiful. Slice of life anime captures the quiet charm of ordinary existence, celebrating small joys and genuine human connections.", emoji: "☕" },
  { slug: "sports", name: "Sports", anilistGenre: "Sports", description: "Intense competition, team spirit, and the drive to be the best. Sports anime turns athletic pursuits into epic narratives of determination and growth.", emoji: "🏆" },
  { slug: "mecha", name: "Mecha", anilistGenre: "Mecha", description: "Giant robots, epic battles, and futuristic warfare. Mecha anime combines impressive mechanical designs with compelling stories about pilots and their machines.", emoji: "🤖" },
  { slug: "psychological", name: "Psychological", anilistGenre: "Psychological", description: "Mind games, moral dilemmas, and deep character studies. Psychological anime challenges your perception and explores the depths of the human mind.", emoji: "🧠" },
  { slug: "drama", name: "Drama", anilistGenre: "Drama", description: "Emotionally charged stories that explore the human condition. Drama anime delivers powerful narratives that can make you laugh, cry, and everything in between.", emoji: "🎭" },
  { slug: "adventure", name: "Adventure", anilistGenre: "Adventure", description: "Epic journeys across vast worlds. Adventure anime follows characters as they explore unknown lands, face challenges, and discover what truly matters.", emoji: "🗺️" },
  { slug: "mystery", name: "Mystery", anilistGenre: "Mystery", description: "Whodunits, detective stories, and unsolved puzzles. Mystery anime keeps you engaged with clever clues, unexpected twists, and satisfying revelations.", emoji: "🔍" },
  { slug: "supernatural", name: "Supernatural", anilistGenre: "Supernatural", description: "Ghosts, spirits, and powers beyond explanation. Supernatural anime blends the ordinary with the extraordinary, creating compelling stories of the unseen world.", emoji: "✨" },
  { slug: "isekai", name: "Isekai", anilistGenre: "Fantasy", description: "Transported to another world! Isekai anime follows characters who find themselves in fantasy realms, often with unique powers and a chance to start anew.", emoji: "🌀" },
  { slug: "seinen", name: "Seinen", anilistGenre: "Action", description: "Mature themes and complex narratives aimed at adult men. Seinen anime features sophisticated storytelling, moral ambiguity, and nuanced character development.", emoji: "📖" },
  { slug: "shounen", name: "Shounen", anilistGenre: "Action", description: "Friendship, rivalry, and the power of determination. Shounen anime is defined by young heroes who grow stronger through battles and bonds with their companions.", emoji: "💪" },
  { slug: "shoujo", name: "Shoujo", anilistGenre: "Romance", description: "Beautiful stories of love, friendship, and self-discovery aimed at young women. Shoujo anime features strong emotional narratives and stunning visual styles.", emoji: "🌸" },
  { slug: "josei", name: "Josei", anilistGenre: "Drama", description: "Realistic and mature stories for adult women. Josei anime explores relationships, career challenges, and personal growth with authenticity and depth.", emoji: "💎" },
];
