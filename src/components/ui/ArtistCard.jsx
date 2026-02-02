import React, { useState, useEffect } from "react";
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
  Rocket,
  Disc3,
  ChevronRight,
} from "lucide-react";
import { getSpotifyAlbumImages } from "../../utils/api";

const BioText = ({ text }) => {
  const [expanded, setExpanded] = useState(false);

  const cleanText = text
    .replace(/<\/?[^>]+(>|$)/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return (
    <div className="text-slate-700 dark:text-slate-300 leading-relaxed">
      <p
        className={`transition-all duration-300 ${
          expanded ? "line-clamp-none" : "line-clamp-5"
        }`}
      >
        {cleanText}
      </p>
      <button
        className="mt-3 text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors flex items-center gap-1 group"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? "Show less" : "Read more"}
        <ChevronRight
          size={14}
          className={`transition-transform ${expanded ? "rotate-90" : ""}`}
        />
      </button>
    </div>
  );
};

const Card = ({ children, className = "" }) => (
  <div
    className={`bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 ${className}`}
  >
    {children}
  </div>
);

const Button = ({
  children,
  className = "",
  icon: Icon,
  onClick,
  variant = "primary",
  size = "md",
  disabled,
}) => {
  const baseStyles =
    "inline-flex items-center gap-2 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl";
  const sizeStyles = {
    sm: "px-4 py-2 text-sm",
    md: "px-5 py-2.5 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${sizeStyles[size]} ${className} disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95`}
    >
      {Icon && <Icon size={18} />}
      {children}
    </button>
  );
};

