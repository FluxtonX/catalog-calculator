import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
import { supabase } from "../utils/supabase";
import { useArtistStore } from "../store/artistStore";
import ChannelSelector from "../components/youtube/ChannelSelector";
import { getCombinedMetrics, formatCurrency, formatNumberAbbrev } from "../utils/combinedValuation";
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

const YouTubeIcon = ({ size = 24, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
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
    icon: YouTubeIcon,
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
  youtube: "YouTube Artist Catalog Valuation Tool",
  itunes: "Apple Music Artist Catalog Valuation Tool",
};

const PLATFORM_DESCRIPTIONS = {
  spotify:
    "Real-time valuation, stream analytics, and listener insights powered by Spotify data",
  youtube:
    "Analytics, view counts, and channel performance powered by YouTube data",
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
const PlatformSelect = ({ platforms, setPlatforms, platform, setPlatform, isLoading }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const togglePlatform = (key) => {
    const currentPlatforms = useArtistStore.getState().platforms || [];
    const currentPlatform = useArtistStore.getState().platform;
    if (currentPlatforms.includes(key)) {
      if (currentPlatforms.length > 1) {
        const newPlatforms = currentPlatforms.filter((p) => p !== key);
        setPlatforms(newPlatforms);
        if (currentPlatform === key) setPlatform(newPlatforms[0]);
      }
    } else {
      setPlatforms([...currentPlatforms, key]);
    }
  };

  return (
    <div className="relative w-full lg:w-56" ref={dropdownRef}>
      <button
        onClick={() => !isLoading && setIsOpen(!isOpen)}
        disabled={isLoading}
        className="flex items-center justify-between gap-3 w-full
          px-4 py-3.5 bg-white/15 hover:bg-white/22
          backdrop-blur-xl border border-white/30 hover:border-white/55
          rounded-xl text-white font-bold text-sm
          focus:outline-none focus:ring-2 focus:ring-white/50
          transition-all duration-200 shadow-lg
          disabled:opacity-50 disabled:cursor-not-allowed group"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1 bg-white/15 rounded-lg">
             <Database size={15} className="text-white" />
          </div>
          <span>{platforms.length} Platforms</span>
        </div>
        <ChevronDown
          size={15}
          className={`opacity-70 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-[999] min-w-[220px]">
          <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-700">
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Select Platforms
            </p>
          </div>
          <div className="p-3 pb-4 flex flex-col gap-1.5">
            {Object.entries(PLATFORM_CONFIG).map(([key, config]) => {
              const PIcon = config.icon;
              const isSelected = platforms.includes(key);
              return (
                <button
                  key={key}
                  onClick={() => togglePlatform(key)}
                  className={`flex items-center justify-between gap-3 px-3 py-3 rounded-xl text-sm font-semibold cursor-pointer outline-none transition-all duration-150 ${isSelected ? "bg-slate-100 dark:bg-slate-700/70 text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50"}`}
                >
                  <div className="flex items-center gap-3 text-left">
                    <div
                      className={`flex items-center justify-center w-5 h-5 rounded-md border ${isSelected ? "bg-emerald-500 border-emerald-500" : "border-slate-300 dark:border-slate-600 bg-transparent"}`}
                    >
                      {isSelected && <Check size={14} className="text-white" />}
                    </div>
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
                      <p>{config.label}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const FeaturePill = ({ label }) => (
  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/15 border border-white/20 rounded-full text-[10px] sm:text-xs font-semibold text-white/90">
    <Zap size={9} className="text-white/70" />
    {label}
  </span>
);

const ValuationTool = () => {
  usePageTitle("Valuation Tool | FluxtonX");
  const navigate = useNavigate();
  const {
    searchQuery,
    setSearchQuery,
    selectedArtist,
    setSelectedArtist,
    selectedArtists,
    setSelectedArtists,
    platform,
    setPlatform,
    platforms,
    setPlatforms,
    importedData,
    selectedDistributor,
    clearImportedData,
  } = useArtistStore();

  const cfg = PLATFORM_CONFIG[platform]; // ← define cfg FIRST
  const SelectedIcon = cfg.icon;
  const features = PLATFORM_FEATURES[platform];

  usePageTitle(
    // ← THEN use it here
    `${cfg.label} Artist Catalog Valuation Tool`,
    `Analyze ${cfg.label} artist metrics with real-time data`,
  );

  const isInitialMount = useRef(true);
  const isPlatformUserChange = useRef(false); // tracks if platforms was changed by user in THIS session
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

      // Case 1: came from Landing Page — selectedArtists already populated, skip re-fetch
      if (Object.keys(selectedArtists).length > 0) {
        return; // Data is already there, just render it
      }

      // Case 2: came from Data Import — importedData set, trigger auto-search
      if (importedData && searchQuery.trim()) {
        handleSearch();
      }
      return;
    }

    if (searchQuery.trim() && Object.keys(selectedArtists).length > 0) {
      // Only re-fetch if the user explicitly toggled a platform inside the Valuation Tool.
      // If the data was pre-loaded from the Landing Page, isPlatformUserChange is false,
      // so we skip the re-fetch to avoid a second API call with potentially different results.
      if (!isPlatformUserChange.current) {
        isPlatformUserChange.current = true; // After the first skip, allow future user-changes
        return;
      }

      // Remove data for platforms that are no longer selected
      const currentKeys = Object.keys(selectedArtists);
      const hasRemoved = currentKeys.some(k => !platforms.includes(k));
      
      if (hasRemoved) {
        const newSelectedArtists = { ...selectedArtists };
        currentKeys.forEach(k => {
          if (!platforms.includes(k)) {
            delete newSelectedArtists[k];
          }
        });
        setSelectedArtists(newSelectedArtists);
      }
      
      // Fetch data for newly selected platforms that don't have data yet
      if (platforms.some(p => !selectedArtists[p])) {
        handleSearch();
      }
    }
  }, [platforms]);

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
          } catch { }
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



  const doSearchForPlatform = async (query, plt) => {
    switch (plt) {
      case "spotify":
        return await searchApify(query);
      case "youtube": {
        const result = await searchYouTube(query);
        if (result.type === "channel_list")
          return { type: "channel_list", channels: result.channels, platform: plt };
        return { ...result, platform: plt };
      }
      case "itunes":
        try {
          const res = await searchAppleMusic(query);
          return { ...res, platform: plt };
        } catch {
          const res = await searchItunes(query);
          return { ...res, platform: plt };
        }
      default:
        throw new Error("Invalid platform selected");
    }
  };

  useEffect(() => {
    // Only auto-trigger if we have imported data and no artists selected yet
    if (importedData && searchQuery.trim() && Object.keys(selectedArtists).length === 0 && !isLoading && !error) {
      handleSearch();
    }
  }, [importedData, searchQuery, isLoading, error]); // Re-run if searchQuery updates after mount

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      setShouldShowSuggestions(false);
      handleSearch();
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError("Please enter a search query");
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    const isGuest = !session;

    setIsLoading(true);
    setError(null);
    setSelectedArtist(null);
    setSelectedArtists({});
    // If user is doing a manual fresh search (not an auto-redirect from DataImport),
    // clear any stale custom distributor data so it doesn't pollute the results.
    clearImportedData();
    setShowSuggestionsDropdown(false);
    setShowChannelSelector(false);
    setYoutubeChannels([]);
    let hasChannelList = false;
    try {
      const results = await Promise.allSettled(
        platforms.map(p => doSearchForPlatform(searchQuery, p))
      );
      
      const newSelectedArtists = {};
      let youtubeChannelsData = [];
      
      results.forEach((res, i) => {
        const p = platforms[i];
        if (res.status === 'fulfilled') {
          const data = res.value;
          if (data?.type === "channel_list") {
            youtubeChannelsData = data.channels;
            hasChannelList = true;
          } else if (data?.name) {
            newSelectedArtists[p] = { ...data, platform: p };
          }
        }
      });
      
      if (hasChannelList && youtubeChannelsData.length > 0) {
        setYoutubeChannels(youtubeChannelsData);
        // Automatically fetch the top/official channel (first in list) to instantly populate combined metrics
        try {
          const bestChannel = youtubeChannelsData[0];
          const details = await getYouTubeChannelDetails(searchQuery, bestChannel.id);
          newSelectedArtists["youtube"] = { ...details, platform: "youtube" };
        } catch (err) {
          console.error("Auto-fetch for top YouTube channel failed:", err);
        }
        setShowChannelSelector(true);
      }
      
      if (Object.keys(newSelectedArtists).length === 0 && !hasChannelList && !importedData) {
        const rejected = results.find(res => res.status === 'rejected');
        if (rejected) throw rejected.reason;
        throw new Error("Failed to fetch data from selected platforms");
      }

      if (importedData) {
        newSelectedArtists["custom"] = {
          name: searchQuery,
          platform: "custom",
          importedDistributor: selectedDistributor,
          stats: {
            totalRevenue: parseFloat(importedData.totalRevenue || 0),
            totalStreams: parseInt(importedData.totalStreams || 0, 10),
            totalTracks: parseInt(importedData.totalTracks || 0, 10)
          }
        };
      }

      setSelectedArtists(newSelectedArtists);
      if (platforms.length === 1) setSelectedArtist(newSelectedArtists[platforms[0]]);
      
      setError(null);
      saveRecentSearch(searchQuery);

    } catch (err) {
      setError(err.message || "Search failed");
      setSelectedArtist(null);
      setSelectedArtists({});
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = async (artist) => {
    setSearchQuery(artist);
    setShowSuggestionsDropdown(false);
    setShouldShowSuggestions(false);
    setError(null);

    const { data: { session } } = await supabase.auth.getSession();
    const isGuest = !session;

    setIsLoading(true);
    setSelectedArtist(null);
    setSelectedArtists({});
    setShowChannelSelector(false);
    setYoutubeChannels([]);
    let hasChannelList = false;
    try {
      const results = await Promise.allSettled(
        platforms.map(p => doSearchForPlatform(artist, p))
      );
      
      const newSelectedArtists = {};
      
      results.forEach((res, i) => {
        const p = platforms[i];
        if (res.status === 'fulfilled') {
          const data = res.value;
          if (data?.type === "channel_list") {
            setYoutubeChannels(data.channels);
            hasChannelList = true;
          } else if (data?.name) {
            newSelectedArtists[p] = { ...data, platform: p };
          }
        }
      });
      
      if (hasChannelList) {
        setShowChannelSelector(true);
      }
      
      if (Object.keys(newSelectedArtists).length === 0 && !hasChannelList) {
        const rejected = results.find(res => res.status === 'rejected');
        if (rejected) throw rejected.reason;
        throw new Error("Failed to fetch data from selected platforms");
      }

      setSelectedArtists(newSelectedArtists);
      if (platforms.length === 1) setSelectedArtist(newSelectedArtists[platforms[0]]);
      
      setError(null);
      saveRecentSearch(artist);

    } catch (err) {
      setError(err.message || "Search failed");
      setSelectedArtist(null);
      setSelectedArtists({});
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
      
      const newYoutubeArtist = { ...result, platform: 'youtube' };

      const currentSelectedArtists = useArtistStore.getState().selectedArtists || {};
      const nextSelectedArtists = { ...currentSelectedArtists, youtube: newYoutubeArtist };
      setSelectedArtists(nextSelectedArtists);
      if (platforms.length === 1) setSelectedArtist(nextSelectedArtists.youtube);
      saveRecentSearch(searchQuery);

    } catch (err) {
      setError(err.message || "Failed to load channel details");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // ✅ No px — MainLayout px-6 is enough
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-6 space-y-6 sm:space-y-8">
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
          <div className="pt-3 pb-2 flex justify-center">
            <div className="inline-flex items-center justify-center gap-2 p-2 bg-slate-100/90 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-lg hover:shadow-xl transition-all duration-300">
              {Object.entries(PLATFORM_CONFIG).map(([key, config]) => {
                const PIcon = config.icon;
                const isActive = platform === key;
                const glowClass = key === "spotify"
                  ? "shadow-[0_0_20px_rgba(16,185,129,0.4)] dark:shadow-[0_0_25px_rgba(16,185,129,0.35)]"
                  : key === "youtube"
                    ? "shadow-[0_0_20px_rgba(239,68,68,0.4)] dark:shadow-[0_0_25px_rgba(239,68,68,0.35)]"
                    : "shadow-[0_0_20px_rgba(236,72,153,0.4)] dark:shadow-[0_0_25px_rgba(236,72,153,0.35)]";

                return (
                  <button
                    key={key}
                    onClick={() => setPlatform(key)}
                    className={`inline-flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm sm:text-base font-black transition-all duration-350 border ${isActive
                      ? `bg-gradient-to-r ${config.color} text-white border-transparent scale-105 active:scale-100 ${glowClass}`
                      : "bg-transparent text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800/40"
                      }`}
                  >
                    <PIcon size={18} className={isActive ? "scale-110" : ""} />
                    {config.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Search Card ────────────────────────────────── */}
        <div
          className={`relative rounded-3xl bg-gradient-to-br ${cfg.color} shadow-2xl transition-all duration-500`}
        >
          <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
            <div
              className="absolute inset-0 opacity-30"
              style={{ background: cfg.bgPattern }}
            />
            <div className="absolute -top-24 -right-24 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
            <div
              className="absolute inset-0 opacity-5"
              style={{
                backgroundImage:
                  "radial-gradient(circle, white 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />
          </div>

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
                platforms={platforms}
                setPlatforms={setPlatforms}
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
                    : " Most Popular Searches:"}
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
        {!isLoading && Object.keys(selectedArtists).length > 0 && (
          <div className="space-y-8">
            {Object.keys(selectedArtists).length > 0 && (() => {
              const metrics = getCombinedMetrics(selectedArtists);
              if (!metrics) return null;
              const loadedPlatformCount = Object.keys(selectedArtists).length;
              const isCombined = loadedPlatformCount > 1;
              const platformNames = Object.keys(selectedArtists).map(k => {
                if (k === 'apify' || k === 'spotify') return 'Spotify';
                if (k === 'youtube') return 'YouTube';
                if (k === 'itunes') return 'Apple Music';
                return k.charAt(0).toUpperCase() + k.slice(1);
              }).join(', ');
              return (
                <div className="p-6 sm:p-8 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="relative z-10 flex flex-col items-center text-center">
                    <p className="text-white/80 text-sm sm:text-base font-bold uppercase tracking-widest mb-1">
                      {isCombined ? "Combined Cross-Platform Analytics" : "Overall Analytics"}
                    </p>
                    <p className="text-white/60 text-xs font-medium uppercase tracking-wider mb-4">
                      {platformNames}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 w-full max-w-4xl mt-2">
                      <div className="bg-white/10 rounded-2xl p-4 border border-white/20 backdrop-blur-sm flex flex-col">
                        <p className="text-white/70 text-xs sm:text-sm font-bold uppercase mb-1">Total Followers</p>
                        <p className="text-2xl sm:text-4xl font-black text-white">{formatNumberAbbrev(metrics.totalFollowers)}</p>
                        {isCombined && (
                          <div className="mt-auto pt-2 text-[10px] sm:text-xs text-white/60 space-y-0.5 w-full">
                            {Object.entries(metrics.breakdown).map(([p, data]) => (
                              data.followers > 0 && <div key={p} className="flex justify-between w-full"><span>{p.charAt(0).toUpperCase() + p.slice(1)}:</span> <span>{formatNumberAbbrev(data.followers)}</span></div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="bg-white/10 rounded-2xl p-4 border border-white/20 backdrop-blur-sm flex flex-col">
                        <p className="text-white/70 text-xs sm:text-sm font-bold uppercase mb-1">Total Market Valuation</p>
                        <p className="text-2xl sm:text-4xl font-black text-white">{formatCurrency(metrics.totalValuation)}</p>
                        {isCombined && (
                          <div className="mt-auto pt-2 text-[10px] sm:text-xs text-white/60 space-y-0.5 w-full">
                            {Object.entries(metrics.breakdown).map(([p, data]) => (
                              data.valuation > 0 && <div key={p} className="flex justify-between w-full"><span>{p.charAt(0).toUpperCase() + p.slice(1)}:</span> <span>{formatCurrency(data.valuation)}</span></div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="bg-white/10 rounded-2xl p-4 border border-white/20 backdrop-blur-sm flex flex-col">
                        <p className="text-white/70 text-xs sm:text-sm font-bold uppercase mb-1">Total Streams / Views</p>
                        <p className="text-2xl sm:text-4xl font-black text-white">{formatNumberAbbrev(metrics.totalStreams)}</p>
                        {isCombined && (
                          <div className="mt-auto pt-2 text-[10px] sm:text-xs text-white/60 space-y-0.5 w-full">
                            {Object.entries(metrics.breakdown).map(([p, data]) => (
                              data.streams > 0 && <div key={p} className="flex justify-between w-full"><span>{p.charAt(0).toUpperCase() + p.slice(1)}:</span> <span>{formatNumberAbbrev(data.streams)}</span></div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="bg-white/10 rounded-2xl p-4 border border-white/20 backdrop-blur-sm flex flex-col">
                        <p className="text-white/70 text-xs sm:text-sm font-bold uppercase mb-1">Total Albums</p>
                        <p className="text-2xl sm:text-4xl font-black text-white">{metrics.totalAlbums || 0}</p>
                        {isCombined && (
                          <div className="mt-auto pt-2 text-[10px] sm:text-xs text-white/60 space-y-0.5 w-full">
                            {Object.entries(metrics.breakdown).map(([p, data]) => (
                              data.albums > 0 && <div key={p} className="flex justify-between w-full"><span>{p.charAt(0).toUpperCase() + p.slice(1)}:</span> <span>{data.albums}</span></div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="bg-white/10 rounded-2xl p-4 border border-white/20 backdrop-blur-sm flex flex-col">
                        <p className="text-white/70 text-xs sm:text-sm font-bold uppercase mb-1">Total Singles</p>
                        <p className="text-2xl sm:text-4xl font-black text-white">{metrics.totalSingles || 0}</p>
                        {isCombined && (
                          <div className="mt-auto pt-2 text-[10px] sm:text-xs text-white/60 space-y-0.5 w-full">
                            {Object.entries(metrics.breakdown).map(([p, data]) => (
                              data.singles > 0 && <div key={p} className="flex justify-between w-full"><span>{p.charAt(0).toUpperCase() + p.slice(1)}:</span> <span>{data.singles}</span></div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="bg-white/10 rounded-2xl p-4 border border-white/20 backdrop-blur-sm flex flex-col">
                        <p className="text-white/70 text-[10px] sm:text-xs font-bold uppercase mb-1">Total Tracks / Videos</p>
                        <p className="text-2xl sm:text-4xl font-black text-white">{metrics.totalTracks || 0}</p>
                        {isCombined && (
                          <div className="mt-auto pt-2 text-[10px] sm:text-xs text-white/60 space-y-0.5 w-full">
                            {Object.entries(metrics.breakdown).map(([p, data]) => (
                              data.tracks > 0 && <div key={p} className="flex justify-between w-full"><span>{p.charAt(0).toUpperCase() + p.slice(1)}:</span> <span>{data.tracks}</span></div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
            {Object.values(selectedArtists)
              .filter(artistData => artistData.platform !== "custom")
              .map((artistData, idx) => {
              const pCfg = PLATFORM_CONFIG[artistData.platform] || cfg;
              const PIcon = pCfg.icon || SelectedIcon;
              return (
              <div key={artistData.platform || idx} className="space-y-5 sm:space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2.5 sm:p-3 bg-gradient-to-br ${pCfg.color} rounded-xl shadow-lg ring-1 ring-white/20`}
                    >
                      <PIcon size={20} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                        Live {artistData.importedDistributor ? `${artistData.importedDistributor} Analytics (Merged)` : `${pCfg.label} Analysis`}
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                        Real-time data · {artistData.name}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`flex items-center gap-2 px-3 py-1.5 ${pCfg.liveBadgeBg} border rounded-full`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full animate-pulse ${pCfg.liveDot}`}
                    />
                    <span
                      className={`text-xs font-bold uppercase tracking-wide ${pCfg.liveText}`}
                    >
                      Live
                    </span>
                  </div>
                </div>

                <ArtistCard
                  name={artistData.name}
                  image={artistData.image}
                  followers={artistData.followers}
                  popularity={artistData.popularity}
                  genres={artistData.genres}
                  topTracks={artistData.topTracks}
                  relatedArtists={artistData.relatedArtists}
                  albums={artistData.albums}
                  singles={artistData.singles}
                  popularReleases={artistData.popularReleases}
                  stats={{
                    ...artistData.stats,
                    scoring: artistData.scoring,
                    catalogScore: artistData.scoring?.catalogScore,
                  }}
                  spotifyUrl={artistData.spotifyUrl}
                  youtubeUrl={artistData.youtubeUrl}
                  appleUrl={artistData.appleUrl}
                  platform={artistData.platform}
                  monthlyListeners={artistData.monthlyListeners}
                  biography={artistData.biography}
                  topCities={artistData.topCities}
                  externalLinks={artistData.externalLinks}
                />
              </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && Object.keys(selectedArtists).length === 0 && !error && (
          <div className={`text-center py-14 sm:py-20 bg-gradient-to-br ${cfg.color} rounded-3xl shadow-xl overflow-hidden relative`}>

            {/* Background decorative blobs */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center gap-5 sm:gap-6 max-w-lg mx-auto px-4">

              {/* Platform icon — white circle so logo is always visible */}
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 rounded-full blur-2xl animate-pulse" />
                <div className="relative p-5 sm:p-6 bg-white rounded-full shadow-2xl ring-4 ring-white/30">
                  <SelectedIcon
                    size={44}
                    className={`sm:w-14 sm:h-14 ${cfg.iconColor}`}
                  />
                </div>
              </div>

              {/* Text */}
              <div>
                <h3 className="text-xl sm:text-3xl font-black text-white mb-2 sm:mb-3">
                  Ready to Discover?
                </h3>
                <p className="text-sm sm:text-base text-white/80 mb-5 sm:mb-6">
                  Search any artist on{" "}
                  <strong className="text-white">{cfg.label}</strong> to see
                  their Royalty Revenue
                </p>

                {/* Platform selector buttons */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6">
                  {Object.entries(PLATFORM_CONFIG).map(([key, config]) => {
                    const PIcon = config.icon;
                    const isActive = platform === key;
                    return (
                      <button
                        key={key}
                        onClick={() => setPlatform(key)}
                        className={`flex flex-col items-center gap-2 p-3 sm:p-4 rounded-2xl border-2 transition-all duration-200 ${isActive
                          ? "bg-white border-white shadow-lg scale-105"
                          : "bg-white/15 border-white/30 hover:bg-white/25 hover:border-white/50 hover:scale-105"
                          }`}
                      >
                        {/* Colored icon circle */}
                        <div className={`p-2 rounded-full ${isActive
                          ? `bg-gradient-to-br ${config.color}`
                          : "bg-white/20"
                          } shadow-md transition-all duration-200`}>
                          <PIcon
                            size={18}
                            className={isActive ? "text-white" : "text-white"}
                          />
                        </div>
                        <span className={`text-xs font-bold ${isActive ? config.iconColor : "text-white"
                          }`}>
                          {config.label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Bottom hint */}
                <p className="flex items-center justify-center gap-2 text-sm text-white/60">
                  <TrendingUp size={14} />
                  Click a suggested artist above for instant results
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ValuationTool;
