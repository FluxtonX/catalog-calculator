// src/utils/constants.js
import { Youtube, Database } from "lucide-react";

/**
 * Platform configurations for search interface
 */
export const PLATFORM_CONFIG = {
  spotify: {
    label: "Spotify",
    icon: Database,
    placeholder: "Search artist on Spotify...",
    color: "from-emerald-500 via-green-500 to-teal-600",
    iconColor: "text-emerald-500",
    bgPattern:
      "radial-gradient(circle at 30% 50%, rgba(16, 185, 129, 0.2) 0%, transparent 50%)",
  },
  youtube: {
    label: "YouTube",
    icon: Youtube,
    placeholder: "Search channel or artist on YouTube...",
    color: "from-red-500 via-rose-500 to-pink-600",
    iconColor: "text-red-500",
    bgPattern:
      "radial-gradient(circle at 70% 50%, rgba(239, 68, 68, 0.2) 0%, transparent 50%)",
  },
};

/**
 * Regional payout rates for Spotify (per stream)
 */
export const RATE_BY_REGION = {
  US_CA_UK_AU: 0.0042,
  EU_WEST: 0.0036,
  LATAM: 0.0018,
  ASIA: 0.0022,
  ROW: 0.0016,
};

/**
 * Default Spotify payout rate (global average)
 */
export const DEFAULT_SPOTIFY_RATE = 0.0035;

/**
 * Suggested artists for quick search
 */
export const SUGGESTED_ARTISTS = [
  "Taylor Swift",
  "Drake",
  "The Weeknd",
  "Bad Bunny",
  "Ariana Grande",
];

/**
 * Decay factors based on months since release
 */
export const DECAY_FACTORS = {
  FRESH: { maxMonths: 3, factor: 1.0 },
  RECENT: { maxMonths: 12, factor: 0.85 },
  MATURE: { maxMonths: 36, factor: 0.65 },
  LEGACY: { maxMonths: Infinity, factor: 0.5 },
};

/**
 * Valuation multiples
 */
export const VALUATION_MULTIPLES = {
  CONSERVATIVE: 6,
  MARKET: 8,
  PREMIUM: 10,
};