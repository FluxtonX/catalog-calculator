import React, { useState, useEffect, useRef } from "react";
import * as Select from "@radix-ui/react-select";
import * as Tooltip from "@radix-ui/react-tooltip";
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
 
} from "lucide-react";

import Card from "../components/common/Card";
import Button from "../components/common/Button";
import ArtistCard from "../components/ui/ArtistCard";
import Badge from "../components/common/Badge";
import SkeletonLoader from "../components/ui/SkeletonLoader";
import { usePageTitle } from "../hooks/usePageTitle";
import {
  searchYouTube,
  searchApify,
  getArtistSuggestions,
  getYouTubeChannelDetails,
   searchAppleMusic,  // PREMIUM with MusicKit
  searchItunes, 
} from "../utils/api";
import { useArtistStore } from "../store/artistStore";
import ChannelSelector from "../components/youtube/ChannelSelector";

// ── Platform config ───────────────────────────────────────
const PLATFORM_CONFIG = {
  spotify: {
    label: "Spotify",
    icon: Database,
    placeholder: "Search artist on Spotify...",
    color: "from-emerald-500 via-green-500 to-teal-600",
    accentBg: "bg-emerald-500/20",
    accentBorder: "border-emerald-500/30",
    accentText: "text-emerald-300",
    bgPattern:
      "radial-gradient(circle at 30% 50%, rgba(16, 185, 129, 0.2) 0%, transparent 50%)",
    tip: "Get official artist metrics, stream counts, and detailed analytics.",
  },
  youtube: {
    label: "YouTube",
    icon: Youtube,
    placeholder: "Search channel or artist on YouTube...",
    color: "from-red-500 via-rose-500 to-pink-600",
    accentBg: "bg-red-500/20",
    accentBorder: "border-red-500/30",
    accentText: "text-red-300",
    bgPattern:
      "radial-gradient(circle at 70% 50%, rgba(239, 68, 68, 0.2) 0%, transparent 50%)",
    tip: "Discover channel statistics, subscriber counts, and video performance.",
  },
   itunes: {
    label: "Apple Music",
    icon: Music,
    placeholder: "Search artist on Apple Music...",
    color: "from-pink-500 via-rose-500 to-red-500",
    iconColor: "text-pink-500",
    bgPattern: "radial-gradient(circle at 50% 50%, rgba(236, 72, 153, 0.2) 0%, transparent 50%)",
  },
};

const suggestedArtists = [
  "Taylor Swift",
  "Drake",
  "The Weeknd",
  "Bad Bunny",
  "Ariana Grande",
];

// ── Radix Select for platform ─────────────────────────────
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
        className="flex items-center justify-between gap-3 w-full lg:w-52
          px-4 py-3.5 bg-white/15 hover:bg-white/20
          backdrop-blur-xl border border-white/30 hover:border-white/50
          rounded-xl text-white font-semibold text-sm
          focus:outline-none focus:ring-2 focus:ring-white/40
          transition-all duration-200 shadow-lg
          disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Platform"
      >
        <div className="flex items-center gap-2.5">
          <Icon size={18} />
          <Select.Value />
        </div>
        <Select.Icon>
          <ChevronDown size={16} className="opacity-70" />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-[999] min-w-[180px]"
          position="popper"
          sideOffset={6}
        >
          <Select.Viewport className="p-1.5">
            {Object.entries(PLATFORM_CONFIG).map(([key, config]) => {
              const PIcon = config.icon;
              return (
                <Select.Item
                  key={key}
                  value={key}
                  className="
                    flex items-center justify-between gap-3 px-4 py-3 rounded-xl
                    text-sm font-semibold cursor-pointer outline-none
                    text-slate-700 dark:text-slate-200
                    data-[highlighted]:bg-slate-100 dark:data-[highlighted]:bg-slate-700
                    data-[state=checked]:text-emerald-600 dark:data-[state=checked]:text-emerald-400
                    data-[state=checked]:bg-emerald-50 dark:data-[state=checked]:bg-emerald-900/30
                    transition-colors duration-150
                  "
                >
                  <div className="flex items-center gap-2.5">
                    <PIcon size={18} />
                    <Select.ItemText>{config.label}</Select.ItemText>
                  </div>
                  <Select.ItemIndicator>
                    <Check size={15} className="text-emerald-500" />
                  </Select.ItemIndicator>
                </Select.Item>
              );
            })}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
};

