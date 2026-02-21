import { Helmet } from "react-helmet-async";

const SITE_NAME = "Bibue";
const SITE_URL = "https://bibue.net";
const DEFAULT_IMAGE = `${SITE_URL}/favicon.png`;
const DEFAULT_DESCRIPTION = "Discover your next favorite anime and manga with Bibue. Track your watchlist, explore trending titles, and connect with the community.";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: "website" | "article";
  jsonLd?: Record<string, any>;
  noIndex?: boolean;
}

export function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  url,
  type = "website",
  jsonLd,
  noIndex = false,
}: SEOProps) {
  const fullTitle = title ? `${title} - ${SITE_NAME}` : `${SITE_NAME} - Discover Anime & Manga`;
  const canonicalUrl = url ? `${SITE_URL}${url}` : undefined;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noIndex && <meta name="robots" content="noindex,nofollow" />}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:type" content={type} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      <meta property="og:site_name" content={SITE_NAME} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Canonical */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* JSON-LD */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
}

// Pre-built JSON-LD helpers
export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/anime?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function creativeWorkJsonLd({
  name,
  description,
  image,
  url,
  genre,
  rating,
  ratingCount,
}: {
  name: string;
  description?: string;
  image?: string;
  url: string;
  genre?: string[];
  rating?: number;
  ratingCount?: number;
}) {
  const ld: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name,
    url: `${SITE_URL}${url}`,
  };
  if (description) ld.description = description;
  if (image) ld.image = image;
  if (genre?.length) ld.genre = genre;
  if (rating) {
    ld.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: rating,
      bestRating: 100,
      ratingCount: ratingCount || 1,
    };
  }
  return ld;
}

export function itemListJsonLd(name: string, url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    url: `${SITE_URL}${url}`,
  };
}
