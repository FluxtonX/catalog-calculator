// src/utils/constants.js
import { Youtube, Database, Music } from "lucide-react";

export const PLATFORM_CONFIG = {
  spotify: {
    label: "Spotify",
    icon: Database,
    placeholder: "Search artist on Spotify...",
    color: "from-emerald-500 via-green-500 to-teal-600",
    iconColor: "text-emerald-500",
    bgPattern: "radial-gradient(circle at 30% 50%, rgba(16, 185, 129, 0.2) 0%, transparent 50%)",
    tip: "Get official artist metrics, stream counts, and detailed analytics.",
    accentBg: "bg-emerald-500/20",
    accentBorder: "border-emerald-500/30",
    accentText: "text-emerald-300",
    checkedText: "data-[state=checked]:text-emerald-600 dark:data-[state=checked]:text-emerald-400",
    checkedBg: "data-[state=checked]:bg-emerald-50 dark:data-[state=checked]:bg-emerald-900/30",
    checkColor: "text-emerald-500",
    liveBadgeBg: "bg-emerald-500/10 border-emerald-500/20",
    liveDot: "bg-emerald-500",
    liveText: "text-emerald-600 dark:text-emerald-400",
    itemCheckedText: "text-emerald-600 dark:text-emerald-400",
    itemCheckedBg: "bg-emerald-50 dark:bg-emerald-900/30",
    iconBg: "bg-emerald-500/15",
  },
  youtube: {
    label: "YouTube",
    icon: Youtube,
    placeholder: "Search channel or artist on YouTube...",
    color: "from-red-500 via-rose-500 to-pink-600",
    iconColor: "text-red-500",
    bgPattern: "radial-gradient(circle at 70% 50%, rgba(239, 68, 68, 0.2) 0%, transparent 50%)",
    tip: "Discover channel statistics, subscriber counts, and video performance.",
    accentBg: "bg-red-500/20",
    accentBorder: "border-red-500/30",
    accentText: "text-red-300",
    checkedText: "data-[state=checked]:text-red-600 dark:data-[state=checked]:text-red-400",
    checkedBg: "data-[state=checked]:bg-red-50 dark:data-[state=checked]:bg-red-900/30",
    checkColor: "text-red-500",
    liveBadgeBg: "bg-red-500/10 border-red-500/20",
    liveDot: "bg-red-500",
    liveText: "text-red-600 dark:text-red-400",
    itemCheckedText: "text-red-600 dark:text-red-400",
    itemCheckedBg: "bg-red-50 dark:bg-red-900/30",
    iconBg: "bg-red-500/15",
  },
  itunes: {
    label: "Apple Music",
    icon: Music,
    placeholder: "Search artist on Apple Music...",
    // Apple logo black — slate-900 to zinc-800
    color: "from-slate-900 via-zinc-800 to-slate-900",
    iconColor: "text-slate-900 dark:text-white",
    bgPattern: "radial-gradient(circle at 50% 50%, rgba(15, 15, 15, 0.4) 0%, transparent 60%)",
    tip: "Get Apple Music track previews, album catalog, and popularity scores directly from Apple's catalog.",
    accentBg: "bg-slate-900/15 dark:bg-white/10",
    accentBorder: "border-slate-900/25 dark:border-white/20",
    accentText: "text-slate-200",
    checkedText: "data-[state=checked]:text-slate-900 dark:data-[state=checked]:text-white",
    checkedBg: "data-[state=checked]:bg-slate-100 dark:data-[state=checked]:bg-slate-700",
    checkColor: "text-slate-900 dark:text-white",
    liveBadgeBg: "bg-slate-900/8 border-slate-900/15 dark:bg-white/8 dark:border-white/15",
    liveDot: "bg-slate-900 dark:bg-white",
    liveText: "text-slate-900 dark:text-slate-200",
    itemCheckedText: "text-slate-900 dark:text-white",
    itemCheckedBg: "bg-slate-100 dark:bg-slate-700",
    iconBg: "bg-slate-900/10 dark:bg-white/10",
  },
};

export const RATE_BY_REGION = {
  US_CA_UK_AU: 0.0042,
  EU_WEST: 0.0036,
  LATAM: 0.0018,
  ASIA: 0.0022,
  ROW: 0.0016,
};

export const DEFAULT_SPOTIFY_RATE = 0.0035;
export const APPLE_MUSIC_RATE = 0.01;

export const SUGGESTED_ARTISTS = [
  "Taylor Swift",
  "Drake",
  "The Weeknd",
  "Bad Bunny",
  "Ariana Grande",
];

export const DECAY_FACTORS = {
  FRESH: { maxMonths: 3, factor: 1.0 },
  RECENT: { maxMonths: 12, factor: 0.85 },
  MATURE: { maxMonths: 36, factor: 0.65 },
  LEGACY: { maxMonths: Infinity, factor: 0.5 },
};

export const VALUATION_MULTIPLES = {
  CONSERVATIVE: 6,
  MARKET: 8,
  PREMIUM: 10,
};