import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import * as Tabs from "@radix-ui/react-tabs";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import * as Separator from "@radix-ui/react-separator";
import {
  Music,
  Facebook,
  Instagram,
  Twitter,
  Globe,
  Users,
  MapPin,
  Star,
  Disc,
  BarChart3,
  Map,
  Disc3,
  ListMusic,
  Heart,
  Album,
} from "lucide-react";
import { getSpotifyAlbumImages } from "../../utils/api";
import Card from "../common/Card";
import SectionHeader from "../common/SectionHeader";
import EmptyState from "../common/EmptyState";
import ArtistHeader from "../artist/ArtistHeader";
import ArtistStats from "../artist/ArtistStats";
import BioText from "../artist/BioText";
import TrackList from "../artist/TrackList";
import RelatedArtistCard from "../artist/RelatedArtistCard";
import AlbumCard from "../artist/AlbumCard";
import TopCitiesList from "../artist/TopCitiesList";
import ValuationTab from "../valuation/ValuationTab";
import PopularReleaseCard from "../artist/PopularReleaseCard";
import SingleCard from "../artist/SingleCard";
import YouTubeValuationTab from "../youtube/YouTubeValuationTab";
import ITunesValuationTab from "../itunes/ITunesValuationTab";

// ── Tab config ────────────────────────────────────────────
const buildTabs = ({
  platform,
  hasRelated,
  hasCities,
  hasPopularReleases,
  hasSingles,
}) => {
  const tabs = [
    { id: "tracks", label: "Tracks", icon: ListMusic, always: true },
    { id: "albums", label: "Albums", icon: Disc3, always: true },
    { id: "singles", label: "Singles", icon: Disc, show: hasSingles },
    { id: "popular", label: "Popular", icon: Star, show: hasPopularReleases },
    { id: "related", label: "Related", icon: Heart, show: hasRelated },
    {
      id: "cities",
      label: "Cities",
      icon: Map,
      show: hasCities && platform === "apify",
    },
  ];
  return tabs.filter((t) => t.always || t.show);
};

// ── Tab trigger with active indicator ────────────────────
const TabTrigger = ({ id, label, Icon, platform }) => {
  const isItunes = platform === "itunes";
  return (
    <Tabs.Trigger
      value={id}
      className={`
        group relative flex items-center gap-1.5 sm:gap-2
        px-3 sm:px-4 py-2.5 sm:py-3
        text-[11px] sm:text-sm font-semibold rounded-t-xl
        whitespace-nowrap outline-none select-none
        transition-all duration-200
        data-[state=inactive]:text-slate-500 dark:data-[state=inactive]:text-slate-400
        data-[state=inactive]:hover:text-slate-700 dark:data-[state=inactive]:hover:text-slate-200
        data-[state=inactive]:hover:bg-slate-200/60 dark:data-[state=inactive]:hover:bg-slate-700/50
        ${isItunes
          ? "data-[state=active]:text-pink-600 dark:data-[state=active]:text-pink-400 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900"
          : "data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900"
        }
      `}
    >
      <Icon
        size={13}
        className="sm:w-4 sm:h-4 flex-shrink-0 transition-transform group-hover:scale-110 group-data-[state=active]:scale-110"
      />
      <span>{label}</span>
      {/* Active underline */}
      <span
        className={`
          absolute bottom-0 left-0 right-0 h-0.5 rounded-full
          ${isItunes ? "bg-pink-500" : "bg-emerald-500"}
          scale-x-0 data-[state=active]:scale-x-100
          transition-transform duration-200
        `}
      />
    </Tabs.Trigger>
  );
};

