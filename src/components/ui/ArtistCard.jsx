import React, { useState, useEffect, useCallback, useMemo } from "react";
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

  const cleanText = useMemo(
    () =>
      text
        .replace(/<\/?[^>]+(>|$)/g, "")
        .replace(/\s+/g, " ")
        .trim(),
    [text]
  );

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
    sm: "px-3 py-2 text-xs sm:px-4 sm:text-sm",
    md: "px-4 py-2 text-sm sm:px-5 sm:py-2.5 sm:text-base",
    lg: "px-5 py-2.5 text-base sm:px-6 sm:py-3 sm:text-lg",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${sizeStyles[size]} ${className} disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95`}
    >
      {Icon && <Icon size={16} className="sm:w-[18px] sm:h-[18px]" />}
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
    sm: "px-2 py-0.5 text-[10px] sm:px-2.5 sm:py-1 sm:text-xs",
    md: "px-2.5 py-1 text-xs sm:px-3 sm:py-1.5 sm:text-sm",
    lg: "px-3 py-1.5 text-sm sm:px-4 sm:py-2 sm:text-base",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold shadow-sm ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
};

// Optimized Spotify Embed Component with lazy loading
const SpotifyEmbed = React.memo(({ trackId, title }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    // Use Intersection Observer to lazy load the embed
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoad(true);
          }
        });
      },
      { rootMargin: "200px" }
    );

    const element = document.getElementById(`spotify-container-${trackId}`);
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [trackId]);

  return (
    <div
      id={`spotify-container-${trackId}`}
      className="mt-3 w-full relative"
      style={{ minHeight: "152px" }}
    >
      {shouldLoad ? (
        <>
          {!isLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            </div>
          )}
          <iframe
            key={`spotify-${trackId}`}
            src={`https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0`}
            width="100%"
            height="152"
            frameBorder="0"
            allowtransparency="true"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className={`rounded-lg shadow-sm max-w-full transition-opacity duration-300 ${
              isLoaded ? "opacity-100" : "opacity-0"
            }`}
            style={{ minWidth: "280px" }}
            title={`Spotify player for ${title}`}
            onLoad={() => setIsLoaded(true)}
          />
        </>
      ) : (
        <div className="w-full h-[152px] flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-lg">
          <Play size={32} className="text-slate-400" />
        </div>
      )}
    </div>
  );
});

SpotifyEmbed.displayName = "SpotifyEmbed";

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
  const [isLoadingAlbums, setIsLoadingAlbums] = useState(false);

  // Helper function to extract Spotify track ID from URL
  const extractSpotifyId = useCallback((url) => {
    if (!url) return null;
    const match = url.match(/track[\/:]([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
  }, []);

  const platformData = useMemo(
    () => ({
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
    }),
    [youtubeUrl, apifyUrl, spotifyUrl]
  );

  const currentPlatform = platformData[platform] || platformData.apify;

  const getSocialIcon = useCallback((label) => {
    const iconMap = {
      facebook: Facebook,
      instagram: Instagram,
      twitter: Twitter,
      x: Twitter,
    };
    return iconMap[label?.toLowerCase()] || Globe;
  }, []);

  const handleLaunchValuation = useCallback(() => {
    sessionStorage.setItem("artistCardScrollPos", window.scrollY.toString());
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
  }, [
    navigate,
    name,
    image,
    followers,
    popularity,
    genres,
    topTracks,
    stats,
    monthlyListeners,
    platform,
  ]);

  // Optimize album image enhancement with debouncing
  useEffect(() => {
    let isMounted = true;

    const enhanceAlbumsWithSpotifyImages = async () => {
      if (!albums || albums.length === 0) {
        setEnhancedAlbums([]);
        return;
      }

      // Set initial albums immediately for faster display
      setEnhancedAlbums(albums);
      setIsLoadingAlbums(true);

      try {
        const albumNames = albums.map((a) => a.name);
        const spotifyImages = await getSpotifyAlbumImages(name, albumNames);

        if (!isMounted) return;

        const merged = albums.map((album) => {
          const spotifyData = spotifyImages.find(
            (s) => s.albumName?.toLowerCase() === album.name?.toLowerCase()
          );
          return {
            ...album,
            image: spotifyData?.image || album.image,
          };
        });

        setEnhancedAlbums(merged);
      } catch (err) {
        console.error("Error enhancing albums:", err);
        if (isMounted) {
          setEnhancedAlbums(albums);
        }
      } finally {
        if (isMounted) {
          setIsLoadingAlbums(false);
        }
      }
    };

    // Only enhance if we're on the albums tab or about to be
    if (activeTab === "albums" || albums?.length > 0) {
      enhanceAlbumsWithSpotifyImages();
    }

    return () => {
      isMounted = false;
    };
  }, [albums, name, activeTab]);

  useEffect(() => {
    const savedScrollPos = sessionStorage.getItem("artistCardScrollPos");
    if (savedScrollPos) {
      requestAnimationFrame(() => {
        window.scrollTo(0, parseInt(savedScrollPos));
        sessionStorage.removeItem("artistCardScrollPos");
      });
    }
  }, []);

  // Memoize track list to prevent unnecessary re-renders
  const trackList = useMemo(() => {
    if (!topTracks || topTracks.length === 0) return null;

    return topTracks.map((track, idx) => {
      const trackId = extractSpotifyId(track.spotifyUrl);
      
      return (
        <div
          key={`track-${track.id || idx}`}
          className="group flex flex-col gap-3 p-3 sm:p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300 border border-slate-200 dark:border-slate-700 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:shadow-lg"
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex-shrink-0 w-8 sm:w-10 text-center">
              <span className="text-xl sm:text-2xl font-bold text-slate-400 dark:text-slate-600 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {track.rank || idx + 1}
              </span>
            </div>

            {track.albumImage && (
              <img
                src={track.albumImage}
                alt={track.album}
                className="w-14 h-14 sm:w-20 sm:h-20 rounded-lg object-cover shadow-md ring-2 ring-slate-200 dark:ring-slate-700 group-hover:ring-emerald-500/50 transition-all flex-shrink-0"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 sm:gap-4">
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-sm sm:text-lg text-slate-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
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
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1 sm:mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    {track.album && (
                      <span className="truncate font-medium max-w-[150px] sm:max-w-none">
                        {track.album}
                      </span>
                    )}
                    {track.releaseYear && (
                      <span className="flex items-center gap-1 flex-shrink-0">
                        <Calendar size={12} className="sm:w-[14px] sm:h-[14px]" />
                        {track.releaseYear}
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

          {/* Spotify Embed Player for Apify/Spotify tracks */}
          {trackId && platform === "apify" && (
            <SpotifyEmbed trackId={trackId} title={track.title} />
          )}

          {/* HTML5 Audio Player for preview URLs (non-Apify) */}
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
    });
  }, [topTracks, platform, extractSpotifyId]);

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Main Artist Info Card */}
      <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-white overflow-hidden relative">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
          <div className="absolute top-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-gradient-to-br from-emerald-500/20 to-transparent rounded-full blur-3xl animate-pulse" />
          <div
            className="absolute bottom-0 left-0 w-64 h-64 sm:w-96 sm:h-96 bg-gradient-to-tr from-blue-500/20 to-transparent rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          />
        </div>

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
                      e.currentTarget.src =
                        "https://via.placeholder.com/256?text=No+Image";
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
              {/* Top Section: Artist Identity */}
              <div className="mb-4 sm:mb-6">
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
                    <span className="hidden xs:inline">Real-time {currentPlatform.label} Stats</span>
                    <span className="xs:hidden">{currentPlatform.label}</span>
                  </span>
                </div>

                {/* Artist Name */}
                <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-5 bg-gradient-to-r from-white via-white to-white/80 bg-clip-text leading-tight">
                  {name}
                </h2>

                {/* Follower Stats Row */}
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

                  {monthlyListeners && platform === "apify" && (
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

                  {popularity && platform !== "apify" && (
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
              </div>

              {/* Action Buttons Section */}
              <div className="mb-4 sm:mb-6">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  {platform?.toLowerCase() === "youtube" && youtubeUrl && (
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

                  {platform?.toLowerCase() === "apify" && spotifyUrl && (
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
                    onClick={handleLaunchValuation}
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                    <span className="relative">
                      <span className="hidden xs:inline">Launch Valuation</span>
                      <span className="xs:hidden">Valuation</span>
                    </span>
                  </Button>
                </div>
              </div>

              {/* Genres Section */}
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

              {/* Social Links Section */}
              {platform === "apify" && externalLinks?.length > 0 && (
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

              {/* Stats Grid - Four Cards */}
              {stats && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
                  {platform === "apify" ? (
                    <>
                      <div className="bg-white/8 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-5 border border-white/20 hover:bg-white/10 hover:border-white/30 transition-all duration-200">
                        <p className="text-white/60 text-[10px] sm:text-xs font-semibold mb-1 sm:mb-2 uppercase tracking-wider">
                          Total Streams
                        </p>
                        <p className="text-xl sm:text-3xl font-bold text-white truncate">
                          {stats.totalStreams}
                        </p>
                      </div>
                      <div className="bg-white/8 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-5 border border-white/20 hover:bg-white/10 hover:border-white/30 transition-all duration-200">
                        <p className="text-white/60 text-[10px] sm:text-xs font-semibold mb-1 sm:mb-2 uppercase tracking-wider">
                          Avg Streams
                        </p>
                        <p className="text-xl sm:text-3xl font-bold text-white truncate">
                          {stats.averageStreams}
                        </p>
                      </div>
                      <div className="bg-white/8 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-5 border border-white/20 hover:bg-white/10 hover:border-white/30 transition-all duration-200">
                        <p className="text-white/60 text-[10px] sm:text-xs font-semibold mb-1 sm:mb-2 uppercase tracking-wider">
                          Top Tracks
                        </p>
                        <p className="text-xl sm:text-3xl font-bold text-white">
                          {topTracks?.length || 0}
                        </p>
                      </div>
                      <div className="bg-white/8 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-5 border border-white/20 hover:bg-white/10 hover:border-white/30 transition-all duration-200">
                        <p className="text-white/60 text-[10px] sm:text-xs font-semibold mb-1 sm:mb-2 uppercase tracking-wider">
                          Albums
                        </p>
                        <p className="text-xl sm:text-3xl font-bold text-white">
                          {albums?.length || 0}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="bg-white/8 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-5 border border-white/20 hover:bg-white/10 hover:border-white/30 transition-all duration-200">
                        <p className="text-white/60 text-[10px] sm:text-xs font-semibold mb-1 sm:mb-2 uppercase tracking-wider">
                          Avg Popularity
                        </p>
                        <p className="text-xl sm:text-3xl font-bold text-white">
                          {stats.averageTrackPopularity}
                        </p>
                      </div>
                      <div className="bg-white/8 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-5 border border-white/20 hover:bg-white/10 hover:border-white/30 transition-all duration-200">
                        <p className="text-white/60 text-[10px] sm:text-xs font-semibold mb-1 sm:mb-2 uppercase tracking-wider">
                          Total Albums
                        </p>
                        <p className="text-xl sm:text-3xl font-bold text-white">
                          {stats.totalAlbums}
                        </p>
                      </div>
                      <div className="bg-white/8 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-5 border border-white/20 hover:bg-white/10 hover:border-white/30 transition-all duration-200">
                        <p className="text-white/60 text-[10px] sm:text-xs font-semibold mb-1 sm:mb-2 uppercase tracking-wider">
                          Top Tracks
                        </p>
                        <p className="text-xl sm:text-3xl font-bold text-white">
                          {stats.totalTopTracks}
                        </p>
                      </div>
                      <div className="bg-white/8 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-5 border border-white/20 hover:bg-white/10 hover:border-white/30 transition-all duration-200">
                        <p className="text-white/60 text-[10px] sm:text-xs font-semibold mb-1 sm:mb-2 uppercase tracking-wider">
                          Related
                        </p>
                        <p className="text-xl sm:text-3xl font-bold text-white">
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
        <Card className="p-4 sm:p-6 lg:p-8">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5">
            <div className="p-1.5 sm:p-2 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-lg sm:rounded-xl">
              <Music
                size={20}
                className="text-emerald-600 dark:text-emerald-400 sm:w-6 sm:h-6"
              />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Biography
            </h3>
          </div>
          <BioText text={biography} />
        </Card>
      )}

      {/* Tabbed Content */}
      <Card className="p-4 sm:p-6 lg:p-8">
        <div className="flex gap-1 sm:gap-2 mb-6 sm:mb-8 border-b-2 border-slate-200 dark:border-slate-700 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setActiveTab("tracks")}
            className={`px-3 sm:px-6 py-2 sm:py-3 font-bold transition-all duration-300 border-b-2 whitespace-nowrap rounded-t-lg text-xs sm:text-base ${
              activeTab === "tracks"
                ? "border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 -mb-2"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
            }`}
          >
            <span className="flex items-center gap-1.5 sm:gap-2">
              <Music size={16} className="sm:w-5 sm:h-5" />
              <span className="hidden xs:inline">Top Tracks</span>
              <span className="xs:hidden">Tracks</span>
            </span>
          </button>

          {platform !== "apify" && (
            <button
              onClick={() => setActiveTab("related")}
              className={`px-3 sm:px-6 py-2 sm:py-3 font-bold transition-all duration-300 border-b-2 whitespace-nowrap rounded-t-lg text-xs sm:text-base ${
                activeTab === "related"
                  ? "border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 -mb-2"
                  : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              }`}
            >
              <span className="flex items-center gap-1.5 sm:gap-2">
                <Users size={16} className="sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Related Artists</span>
                <span className="sm:hidden">Related</span>
              </span>
            </button>
          )}

          <button
            onClick={() => setActiveTab("albums")}
            className={`px-3 sm:px-6 py-2 sm:py-3 font-bold transition-all duration-300 border-b-2 whitespace-nowrap rounded-t-lg text-xs sm:text-base ${
              activeTab === "albums"
                ? "border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 -mb-2"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
            }`}
          >
            <span className="flex items-center gap-1.5 sm:gap-2">
              <Album size={16} className="sm:w-5 sm:h-5" />
              Albums
            </span>
          </button>

          {platform === "apify" && topCities?.length > 0 && (
            <button
              onClick={() => setActiveTab("cities")}
              className={`px-3 sm:px-6 py-2 sm:py-3 font-bold transition-all duration-300 border-b-2 whitespace-nowrap rounded-t-lg text-xs sm:text-base ${
                activeTab === "cities"
                  ? "border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 -mb-2"
                  : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              }`}
            >
              <span className="flex items-center gap-1.5 sm:gap-2">
                <MapPin size={16} className="sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Top Cities</span>
                <span className="sm:hidden">Cities</span>
              </span>
            </button>
          )}
        </div>

        <div className="min-h-[300px] sm:min-h-[400px]">
          {/* Top Tracks Tab */}
          {activeTab === "tracks" && topTracks?.length > 0 && (
            <div className="space-y-2 sm:space-y-3">{trackList}</div>
          )}

          {/* Related Artists Tab */}
          {activeTab === "related" && relatedArtists?.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {relatedArtists.map((artist, i) => (
                <div
                  key={artist.id || i}
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
              ))}
            </div>
          )}

          {/* Albums Tab */}
          {activeTab === "albums" && enhancedAlbums?.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {enhancedAlbums.map((album, i) => (
                <div
                  key={album.id || i}
                  className="group bg-slate-50 dark:bg-slate-800/50 rounded-xl sm:rounded-2xl p-3 sm:p-4 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-slate-200 dark:border-slate-700 hover:border-emerald-500/50 dark:hover:border-emerald-500/50"
                >
                  {album.image ? (
                    <div className="relative mb-3 sm:mb-4">
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-lg sm:rounded-xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity" />
                      <img
                        src={album.image}
                        alt={album.name}
                        className="relative w-full aspect-square rounded-lg sm:rounded-xl object-cover shadow-md ring-2 ring-slate-200 dark:ring-slate-700 group-hover:ring-emerald-500/50 transition-all"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          e.currentTarget.nextElementSibling?.style.setProperty(
                            "display",
                            "flex"
                          );
                        }}
                      />
                      <div
                        className="w-full aspect-square rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 flex items-center justify-center shadow-md"
                        style={{ display: "none" }}
                      >
                        <Disc3
                          size={48}
                          className="text-white drop-shadow-lg sm:w-16 sm:h-16"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="w-full aspect-square rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 flex items-center justify-center mb-3 sm:mb-4 shadow-md">
                      <Disc3 size={48} className="text-white drop-shadow-lg sm:w-16 sm:h-16" />
                    </div>
                  )}

                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white mb-1.5 sm:mb-2 line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {album.name}
                    </h4>
                    <div className="flex items-center justify-between text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 mb-1.5 sm:mb-2">
                      <span className="font-semibold flex items-center gap-0.5 sm:gap-1">
                        <Calendar size={10} className="sm:w-3 sm:h-3" />
                        {album.releaseYear}
                      </span>
                      {album.type && (
                        <Badge
                          size="sm"
                          className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white text-[10px] sm:text-xs capitalize"
                        >
                          {album.type}
                        </Badge>
                      )}
                    </div>
                    {album.totalTracks > 0 && (
                      <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mb-2 sm:mb-3 flex items-center gap-0.5 sm:gap-1">
                        <Music size={10} className="sm:w-3 sm:h-3" />
                        {album.totalTracks} track
                        {album.totalTracks !== 1 ? "s" : ""}
                      </p>
                    )}

                    {album.spotifyUrl && (
                      <a
                        href={album.spotifyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 transition-colors group-hover:underline"
                      >
                        <ExternalLink size={10} className="sm:w-3 sm:h-3" />
                        <span className="hidden xs:inline">Open in Spotify</span>
                        <span className="xs:hidden">Spotify</span>
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
              <div className="space-y-2 sm:space-y-3">
                {topCities.map((city, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 sm:p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300 border border-slate-200 dark:border-slate-700 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:shadow-lg group"
                  >
                    <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
                      <span className="text-lg sm:text-2xl font-bold text-slate-400 dark:text-slate-600 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors w-6 sm:w-10 text-center flex-shrink-0">
                        {idx + 1}
                      </span>
                      <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500/20 to-emerald-500/20 rounded-lg sm:rounded-xl flex-shrink-0">
                        <MapPin
                          size={20}
                          className="text-blue-600 dark:text-blue-400 sm:w-6 sm:h-6"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                          {city.city}
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium truncate">
                          {city.country}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold flex-shrink-0 ml-2" size="sm">
                      <Users size={12} className="mr-0.5 sm:mr-1 sm:w-[14px] sm:h-[14px]" />
                      <span className="hidden xs:inline">{city.numberOfListeners.toLocaleString()}</span>
                      <span className="xs:hidden">{(city.numberOfListeners / 1000).toFixed(0)}k</span>
                    </Badge>
                  </div>
                ))}
              </div>
            )}

          {/* Empty States */}
          {activeTab === "tracks" && (!topTracks || topTracks.length === 0) && (
            <div className="text-center py-12 sm:py-16">
              <div className="inline-flex p-4 sm:p-6 bg-slate-100 dark:bg-slate-800 rounded-full mb-3 sm:mb-4">
                <Music size={40} className="text-slate-400 sm:w-14 sm:h-14" />
              </div>
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 font-medium">
                No top tracks available
              </p>
            </div>
          )}
          {activeTab === "related" &&
            (!relatedArtists || relatedArtists.length === 0) && (
              <div className="text-center py-12 sm:py-16">
                <div className="inline-flex p-4 sm:p-6 bg-slate-100 dark:bg-slate-800 rounded-full mb-3 sm:mb-4">
                  <Users size={40} className="text-slate-400 sm:w-14 sm:h-14" />
                </div>
                <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 font-medium">
                  No related artists found
                </p>
              </div>
            )}
          {activeTab === "albums" && (!albums || albums.length === 0) && (
            <div className="text-center py-12 sm:py-16">
              <div className="inline-flex p-4 sm:p-6 bg-slate-100 dark:bg-slate-800 rounded-full mb-3 sm:mb-4">
                <Album size={40} className="text-slate-400 sm:w-14 sm:h-14" />
              </div>
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 font-medium">
                No albums available
              </p>
            </div>
          )}
          {activeTab === "cities" && (!topCities || topCities.length === 0) && (
            <div className="text-center py-12 sm:py-16">
              <div className="inline-flex p-4 sm:p-6 bg-slate-100 dark:bg-slate-800 rounded-full mb-3 sm:mb-4">
                <MapPin size={40} className="text-slate-400 sm:w-14 sm:h-14" />
              </div>
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 font-medium">
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