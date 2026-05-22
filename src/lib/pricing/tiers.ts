// Single source of truth for every price, percentage, and SLA used on
// the marketing surface. Do not hardcode these values anywhere else.

export const PRICING = {
  monthly: { amount: 8.99, currency: "USD", display: "$8.99" },
} as const;

export const REVENUE_SHARE = {
  publishers: 0.52,
  creatorsDefault: 0.67,
  creatorsStudio: 0.80,
} as const;

export const WEDGE = {
  languagesOnDay1: 60,
  takedownSLAHours: 24,
  industryAvgPublisherShare: 0.35,
} as const;

export type Tier = {
  id: "monthly" | "quarterly" | "annual";
  label: string;
  cadence: string;
  priceDisplay: string;
  tagline: string;
};

// Flat $8.99 across all cadences (no savings) — see memory:
// features/monetization/subscription-and-wishlist
export const TIERS: Tier[] = [
  {
    id: "monthly",
    label: "Monthly",
    cadence: "per month",
    priceDisplay: PRICING.monthly.display,
    tagline: "For binging a series.",
  },
  {
    id: "quarterly",
    label: "Quarterly",
    cadence: "per month, billed quarterly",
    priceDisplay: PRICING.monthly.display,
    tagline: "For tracking a season.",
  },
  {
    id: "annual",
    label: "Annual",
    cadence: "per month, billed annually",
    priceDisplay: PRICING.monthly.display,
    tagline: "For a year of reading.",
  },
];

export function formatPct(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function formatPrice(p: { display: string }): string {
  return p.display;
}
