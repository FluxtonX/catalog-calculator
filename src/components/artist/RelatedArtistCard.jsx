// src/components/artist/RelatedArtistCard.jsx
import React from "react";
import { Music, Users, ExternalLink } from "lucide-react";
import Badge from "../common/Badge";

const RelatedArtistCard = ({ artist, index }) => {
  return (
    <div
      key={artist.id || index}
      className="group p-3 sm:p-5 bg-slate-50 dark:bg-slate-800/50 rounded-xl sm:rounded-2xl hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-slate-200 dark:border-slate-700 hover:border-emerald-500/50 dark:hover:border-emerald-500/50"
    >
      <div className="flex flex-col items-center text-center space-y-3 sm:space-y-4">
        {artist.image ? (
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-full blur-lg opacity-0 group-hover:opacity-50 transition-opacity" />
            <img
              src={artist.image}
              alt={artist.name}
              className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover shadow-lg ring-4 ring-slate-200 dark:ring-slate-700 group-hover:ring-emerald-500/50 transition-all"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center shadow-lg">
            <Music size={32} className="text-white sm:w-10 sm:h-10" />
          </div>
        )}

        <div className="w-full">
          <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white mb-2 sm:mb-3 line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            {artist.name}
          </h4>

          <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-slate-600 dark:text-slate-400">
              <Users size={14} className="sm:w-4 sm:h-4" />
              <span className="font-semibold truncate">
                {artist.followersFormatted || artist.followers}
              </span>
            </div>
            <Badge
              size="sm"
              className={`${
                artist.popularity >= 80
                  ? "bg-gradient-to-r from-emerald-500 to-green-600"
                  : artist.popularity >= 60
                    ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                    : "bg-gradient-to-r from-slate-500 to-slate-600"
              } text-white`}
            >
              {artist.popularityFormatted || artist.popularity}
            </Badge>
          </div>

          {artist.genres?.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1 mt-2 sm:mt-3">
              {artist.genres.slice(0, 2).map((genre, idx) => (
                <Badge
                  key={idx}
                  size="sm"
                  className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                >
                  {genre}
                </Badge>
              ))}
            </div>
          )}

          {artist.spotifyUrl && (
            <a
              href={artist.spotifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-3 sm:mt-4 text-xs sm:text-sm font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 transition-colors"
            >
              <ExternalLink size={12} className="sm:w-[14px] sm:h-[14px]" />
              View Profile
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default RelatedArtistCard;