// ── Grid wrapper for media cards ─────────────────────────
const MediaGrid = ({ children }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
    {children}
  </div>
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
  singles,
  popularReleases,
  totalViews,
  stats,
  spotifyUrl,
  youtubeUrl,
  appleUrl,        // ← iTunes/Apple Music artist URL
  platform,
  monthlyListeners,
  biography,
  topCities,
  externalLinks,
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("tracks");
  const [enhancedAlbums, setEnhancedAlbums] = useState([]);
  const [showValuation, setShowValuation] = useState(false);

  const isItunes = platform === "itunes";
  const isYouTube = platform === "youtube";
  const isApify = platform === "apify";

  // ── Helpers ───────────────────────────────────────────
  const extractSpotifyId = useCallback((url) => {
    if (!url) return null;
    const match = url.match(/track[\/:]([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
  }, []);

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
  }, [navigate, name, image, followers, popularity, genres, topTracks, stats, monthlyListeners, platform]);

  // ── Album image enhancement (skip for iTunes — images already good) ──
  useEffect(() => {
    let isMounted = true;
    const enhanceAlbums = async () => {
      const allReleases = [
        ...(albums || []),
        ...(singles || []),
        ...(popularReleases || []),
      ];
      if (allReleases.length === 0) {
        setEnhancedAlbums([]);
        return;
      }
      const uniqueReleases = allReleases.reduce((acc, current) => {
        if (!acc.find((item) => item.id === current.id)) acc.push(current);
        return acc;
      }, []);
      const sortedReleases = uniqueReleases.sort(
        (a, b) => new Date(b.releaseDate || 0) - new Date(a.releaseDate || 0),
      );
      setEnhancedAlbums(sortedReleases);

      // Only fetch Spotify images for non-iTunes platforms
      if (!isItunes) {
        try {
          const spotifyImages = await getSpotifyAlbumImages(name, sortedReleases);
          if (!isMounted) return;
          setEnhancedAlbums(
            sortedReleases.map((album) => {
              const spotifyData = spotifyImages.find((s) => s.id === album.id);
              return { ...album, image: spotifyData?.image || album.image };
            }),
          );
        } catch {
          if (isMounted) setEnhancedAlbums(sortedReleases);
        }
      }
    };
    if (activeTab === "albums") enhanceAlbums();
    return () => { isMounted = false; };
  }, [albums, singles, popularReleases, name, activeTab, platform, isItunes]);

  useEffect(() => {
    const savedScrollPos = sessionStorage.getItem("artistCardScrollPos");
    if (savedScrollPos) {
      requestAnimationFrame(() => {
        window.scrollTo(0, parseInt(savedScrollPos));
        sessionStorage.removeItem("artistCardScrollPos");
      });
    }
  }, []);

  const tabs = buildTabs({
    platform,
    hasRelated: relatedArtists?.length > 0,
    hasCities: topCities?.length > 0,
    hasPopularReleases: popularReleases?.length > 0,
    hasSingles: singles?.length > 0,
  });

  // ── Valuation button styles per platform ──────────────
  const valuationBtnActive = isItunes
    ? "bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-lg shadow-pink-500/30 group-hover:shadow-pink-500/50 group-hover:scale-105"
    : isYouTube
    ? "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/30 group-hover:shadow-red-500/50 group-hover:scale-105"
    : "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30 group-hover:shadow-emerald-500/50 group-hover:scale-105";

  const valuationBorderColor = isItunes
    ? "border-pink-200 dark:border-pink-800/60"
    : isYouTube
    ? "border-red-200 dark:border-red-800/60"
    : "border-emerald-200 dark:border-emerald-800/60";

  const valuationBgColor = isItunes
    ? "from-pink-50 to-rose-50 dark:from-pink-950/40 dark:to-rose-950/40"
    : isYouTube
    ? "from-red-50 to-rose-50 dark:from-red-950/40 dark:to-rose-950/40"
    : "from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40";

  const valuationIconBg = isItunes
    ? "from-pink-500 to-rose-600"
    : isYouTube
    ? "from-red-500 to-rose-600"
    : "from-emerald-500 to-teal-600";

  // ── Render valuation content ───────────────────────────
  const renderValuation = () => {
    if (isYouTube) {
      return (
        <YouTubeValuationTab
          artistData={{
            name, image,
            totalViews: stats?.totalViews || 0,
            followers, popularity, platform,
          }}
        />
      );
    }
    if (isItunes) {
      return (
        <ITunesValuationTab
          artistData={{
            name, image, topTracks, albums, singles,
            stats, platform, popularity, genres,
          }}
        />
      );
    }
    return (
      <ValuationTab
        artistData={{
          name, image, topTracks, albums,
          monthlyListeners, stats, platform, topCities,
        }}
      />
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* ── Artist Info Card ─────────────────────────────── */}
      <div className="rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
        <ArtistHeader
          name={name}
          image={image}
          followers={followers}
          monthlyListeners={monthlyListeners}
          popularity={popularity}
          genres={genres}
          platform={platform}
          spotifyUrl={spotifyUrl}
          youtubeUrl={youtubeUrl}
          appleUrl={appleUrl}
          externalLinks={externalLinks}
          onLaunchValuation={handleLaunchValuation}
          getSocialIcon={getSocialIcon}
        />
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 lg:p-8">
          <ArtistStats
            stats={stats}
            platform={platform}
            topTracks={topTracks}
            albums={albums}
          />
        </div>
      </div>

      {/* ── Valuation Toggle ─────────────────────────────── */}
      <div className={`rounded-3xl overflow-hidden border-2 ${valuationBorderColor} shadow-xl bg-gradient-to-br ${valuationBgColor}`}>
        <button
          onClick={() => setShowValuation((v) => !v)}
          className="w-full flex items-center justify-between gap-4 px-5 sm:px-8 py-5 sm:py-6 group"
        >
          <div className="flex items-center gap-4">
            <div className={`p-3 bg-gradient-to-br ${valuationIconBg} rounded-2xl shadow-lg`}>
              <BarChart3 size={22} className="text-white" />
            </div>
            <div className="text-left">
              <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                Artist Valuation
              </p>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                {isItunes
                  ? "Apple Music revenue estimate & catalog analysis"
                  : isYouTube
                  ? "YouTube revenue estimate & channel analytics"
                  : "Revenue estimate, deal score & market breakdown"}
              </p>
            </div>
          </div>
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all duration-200 ${
              showValuation
                ? "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                : valuationBtnActive
            }`}
          >
            <BarChart3 size={15} />
            {showValuation ? "Hide" : "View Valuation"}
          </div>
        </button>

        {showValuation && (
          <div className={`border-t-2 ${valuationBorderColor} p-4 sm:p-6 lg:p-8 bg-white dark:bg-slate-900`}>
            {renderValuation()}
          </div>
        )}
      </div>

      {/* ── Biography ────────────────────────────────────── */}
      {(isApify || isItunes) && biography && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200 dark:border-slate-800 shadow-xl p-4 sm:p-6 lg:p-8">
          <SectionHeader
            icon={Music}
            title="Biography"
            iconBg={isItunes ? "from-pink-500/20 to-rose-500/20" : "from-emerald-500/20 to-blue-500/20"}
            iconColor={isItunes ? "text-pink-600 dark:text-pink-400" : "text-emerald-600 dark:text-emerald-400"}
          />
          <Separator.Root
            className="bg-slate-100 dark:bg-slate-800 h-px mb-4"
            decorative
          />
          <BioText text={biography} />
        </div>
      )}

      {/* ── Radix Tabs Card ──────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
          {/* Tab List */}
          <div className="bg-slate-50 dark:bg-slate-800/70 border-b-2 border-slate-200 dark:border-slate-700">
            <ScrollArea.Root className="w-full">
              <ScrollArea.Viewport className="w-full">
                <Tabs.List
                  className="flex px-3 sm:px-5 pt-2 gap-0.5 sm:gap-1 min-w-max"
                  aria-label="Artist content"
                >
                  {tabs.map(({ id, label, icon }) => (
                    <TabTrigger key={id} id={id} label={label} Icon={icon} platform={platform} />
                  ))}
                </Tabs.List>
              </ScrollArea.Viewport>
              <ScrollArea.Scrollbar
                orientation="horizontal"
                className="flex h-0.5 bg-slate-200 dark:bg-slate-700"
              >
                <ScrollArea.Thumb className={`rounded-full ${isItunes ? "bg-pink-500" : "bg-emerald-500"}`} />
              </ScrollArea.Scrollbar>
            </ScrollArea.Root>
          </div>

          {/* Tab Content */}
          <div className="p-4 sm:p-6 lg:p-8 min-h-[380px] sm:min-h-[480px]">

            <Tabs.Content
              value="tracks"
              className="outline-none data-[state=active]:animate-in data-[state=active]:fade-in-0"
            >
              {topTracks?.length > 0 ? (
                <TrackList
                  tracks={topTracks}
                  platform={platform}
                  extractSpotifyId={extractSpotifyId}
                />
              ) : (
                <EmptyState icon={Music} message="No top tracks available" />
              )}
            </Tabs.Content>

            <Tabs.Content
              value="albums"
              className="outline-none data-[state=active]:animate-in data-[state=active]:fade-in-0"
            >
              {enhancedAlbums?.length > 0 ? (
                <MediaGrid>
                  {enhancedAlbums.map((album, i) => (
                    <AlbumCard key={album.id || i} album={album} index={i} platform={platform} />
                  ))}
                </MediaGrid>
              ) : (
                <EmptyState icon={Album} message="No albums available" />
              )}
            </Tabs.Content>

            <Tabs.Content
              value="singles"
              className="outline-none data-[state=active]:animate-in data-[state=active]:fade-in-0"
            >
              {singles?.length > 0 ? (
                <MediaGrid>
                  {singles.map((s, i) => (
                    <SingleCard key={s.id || i} single={s} index={i} platform={platform} />
                  ))}
                </MediaGrid>
              ) : (
                <EmptyState icon={Disc} message="No singles available" />
              )}
            </Tabs.Content>

            <Tabs.Content
              value="popular"
              className="outline-none data-[state=active]:animate-in data-[state=active]:fade-in-0"
            >
              {popularReleases?.length > 0 ? (
                <MediaGrid>
                  {popularReleases.map((r, i) => (
                    <PopularReleaseCard key={r.id || i} release={r} index={i} platform={platform} />
                  ))}
                </MediaGrid>
              ) : (
                <EmptyState icon={Star} message="No popular releases available" />
              )}
            </Tabs.Content>

            <Tabs.Content
              value="related"
              className="outline-none data-[state=active]:animate-in data-[state=active]:fade-in-0"
            >
              {relatedArtists?.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {relatedArtists.map((a, i) => (
                    <RelatedArtistCard key={a.id || i} artist={a} index={i} />
                  ))}
                </div>
              ) : (
                <EmptyState icon={Users} message="No related artists found" />
              )}
            </Tabs.Content>

            <Tabs.Content
              value="cities"
              className="outline-none data-[state=active]:animate-in data-[state=active]:fade-in-0"
            >
              {topCities?.length > 0 ? (
                <TopCitiesList cities={topCities} />
              ) : (
                <EmptyState icon={MapPin} message="No city data available" />
              )}
            </Tabs.Content>
          </div>
        </Tabs.Root>
      </div>
    </div>
  );
};

export default ArtistCard;