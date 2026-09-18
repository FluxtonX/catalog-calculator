export const PLATFORM_THEME = {
  spotify: {
    gradient: "from-[#1DB954] to-[#1DB954]",
    gradientSoft: "from-[#1DB954]/10 to-[#1DB954]/10",
    accentBg: "bg-[#1DB954]/10 dark:bg-[#1DB954]/30",
    accentText: "text-[#1DB954] dark:text-[#1DB954]",
    accentDot: "bg-[#1DB954]",
    border: "border-[#1DB954]/30",
    hoverBorder: "hover:border-[#1DB954]/40",
    glow: "shadow-[#1DB954]/30",
  },
  youtube: {
    gradient: "from-[#FF0000] to-[#FF0000]",
    gradientSoft: "from-[#FF0000]/10 to-[#FF0000]/10",
    accentBg: "bg-[#FF0000]/10 dark:bg-[#FF0000]/30",
    accentText: "text-[#FF0000] dark:text-[#FF0000]",
    accentDot: "bg-[#FF0000]",
    border: "border-[#FF0000]/30",
    hoverBorder: "hover:border-[#FF0000]/40",
    glow: "shadow-[#FF0000]/30",
  },
  itunes: {
    gradient: "from-slate-700 to-slate-900",
    gradientSoft: "from-slate-700/10 to-slate-900/10",
    accentBg: "bg-slate-200 dark:bg-slate-700/60",
    accentText: "text-slate-700 dark:text-slate-200",
    accentDot: "bg-slate-700 dark:bg-slate-200",
    border: "border-slate-500/30",
    hoverBorder: "hover:border-slate-500/40",
    glow: "shadow-slate-500/30",
  },
};

export const getPlatformTheme = (platform) =>
  PLATFORM_THEME[platform] || PLATFORM_THEME.spotify;
