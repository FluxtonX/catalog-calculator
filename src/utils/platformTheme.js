export const PLATFORM_THEME = {
  spotify: {
    gradient: "from-emerald-500 to-teal-600",
    gradientSoft: "from-emerald-500/10 to-teal-600/10",
    accentBg: "bg-emerald-100 dark:bg-emerald-900/30",
    accentText: "text-emerald-600 dark:text-emerald-400",
    accentDot: "bg-emerald-500",
    border: "border-emerald-500/30",
    hoverBorder: "hover:border-emerald-500/40",
    glow: "shadow-emerald-500/30",
  },
  youtube: {
    gradient: "from-red-500 to-rose-600",
    gradientSoft: "from-red-500/10 to-rose-600/10",
    accentBg: "bg-red-100 dark:bg-red-900/30",
    accentText: "text-red-600 dark:text-red-400",
    accentDot: "bg-red-500",
    border: "border-red-500/30",
    hoverBorder: "hover:border-red-500/40",
    glow: "shadow-red-500/30",
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
