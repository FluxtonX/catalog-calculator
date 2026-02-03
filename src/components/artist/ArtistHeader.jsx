// src/components/artist/ArtistHeader.jsx
import React from "react";
import { Music, Users, TrendingUp, Play, Disc3, Youtube, Rocket } from "lucide-react";
import Badge from "../common/Badge";
import Button from "../common/Button";
import AnimatedBackground from "../common/AnimatedBackground";

const ArtistHeader = ({
  name,
  image,
  followers,
  monthlyListeners,
  popularity,
  genres,
  platform,
  spotifyUrl,
  youtubeUrl,
  externalLinks,
  onLaunchValuation,
  getSocialIcon,
}) => {
  const isApify = platform === "apify";
  const isYoutube = platform === "youtube";

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-white overflow-hidden relative rounded-2xl shadow-2xl">
      <AnimatedBackground />

      <div className="relative z-10 p-4 sm:p-6 lg:p-10">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 sm:gap-6 lg:gap-8">
          {/* Artist Image */}
          <div className="flex-shrink-0 mx-auto lg:mx-0">
            {image ? (
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-2xl sm:rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                <img
                  src={image}
                  alt={name}
                  className="relative w-32 h-32 sm:w-52 sm:h-52 lg:w-64 lg:h-64 rounded-2xl sm:rounded-3xl object-cover shadow-2xl ring-4 ring-white/30 group-hover:ring-white/50 transition-all"
                  loading="eager"
                  onError={(e) => {
                    e.currentTarget.src = "https://via.placeholder.com/256?text=No+Image";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4 sm:pb-6">
                  <Music size={32} className="sm:w-12 sm:h-12 text-white drop-shadow-lg" />
                </div>
              </div>
            ) : (
              <div className="w-32 h-32 sm:w-52 sm:h-52 lg:w-64 lg:h-64 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center backdrop-blur-sm ring-4 ring-white/20">
                <Music size={48} className="sm:w-16 sm:h-16 text-white/50" />
              </div>
            )}
          </div>

          {/* Artist Details */}
          <div className="flex-1 w-full">
            {/* Status Badges */}
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 flex-wrap">
              <Badge
                variant="success"
                className="bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg"
                size="sm"
              >
                <span className="flex items-center gap-1.5 sm:gap-2">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-pulse shadow-lg shadow-white/50"></span>
                  Live Data
                </span>
              </Badge>
              <span className="text-white/80 text-xs sm:text-sm font-medium flex items-center gap-1.5 sm:gap-2">
                <Disc3
                  size={14}
                  className="animate-spin sm:w-4 sm:h-4"
                  style={{ animationDuration: "3s" }}
                />
                <span className="hidden xs:inline">Real-time {isApify ? "Spotify" : "YouTube"} Stats</span>
                <span className="xs:hidden">{isApify ? "Spotify" : "YouTube"}</span>
              </span>
            </div>

            {/* Artist Name */}
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-5 bg-gradient-to-r from-white via-white to-white/80 bg-clip-text leading-tight">
              {name}
            </h2>

            {/* Follower Stats */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="flex items-center gap-2 sm:gap-3 bg-white/10 backdrop-blur-sm px-3 py-2 sm:px-5 sm:py-3 rounded-lg sm:rounded-xl border border-white/20">
                <Users size={16} className="text-white/90 sm:w-5 sm:h-5" />
                <div className="flex items-baseline gap-1 sm:gap-2">
                  <span className="font-bold text-base sm:text-xl text-white">
                    {followers}
                  </span>
                  <span className="text-white/60 text-xs sm:text-sm font-medium hidden xs:inline">
                    Followers
                  </span>
                </div>
              </div>

              {monthlyListeners && isApify && (
                <div className="flex items-center gap-2 sm:gap-3 bg-white/10 backdrop-blur-sm px-3 py-2 sm:px-5 sm:py-3 rounded-lg sm:rounded-xl border border-white/20">
                  <Play size={16} className="text-white/90 sm:w-5 sm:h-5" />
                  <div className="flex items-baseline gap-1 sm:gap-2">
                    <span className="font-bold text-base sm:text-xl text-white">
                      {monthlyListeners}
                    </span>
                    <span className="text-white/60 text-xs sm:text-sm font-medium hidden sm:inline">
                      Monthly Listeners
                    </span>
                  </div>
                </div>
              )}

              {popularity && !isApify && (
                <div className="flex items-center gap-2 sm:gap-3 bg-white/10 backdrop-blur-sm px-3 py-2 sm:px-5 sm:py-3 rounded-lg sm:rounded-xl border border-white/20">
                  <TrendingUp size={16} className="text-white/90 sm:w-5 sm:h-5" />
                  <div className="flex items-baseline gap-1 sm:gap-2">
                    <span className="font-bold text-base sm:text-xl text-white">
                      {popularity}
                    </span>
                    <span className="text-white/60 text-xs sm:text-sm font-medium hidden xs:inline">
                      Popularity
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mb-4 sm:mb-6">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                {isYoutube && youtubeUrl && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="bg-white/10 hover:bg-white/20 border border-white/25 hover:border-white/40 text-white backdrop-blur-xl transition-all duration-200"
                    icon={Youtube}
                    onClick={() => window.open(youtubeUrl, "_blank")}
                  >
                    <span className="hidden xs:inline">Open in YouTube</span>
                    <span className="xs:hidden">YouTube</span>
                  </Button>
                )}

                {isApify && spotifyUrl && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="bg-white/10 hover:bg-white/20 border border-white/25 hover:border-white/40 text-white backdrop-blur-xl transition-all duration-200"
                    icon={Music}
                    onClick={() => window.open(spotifyUrl, "_blank")}
                  >
                    <span className="hidden xs:inline">Open in Spotify</span>
                    <span className="xs:hidden">Spotify</span>
                  </Button>
                )}

                <Button
                  variant="primary"
                  size="sm"
                  className="relative overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white border-0 font-semibold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40 transition-all duration-200"
                  icon={Rocket}
                  onClick={onLaunchValuation}
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                  <span className="relative">
                    <span className="hidden xs:inline">Launch Valuation</span>
                    <span className="xs:hidden">Valuation</span>
                  </span>
                </Button>
              </div>
            </div>

            {/* Genres */}
            {genres?.length > 0 && (
              <div className="mb-4 sm:mb-6">
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {genres.slice(0, 6).map((genre, i) => (
                    <Badge
                      key={i}
                      className="bg-white/8 backdrop-blur-sm text-white/90 border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-200"
                      size="sm"
                    >
                      {genre}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Social Links */}
            {isApify && externalLinks?.length > 0 && (
              <div className="mb-4 sm:mb-6">
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {externalLinks.map((link, i) => {
                    const Icon = getSocialIcon(link.label);
                    return (
                      <a
                        key={i}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-4 sm:py-2.5 bg-white/8 hover:bg-white/15 backdrop-blur-sm border border-white/20 hover:border-white/30 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium text-white/90 transition-all duration-200"
                      >
                        <Icon size={14} className="sm:w-4 sm:h-4" />
                        <span className="capitalize">{link.label}</span>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtistHeader;