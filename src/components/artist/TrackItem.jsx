// src/components/artist/TrackItem.jsx
import React from "react";
import { Calendar, Play, ExternalLink, TrendingUp } from "lucide-react";
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

  const displayDate = track.releaseDate 
    ? formatDate(track.releaseDate) 
    : track.releaseYear 
      ? track.releaseYear 
      : null;

  // Returns Tailwind classes that look great in both light & dark mode
  const getPopularityStyle = (score) => {
    if (score >= 80) return {
      badge: "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40",
      label: "🔥 Hot",
    };
    if (score >= 60) return {
      badge: "bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300 border border-violet-300 dark:border-violet-500/40",
      label: "⚡ Popular",
    };
    if (score >= 40) return {
      badge: "bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-500/40",
      label: "📈 Growing",
    };
    if (score >= 20) return {
      badge: "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40",
      label: "⭐ Emerging",
    };
    return {
      badge: "bg-slate-100 dark:bg-slate-500/20 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-500/40",
      label: "💎 Hidden Gem",
    };
  };

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
            ) : track.popularity && platform !== "youtube" ? (() => {
              const style = getPopularityStyle(track.popularity);
              return (
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${style.badge}`}>
                    {style.label}
                    <span className="opacity-60 font-normal">{track.popularity}/100</span>
                  </span>
                  <span className="flex items-center gap-0.5 text-[10px] text-slate-400 dark:text-slate-500">
                    <TrendingUp size={9} />
                    Popularity Score
                  </span>
                </div>
              );
            })() : null}
          </div>
        </div>
      </div>

      {/* Spotify Embed Player */}
      {trackId && platform === "apify" && (
        <SpotifyEmbed trackId={trackId} title={track.title} />
      )}

      {/* HTML5 Audio Player */}
      {track.previewUrl && platform !== "apify" && (
        <div className="mt-2 w-full">
          <audio
            controls
            className="w-full h-10 rounded-lg"
            preload="none"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              e.currentTarget.nextElementSibling?.style.removeProperty("display");
            }}
          >
            <source src={track.previewUrl} type="audio/mpeg" />
          </audio>
          <a
            href={track.appleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden text-xs font-semibold text-pink-500 hover:text-pink-600 whitespace-nowrap"
            style={{ display: "none" }}
          >
            Preview on Apple Music ↗
          </a>
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