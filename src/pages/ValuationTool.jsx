import React, { useState, useEffect } from "react";
import { Search, Youtube, Database, ChevronDown } from "lucide-react";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import ArtistCard from "../components/ui/ArtistCard";
import Badge from "../components/common/Badge";
import SkeletonLoader from "../components/ui/SkeletonLoader";
import { usePageTitle } from "../hooks/usePageTitle";
import { searchYouTube, searchApify } from "../utils/api";

const ValuationTool = () => {
  usePageTitle("Valuation Tool", "Analyze artist metrics with real-time data");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [platform, setPlatform] = useState("spotify");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
      color: "from-green-500 to-emerald-600",
      iconColor: "text-green-500",
    },
    youtube: {
      label: "YouTube",
      icon: Youtube,
      placeholder: "Search channel or artist on YouTube...",
      color: "from-red-500 to-red-600",
      iconColor: "text-red-500",
    },
  };

  const SelectedIcon = PLATFORM_CONFIG[platform].icon;

  // Auto-search when platform changes if there's a query
  useEffect(() => {
    if (searchQuery.trim() && selectedArtist) {
      handleSearch();
    }
  }, [platform]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError("Please enter a search query");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSelectedArtist(null);

    try {
      let result;

      switch (platform) {
        case "spotify": // renamed Apify
          result = await searchApify(searchQuery);
          break;

        case "youtube":
          result = await searchYouTube(searchQuery);
          break;

        default:
          throw new Error("Invalid platform selected");
      }
      // Validate result
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

  const handleSuggestedArtistClick = async (artist) => {
    setSearchQuery(artist);
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

  const activePlatform = platform;
  return (
    <div className="space-y-6 px-4 sm:px-0">
      {/* Search Section */}
      <Card
        className={`bg-gradient-to-br ${PLATFORM_CONFIG[platform].color} text-white shadow-xl`}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <SelectedIcon size={24} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">Search Artist</h2>
            <p className="text-white/90 text-xs sm:text-sm">
             Search from Spotify (with stream counts) or YouTube

            </p>
          </div>
        </div>

        <div className="flex gap-3 flex-col sm:flex-row">
          {/* Custom Styled Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              disabled={isLoading}
              className="w-full sm:w-48 px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between gap-2 hover:bg-white/15"
            >
              <div className="flex items-center gap-2">
                <SelectedIcon size={20} />
                <span className="font-medium">
                  {PLATFORM_CONFIG[platform].label}
                </span>
              </div>
              <ChevronDown
                size={18}
                className={`transition-transform duration-200 ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isDropdownOpen && (
              <>
                {/* Backdrop to close dropdown */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsDropdownOpen(false)}
                />

                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                  {Object.entries(PLATFORM_CONFIG).map(([key, config]) => {
                    const Icon = config.icon;
                    return (
                      <button
                        key={key}
                        onClick={() => {
                          setPlatform(key);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full px-4 py-3 flex items-center gap-3 transition-all duration-200 ${
                          platform === key
                            ? "bg-gradient-to-r " + config.color + " text-white"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                        }`}
                      >
                        <Icon size={20} />
                        <span className="font-medium">{config.label}</span>
                        {platform === key && (
                          <span className="ml-auto text-xs">✓</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) =>
                e.key === "Enter" && !isLoading && handleSearch()
              }
              placeholder={PLATFORM_CONFIG[platform].placeholder}
              disabled={isLoading}
              className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <SelectedIcon size={20} className="text-white/70" />
            </div>
          </div>

          <Button
            variant="primary"
            className="bg-white/20 hover:bg-white/30 text-white border-white/30 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            icon={SelectedIcon}
            onClick={handleSearch}
            disabled={isLoading}
          >
            {isLoading ? "Searching..." : "Search"}
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-red-500/20 border border-red-300/30 rounded-lg backdrop-blur-sm animate-fade-in">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div className="flex-1">
                <p className="text-white text-sm font-medium">{error}</p>
                {platform === "youtube" && error.includes("quota") && (
                  <p className="text-white/80 text-xs mt-1">
                    YouTube API has daily quotas. Try again tomorrow or use
                    Spotify/Apify.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Loading Message for Apify */}
        {isLoading && platform === "spotify" && (
          <div className="mt-4 p-4 bg-green-500/20 border border-green-300/30 rounded-lg">
            <p className="text-white text-sm font-medium">
              Fetching Spotify data...
            </p>
          </div>
        )}

        {/* Platform-specific info */}
        {!isLoading && !error && (
          <div className="mt-4 p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
            <div className="flex items-start gap-2 text-xs text-white/90">
              <span>💡</span>
              <div>
                {platform === "spotify" && (
                  <p>
                   <strong>Spotify:</strong> Official Spotify artist metrics and analytics.

                  </p>
                )}
                {platform === "youtube" && (
                  <p>
                    <strong>YouTube:</strong> Search for YouTube channels and
                    get subscriber counts, video stats.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Suggested Artists */}
        <div className="mt-6">
          <p className="text-sm text-white/90 mb-3">Try searching for:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedArtists.map((artist) => (
              <button
                key={artist}
                onClick={() => handleSuggestedArtistClick(artist)}
                disabled={isLoading}
                className="px-3 sm:px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
              >
                {artist}
              </button>
            ))}
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
                className={`p-2 bg-gradient-to-br ${
                  PLATFORM_CONFIG[activePlatform].color
                } rounded-lg shadow-lg`}
              >
                {React.createElement(PLATFORM_CONFIG[activePlatform].icon, {
                  size: 24,
                  className: "text-white",
                })}
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  Live {PLATFORM_CONFIG[activePlatform].label} Analysis
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Real-time data from {PLATFORM_CONFIG[activePlatform].label}
                </p>
              </div>
            </div>

            <Badge variant="success" size="lg">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
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
            stats={selectedArtist.stats}
            spotifyUrl={selectedArtist.spotifyUrl}
            youtubeUrl={selectedArtist.youtubeUrl}
            // apifyUrl={selectedArtist.apifyUrl}
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
        <Card className="text-center py-12 sm:py-16">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-full">
              <Search
                size={48}
                className="text-purple-600 dark:text-purple-400"
              />
            </div>
            <div className="px-4">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No Artist Selected
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4">
                Select a platform and search for an artist to begin analysis
              </p>
              <div className="space-y-2 text-xs sm:text-sm text-gray-500 dark:text-gray-500">
                <p>💡 Tip: Click on suggested artists for instant results</p>
                <p>
                  🔥 Try <strong>Apify</strong> for detailed stream counts and
                  play data!
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ValuationTool;
