import React, { useState, useEffect, useRef } from "react";
import * as Select from "@radix-ui/react-select";
import {
  Search,
  Youtube,
  Database,
  ChevronDown,
  X,
  Sparkles,
  Check,
  AlertTriangle,
  Loader2,
  Info,
  Music,
  Zap,
  TrendingUp,
} from "lucide-react";

import ArtistCard from "../components/ui/ArtistCard";
import { usePageTitle } from "../hooks/usePageTitle";
import {
  searchYouTube,
  searchApify,
  getArtistSuggestions,
  getYouTubeChannelDetails,
  searchAppleMusic,
  searchItunes,
} from "../utils/api";
import { useArtistStore } from "../store/artistStore";
import ChannelSelector from "../components/youtube/ChannelSelector";
const SpotifyIcon = ({ size = 24, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
  </svg>
);

const PLATFORM_CONFIG = {
  spotify: {
    label: "Spotify",
    icon: SpotifyIcon,
    placeholder: "Search artist on Spotify...",
    color: "from-emerald-500 via-green-500 to-teal-600",
    bgPattern:
      "radial-gradient(circle at 30% 50%, rgba(16, 185, 129, 0.25) 0%, transparent 60%)",
    tip: "Get official artist metrics, stream counts, and financial detailed analytics.",
    itemCheckedText: "text-emerald-600 dark:text-emerald-400",
    itemCheckedBg: "bg-emerald-50 dark:bg-emerald-900/30",
    checkColor: "text-emerald-500",
    iconBg: "bg-emerald-500/15",
    iconColor: "text-emerald-500",
    liveBadgeBg: "bg-emerald-500/10 border-emerald-500/20",
    liveDot: "bg-emerald-500",
    liveText: "text-emerald-600 dark:text-emerald-400",
  },
  youtube: {
    label: "YouTube",
    icon: Youtube,
    placeholder: "Search channel or artist on YouTube...",
    color: "from-red-500 via-rose-500 to-pink-600",
    bgPattern:
      "radial-gradient(circle at 70% 50%, rgba(239, 68, 68, 0.25) 0%, transparent 60%)",
    tip: "Discover channel statistics, subscriber counts, and video performance.",
    itemCheckedText: "text-red-600 dark:text-red-400",
    itemCheckedBg: "bg-red-50 dark:bg-red-900/30",
    checkColor: "text-red-500",
    iconBg: "bg-red-500/15",
    iconColor: "text-red-500",
    liveBadgeBg: "bg-red-500/10 border-red-500/20",
    liveDot: "bg-red-500",
    liveText: "text-red-600 dark:text-red-400",
  },
  itunes: {
    label: "Apple Music",
    icon: Music,
    placeholder: "Search artist on Apple Music...",
    // Apple black
    color: "from-slate-900 via-zinc-800 to-slate-900",
    bgPattern:
      "radial-gradient(circle at 50% 50%, rgba(15, 15, 15, 0.4) 0%, transparent 60%)",
    tip: "Get Apple Music track previews, Royalty analytics, and popularity scores from Apple's catalog.",
    itemCheckedText: "text-slate-900 dark:text-white",
    itemCheckedBg: "bg-slate-100 dark:bg-slate-700",
    checkColor: "text-slate-900 dark:text-white",
    iconBg: "bg-slate-900/10 dark:bg-white/10",
    iconColor: "text-slate-900 dark:text-white",
    liveBadgeBg:
      "bg-slate-900/8 border-slate-900/15 dark:bg-white/10 dark:border-white/20",
    liveDot: "bg-slate-900 dark:bg-white",
    liveText: "text-slate-900 dark:text-slate-200",
  },
};
// Add this object near PLATFORM_CONFIG
const PLATFORM_TITLES = {
  spotify: "Spotify  Artist Catalog Valuation Tool",
  youtube: "YouTube Channel Artist Catalog Valuation Tool",
  itunes: "Apple Music Artist Catalog Valuation Tool",
};

const PLATFORM_DESCRIPTIONS = {
  spotify:
    "Real-time valuation, stream analytics, and listener insights powered by Spotify data",
  youtube:
    "Subscriber analytics, view counts, and channel performance powered by YouTube data",
  itunes:
    "Track catalog, popularity scores, and royalty insights powered by Apple Music data",
};

const SUGGESTED_ARTISTS = [
  "Taylor Swift",
  "Drake",
  "The Weeknd",
  "Bad Bunny",
  "Ariana Grande",
  "KCee",
];

const PLATFORM_FEATURES = {
  spotify: [
    "Stream Counts",
    "Monthly Listeners",
    "Top Cities",
    "Related Artists",
  ],
  youtube: [
    "Subscriber Count",
    "Total Views",
    "Video Stats",
    "Channel Analytics",
  ],
  itunes: [
    "30s Previews",
    "Album Catalog",
    "Popularity Score",
    "Apple Music Links",
  ],
};

// ── Platform-aware Radix Select ───────────────────────────
const PlatformSelect = ({ platform, setPlatform, isLoading }) => {
  const cfg = PLATFORM_CONFIG[platform];
  const Icon = cfg.icon;
  return (
    <Select.Root
      value={platform}
      onValueChange={setPlatform}
      disabled={isLoading}
    >
      <Select.Trigger
        className="flex items-center justify-between gap-3 w-full lg:w-56
          px-4 py-3.5 bg-white/15 hover:bg-white/22
          backdrop-blur-xl border border-white/30 hover:border-white/55
          rounded-xl text-white font-bold text-sm
          focus:outline-none focus:ring-2 focus:ring-white/50
          transition-all duration-200 shadow-lg
          disabled:opacity-50 disabled:cursor-not-allowed group"
        aria-label="Platform"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1 bg-white/15 rounded-lg">
            <Icon size={15} className="text-white" />
          </div>
          <Select.Value />
        </div>
        <Select.Icon>
          <ChevronDown
            size={15}
            className="opacity-70 group-data-[state=open]:rotate-180 transition-transform duration-200"
          />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-[999] min-w-[220px]"
          position="popper"
          sideOffset={8}
        >
          <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-700">
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Select Platform
            </p>
          </div>
          <Select.Viewport className="p-2">
            {Object.entries(PLATFORM_CONFIG).map(([key, config]) => {
              const PIcon = config.icon;
              const isSelected = platform === key;
              return (
                <Select.Item
                  key={key}
                  value={key}
                  className="flex items-center justify-between gap-3 px-3 py-3 rounded-xl text-sm font-semibold cursor-pointer outline-none text-slate-700 dark:text-slate-200 transition-all duration-150 mb-0.5 last:mb-0 data-[highlighted]:bg-slate-100 dark:data-[highlighted]:bg-slate-700/70"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-1.5 rounded-lg ${isSelected ? config.iconBg : "bg-slate-100 dark:bg-slate-700"} transition-colors`}
                    >
                      <PIcon
                        size={15}
                        className={
                          isSelected
                            ? config.iconColor
                            : "text-slate-500 dark:text-slate-400"
                        }
                      />
                    </div>
                    <div>
                      <Select.ItemText>{config.label}</Select.ItemText>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-normal mt-0.5">
                        {key === "spotify"
                          ? "via Apify scraper"
                          : key === "youtube"
                            ? "via YouTube API"
                            : "via iTunes API"}
                      </p>
                    </div>
                  </div>
                  <Select.ItemIndicator>
                    <div className={`p-1 rounded-full ${config.iconBg}`}>
                      <Check size={11} className={config.checkColor} />
                    </div>
                  </Select.ItemIndicator>
                </Select.Item>
              );
            })}
          </Select.Viewport>
          <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <p className="text-[10px] text-slate-400 dark:text-slate-500">
              Switch platforms to compare analytics
            </p>
          </div>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
};

const FeaturePill = ({ label }) => (
  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/15 border border-white/20 rounded-full text-[10px] sm:text-xs font-semibold text-white/90">
    <Zap size={9} className="text-white/70" />
    {label}
  </span>
);



const ValuationTool = () => {
  const {
    searchQuery,
    setSearchQuery,
    selectedArtist,
    setSelectedArtist,
    platform,
    setPlatform,
  } = useArtistStore();

  const cfg = PLATFORM_CONFIG[platform];        // ← define cfg FIRST
  const SelectedIcon = cfg.icon;
  const features = PLATFORM_FEATURES[platform];

  usePageTitle(                                  // ← THEN use it here
    `${cfg.label} Artist Catalog Valuation Tool`,
    `Analyze ${cfg.label} artist metrics with real-time data`
  );

  const isInitialMount = useRef(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showSuggestionsDropdown, setShowSuggestionsDropdown] = useState(false);
  const [youtubeChannels, setYoutubeChannels] = useState([]);
  const [showChannelSelector, setShowChannelSelector] = useState(false);
  const [shouldShowSuggestions, setShouldShowSuggestions] = useState(true);

  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("recentSearches") || "[]");
    } catch {
      return [];
    }
  });

  const saveRecentSearch = (artist) => {
    const updated = [
      artist,
      ...recentSearches.filter((a) => a !== artist),
    ].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };
  const inputRef = useRef(null);



  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (
      searchQuery.trim() &&
      selectedArtist &&
      selectedArtist.platform !== platform
    )
      handleSearch();
  }, [platform]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!shouldShowSuggestions) return;
      if (!searchQuery.trim()) {
        setSuggestions([]);
        setShowSuggestionsDropdown(false);
        return;
      }
      setIsLoadingSuggestions(true);
      setShowSuggestionsDropdown(true);
      try {
        let results = SUGGESTED_ARTISTS.filter((a) =>
          a.toLowerCase().includes(searchQuery.toLowerCase()),
        );
        if (searchQuery.length > 3) {
          try {
            const apiResults = await getArtistSuggestions(
              searchQuery,
              platform,
            );
            results = [
              ...new Set([...results, ...apiResults.map((r) => r.name)]),
            ];
          } catch {}
        }
        if (results.length === 0 && searchQuery.length > 1)
          results = [searchQuery];
        setSuggestions(results);
      } catch {
        setSuggestions([]);
      } finally {
        setIsLoadingSuggestions(false);
      }
    };
    const timer = setTimeout(
      fetchSuggestions,
      searchQuery.length < 3 ? 150 : 350,
    );
    return () => clearTimeout(timer);
  }, [searchQuery, platform, shouldShowSuggestions]);

  const doSearch = async (query) => {
    switch (platform) {
      case "spotify":
        return await searchApify(query);
      case "youtube": {
        const result = await searchYouTube(query);
        if (result.type === "channel_list")
          return { type: "channel_list", channels: result.channels };
        return result;
      }
      case "itunes":
        try {
          return await searchAppleMusic(query);
        } catch {
          return await searchItunes(query);
        }
      default:
        throw new Error("Invalid platform selected");
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError("Please enter a search query");
      return;
    }
    setIsLoading(true);
    setError(null);
    setSelectedArtist(null);
    setShowSuggestionsDropdown(false);
    setShowChannelSelector(false);
    setYoutubeChannels([]);
    try {
      const result = await doSearch(searchQuery);
      if (result?.type === "channel_list") {
        setYoutubeChannels(result.channels);
        setShowChannelSelector(true);
        setIsLoading(false);
        return;
      }
      if (!result?.name) throw new Error("Invalid response from API");
      setSelectedArtist(result);
      setError(null);
      saveRecentSearch(searchQuery); // ← added here
    } catch (err) {
      setError(err.message || `Failed to fetch data from ${cfg.label}`);
      setSelectedArtist(null);
    } finally {
      setIsLoading(false);
    }
  };
  const handleSuggestionClick = async (artist) => {
    setSearchQuery(artist);
    setShowSuggestionsDropdown(false);
    setShouldShowSuggestions(false);
    setError(null);

    setIsLoading(true);
    setSelectedArtist(null);
    setShowChannelSelector(false);
    setYoutubeChannels([]);
    try {
      const result = await doSearch(artist);
      if (result?.type === "channel_list") {
        setYoutubeChannels(result.channels);
        setShowChannelSelector(true);
        setIsLoading(false);
        return;
      }
      if (!result?.name) throw new Error("Invalid response from API");
      setSelectedArtist(result);
      setError(null);
      saveRecentSearch(artist);
    } catch (err) {
      setError(err.message || `Failed to fetch data from ${cfg.label}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChannelSelect = async (channel) => {
    setIsLoading(true);
    setError(null);
    setShowChannelSelector(false);
    try {
      const result = await getYouTubeChannelDetails(searchQuery, channel.id);
      if (!result?.name) throw new Error("Invalid response from API");
      setSelectedArtist(result);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to fetch channel details");
      setSelectedArtist(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-4 sm:py-8 px-3 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* ── Page Header ───────────────────────────────── */}
        <div className="text-center space-y-3 sm:space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 dark:from-emerald-500/20 dark:to-blue-500/20 rounded-full border border-emerald-500/20 dark:border-emerald-500/30 shadow-sm">
            <Sparkles
              size={15}
              className="text-emerald-600 dark:text-emerald-400"
            />
            <span className="text-xs sm:text-sm font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wide">
              {cfg.label} · Real-Time Analytics
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-white dark:via-slate-100 dark:to-white bg-clip-text text-transparent tracking-tight transition-all duration-300">
            {PLATFORM_TITLES[platform]}
          </h1>
          <p className="text-sm sm:text-lg text-slate-500 dark:text-slate-400 max-w-xl mx-auto transition-all duration-300">
            {PLATFORM_DESCRIPTIONS[platform]}
          </p>

          {/* Platform switcher pills */}
          <div className="flex items-center justify-center gap-2 flex-wrap pt-1">
            {Object.entries(PLATFORM_CONFIG).map(([key, config]) => {
              const PIcon = config.icon;
              const isActive = platform === key;
              return (
                <button
                  key={key}
                  onClick={() => setPlatform(key)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 border ${
                    isActive
                      ? `bg-gradient-to-r ${config.color} text-white border-transparent shadow-lg scale-105`
                      : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                  }`}
                >
                  <PIcon size={12} />
                  {config.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Search Card ────────────────────────────────── */}
        <div
          className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${cfg.color} shadow-2xl transition-all duration-500`}
        >
          <div
            className="absolute inset-0 opacity-30"
            style={{ background: cfg.bgPattern }}
          />
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage:
                "radial-gradient(circle, white 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />

          <div className="relative z-10 p-5 sm:p-7 lg:p-10">
            <div className="flex items-start sm:items-center gap-3 sm:gap-4 mb-5 sm:mb-6">
             
                <SelectedIcon size={24} className="sm:w-7 sm:h-7 text-white" />
          
              <div className="flex-1 min-w-0">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
                  Search Artist
                </h2>
                <p className="text-white/70 text-xs sm:text-sm mt-0.5">
                  Discover analytics from{" "}
                  <span className="font-bold text-white">{cfg.label}</span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-5">
              {features.map((f) => (
                <FeaturePill key={f} label={f} />
              ))}
            </div>

            <div className="flex gap-2 sm:gap-3 flex-col lg:flex-row">
              <PlatformSelect
                platform={platform}
                setPlatform={setPlatform}
                isLoading={isLoading}
              />

              <div className="flex-1 relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                  <Search size={18} className="text-white/70" />
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShouldShowSuggestions(true);
                  }}
                  onKeyDown={(e) =>
                    e.key === "Enter" && !isLoading && handleSearch()
                  }
                  onFocus={() => {
                    if (searchQuery.trim() && suggestions.length > 0)
                      setShowSuggestionsDropdown(true);
                  }}
                  placeholder={cfg.placeholder}
                  disabled={isLoading}
                  autoComplete="off"
                  className="w-full pl-11 pr-10 py-3.5 bg-white/15 hover:bg-white/20 backdrop-blur-xl border border-white/30 hover:border-white/50 rounded-xl text-white placeholder-white/55 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-white/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSuggestions([]);
                      setShowSuggestionsDropdown(false);
                      inputRef.current?.focus();
                    }}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/15 transition-all"
                  >
                    <X size={15} />
                  </button>
                )}

                {showSuggestionsDropdown && suggestions.length > 0 && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setShowSuggestionsDropdown(false)}
                    />
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-40 max-h-64 overflow-y-auto">
                      <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          Suggestions
                        </p>
                      </div>
                      {isLoadingSuggestions ? (
                        <div className="flex items-center justify-center gap-2 px-5 py-4 text-slate-500 dark:text-slate-400">
                          <Loader2 size={16} className="animate-spin" />
                          <span className="text-sm">Loading…</span>
                        </div>
                      ) : (
                        suggestions.map((suggestion, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="w-full px-4 py-3 text-left flex items-center gap-3 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/70 border-b border-slate-100 dark:border-slate-700 last:border-0 transition-colors group"
                          >
                            <div
                              className={`p-1.5 rounded-lg ${cfg.iconBg || "bg-slate-100 dark:bg-slate-700"} flex-shrink-0`}
                            >
                              <Search
                                size={12}
                                className={cfg.iconColor || "text-slate-500"}
                              />
                            </div>
                            <span className="text-sm font-semibold group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                              {suggestion}
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={handleSearch}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 bg-white/25 hover:bg-white/35 active:bg-white/40 border border-white/40 hover:border-white/60 rounded-xl text-white text-sm sm:text-base font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl backdrop-blur-xl whitespace-nowrap hover:scale-[1.02] active:scale-[0.98]"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={17} className="animate-spin" /> Searching…
                  </>
                ) : (
                  <>
                    <SelectedIcon size={17} /> Search
                  </>
                )}
              </button>
            </div>

            {error && (
              <div className="mt-4 flex items-start gap-3 p-4 bg-red-500/20 border border-red-300/40 rounded-xl backdrop-blur-xl">
                <AlertTriangle
                  size={18}
                  className="text-red-200 flex-shrink-0 mt-0.5"
                />
                <div>
                  <p className="text-white text-sm font-semibold">{error}</p>
                  {platform === "youtube" && error.includes("quota") && (
                    <p className="text-white/70 text-xs mt-1">
                      YouTube API has daily quotas. Try again tomorrow or switch
                      to Spotify.
                    </p>
                  )}
                </div>
              </div>
            )}

            {isLoading && (
              <div className="mt-4 flex items-center gap-3 p-4 bg-white/15 border border-white/25 rounded-xl backdrop-blur-xl">
                <div className="relative flex-shrink-0">
                  <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                  <div
                    className="absolute inset-0 w-8 h-8 rounded-full border-2 border-white/10 border-b-white/60 animate-spin"
                    style={{
                      animationDuration: "1.5s",
                      animationDirection: "reverse",
                    }}
                  />
                </div>
                <div>
                  <p className="text-white text-sm font-bold">
                    Crunching the numbers…
                  </p>
                  <p className="text-white/60 text-xs mt-0.5">
                    Fetching live data from {cfg.label}
                  </p>
                </div>
              </div>
            )}

            {!isLoading && !error && (
              <div className="mt-4 flex items-start gap-2.5 p-3.5 bg-white/10 border border-white/15 rounded-xl backdrop-blur-xl">
                <Info
                  size={14}
                  className="text-white/60 flex-shrink-0 mt-0.5"
                />
                <p className="text-white/85 text-xs sm:text-sm">
                  <strong className="font-bold">{cfg.label}:</strong> {cfg.tip}
                </p>
              </div>
            )}

            <div className="mt-5 sm:mt-7">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-white/60 uppercase tracking-widest">
                  {recentSearches.length > 0
                    ? "🕐 Recent Searches:"
                    : "🔥 Most Popular Searches:"}
                </p>
                {recentSearches.length > 0 && (
                  <button
                    onClick={() => {
                      setRecentSearches([]);
                      localStorage.removeItem("recentSearches");
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/35 rounded-full text-[10px] font-bold text-white/60 hover:text-white transition-all duration-200"
                  >
                    <X size={10} />
                    Clear
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {(recentSearches.length > 0
                  ? recentSearches
                  : SUGGESTED_ARTISTS
                ).map((artist) => (
                  <button
                    key={artist}
                    onClick={() => handleSuggestionClick(artist)}
                    disabled={isLoading}
                    className="px-3.5 py-2 sm:px-4 sm:py-2.5 bg-white/15 hover:bg-white/25 active:bg-white/30 border border-white/25 hover:border-white/45 rounded-full text-xs sm:text-sm font-semibold text-white transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg backdrop-blur-xl"
                  >
                    {artist}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Loading skeleton */}
        {isLoading && (
          <div className="space-y-4 animate-pulse">
            <div className="h-52 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 rounded-3xl" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-28 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 rounded-2xl"
                />
              ))}
            </div>
            <div className="h-72 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 rounded-3xl" />
          </div>
        )}

        {/* Channel Selector */}
        {!isLoading && showChannelSelector && youtubeChannels.length > 0 && (
          <ChannelSelector
            channels={youtubeChannels}
            onSelectChannel={handleChannelSelect}
            isLoading={isLoading}
          />
        )}

        {/* Artist Analysis */}
        {!isLoading && selectedArtist && (
          <div className="space-y-5 sm:space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2.5 sm:p-3 bg-gradient-to-br ${cfg.color} rounded-xl shadow-lg ring-1 ring-white/20`}
                >
                  <SelectedIcon size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    Live {cfg.label} Analysis
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Real-time data · {selectedArtist.name}
                  </p>
                </div>
              </div>
              <div
                className={`flex items-center gap-2 px-3 py-1.5 ${cfg.liveBadgeBg} border rounded-full`}
              >
                <span
                  className={`w-2 h-2 rounded-full animate-pulse ${cfg.liveDot}`}
                />
                <span
                  className={`text-xs font-bold uppercase tracking-wide ${cfg.liveText}`}
                >
                  Live
                </span>
              </div>
            </div>
            <ArtistCard
              name={selectedArtist.name}
              image={selectedArtist.image}
              followers={selectedArtist.followers}
              popularity={selectedArtist.popularity}
              genres={selectedArtist.genres}
              topTracks={selectedArtist.topTracks}
              relatedArtists={selectedArtist.relatedArtists}
              albums={selectedArtist.albums}
              singles={selectedArtist.singles}
              popularReleases={selectedArtist.popularReleases}
              stats={selectedArtist.stats}
              spotifyUrl={selectedArtist.spotifyUrl}
              youtubeUrl={selectedArtist.youtubeUrl}
              appleUrl={selectedArtist.appleUrl}
              platform={selectedArtist.platform}
              monthlyListeners={selectedArtist.monthlyListeners}
              biography={selectedArtist.biography}
              topCities={selectedArtist.topCities}
              externalLinks={selectedArtist.externalLinks}
            />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !selectedArtist && !error && (
          <div className="text-center py-14 sm:py-20 bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200 dark:border-slate-800 shadow-xl">
            <div className="flex flex-col items-center gap-5 sm:gap-6 max-w-lg mx-auto px-4">
              <div className="relative">
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${cfg.color} rounded-full blur-2xl opacity-20 animate-pulse`}
                />
                <div
                  className={`relative p-5 sm:p-6 bg-gradient-to-br ${cfg.color} rounded-full`}
                >
                  <SelectedIcon
                    size={44}
                    className="sm:w-14 sm:h-14 text-white"
                  />
                </div>
              </div>
              <div>
                <h3 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white mb-2 sm:mb-3">
                  Ready to Discover?
                </h3>
                <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mb-5 sm:mb-6">
                  Search any artist on{" "}
                  <strong className="text-slate-700 dark:text-slate-200">
                    {cfg.label}
                  </strong>{" "}
                  to see their Royalty Revenue
                </p>
                <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6">
                  {Object.entries(PLATFORM_CONFIG).map(([key, config]) => {
                    const PIcon = config.icon;
                    const isActive = platform === key;
                    return (
                      <button
                        key={key}
                        onClick={() => setPlatform(key)}
                        className={`flex flex-col items-center gap-1.5 p-3 sm:p-4 rounded-2xl border-2 transition-all duration-200 ${
                          isActive
                            ? `bg-gradient-to-br ${config.color} border-transparent text-white shadow-lg`
                            : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600"
                        }`}
                      >
                        <PIcon
                          size={20}
                          className={isActive ? "text-white" : ""}
                        />
                        <span className="text-xs font-bold">
                          {config.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className="space-y-2 text-sm text-slate-400 dark:text-slate-500">
                  <p className="flex items-center justify-center gap-2">
                    <TrendingUp size={14} />
                    Click a suggested artist above for instant results
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ValuationTool;