const Badge = ({
  children,
  className = "",
  size = "md",
  variant = "default",
}) => {
  const sizeStyles = {
    sm: "px-2.5 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold shadow-sm ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
};

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
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("tracks");
  const [enhancedAlbums, setEnhancedAlbums] = useState(albums);

  // Helper function to extract Spotify track ID from URL
  const extractSpotifyId = (url) => {
    if (!url) return null;
    
    // Handle different Spotify URL formats
    // https://open.spotify.com/track/3n3Ppam7vgaVa1iaRUc9Lp
    // spotify:track:3n3Ppam7vgaVa1iaRUc9Lp
    const match = url.match(/track[\/:]([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
  };

  const platformData = {
    youtube: {
      url: youtubeUrl,
      icon: Youtube,
      label: "YouTube",
      color: "from-red-500 via-rose-500 to-pink-600",
    },
    apify: {
      url: apifyUrl || spotifyUrl,
      icon: Database,
      label: "Spotify",
      color: "from-emerald-500 via-green-500 to-teal-600",
    },
  };

  const currentPlatform = platformData[platform] || platformData.apify;

  const getSocialIcon = (label) => {
    const iconMap = {
      facebook: Facebook,
      instagram: Instagram,
      twitter: Twitter,
      x: Twitter,
    };
    return iconMap[label?.toLowerCase()] || Globe;
  };

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

  useEffect(() => {
    const enhanceAlbumsWithSpotifyImages = async () => {
      if (!albums || albums.length === 0) return;

      try {
        const albumNames = albums.map((a) => a.name);
        const spotifyImages = await getSpotifyAlbumImages(name, albumNames);

        const merged = albums.map((album) => {
          const spotifyData = spotifyImages.find(
            (s) => s.albumName?.toLowerCase() === album.name?.toLowerCase(),
          );
          return {
            ...album,
            image: spotifyData?.image || album.image,
          };
        });

        setEnhancedAlbums(merged);
      } catch (err) {
        console.error("Error enhancing albums:", err);
        setEnhancedAlbums(albums);
      }
    };

    enhanceAlbumsWithSpotifyImages();
  }, [albums, name]);

  return (
    <div className="space-y-6">
      {/* Main Artist Info Card */}
      <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-white overflow-hidden relative">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-emerald-500/20 to-transparent rounded-full blur-3xl animate-pulse" />
          <div
            className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-500/20 to-transparent rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          />
        </div>

        <div className="relative z-10 p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 lg:gap-8">
            {/* Artist Image */}
            <div className="flex-shrink-0 mx-auto lg:mx-0">
              {image ? (
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                  <img
                    src={image}
                    alt={name}
                    className="relative w-40 h-40 sm:w-52 sm:h-52 lg:w-64 lg:h-64 rounded-3xl object-cover shadow-2xl ring-4 ring-white/30 group-hover:ring-white/50 transition-all"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://via.placeholder.com/256?text=No+Image";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-6">
                    <Music size={48} className="text-white drop-shadow-lg" />
                  </div>
                </div>
              ) : (
                <div className="w-40 h-40 sm:w-52 sm:h-52 lg:w-64 lg:h-64 rounded-3xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center backdrop-blur-sm ring-4 ring-white/20">
                  <Music size={64} className="text-white/50" />
                </div>
              )}
            </div>

            {/* Artist Details */}
            <div className="flex-1 w-full">
              {/* Top Section: Artist Identity */}
              <div className="mb-6">
                {/* Status Badges */}
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  <Badge
                    variant="success"
                    className="bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg"
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse shadow-lg shadow-white/50"></span>
                      Live Data
                    </span>
                  </Badge>
                  <span className="text-white/80 text-sm font-medium flex items-center gap-2">
                    <Disc3
                      size={16}
                      className="animate-spin"
                      style={{ animationDuration: "3s" }}
                    />
                    Real-time {currentPlatform.label} Stats
                  </span>
                </div>

                {/* Artist Name */}
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-5 bg-gradient-to-r from-white via-white to-white/80 bg-clip-text leading-tight">
                  {name}
                </h2>

                {/* Follower Stats Row */}
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-5 py-3 rounded-xl border border-white/20">
                    <Users size={20} className="text-white/90" />
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-xl text-white">
                        {followers}
                      </span>
                      <span className="text-white/60 text-sm font-medium">
                        Followers
                      </span>
                    </div>
                  </div>

                  {monthlyListeners && platform === "apify" && (
                    <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-5 py-3 rounded-xl border border-white/20">
                      <Play size={20} className="text-white/90" />
                      <div className="flex items-baseline gap-2">
                        <span className="font-bold text-xl text-white">
                          {monthlyListeners}
                        </span>
                        <span className="text-white/60 text-sm font-medium">
                          Monthly Listeners
                        </span>
                      </div>
                    </div>
                  )}

                  {popularity && platform !== "apify" && (
                    <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-5 py-3 rounded-xl border border-white/20">
                      <TrendingUp size={20} className="text-white/90" />
                      <div className="flex items-baseline gap-2">
                        <span className="font-bold text-xl text-white">
                          {popularity}
                        </span>
                        <span className="text-white/60 text-sm font-medium">
                          Popularity
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons Section */}
              <div className="mb-6">
                <div className="flex flex-wrap items-center gap-3">
                  {platform?.toLowerCase() === "youtube" && youtubeUrl && (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="bg-white/10 hover:bg-white/20 border border-white/25 hover:border-white/40 text-white backdrop-blur-xl transition-all duration-200"
                      icon={Youtube}
                      onClick={() => window.open(youtubeUrl, "_blank")}
                    >
                      Open in YouTube
                    </Button>
                  )}

                  {platform?.toLowerCase() === "apify" && spotifyUrl && (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="bg-white/10 hover:bg-white/20 border border-white/25 hover:border-white/40 text-white backdrop-blur-xl transition-all duration-200"
                      icon={Music}
                      onClick={() => window.open(spotifyUrl, "_blank")}
                    >
                      Open in Spotify
                    </Button>
                  )}

                  <Button
                    variant="primary"
                    size="sm"
                    className="relative overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white border-0 font-semibold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40 transition-all duration-200"
                    icon={Rocket}
                    onClick={handleLaunchValuation}
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                    <span className="relative">Launch Valuation</span>
                  </Button>
                </div>
              </div>

              {/* Genres Section */}
              {genres?.length > 0 && (
                <div className="mb-6">
                  <div className="flex flex-wrap gap-2">
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

              {/* Social Links Section */}
              {platform === "apify" && externalLinks?.length > 0 && (
                <div className="mb-6">
                  <div className="flex flex-wrap gap-2">
                    {externalLinks.map((link, i) => {
                      const Icon = getSocialIcon(link.label);
                      return (
                        <a
                          key={i}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/8 hover:bg-white/15 backdrop-blur-sm border border-white/20 hover:border-white/30 rounded-xl text-sm font-medium text-white/90 transition-all duration-200"
                        >
                          <Icon size={16} />
                          <span className="capitalize">{link.label}</span>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Stats Grid - Four Cards */}
              {stats && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {platform === "apify" ? (
                    <>
                      <div className="bg-white/8 backdrop-blur-sm rounded-xl p-5 border border-white/20 hover:bg-white/10 hover:border-white/30 transition-all duration-200">
                        <p className="text-white/60 text-xs font-semibold mb-2 uppercase tracking-wider">
                          Total Streams
                        </p>
                        <p className="text-3xl font-bold text-white">
                          {stats.totalStreams}
                        </p>
                      </div>
                      <div className="bg-white/8 backdrop-blur-sm rounded-xl p-5 border border-white/20 hover:bg-white/10 hover:border-white/30 transition-all duration-200">
                        <p className="text-white/60 text-xs font-semibold mb-2 uppercase tracking-wider">
                          Avg Streams
                        </p>
                        <p className="text-3xl font-bold text-white">
                          {stats.averageStreams}
                        </p>
                      </div>
                      <div className="bg-white/8 backdrop-blur-sm rounded-xl p-5 border border-white/20 hover:bg-white/10 hover:border-white/30 transition-all duration-200">
                        <p className="text-white/60 text-xs font-semibold mb-2 uppercase tracking-wider">
                          Top Tracks
                        </p>
                        <p className="text-3xl font-bold text-white">
                          {topTracks?.length || 0}
                        </p>
                      </div>
                      <div className="bg-white/8 backdrop-blur-sm rounded-xl p-5 border border-white/20 hover:bg-white/10 hover:border-white/30 transition-all duration-200">
                        <p className="text-white/60 text-xs font-semibold mb-2 uppercase tracking-wider">
                          Albums
                        </p>
                        <p className="text-3xl font-bold text-white">
                          {albums?.length || 0}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="bg-white/8 backdrop-blur-sm rounded-xl p-5 border border-white/20 hover:bg-white/10 hover:border-white/30 transition-all duration-200">
                        <p className="text-white/60 text-xs font-semibold mb-2 uppercase tracking-wider">
                          Avg Popularity
                        </p>
                        <p className="text-3xl font-bold text-white">
                          {stats.averageTrackPopularity}
                        </p>
                      </div>
                      <div className="bg-white/8 backdrop-blur-sm rounded-xl p-5 border border-white/20 hover:bg-white/10 hover:border-white/30 transition-all duration-200">
                        <p className="text-white/60 text-xs font-semibold mb-2 uppercase tracking-wider">
                          Total Albums
                        </p>
                        <p className="text-3xl font-bold text-white">
                          {stats.totalAlbums}
                        </p>
                      </div>
                      <div className="bg-white/8 backdrop-blur-sm rounded-xl p-5 border border-white/20 hover:bg-white/10 hover:border-white/30 transition-all duration-200">
                        <p className="text-white/60 text-xs font-semibold mb-2 uppercase tracking-wider">
                          Top Tracks
                        </p>
                        <p className="text-3xl font-bold text-white">
                          {stats.totalTopTracks}
                        </p>
                      </div>
                      <div className="bg-white/8 backdrop-blur-sm rounded-xl p-5 border border-white/20 hover:bg-white/10 hover:border-white/30 transition-all duration-200">
                        <p className="text-white/60 text-xs font-semibold mb-2 uppercase tracking-wider">
                          Related
                        </p>
                        <p className="text-3xl font-bold text-white">
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

      {/* Biography */}
      {platform === "apify" && biography && (
        <Card className="p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-xl">
              <Music
                size={24}
                className="text-emerald-600 dark:text-emerald-400"
              />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              Biography
            </h3>
          </div>
          <BioText text={biography} />
        </Card>
      )}

      {/* Tabbed Content */}
      <Card className="p-6 sm:p-8">
        <div className="flex gap-2 mb-8 border-b-2 border-slate-200 dark:border-slate-700 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab("tracks")}
            className={`px-6 py-3 font-bold transition-all duration-300 border-b-2 whitespace-nowrap rounded-t-lg ${
              activeTab === "tracks"
                ? "border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 -mb-2"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
            }`}
          >
            <span className="flex items-center gap-2">
              <Music size={20} />
              <span className="hidden sm:inline">Top Tracks</span>
              <span className="sm:hidden">Tracks</span>
            </span>
          </button>

          {platform !== "apify" && (
            <button
              onClick={() => setActiveTab("related")}
              className={`px-6 py-3 font-bold transition-all duration-300 border-b-2 whitespace-nowrap rounded-t-lg ${
                activeTab === "related"
                  ? "border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 -mb-2"
                  : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              }`}
            >
              <span className="flex items-center gap-2">
                <Users size={20} />
                <span className="hidden sm:inline">Related Artists</span>
                <span className="sm:hidden">Related</span>
              </span>
            </button>
          )}

          <button
            onClick={() => setActiveTab("albums")}
            className={`px-6 py-3 font-bold transition-all duration-300 border-b-2 whitespace-nowrap rounded-t-lg ${
              activeTab === "albums"
                ? "border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 -mb-2"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
            }`}
          >
            <span className="flex items-center gap-2">
              <Album size={20} />
              Albums
            </span>
          </button>

          {platform === "apify" && topCities?.length > 0 && (
            <button
              onClick={() => setActiveTab("cities")}
              className={`px-6 py-3 font-bold transition-all duration-300 border-b-2 whitespace-nowrap rounded-t-lg ${
                activeTab === "cities"
                  ? "border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 -mb-2"
                  : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              }`}
            >
              <span className="flex items-center gap-2">
                <MapPin size={20} />
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
                  className="group flex items-center gap-4 p-4 sm:p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300 border border-slate-200 dark:border-slate-700 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:shadow-lg"
                >
                  <div className="flex-shrink-0 w-10 text-center">
                    <span className="text-2xl font-bold text-slate-400 dark:text-slate-600 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {track.rank || idx + 1}
                    </span>
                  </div>

                  {track.albumImage && (
                    <img
                      src={track.albumImage}
                      alt={track.album}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover shadow-md ring-2 ring-slate-200 dark:ring-slate-700 group-hover:ring-emerald-500/50 transition-all"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {track.title}
                          {track.explicit && (
                            <Badge
                              className="ml-2 bg-slate-700 text-white"
                              size="sm"
                            >
                              E
                            </Badge>
                          )}
                        </h4>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-slate-600 dark:text-slate-400">
                          {track.album && (
                            <span className="truncate font-medium">
                              {track.album}
                            </span>
                          )}
                          {track.releaseYear && (
                            <span className="flex items-center gap-1">
                              <Calendar size={14} />
                              {track.releaseYear}
                            </span>
                          )}
                          {track.durationFormatted && (
                            <span>{track.durationFormatted}</span>
                          )}
                        </div>
                      </div>

                      {platform === "apify" && track.streamCountFormatted ? (
                        <Badge
                          className="flex-shrink-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                          size="sm"
                        >
                          <Play size={12} className="mr-1" />
                          {track.streamCountFormatted}
                        </Badge>
                      ) : (
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
                      )}
                    </div>

                    {/* Spotify Embed Player for Apify/Spotify tracks */}
                    {track.spotifyUrl && platform === "apify" && extractSpotifyId(track.spotifyUrl) && (
                      <div className="mt-3 w-full max-w-md">
                        <iframe
                          src={`https://open.spotify.com/embed/track/${extractSpotifyId(track.spotifyUrl)}`}
                          width="100%"
                          height="80"
                          frameBorder="0"
                          allowtransparency="true"
                          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                          loading="lazy"
                          className="rounded-lg shadow-sm"
                          title={`Spotify player for ${track.title}`}
                        />
                      </div>
                    )}

                    {/* HTML5 Audio Player for preview URLs (non-Apify) */}
                    {track.previewUrl && platform !== "apify" && (
                      <div className="mt-3">
                        <audio
                          controls
                          className="w-full h-10 rounded-lg"
                          style={{ maxWidth: "400px" }}
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
                        className="inline-flex items-center gap-1 mt-3 text-sm font-semibold text-red-600 hover:text-red-700 dark:text-red-400 transition-colors"
                      >
                        <ExternalLink size={14} />
                        Open in YouTube
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
                  className="group p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-slate-200 dark:border-slate-700 hover:border-emerald-500/50 dark:hover:border-emerald-500/50"
                >
                  <div className="flex flex-col items-center text-center space-y-4">
                    {artist.image ? (
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-full blur-lg opacity-0 group-hover:opacity-50 transition-opacity" />
                        <img
                          src={artist.image}
                          alt={artist.name}
                          className="relative w-32 h-32 rounded-full object-cover shadow-lg ring-4 ring-slate-200 dark:ring-slate-700 group-hover:ring-emerald-500/50 transition-all"
                        />
                      </div>
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center shadow-lg">
                        <Music size={40} className="text-white" />
                      </div>
                    )}

                    <div className="w-full">
                      <h4 className="font-bold text-base text-slate-900 dark:text-white mb-3 line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {artist.name}
                      </h4>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400">
                          <Users size={16} />
                          <span className="font-semibold">
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
                        <div className="flex flex-wrap justify-center gap-1 mt-3">
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
                          className="inline-flex items-center gap-1 mt-4 text-sm font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 transition-colors"
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
          {activeTab === "albums" && enhancedAlbums?.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {enhancedAlbums.map((album, i) => (
                <div
                  key={album.id || i}
                  className="group bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-slate-200 dark:border-slate-700 hover:border-emerald-500/50 dark:hover:border-emerald-500/50"
                >
                  {album.image ? (
                    <div className="relative mb-4">
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity" />
                      <img
                        src={album.image}
                        alt={album.name}
                        className="relative w-full aspect-square rounded-xl object-cover shadow-md ring-2 ring-slate-200 dark:ring-slate-700 group-hover:ring-emerald-500/50 transition-all"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          e.currentTarget.nextElementSibling?.style.setProperty(
                            "display",
                            "flex",
                          );
                        }}
                      />
                      <div
                        className="w-full aspect-square rounded-xl bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 flex items-center justify-center shadow-md"
                        style={{ display: "none" }}
                      >
                        <Disc3
                          size={64}
                          className="text-white drop-shadow-lg"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="w-full aspect-square rounded-xl bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 flex items-center justify-center mb-4 shadow-md">
                      <Disc3 size={64} className="text-white drop-shadow-lg" />
                    </div>
                  )}

                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {album.name}
                    </h4>
                    <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-2">
                      <span className="font-semibold flex items-center gap-1">
                        <Calendar size={12} />
                        {album.releaseYear}
                      </span>
                      {album.type && (
                        <Badge
                          size="sm"
                          className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white text-xs capitalize"
                        >
                          {album.type}
                        </Badge>
                      )}
                    </div>
                    {album.totalTracks > 0 && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1">
                        <Music size={12} />
                        {album.totalTracks} track
                        {album.totalTracks !== 1 ? "s" : ""}
                      </p>
                    )}

                    {album.spotifyUrl && (
                      <a
                        href={album.spotifyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 transition-colors group-hover:underline"
                      >
                        <ExternalLink size={12} />
                        Open in Spotify
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Top Cities Tab */}
          {activeTab === "cities" &&
            platform === "apify" &&
            topCities?.length > 0 && (
              <div className="space-y-3">
                {topCities.map((city, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300 border border-slate-200 dark:border-slate-700 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:shadow-lg group"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-bold text-slate-400 dark:text-slate-600 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors w-10 text-center">
                        {idx + 1}
                      </span>
                      <div className="p-3 bg-gradient-to-br from-blue-500/20 to-emerald-500/20 rounded-xl">
                        <MapPin
                          size={24}
                          className="text-blue-600 dark:text-blue-400"
                        />
                      </div>
                      <div>
                        <h4 className="font-bold text-base text-slate-900 dark:text-white">
                          {city.city}
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                          {city.country}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold">
                      <Users size={14} className="mr-1" />
                      {city.numberOfListeners.toLocaleString()}
                    </Badge>
                  </div>
                ))}
              </div>
            )}

          {/* Empty States */}
          {activeTab === "tracks" && (!topTracks || topTracks.length === 0) && (
            <div className="text-center py-16">
              <div className="inline-flex p-6 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
                <Music size={56} className="text-slate-400" />
              </div>
              <p className="text-lg text-slate-600 dark:text-slate-400 font-medium">
                No top tracks available
              </p>
            </div>
          )}
          {activeTab === "related" &&
            (!relatedArtists || relatedArtists.length === 0) && (
              <div className="text-center py-16">
                <div className="inline-flex p-6 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
                  <Users size={56} className="text-slate-400" />
                </div>
                <p className="text-lg text-slate-600 dark:text-slate-400 font-medium">
                  No related artists found
                </p>
              </div>
            )}
          {activeTab === "albums" && (!albums || albums.length === 0) && (
            <div className="text-center py-16">
              <div className="inline-flex p-6 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
                <Album size={56} className="text-slate-400" />
              </div>
              <p className="text-lg text-slate-600 dark:text-slate-400 font-medium">
                No albums available
              </p>
            </div>
          )}
          {activeTab === "cities" && (!topCities || topCities.length === 0) && (
            <div className="text-center py-16">
              <div className="inline-flex p-6 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
                <MapPin size={56} className="text-slate-400" />
              </div>
              <p className="text-lg text-slate-600 dark:text-slate-400 font-medium">
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