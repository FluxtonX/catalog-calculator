import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Music,
  ExternalLink,
  Users,
  TrendingUp,
  Album,
  Calendar,
  Youtube,
  Database,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
  Globe,
  Play,
  Eye,
  Rocket, // Added for Launch Valuation button
} from "lucide-react";
const BioText = ({ text }) => {
  const [expanded, setExpanded] = useState(false);

  // Clean the text: remove HTML tags and extra spaces
  const cleanText = text
    .replace(/<\/?[^>]+(>|$)/g, "") // Remove HTML tags
    .replace(/\s+/g, " ")
    .trim();

  return (
    <div className="text-gray-700 dark:text-gray-300 leading-relaxed">
      <p
        className={`transition-all duration-300 overflow-hidden ${
          expanded ? "line-clamp-none" : "line-clamp-5"
        }`}
      >
        {cleanText}
      </p>
      <button
        className="mt-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? "Show less" : "See more..."}
      </button>
    </div>
  );
};

// Mock Card Component
const Card = ({ children, className = "" }) => (
  <div
    className={`bg-white dark:bg-slate-900 rounded-xl shadow-lg ${className}`}
  >
    {children}
  </div>
);

// Mock Button Component
const Button = ({
  children,
  className = "",
  icon: Icon,
  onClick,
  variant = "primary",
  size = "md",
  disabled,
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${className}`}
  >
    {Icon && <Icon size={18} />}
    {children}
  </button>
);

// Mock Badge Component
const Badge = ({
  children,
  className = "",
  size = "md",
  variant = "default",
}) => (
  <span
    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${className}`}
  >
    {children}
  </span>
);

const ArtistCard = ({
  name,
  image,
  followers,
  popularity,
  genres,
  topTracks,
  relatedArtists,
  albums,
  stats,
  spotifyUrl,
  youtubeUrl,
  apifyUrl,
  platform,
  monthlyListeners,
  biography,
  topCities,
  externalLinks,
}) => {
  const navigate = useNavigate(); // Added for navigation
  const [activeTab, setActiveTab] = useState("tracks");

  // Platform configuration
  const platformData = {

    youtube: {
      url: youtubeUrl,
      icon: Youtube,
      label: "YouTube",
      color: "from-red-500 to-red-600",
    },
    apify: {
      url: apifyUrl || spotifyUrl,
      icon: Database,
      label: "Apify",
      color: "from-blue-500 to-indigo-600",
    },
  };

  const currentPlatform = platformData[platform] || platformData.spotify;

  // Helper to get social icon
  const getSocialIcon = (label) => {
    const iconMap = {
      facebook: Facebook,
      instagram: Instagram,
      twitter: Twitter,
      x: Twitter,
    };
    return iconMap[label?.toLowerCase()] || Globe;
  };

  // ADDED: Handler for Launch Valuation button
  const handleLaunchValuation = () => {
    navigate("/valuation/detail", {
      state: {
        artist: {
          name,
          image,
          followers,
          popularity,
          genres,
          topTracks,
          stats,
          monthlyListeners,
          platform,
        },
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Main Artist Info Card */}
      <Card className="bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20px 20px, white 2px, transparent 0)",
              backgroundSize: "40px 40px",
            }}
          ></div>
        </div>

        <div className="relative z-10 p-4 sm:p-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
            {/* Artist Image */}
            <div className="flex-shrink-0 mx-auto lg:mx-0">
              {image ? (
                <div className="relative group">
                  <img
                    src={image}
                    alt={name}
                    className="w-32 h-32 sm:w-48 sm:h-48 rounded-2xl object-cover shadow-2xl ring-4 ring-white/20"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://via.placeholder.com/192?text=No+Image";
                    }}
                  />
                  <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Music size={48} className="text-white" />
                  </div>
                </div>
              ) : (
                <div className="w-32 h-32 sm:w-48 sm:h-48 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <Music size={48} className="text-white/50" />
                </div>
              )}
            </div>

            {/* Artist Details */}
            <div className="flex-1 space-y-4 w-full">
              <div className="flex flex-col gap-4">
                <div>
                  <div className="flex items-center gap-2 sm:gap-3 mb-2 flex-wrap">
                    <Badge
                      variant="success"
                      className="bg-green-500 text-white"
                    >
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                        Live Data
                      </span>
                    </Badge>
                    <span className="text-white/70 text-xs sm:text-sm">
                      Real-time {currentPlatform.label} Stats
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
                    {name}
                  </h2>
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-white/90 text-sm sm:text-base">
                    <div className="flex items-center gap-2">
                      <Users size={18} />
                      <span className="font-semibold">{followers}</span>
                      <span className="text-white/70 hidden sm:inline">
                        Followers
                      </span>
                    </div>
                    {monthlyListeners && platform === "apify" && (
                      <div className="flex items-center gap-2">
                        <Play size={18} />
                        <span className="font-semibold">
                          {monthlyListeners}
                        </span>
                        <span className="text-white/70 hidden sm:inline">
                          Monthly Listeners
                        </span>
                      </div>
                    )}
                    {popularity && platform !== "apify" && (
                      <div className="flex items-center gap-2">
                        <TrendingUp size={18} />
                        <span className="font-semibold">{popularity}</span>
                        <span className="text-white/70 hidden sm:inline">
                          Popularity
                        </span>
                      </div>
                    )}
                  </div>
                </div>

          {/* Platform Buttons */}
