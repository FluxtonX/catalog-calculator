// src/components/artist/AlbumCard.jsx
import React from "react";
import { Music, Calendar, Disc3, ExternalLink } from "lucide-react";

// eslint-disable-next-line no-unused-vars
const AlbumCard = ({ album, index, platform }) => {
  const isItunes = platform === "itunes";

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

  // Prefer appleUrl for iTunes, otherwise generate Spotify URL
  const linkUrl = album.appleUrl || (album.id ? `https://open.spotify.com/album/${album.id}` : null);
  const linkLabel = isItunes || album.appleUrl ? "Apple Music" : "Open in Spotify";
  const linkColor = isItunes || album.appleUrl
    ? "text-pink-600 hover:text-pink-700 dark:text-pink-400"
    : "text-emerald-600 hover:text-emerald-700 dark:text-emerald-400";

  const hoverBorder = isItunes
    ? "hover:border-pink-500/50 dark:hover:border-pink-500/50"
    : "hover:border-emerald-500/50 dark:hover:border-emerald-500/50";
console.log('Album image URL:', album.name, album.image);
  return (
    <div className={`group bg-slate-50 dark:bg-slate-800/50 rounded-xl sm:rounded-2xl p-3 sm:p-4 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-slate-200 dark:border-slate-700 ${hoverBorder}`}>
      {album.image ? (
        <div className="relative mb-3 sm:mb-4">
          <div className={`absolute inset-0 bg-gradient-to-br ${isItunes ? "from-pink-500 to-rose-500" : "from-emerald-500 to-blue-500"} rounded-lg sm:rounded-xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity`} />
          <img
            src={album.image}
            alt={album.name}
            className="relative w-full aspect-square rounded-lg sm:rounded-xl object-cover shadow-md ring-2 ring-slate-200 dark:ring-slate-700 group-hover:ring-pink-500/50 transition-all"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              e.currentTarget.nextElementSibling?.style.setProperty("display", "flex");
            }}
          />
          <div
            className="w-full aspect-square rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 flex items-center justify-center shadow-md"
            style={{ display: "none" }}
          >
            <Disc3 size={48} className="text-white drop-shadow-lg sm:w-16 sm:h-16" />
          </div>
        </div>
      ) : (
        <div className={`w-full aspect-square rounded-lg sm:rounded-xl bg-gradient-to-br ${isItunes ? "from-pink-400 via-rose-500 to-red-600" : "from-blue-400 via-indigo-500 to-purple-600"} flex items-center justify-center mb-3 sm:mb-4 shadow-md`}>
          <Disc3 size={48} className="text-white drop-shadow-lg sm:w-16 sm:h-16" />
        </div>
      )}

      <div>
        <h4 className={`font-bold text-xs sm:text-sm text-slate-900 dark:text-white mb-1.5 sm:mb-2 line-clamp-2 transition-colors ${isItunes ? "group-hover:text-pink-600 dark:group-hover:text-pink-400" : "group-hover:text-emerald-600 dark:group-hover:text-emerald-400"}`}>
          {album.name}
        </h4>
        <div className="flex items-center justify-between text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 mb-1.5 sm:mb-2">
          <span className="font-semibold flex items-center gap-0.5 sm:gap-1">
            <Calendar size={10} className="sm:w-3 sm:h-3" />
            {formatDate(album.releaseDate)}
          </span>
        </div>
        {album.totalTracks > 0 && (
          <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mb-2 sm:mb-3 flex items-center gap-0.5 sm:gap-1">
            <Music size={10} className="sm:w-3 sm:h-3" />
      {album.totalTracks} song{album.totalTracks !== 1 ? "s" : ""} in album
          </p>
        )}

        {linkUrl && (
          <a
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs font-semibold transition-colors group-hover:underline ${linkColor}`}
          >
            <ExternalLink size={10} className="sm:w-3 sm:h-3" />
            <span className="hidden xs:inline">{linkLabel}</span>
            <span className="xs:hidden">{isItunes || album.appleUrl ? "Apple" : "Spotify"}</span>
          </a>
        )}
      </div>
    </div>
  );
};

export default AlbumCard;