// ── Main page ─────────────────────────────────────────────
const ValuationTool = () => {
  usePageTitle("Valuation Tool", "Analyze artist metrics with real-time data");

  const {
    searchQuery,
    setSearchQuery,
    selectedArtist,
    setSelectedArtist,
    platform,
    setPlatform,
  } = useArtistStore();
  const isInitialMount = useRef(true);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showSuggestionsDropdown, setShowSuggestionsDropdown] = useState(false);
  const [youtubeChannels, setYoutubeChannels] = useState([]);
  const [showChannelSelector, setShowChannelSelector] = useState(false);
  const [shouldShowSuggestions, setShouldShowSuggestions] = useState(true);
  const inputRef = useRef(null);

  const cfg = PLATFORM_CONFIG[platform];
  const SelectedIcon = cfg.icon;

  // ── All original useEffects — UNCHANGED ──────────────────
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
        let results = suggestedArtists.filter((a) =>
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

  // ── All original handlers — UNCHANGED ────────────────────
  // const handleSearch = async () => {
  //   if (!searchQuery.trim()) {
  //     setError("Please enter a search query");
  //     return;
  //   }
  //   setIsLoading(true);
  //   setError(null);
  //   setSelectedArtist(null);
  //   setShowSuggestionsDropdown(false);
  //   setShowChannelSelector(false);
  //   setYoutubeChannels([]);
  //   try {
  //     let result;
  //     if (platform === "spotify") result = await searchApify(searchQuery);
  //     else {
  //       result = await searchYouTube(searchQuery);
  //       if (result.type === "channel_list") {
  //         setYoutubeChannels(result.channels);
  //         setShowChannelSelector(true);
  //         setIsLoading(false);
  //         return;
  //       }
  //     }
  //     if (!result || !result.name) throw new Error("Invalid response from API");
  //     setSelectedArtist(result);
  //     setError(null);
  //   } catch (err) {
  //     setError(err.message || `Failed to fetch data from ${cfg.label}`);
  //     setSelectedArtist(null);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };



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
    let result;

    switch (platform) {
      case "spotify":
        result = await searchApify(searchQuery);
        break;

      case "youtube":
        result = await searchYouTube(searchQuery);
        
        if (result.type === 'channel_list') {
          setYoutubeChannels(result.channels);
          setShowChannelSelector(true);
          setIsLoading(false);
          return;
        }
        break;

      case "itunes":
        // Try PREMIUM first, fallback to FREE if it fails
        try {
          result = await searchAppleMusic(searchQuery);
          console.log('✅ Using PREMIUM Apple Music API');
        } catch (premiumError) {
          console.log('⚠️ Premium failed, using FREE iTunes API');
          result = await searchItunes(searchQuery);
        }
        break;

      default:
        throw new Error("Invalid platform selected");
    }

    if (!result || !result.name) {
      throw new Error("Invalid response from API");
    }

    setSelectedArtist(result);
    setError(null);
  } catch (err) {
    console.error("API error:", err);
    const errorMessage =
      err.message ||
      `Failed to fetch data from ${PLATFORM_CONFIG[platform].label}`;
    setError(errorMessage);
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
    let result;

    switch (platform) {
      case "spotify":
        result = await searchApify(artist);
        break;

      case "youtube":
        result = await searchYouTube(artist);
        if (result.type === "channel_list") {
          setYoutubeChannels(result.channels);
          setShowChannelSelector(true);
          setIsLoading(false);
          return;
        }
        break;

      case "itunes":
        try {
          result = await searchAppleMusic(artist);
        } catch {
          result = await searchItunes(artist);
        }
        break;

      default:
        throw new Error("Invalid platform selected");
    }

    if (!result || !result.name) throw new Error("Invalid response from API");
    setSelectedArtist(result);
    setError(null);
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
      if (!result || !result.name) throw new Error("Invalid response from API");
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
        {/* ── Page Header ──────────────────────────────────── */}
        <div className="text-center space-y-3 sm:space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 dark:from-emerald-500/20 dark:to-blue-500/20 rounded-full border border-emerald-500/20 dark:border-emerald-500/30 shadow-sm">
            <Sparkles
              size={15}
              className="text-emerald-600 dark:text-emerald-400"
            />
            <span className="text-xs sm:text-sm font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wide">
              Real-Time Analytics
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-white dark:via-slate-100 dark:to-white bg-clip-text text-transparent tracking-tight">
            Artist Valuation Tool
          </h1>
          <p className="text-sm sm:text-lg text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Discover insights &amp; metrics from Spotify and YouTube in
            real-time
          </p>
        </div>

        {/* ── Search Card ───────────────────────────────────── */}
        <div
          className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${cfg.color} shadow-2xl`}
        >
          {/* Decorative blobs */}
          <div
            className="absolute inset-0 opacity-30"
            style={{ background: cfg.bgPattern }}
          />
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 p-5 sm:p-7 lg:p-10">
            {/* Header */}
            <div className="flex items-center gap-3 sm:gap-4 mb-5 sm:mb-7">
              <div className="p-3 sm:p-4 bg-white/20 backdrop-blur-xl rounded-2xl shadow-lg ring-1 ring-white/30">
                <SelectedIcon size={24} className="sm:w-7 sm:h-7 text-white" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
                  Search Artist
                </h2>
                <p className="text-white/70 text-xs sm:text-sm mt-0.5">
                  Discover analytics from{" "}
                  <span className="font-semibold text-white/90">
                    {cfg.label}
                  </span>
                </p>
              </div>
            </div>

            {/* Search Row */}
            <div className="flex gap-2 sm:gap-3 flex-col lg:flex-row">
              {/* Radix Select — platform */}
              <PlatformSelect
                platform={platform}
                setPlatform={setPlatform}
                isLoading={isLoading}
              />

              {/* Search input */}
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
                  className="w-full pl-11 pr-10 py-3.5 bg-white/15 hover:bg-white/20 backdrop-blur-xl border border-white/30 hover:border-white/50 rounded-xl text-white placeholder-white/60 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-white/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSuggestions([]);
                      setShowSuggestionsDropdown(false);
                      inputRef.current?.focus();
                    }}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-white/60 hover:text-white hover:bg-white/15 transition-all"
                  >
                    <X size={16} />
                  </button>
                )}

                {/* Autocomplete dropdown */}
                {showSuggestionsDropdown && suggestions.length > 0 && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setShowSuggestionsDropdown(false)}
                    />
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-40 max-h-64 overflow-y-auto">
                      {isLoadingSuggestions ? (
                        <div className="flex items-center justify-center gap-2 px-5 py-4 text-slate-500 dark:text-slate-400">
                          <Loader2 size={16} className="animate-spin" />
                          <span className="text-sm">Loading suggestions…</span>
                        </div>
                      ) : (
                        suggestions.map((suggestion, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="w-full px-5 py-3 text-left flex items-center gap-3 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/70 border-b border-slate-100 dark:border-slate-700 last:border-0 transition-colors group"
                          >
                            <Search
                              size={14}
                              className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors flex-shrink-0"
                            />
                            <span className="text-sm font-medium group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                              {suggestion}
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Search button */}
              <button
                onClick={handleSearch}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 bg-white/25 hover:bg-white/35 active:bg-white/40 border border-white/40 rounded-xl text-white text-sm sm:text-base font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl backdrop-blur-xl whitespace-nowrap"
              >
              <><SelectedIcon size={17} /> Search</>
              </button>
            </div>

            {/* Error */}
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

            {/* Loading hint */}
            {/* Loading hint — REPLACE the existing isLoading && platform === "spotify" block */}
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
                    Just a sec while we crunch the numbers…
                  </p>
                  <p className="text-white/60 text-xs mt-0.5">
                    Fetching live data from {cfg.label}
                  </p>
                </div>
              </div>
            )}

            {/* Platform tip */}
            {!isLoading && !error && (
              <div className="mt-4 flex items-start gap-2.5 p-4 bg-white/10 border border-white/20 rounded-xl backdrop-blur-xl">
                <Info
                  size={15}
                  className="text-white/70 flex-shrink-0 mt-0.5"
                />
                <p className="text-white/90 text-xs sm:text-sm">
                  <strong className="font-bold">{cfg.label}:</strong> {cfg.tip}
                </p>
              </div>
            )}

            {/* Suggested artists */}
            <div className="mt-5 sm:mt-7">
              <p className="text-xs font-bold text-white/70 uppercase tracking-widest mb-3">
                Try searching for:
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestedArtists.map((artist) => (
                  <button
                    key={artist}
                    onClick={() => handleSuggestionClick(artist)}
                    disabled={isLoading}
                    className="px-3.5 py-2 sm:px-4 sm:py-2.5 bg-white/15 hover:bg-white/25 active:bg-white/30 border border-white/25 hover:border-white/40 rounded-full text-xs sm:text-sm font-semibold text-white transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg backdrop-blur-xl"
                  >
                    {artist}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Loading skeleton ───────────────────────────────── */}
        {/* Loading skeleton — REPLACE the existing isLoading && <SkeletonLoader /> block */}
        {isLoading && (
          <div className="space-y-4 animate-pulse">
            <div className="h-48 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 rounded-3xl bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-28 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 rounded-2xl"
                />
              ))}
            </div>
            <div className="h-64 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 rounded-3xl" />
          </div>
        )}

        {/* ── Channel Selector ───────────────────────────────── */}
        {!isLoading && showChannelSelector && youtubeChannels.length > 0 && (
          <ChannelSelector
            channels={youtubeChannels}
            onSelectChannel={handleChannelSelect}
            isLoading={isLoading}
          />
        )}

        {/* ── Artist Analysis ────────────────────────────────── */}
        {!isLoading && selectedArtist && (
          <div className="space-y-5 sm:space-y-6">
            {/* Section header bar */}
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
                    Real-time data from {cfg.label}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
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

        {/* ── Empty State ────────────────────────────────────── */}
        {!isLoading && !selectedArtist && !error && (
          <div className="text-center py-14 sm:py-24 bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200 dark:border-slate-800 shadow-xl">
            <div className="flex flex-col items-center gap-5 sm:gap-6 max-w-xl mx-auto px-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-full blur-2xl opacity-20 animate-pulse" />
                <div className="relative p-5 sm:p-6 bg-gradient-to-br from-emerald-100 to-blue-100 dark:from-emerald-900/30 dark:to-blue-900/30 rounded-full">
                  <Search
                    size={44}
                    className="sm:w-14 sm:h-14 text-emerald-600 dark:text-emerald-400"
                  />
                </div>
              </div>
              <div>
                <h3 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white mb-2 sm:mb-3">
                  Ready to Discover?
                </h3>
                <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mb-5 sm:mb-6">
                  Select a platform and search for an artist to begin your
                  analysis
                </p>
                <div className="space-y-2.5 text-sm text-slate-400 dark:text-slate-500">
                  <p className="flex items-center justify-center gap-2">
                    <span className="text-xl">💡</span>
                    Click a suggested artist for instant results
                  </p>
                  <p className="flex items-center justify-center gap-2">
                    <span className="text-xl">🎵</span>
                    Use{" "}
                    <strong className="text-emerald-600 dark:text-emerald-400">
                      Spotify
                    </strong>{" "}
                    for detailed stream counts
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
