// src/components/artist/SingleCard.jsx
import React from "react";
import { Calendar, ExternalLink, Music } from "lucide-react";
import Badge from "../common/Badge";
import SpotifyEmbed from "./SpotifyEmbed";

// eslint-disable-next-line no-unused-vars
const SingleCard = ({ single, index, platform }) => {
  const isItunes = platform === "itunes";

  const extractSpotifyId = (url) => {
    if (!url) return null;
    // eslint-disable-next-line no-useless-escape
    const match = url.match(/track[\/:]([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const trackId = !isItunes ? extractSpotifyId(single.spotifyUrl) : null;
  const externalUrl = single.appleUrl || single.spotifyUrl;
  const hoverBorder = isItunes
    ? "hover:border-pink-500/50 dark:hover:border-pink-500/50"
    : "hover:border-blue-500/50 dark:hover:border-blue-500/50";
  const linkColor = isItunes
    ? "text-pink-600 hover:text-pink-700 dark:text-pink-400"
    : "text-blue-600 hover:text-blue-700 dark:text-blue-400";
  const nameHover = isItunes
    ? "group-hover:text-pink-600 dark:group-hover:text-pink-400"
    : "group-hover:text-blue-600 dark:group-hover:text-blue-400";

  return (
    <div className={`group p-3 sm:p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-700 ${hoverBorder}`}>
      <div className="flex flex-col gap-3">
        {/* Cover — only show if no Spotify embed */}
        {!trackId && (
          <div className="relative overflow-hidden rounded-lg">
            {single.image ? (
              <img
                src={single.image}
                alt={single.name}
                className="w-full aspect-square object-cover transition-transform duration-300 group-hover:scale-110"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.nextElementSibling?.style.setProperty("display", "flex");
                }}
              />
            ) : null}
            <div
              className={`w-full aspect-square bg-gradient-to-br ${isItunes ? "from-pink-400 to-rose-500" : "from-blue-400 to-purple-500"} flex items-center justify-center`}
              style={{ display: single.image ? "none" : "flex" }}
            >
              <Music size={48} className="text-white opacity-50" />
            </div>
            <div className="absolute top-2 right-2">
              <Badge size="sm" className={`${isItunes ? "bg-pink-500" : "bg-blue-500"} text-white backdrop-blur-sm bg-opacity-90`}>
                SINGLE
              </Badge>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="flex flex-col">
          <h4 className={`font-bold text-sm sm:text-base text-slate-900 dark:text-white mb-2 line-clamp-2 transition-colors ${nameHover}`}>
            {single.name}
          </h4>

          {single.releaseDate && (
            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-3">
              <Calendar size={14} />
              <span>{formatDate(single.releaseDate)}</span>
            </div>
          )}

          {/* Spotify embed (non-iTunes only) */}
          {trackId && (
            <div className="mb-3">
              <SpotifyEmbed trackId={trackId} title={single.name} />
            </div>
          )}

          {/* Apple Music audio preview */}
          {isItunes && single.previewUrl && (
            <div className="mb-3">
              <audio controls className="w-full h-10 rounded-lg" style={{ maxWidth: "400px" }} preload="none">
                <source src={single.previewUrl} type="audio/mpeg" />
              </audio>
            </div>
          )}

          {/* External link */}
          {externalUrl && !trackId && (
            <a
              href={externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1 text-xs sm:text-sm font-semibold transition-colors ${linkColor}`}
            >
              <ExternalLink size={12} className="sm:w-[14px] sm:h-[14px]" />
              {isItunes ? "Open in Apple Music" : "Open in Spotify"}
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default SingleCard;