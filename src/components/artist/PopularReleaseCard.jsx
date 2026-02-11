// src/components/artist/PopularReleaseCard.jsx
import React from "react";
import { Calendar, ExternalLink, Music } from "lucide-react";
import Badge from "../common/Badge";
import SpotifyEmbed from "./SpotifyEmbed";

const PopularReleaseCard = ({ release, index }) => {
  // Helper function to extract Spotify track ID from URL
  const extractSpotifyId = (url) => {
    if (!url) return null;
    const match = url.match(/track[\/:]([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
  };

  // Format the full release date
  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  const trackId = extractSpotifyId(release.spotifyUrl);

  return (
    <div
      key={release.id || index}
      className="group p-3 sm:p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-700 hover:border-emerald-500/50 dark:hover:border-emerald-500/50"
    >
      <div className="flex flex-col gap-3">
        {/* Album Cover - Only show if NO Spotify embed available */}
        {!trackId && (
          <div className="relative overflow-hidden rounded-lg">
            {release.image ? (
              <img
                src={release.image}
                alt={release.name}
                className="w-full aspect-square object-cover transition-transform duration-300 group-hover:scale-110"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.nextElementSibling?.style.setProperty("display", "flex");
                }}
              />
            ) : null}
            
            {/* Fallback image if main image fails or doesn't exist */}
            <div 
              className="w-full aspect-square bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center"
              style={{ display: release.image ? "none" : "flex" }}
            >
              <Music size={48} className="text-white opacity-50" />
            </div>
            
            {/* Release Type Badge */}
            <div className="absolute top-2 right-2">
              <Badge
                size="sm"
                className={`${
                  release.type === "album"
                    ? "bg-purple-500"
                    : release.type === "single"
                      ? "bg-blue-500"
                      : "bg-emerald-500"
                } text-white backdrop-blur-sm bg-opacity-90`}
              >
                {release.type?.toUpperCase() || "RELEASE"}
              </Badge>
            </div>
          </div>
        )}

        {/* Release Info */}
        <div className="flex flex-col">
          <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            {release.name}
          </h4>

          {/* Release Date - Full format */}
          {release.releaseDate && (
            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-2">
              <Calendar size={14} />
              <span>{formatDate(release.releaseDate)}</span>
            </div>
          )}

          {/* Track Count */}
          {release.totalTracks > 0 && (
            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-3">
              <Music size={14} />
              <span>{release.totalTracks} {release.totalTracks === 1 ? "track" : "tracks"}</span>
            </div>
          )}

          {/* Spotify Embed Player - Show this instead of image when available */}
          {trackId && (
            <div className="mb-3">
              <SpotifyEmbed trackId={trackId} title={release.name} />
            </div>
          )}

          {/* Spotify Link - Only show if NO embed available */}
          {release.spotifyUrl && !trackId && (
            <a
              href={release.spotifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 transition-colors"
            >
              <ExternalLink size={12} className="sm:w-[14px] sm:h-[14px]" />
              Open in Spotify
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default PopularReleaseCard;