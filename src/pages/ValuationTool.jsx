import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Youtube,
  Database,
  ChevronDown,
  X,
  Sparkles,
} from "lucide-react";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import ArtistCard from "../components/ui/ArtistCard";
import Badge from "../components/common/Badge";
import SkeletonLoader from "../components/ui/SkeletonLoader";
import { usePageTitle } from "../hooks/usePageTitle";
import { searchYouTube, searchApify, getArtistSuggestions } from "../utils/api";
import { useArtistStore } from "../store/artistStore";
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showSuggestionsDropdown, setShowSuggestionsDropdown] = useState(false);

  const [shouldShowSuggestions, setShouldShowSuggestions] = useState(true);
  const suggestedArtists = [
    "Taylor Swift",
    "Drake",
    "The Weeknd",
    "Bad Bunny",
    "Ariana Grande",
  ];

  const PLATFORM_CONFIG = {
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

  const SelectedIcon = PLATFORM_CONFIG[platform].icon;

  useEffect(() => {
    // Skip on initial mount/when coming back from detail page
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Only search if platform changes AND we don't already have the artist data
    if (
      searchQuery.trim() &&
      selectedArtist &&
      selectedArtist.platform !== platform
    ) {
      handleSearch();
    }
  }, [platform]);

  // Fetch suggestions as user types
  useEffect(() => {
    const fetchSuggestions = async () => {
      // ADD THIS CHECK - don't fetch if flag is false
      if (!shouldShowSuggestions) {
        return;
      }

      if (!searchQuery.trim()) {
        setSuggestions([]);
        setShowSuggestionsDropdown(false);
        return;
      }

      setIsLoadingSuggestions(true);
      setShowSuggestionsDropdown(true);

      try {
        let results = [];

        results = suggestedArtists.filter((artist) =>
          artist.toLowerCase().includes(searchQuery.toLowerCase()),
        );

        if (searchQuery.length > 2) {
          try {
            const apiResults = await getArtistSuggestions(
              searchQuery,
              platform,
            );

            const combinedResults = [
              ...results,
              ...apiResults.map((r) => r.name),
            ];

            results = [...new Set(combinedResults)];
          } catch (apiErr) {
            console.warn(
              "API suggestion fetch failed, using local suggestions only",
              apiErr,
            );
          }
        }

        if (results.length === 0 && searchQuery.length > 1) {
          results = [searchQuery];
        }

        setSuggestions(results);
      } catch (err) {
        console.error("Error fetching suggestions:", err);
        setSuggestions([]);
      } finally {
        setIsLoadingSuggestions(false);
      }
    };

    const timer = setTimeout(fetchSuggestions, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, platform, shouldShowSuggestions]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError("Please enter a search query");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSelectedArtist(null);
    setShowSuggestionsDropdown(false);

    try {
      let result;

      switch (platform) {
        case "spotify":
          result = await searchApify(searchQuery);
          break;

        case "youtube":
          result = await searchYouTube(searchQuery);
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

    try {
      let result;

      switch (platform) {
        case "spotify":
          result = await searchApify(artist);
          break;

        case "youtube":
          result = await searchYouTube(artist);
          break;
      }

      if (!result || !result.name) {
        throw new Error("Invalid response from API");
      }

      setSelectedArtist(result);
      setError(null);
    } catch (err) {
      console.error("API error:", err);
      setError(
        err.message ||
          `Failed to fetch data from ${PLATFORM_CONFIG[platform].label}`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestedArtistClick = (artist) => {
    handleSuggestionClick(artist);
  };

  const activePlatform = platform;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-3 sm:space-y-4 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 dark:from-emerald-500/20 dark:to-blue-500/20 rounded-full border border-emerald-500/20 dark:border-emerald-500/30">
            <Sparkles
              size={16}
              className="text-emerald-600 dark:text-emerald-400"
            />
            <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
              Real-Time Analytics
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-slate-100 dark:to-white bg-clip-text text-transparent">
            Artist Valuation Tool
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Discover insights and metrics from Spotify and YouTube in real-time
          </p>
        </div>

        {/* Search Section */}
        <Card
          className={`relative overflow-hidden bg-gradient-to-br ${PLATFORM_CONFIG[platform].color} border-0 shadow-2xl shadow-${platform === "spotify" ? "emerald" : "red"}-500/20`}
        >
          {/* Animated Background Pattern */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background: PLATFORM_CONFIG[platform].bgPattern,
            }}
          />

          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />

          <div className="relative z-10 p-6 sm:p-8">
            <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="p-3 sm:p-4 bg-white/20 backdrop-blur-xl rounded-2xl shadow-lg ring-1 ring-white/30">
                <SelectedIcon size={28} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white">
                  Search Artist
                </h2>
                <p className="text-white/90 text-sm sm:text-base mt-1">
                  Discover detailed analytics from{" "}
                  {PLATFORM_CONFIG[platform].label}
                </p>
              </div>
            </div>

            <div className="flex gap-3 flex-col lg:flex-row">
              {/* Platform Selector */}
              <div className="relative lg:w-56">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  disabled={isLoading}
                  className="w-full px-5 py-3.5 bg-white/15 backdrop-blur-xl border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between gap-2 hover:bg-white/20 shadow-lg hover:shadow-xl group"
                >
                  <div className="flex items-center gap-3">
                    <SelectedIcon
                      size={22}
                      className="group-hover:scale-110 transition-transform"
                    />
                    <span className="font-semibold text-base">
                      {PLATFORM_CONFIG[platform].label}
                    </span>
                  </div>
                  <ChevronDown
                    size={20}
                    className={`transition-transform duration-300 ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsDropdownOpen(false)}
                    />

                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50 backdrop-blur-xl">
                      {Object.entries(PLATFORM_CONFIG).map(([key, config]) => {
                        const Icon = config.icon;
                        return (
                          <button
                            key={key}
                            onClick={() => {
                              setPlatform(key);
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full px-5 py-4 flex items-center gap-3 transition-all duration-200 ${
                              platform === key
                                ? "bg-gradient-to-r " +
                                  config.color +
                                  " text-white shadow-md"
                                : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/70"
                            }`}
                          >
                            <Icon size={20} />
                            <span className="font-semibold">
                              {config.label}
                            </span>
                            {platform === key && (
                              <span className="ml-auto text-sm font-bold">
                                ✓
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              {/* Search Input with Autocomplete */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShouldShowSuggestions(true); // Re-enable suggestions when typing
                  }}
                  onKeyPress={(e) =>
                    e.key === "Enter" && !isLoading && handleSearch()
                  }
                  onFocus={() => {
                    if (searchQuery.trim() && suggestions.length > 0) {
                      setShowSuggestionsDropdown(true);
                    }
                  }}
                  placeholder={PLATFORM_CONFIG[platform].placeholder}
                  disabled={isLoading}
                  className="w-full pl-14 pr-12 py-3.5 bg-white/15 backdrop-blur-xl border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-base shadow-lg hover:shadow-xl"
                  autoComplete="off"
                />
                <div className="absolute left-5 top-1/2 -translate-y-1/2">
                  <Search size={20} className="text-white/80" />
                </div>

                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSuggestions([]);
                      setShowSuggestionsDropdown(false);
                    }}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
                  >
                    <X size={18} />
                  </button>
                )}

                {/* Suggestions Dropdown */}
                {showSuggestionsDropdown && suggestions.length > 0 && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setShowSuggestionsDropdown(false)}
                    />

                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-40 max-h-72 overflow-y-auto backdrop-blur-xl">
                      {isLoadingSuggestions ? (
                        <div className="px-5 py-4 text-center text-slate-600 dark:text-slate-400">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                            <span className="text-sm font-medium">
                              Loading suggestions...
                            </span>
                          </div>
                        </div>
                      ) : (
                        suggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="w-full px-5 py-3.5 text-left text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/70 transition-all duration-200 flex items-center gap-3 border-b border-slate-100 dark:border-slate-700 last:border-b-0 group"
                          >
                            <Search
                              size={16}
                              className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors"
                            />
                            <span className="font-medium group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                              {suggestion}
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  </>
                )}
              </div>

              <Button
                variant="primary"
                className="bg-white/25 hover:bg-white/35 text-white border-white/40 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shadow-lg hover:shadow-xl backdrop-blur-xl font-semibold px-6 lg:px-8 py-3.5"
                icon={SelectedIcon}
                onClick={handleSearch}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Searching...
                  </span>
                ) : (
                  "Search"
                )}
              </Button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-5 p-4 bg-red-500/20 border border-red-300/40 rounded-xl backdrop-blur-xl animate-fade-in shadow-lg">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">⚠️</span>
                  <div className="flex-1">
                    <p className="text-white text-sm font-semibold">{error}</p>
                    {platform === "youtube" && error.includes("quota") && (
                      <p className="text-white/80 text-xs mt-1">
                        YouTube API has daily quotas. Try again tomorrow or use
                        Spotify.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Loading Message */}
            {isLoading && platform === "spotify" && (
              <div className="mt-5 p-4 bg-white/20 border border-white/30 rounded-xl backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <p className="text-white text-sm font-semibold">
                    Fetching Spotify data...
                  </p>
                </div>
              </div>
            )}

            {/* Platform Info */}
            {!isLoading && !error && (
              <div className="mt-5 p-4 bg-white/15 backdrop-blur-xl rounded-xl border border-white/30 shadow-lg">
                <div className="flex items-start gap-2 text-sm text-white/95">
                  <span>💡</span>
                  <div>
                    {platform === "spotify" && (
                      <p>
                        <strong className="font-bold">Spotify:</strong> Get
                        official artist metrics, stream counts, and detailed
                        analytics.
                      </p>
                    )}
                    {platform === "youtube" && (
                      <p>
                        <strong className="font-bold">YouTube:</strong> Discover
                        channel statistics, subscriber counts, and video
                        performance.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Suggested Artists */}
            <div className="mt-6 sm:mt-8">
              <p className="text-sm font-semibold text-white/95 mb-3">
                Try searching for:
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestedArtists.map((artist) => (
                  <button
                    key={artist}
                    onClick={() => handleSuggestedArtistClick(artist)}
                    disabled={isLoading}
                    className="px-4 py-2.5 bg-white/15 hover:bg-white/25 backdrop-blur-xl border border-white/30 rounded-full text-sm font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 shadow-lg hover:shadow-xl text-white"
                  >
                    {artist}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Loading State */}
        {isLoading && <SkeletonLoader />}

        {/* Artist Analysis */}
        {!isLoading && selectedArtist && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={`p-3 bg-gradient-to-br ${
                    PLATFORM_CONFIG[activePlatform].color
                  } rounded-xl shadow-lg ring-1 ring-white/20`}
                >
                  {React.createElement(PLATFORM_CONFIG[activePlatform].icon, {
                    size: 24,
                    className: "text-white",
                  })}
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                    Live {PLATFORM_CONFIG[activePlatform].label} Analysis
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Real-time data from {PLATFORM_CONFIG[activePlatform].label}
                  </p>
                </div>
              </div>

              <Badge
                variant="success"
                size="lg"
                className="bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg"
              >
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse shadow-lg shadow-white/50"></span>
                  Live
                </span>
              </Badge>
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
          <Card className="text-center py-16 sm:py-24 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 border-slate-200 dark:border-slate-800 shadow-xl">
            <div className="flex flex-col items-center gap-6 max-w-2xl mx-auto px-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-full blur-2xl opacity-20 animate-pulse" />
                <div className="relative p-6 bg-gradient-to-br from-emerald-100 to-blue-100 dark:from-emerald-900/30 dark:to-blue-900/30 rounded-full">
                  <Search
                    size={56}
                    className="text-emerald-600 dark:text-emerald-400"
                  />
                </div>
              </div>
              <div>
                <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-3">
                  Ready to Discover?
                </h3>
                <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 mb-6">
                  Select a platform and search for an artist to begin your
                  analysis
                </p>
                <div className="space-y-3 text-sm sm:text-base text-slate-500 dark:text-slate-500">
                  <p className="flex items-center justify-center gap-2">
                    <span className="text-2xl">💡</span>
                    <span>
                      Tip: Click on suggested artists for instant results
                    </span>
                  </p>
                  <p className="flex items-center justify-center gap-2">
                    <span className="text-2xl">🔥</span>
                    <span>
                      Try{" "}
                      <strong className="text-emerald-600 dark:text-emerald-400">
                        Spotify
                      </strong>{" "}
                      for detailed stream counts!
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ValuationTool;