<div className="flex flex-wrap gap-2">
  {/* YouTube Button */}
  {platform?.toLowerCase() === "youtube" && youtubeUrl ? (
    <Button
      variant="secondary"
      size="sm"
      className="bg-white/20 hover:bg-white/30 border-white/30 text-white"
      icon={Youtube}
      onClick={() => window.open(youtubeUrl, "_blank")}
    >
      Open in YouTube
    </Button>
  ) : null}

  {/* Spotify Button */}
  {platform?.toLowerCase() === "apify" && spotifyUrl ? (
    <Button
      variant="secondary"
      size="sm"
      className="bg-white/20 hover:bg-white/30 border-white/30 text-white"
      icon={Music}
      onClick={() => window.open(spotifyUrl, "_blank")}
    >
      Open in Spotify
    </Button>
  ) : null}

  {/* Launch Valuation Button */}
  <Button
    variant="primary"
    size="sm"
    className="bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white shadow-lg border-0"
    icon={Rocket}
    onClick={handleLaunchValuation}
  >
    Launch Valuation
  </Button>
</div>

              </div>

              {/* Genres */}
              {genres?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {genres.slice(0, 6).map((genre, i) => (
                    <Badge
                      key={i}
                      className="bg-white/10 backdrop-blur-sm text-white border border-white/20"
                      size="sm"
                    >
                      {genre}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Social Links - Apify Specific */}
              {platform === "apify" && externalLinks?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {externalLinks.map((link, i) => {
                    const Icon = getSocialIcon(link.label);
                    return (
                      <a
                        key={i}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg text-xs font-medium transition-all"
                      >
                        <Icon size={16} />
                        <span className="capitalize">{link.label}</span>
                      </a>
                    );
                  })}
                </div>
              )}

              {/* Stats Grid */}
              {stats && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-4">
                  {platform === "apify" ? (
                    <>
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                        <p className="text-white/70 text-xs mb-1">
                          Total Streams
                        </p>
                        <p className="text-xl sm:text-2xl font-bold">
                          {stats.totalStreams}
                        </p>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                        <p className="text-white/70 text-xs mb-1">
                          Avg Streams
                        </p>
                        <p className="text-xl sm:text-2xl font-bold">
                          {stats.averageStreams}
                        </p>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                        <p className="text-white/70 text-xs mb-1">Top Tracks</p>
                        <p className="text-xl sm:text-2xl font-bold">
                          {topTracks?.length || 0}
                        </p>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                        <p className="text-white/70 text-xs mb-1">Albums</p>
                        <p className="text-xl sm:text-2xl font-bold">
                          {albums?.length || 0}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                        <p className="text-white/70 text-xs mb-1">
                          Avg Popularity
                        </p>
                        <p className="text-xl sm:text-2xl font-bold">
                          {stats.averageTrackPopularity}
                        </p>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                        <p className="text-white/70 text-xs mb-1">
                          Total Albums
                        </p>
                        <p className="text-xl sm:text-2xl font-bold">
                          {stats.totalAlbums}
                        </p>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                        <p className="text-white/70 text-xs mb-1">Top Tracks</p>
                        <p className="text-xl sm:text-2xl font-bold">
                          {stats.totalTopTracks}
                        </p>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                        <p className="text-white/70 text-xs mb-1">Related</p>
                        <p className="text-xl sm:text-2xl font-bold">
                          {stats.totalRelatedArtists}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Biography - Apify Specific */}
      {platform === "apify" && biography && (
        <Card className="p-4 sm:p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            Biography
          </h3>

          {/* Bio with Read More */}
          <BioText text={biography} />
        </Card>
      )}

      {/* Tabbed Content */}
      <Card className="p-4 sm:p-6">
        <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          <button
            onClick={() => setActiveTab("tracks")}
            className={`px-4 sm:px-6 py-3 font-semibold transition-all duration-200 border-b-2 whitespace-nowrap ${
              activeTab === "tracks"
                ? "border-green-500 text-green-500"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            <span className="flex items-center gap-2">
              <Music size={18} />
              <span className="hidden sm:inline">Top Tracks</span>
              <span className="sm:hidden">Tracks</span>
            </span>
          </button>

          {platform !== "apify" && (
            <button
              onClick={() => setActiveTab("related")}
              className={`px-4 sm:px-6 py-3 font-semibold transition-all duration-200 border-b-2 whitespace-nowrap ${
                activeTab === "related"
                  ? "border-green-500 text-green-500"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <span className="flex items-center gap-2">
                <Users size={18} />
                <span className="hidden sm:inline">Related Artists</span>
                <span className="sm:hidden">Related</span>
              </span>
            </button>
          )}

          <button
            onClick={() => setActiveTab("albums")}
            className={`px-4 sm:px-6 py-3 font-semibold transition-all duration-200 border-b-2 whitespace-nowrap ${
              activeTab === "albums"
                ? "border-green-500 text-green-500"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            <span className="flex items-center gap-2">
              <Album size={18} />
              Albums
            </span>
          </button>

          {platform === "apify" && topCities?.length > 0 && (
            <button
              onClick={() => setActiveTab("cities")}
              className={`px-4 sm:px-6 py-3 font-semibold transition-all duration-200 border-b-2 whitespace-nowrap ${
                activeTab === "cities"
                  ? "border-green-500 text-green-500"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <span className="flex items-center gap-2">
                <MapPin size={18} />
                <span className="hidden sm:inline">Top Cities</span>
                <span className="sm:hidden">Cities</span>
              </span>
            </button>
          )}
        </div>

        <div className="min-h-[400px]">
          {/* Top Tracks Tab */}
          {activeTab === "tracks" && topTracks?.length > 0 && (
            <div className="space-y-3">
              {topTracks.map((track, idx) => (
                <div
                  key={track.id || idx}
                  className="group flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-gray-50 dark:bg-slate-800/50 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all duration-200"
                >
                  <div className="flex-shrink-0 w-6 sm:w-8 text-center">
                    <span className="text-lg sm:text-2xl font-bold text-gray-400 dark:text-gray-600">
                      {track.rank || idx + 1}
                    </span>
                  </div>

                  {track.albumImage && (
                    <img
                      src={track.albumImage}
                      alt={track.album}
                      className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover shadow-md"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white truncate">
                          {track.title}
                          {track.explicit && (
                            <Badge
                              className="ml-2 bg-gray-700 text-white"
                              size="sm"
                            >
                              E
                            </Badge>
                          )}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          {track.album && (
                            <span className="truncate">{track.album}</span>
                          )}
                          {track.releaseYear && (
                            <span className="flex items-center gap-1">
                              <Calendar
                                size={12}
                                className="hidden sm:inline"
                              />
                              {track.releaseYear}
                            </span>
                          )}
                          {track.durationFormatted && (
                            <span className="hidden sm:inline">
                              {track.durationFormatted}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Show stream count for Apify, popularity for others */}
                      {platform === "apify" && track.streamCountFormatted ? (
                        <Badge
                          className="flex-shrink-0 bg-blue-500 text-white"
                          size="sm"
                        >
                        <Eye size={12} className="mr-1 opacity-90" />
                          {track.streamCountFormatted}
                        </Badge>
                      ) : (
                        <Badge
                          className={`flex-shrink-0 ${
                            track.popularity >= 80
                              ? "bg-green-500"
                              : track.popularity >= 60
                                ? "bg-yellow-500"
                                : "bg-gray-500"
                          } text-white`}
                          size="sm"
                        >
                          {track.popularity}
                        </Badge>
                      )}
                    </div>

                    {track.previewUrl && platform !== "apify" && (
                      <div className="mt-3">
                        <audio
                          controls
                          className="w-full h-8 rounded"
                          style={{ maxWidth: "400px" }}
                        >
                          <source src={track.previewUrl} type="audio/mpeg" />
                        </audio>
                      </div>
                    )}

                    {(track.spotifyUrl || track.youtubeUrl) && (
                      <a
                        href={track.youtubeUrl || track.spotifyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-1 mt-2 text-xs sm:text-sm ${
                          platform === "youtube"
                            ? "text-red-600 hover:text-red-700 dark:text-red-400"
                            : platform === "apify"
                              ? "text-blue-600 hover:text-blue-700 dark:text-blue-400"
                              : "text-green-600 hover:text-green-700 dark:text-green-400"
                        }`}
                      >
                        <ExternalLink size={14} />
                        Open in {platform === "youtube" ? "YouTube" : "Spotify"}
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Related Artists Tab */}
          {activeTab === "related" && relatedArtists?.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {relatedArtists.map((artist, i) => (
                <div
                  key={artist.id || i}
                  className="group p-4 bg-gray-50 dark:bg-slate-800/50 rounded-xl hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
                >
                  <div className="flex flex-col items-center text-center space-y-3">
                    {artist.image ? (
                      <img
                        src={artist.image}
                        alt={artist.name}
                        className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover shadow-lg ring-2 ring-gray-200 dark:ring-gray-700"
                      />
                    ) : (
                      <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center">
                        <Music size={32} className="text-white" />
                      </div>
                    )}

                    <div className="w-full">
                      <h4 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white mb-2 line-clamp-2">
                        {artist.name}
                      </h4>

                      <div className="space-y-2 text-xs sm:text-sm">
                        <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400">
                          <Users size={14} />
                          <span>
                            {artist.followersFormatted || artist.followers}
                          </span>
                        </div>
                        <Badge
                          size="sm"
                          className={`${
                            artist.popularity >= 80
                              ? "bg-green-500"
                              : artist.popularity >= 60
                                ? "bg-yellow-500"
                                : "bg-gray-500"
                          } text-white`}
                        >
                          {artist.popularityFormatted || artist.popularity}
                        </Badge>
                      </div>

                      {artist.genres?.length > 0 && (
                        <div className="flex flex-wrap justify-center gap-1 mt-2">
                          {artist.genres.slice(0, 2).map((genre, idx) => (
                            <Badge
                              key={idx}
                              size="sm"
                              className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
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
                          className="inline-flex items-center gap-1 mt-3 text-xs sm:text-sm text-green-600 hover:text-green-700 dark:text-green-400"
                        >
                          <ExternalLink size={14} />
                          View Profile
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Albums Tab */}
          {activeTab === "albums" && albums?.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {albums.map((album, i) => (
                <div
                  key={album.id || i}
                  className="group bg-gray-50 dark:bg-slate-800/50 rounded-xl p-3 sm:p-4 hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
                >
                  {album.image ? (
                    <img
                      src={album.image}
                      alt={album.name}
                      className="w-full aspect-square rounded-lg object-cover shadow-md mb-3"
                    />
                  ) : (
                    <div className="w-full aspect-square rounded-lg bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center mb-3">
                      <Album
                        size={40}
                        className="text-gray-500 dark:text-gray-600"
                      />
                    </div>
                  )}

                  <div>
                    <h4 className="font-semibold text-xs sm:text-sm text-gray-900 dark:text-white mb-1 line-clamp-2">
                      {album.name}
                    </h4>
                    <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-2">
                      <span>{album.releaseYear}</span>
                      {album.type && (
                        <Badge
                          size="sm"
                          className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs"
                        >
                          {album.type}
                        </Badge>
                      )}
                    </div>
                    {album.totalTracks && (
                      <p className="text-xs text-gray-500">
                        {album.totalTracks} track
                        {album.totalTracks !== 1 ? "s" : ""}
                      </p>
                    )}

                    {album.spotifyUrl && (
                      <a
                        href={album.spotifyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-2 text-xs text-green-600 hover:text-green-700 dark:text-green-400"
                      >
                        <ExternalLink size={12} />
                        Open
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Top Cities Tab - Apify Specific */}
          {activeTab === "cities" &&
            platform === "apify" &&
            topCities?.length > 0 && (
              <div className="space-y-3">
                {topCities.map((city, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-slate-800/50 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-gray-400 dark:text-gray-600">
                        {idx + 1}
                      </span>
                      <MapPin size={20} className="text-blue-500" />
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {city.city}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {city.country}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-blue-500 text-white">
                      <Eye size={12} className="mr-1" />
                      {city.listenersFormatted}
                    </Badge>
                  </div>
                ))}
              </div>
            )}

          {/* Empty States */}
          {activeTab === "tracks" && (!topTracks || topTracks.length === 0) && (
            <div className="text-center py-12">
              <Music size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                No top tracks available
              </p>
            </div>
          )}
          {activeTab === "related" &&
            (!relatedArtists || relatedArtists.length === 0) && (
              <div className="text-center py-12">
                <Users size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  No related artists found
                </p>
              </div>
            )}
          {activeTab === "albums" && (!albums || albums.length === 0) && (
            <div className="text-center py-12">
              <Album size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                No albums available
              </p>
            </div>
          )}
          {activeTab === "cities" && (!topCities || topCities.length === 0) && (
            <div className="text-center py-12">
              <MapPin size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                No city data available
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
export default ArtistCard;
