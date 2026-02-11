// src/components/artist/TrackItem.jsx
import React from "react";
import { Calendar, Play, ExternalLink } from "lucide-react";
import Badge from "../common/Badge";
import SpotifyEmbed from "./SpotifyEmbed";

/**
 * Individual track card component
 */
const TrackItem = ({ track, index, platform, extractSpotifyId }) => {
  const trackId = extractSpotifyId ? extractSpotifyId(track.spotifyUrl) : null;

  // Format the full release date
  const formatDate = (dateString) => {
    if (!dateString) return null;
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

  // Determine what date to display - prioritize full date over year
  const displayDate = track.releaseDate 
    ? formatDate(track.releaseDate) 
    : track.releaseYear 
      ? track.releaseYear 
      : null;

  return (
    <div className="group flex flex-col gap-3 p-3 sm:p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300 border border-slate-200 dark:border-slate-700 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:shadow-lg">
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="flex-shrink-0 w-8 sm:w-10 text-center">
          <span className="text-xl sm:text-2xl font-bold text-slate-400 dark:text-slate-600 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            {track.rank || index + 1}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 sm:gap-4">
            <div className="min-w-0 flex-1">
              <h4 className="font-bold text-sm sm:text-lg text-slate-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {track.title}
                {track.explicit && (
                  <Badge className="ml-2 bg-slate-700 text-white" size="sm">
                    E
                  </Badge>
                )}
              </h4>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1 sm:mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                {track.album && (
                  <span className="truncate font-medium max-w-[150px] sm:max-w-none">
                    {track.album}
                  </span>
                )}
                {displayDate && (
                  <span className="flex items-center gap-1 flex-shrink-0">
                    <Calendar size={12} className="sm:w-[14px] sm:h-[14px]" />
                    {displayDate}
                  </span>
                )}
                {track.durationFormatted && (
                  <span className="flex-shrink-0">{track.durationFormatted}</span>
                )}
              </div>
            </div>

            {platform === "apify" && track.streamCountFormatted ? (
              <Badge
                className="flex-shrink-0 bg-gradient-to-r from-emerald-500 to-green-600 text-white whitespace-nowrap"
                size="sm"
              >
                <Play size={10} className="mr-1 sm:w-[12px] sm:h-[12px]" />
                <span className="hidden xs:inline">{track.streamCountFormatted}</span>
                <span className="xs:hidden">{track.streamCountFormatted.replace(/\s/g, '')}</span>
              </Badge>
            ) : track.popularity ? (
              <Badge
                className={`flex-shrink-0 ${
                  track.popularity >= 80
                    ? "bg-gradient-to-r from-emerald-500 to-green-600"
                    : track.popularity >= 60
                      ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                      : "bg-gradient-to-r from-slate-500 to-slate-600"
                } text-white`}
                size="sm"
              >
                {track.popularity}
              </Badge>
            ) : null}
          </div>
        </div>
      </div>

      {/* Spotify Embed Player */}
      {trackId && platform === "apify" && (
        <SpotifyEmbed trackId={trackId} title={track.title} />
      )}

      {/* HTML5 Audio Player */}
      {track.previewUrl && platform !== "apify" && (
        <div className="mt-2">
          <audio
            controls
            className="w-full h-10 rounded-lg"
            style={{ maxWidth: "400px" }}
            preload="none"
          >
            <source src={track.previewUrl} type="audio/mpeg" />
          </audio>
        </div>
      )}

      {/* External Links */}
      {track.youtubeUrl && platform === "youtube" && (
        <a
          href={track.youtubeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-red-600 hover:text-red-700 dark:text-red-400 transition-colors"
        >
          <ExternalLink size={12} className="sm:w-[14px] sm:h-[14px]" />
          Open in YouTube
        </a>
      )}
    </div>
  );
};

export default TrackItem;