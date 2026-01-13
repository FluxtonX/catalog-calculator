import React, { useState, useEffect } from "react";
import { Search, Rocket, Music, Youtube, Database } from "lucide-react";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import ArtistCard from "../components/ui/ArtistCard";
import Badge from "../components/common/Badge";
import SkeletonLoader from "../components/ui/SkeletonLoader";
import { usePageTitle } from "../hooks/usePageTitle";
import { searchSpotify, searchYouTube, searchApify } from "../utils/api";

const ValuationTool = () => {
  usePageTitle("Valuation Tool", "Analyze artist metrics with real-time data");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [platform, setPlatform] = useState("spotify");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

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
      icon: Music,
      placeholder: "Search artist on Spotify...",
      color: "from-green-500 to-emerald-600",
    },
    youtube: {
      label: "YouTube",
      icon: Youtube,
      placeholder: "Search channel or artist on YouTube...",
      color: "from-red-500 to-red-600",
    },
    apify: {
      label: "Apify",
      icon: Database,
      placeholder: "Search using Apify scraper...",
      color: "from-blue-500 to-indigo-600",
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
        case "spotify":
          result = await searchSpotify(searchQuery);
          break;

        case "youtube":
          result = await searchYouTube(searchQuery);
          break;

        case "apify":
          result = await searchApify(searchQuery);
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
      const errorMessage = err.message || `Failed to fetch data from ${PLATFORM_CONFIG[platform].label}`;
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
          result = await searchSpotify(artist);
          break;

        case "youtube":
          result = await searchYouTube(artist);
          break;

        case "apify":
          result = await searchApify(artist);
          break;
      }

      if (!result || !result.name) {
        throw new Error("Invalid response from API");
      }

      setSelectedArtist(result);
      setError(null);
    } catch (err) {
      console.error("API error:", err);
      setError(err.message || `Failed to fetch data from ${PLATFORM_CONFIG[platform].label}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLaunchValuation = () => {
    console.log(
      "Launching valuation for:",
      selectedArtist?.name,
      "on",
      selectedArtist?.platform || platform
    );
    // Add your valuation logic here
  };

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card className={`bg-gradient-to-br ${PLATFORM_CONFIG[platform].color} text-white shadow-xl`}>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <SelectedIcon size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Search Artist</h2>
            <p className="text-white/90 text-sm">
              Search from Spotify, YouTube or Apify
            </p>
          </div>
        </div>

        <div className="flex gap-3 flex-col sm:flex-row">
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            disabled={isLoading}
            className="px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="spotify" className="text-black">
              Spotify
            </option>
            <option value="youtube" className="text-black">
              YouTube
            </option>
            <option value="apify" className="text-black">
              Apify
            </option>
          </select>

          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && !isLoading && handleSearch()}
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
            className="bg-white/20 hover:bg-white/30 text-white border-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    YouTube API has daily quotas. Try again tomorrow or use Spotify/Apify.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Loading Message for Apify */}
        {isLoading && platform === "apify" && (
          <div className="mt-4 p-4 bg-blue-500/20 border border-blue-300/30 rounded-lg backdrop-blur-sm animate-pulse">
            <div className="flex items-center gap-3">
              <div className="animate-spin">⏳</div>
              <p className="text-white text-sm font-medium">
                Apify is scraping data... This may take 20-40 seconds. Please wait!
              </p>
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
                className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-full text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
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
              <div className={`p-2 bg-gradient-to-br ${PLATFORM_CONFIG[selectedArtist.platform || platform].color} rounded-lg shadow-lg`}>
                {React.createElement(PLATFORM_CONFIG[selectedArtist.platform || platform].icon, {
                  size: 24,
                  className: "text-white"
                })}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Live {PLATFORM_CONFIG[selectedArtist.platform || platform].label} Analysis
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Real-time data from {PLATFORM_CONFIG[selectedArtist.platform || platform].label}
                </p>
              </div>
            </div>

            <Button icon={Rocket} onClick={handleLaunchValuation}>
              Launch Valuation
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="success" size="lg">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Live
              </span>
            </Badge>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Real-time Data from {PLATFORM_CONFIG[selectedArtist.platform || platform].label}
            </span>
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
            onLaunchValuation={handleLaunchValuation}
          />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !selectedArtist && !error && (
        <Card className="text-center py-16">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-full">
              <Search size={48} className="text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No Artist Selected
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Select a platform and search for an artist to begin analysis
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                💡 Tip: Click on suggested artists for instant results
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ValuationTool;