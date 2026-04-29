import React, { useState, useEffect, useCallback, useRef } from "react";
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
  BarChart3,
  Album,

  Disc, 
} from "lucide-react";
import { getSpotifyAlbumImages } from "../../utils/api";
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
import {
  ArtistTabTrigger,
  MediaGrid,
  buildArtistTabs,
} from "./artistCardTabs";

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
  appleUrl,
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
  const valuationSectionRef = useRef(null);

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
       const spotifyImages = await getSpotifyAlbumImages(
  name,
  sortedReleases,
);
if (!isMounted) return;
setEnhancedAlbums(
  sortedReleases.map((album) => {
    const spotifyData = spotifyImages.find(
      (s) => s.albumName === album.name  // ✅ match by name not id
    );
    return { ...album, image: spotifyData?.image || album.image };
  }),
);
        } catch {
          if (isMounted) setEnhancedAlbums(sortedReleases);
        }
      }
    };
 enhanceAlbums(); // ✅ always run on mount and when data changes
    return () => {
      isMounted = false;
    };
}, [albums, singles, popularReleases, name, platform, isItunes]);

  useEffect(() => {
    const savedScrollPos = sessionStorage.getItem("artistCardScrollPos");
    if (savedScrollPos) {
      requestAnimationFrame(() => {
        window.scrollTo(0, parseInt(savedScrollPos));
        sessionStorage.removeItem("artistCardScrollPos");
      });
    }
  }, []);

  useEffect(() => {
    if (showValuation && valuationSectionRef.current) {
      valuationSectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [showValuation]);

  const tabs = buildArtistTabs({
    platform,
    hasRelated: relatedArtists?.length > 0,
    hasCities: topCities?.length > 0,
    hasPopularReleases: popularReleases?.length > 0,
    hasSingles: singles?.length > 0,
  });

  const displayedAlbums = enhancedAlbums.filter((release) => release.type === "album");
  const displayedSingles = enhancedAlbums.filter((release) => release.type === "single");
  const albumsForDisplay = displayedAlbums.length > 0 ? displayedAlbums : albums || [];
  const singlesForDisplay = displayedSingles.length > 0 ? displayedSingles : singles || [];

  // ── Valuation styles per platform ─────────────────────
  // Apple-black for iTunes
  const valuationBtnActive = isItunes
    ? "bg-gradient-to-r from-slate-900 to-zinc-800 text-white shadow-lg shadow-slate-900/30 group-hover:shadow-slate-900/50 group-hover:scale-105"
    : isYouTube
      ? "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/30 group-hover:shadow-red-500/50 group-hover:scale-105"
      : "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30 group-hover:shadow-emerald-500/50 group-hover:scale-105";

  const valuationBorderColor = isItunes
    ? "border-slate-300 dark:border-slate-700"
    : isYouTube
      ? "border-red-200 dark:border-red-800/60"
      : "border-emerald-200 dark:border-emerald-800/60";

  const valuationBgColor = isItunes
    ? "from-slate-100 to-zinc-100 dark:from-slate-900/60 dark:to-zinc-900/40"
    : isYouTube
      ? "from-red-50 to-rose-50 dark:from-red-950/40 dark:to-rose-950/40"
      : "from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40";

  const valuationIconBg = isItunes
    ? "from-slate-900 to-zinc-800"
    : isYouTube
      ? "from-red-500 to-rose-600"
      : "from-emerald-500 to-teal-600";

  // ── Render valuation content ───────────────────────────
  const renderValuation = () => {
    if (isYouTube) {
      return (
        <YouTubeValuationTab
          artistData={{
            name,
            image,
            totalViews: stats?.totalViews || 0,
            followers,
            popularity,
            platform,
          }}
        />
      );
    }
    if (isItunes) {
      return (
        <ITunesValuationTab
          artistData={{
            name,
            image,
            topTracks,
            albums,
            singles,
            stats,
            platform,
            popularity,
            genres,
          }}
        />
      );
    }
    return (
      <ValuationTab
        artistData={{
          name,
          image,
          topTracks,
          albums,
          monthlyListeners,
          stats,
          platform,
          topCities,
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
          onCalculateRoyalties={() => setShowValuation(true)}
        />
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 lg:p-8">
    
         <ArtistStats
  stats={stats}
  platform={platform}
  topTracks={topTracks}
  albums={albumsForDisplay}
  singles={singlesForDisplay}
/>
        </div>
      </div>

      {/* ── Valuation Toggle ─────────────────────────────── */}
      <div
        ref={valuationSectionRef}
        className={`rounded-3xl overflow-hidden border-2 ${valuationBorderColor} shadow-xl bg-gradient-to-br ${valuationBgColor}`}
      >
        <button
          onClick={() => setShowValuation((v) => !v)}
          className="w-full flex items-center justify-between gap-4 px-5 sm:px-8 py-5 sm:py-6 group"
        >
          <div className="flex items-center gap-4">
            <div
              className={`p-3 bg-gradient-to-br ${valuationIconBg} rounded-2xl shadow-lg`}
            >
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
                    ? " Youtube Revenue Estimates and Catalog Valuuation"
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
            {showValuation ? "Hide" : "Calculate Royalties"}
          </div>
        </button>

        {showValuation && (
          <div
            className={`border-t-2 ${valuationBorderColor} p-4 sm:p-6 lg:p-8 bg-white dark:bg-slate-900`}
          >
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
            iconBg={
              isItunes
                ? "from-slate-800/15 to-zinc-800/15"
                : "from-emerald-500/20 to-blue-500/20"
            }
            iconColor={
              isItunes
                ? "text-slate-900 dark:text-white"
                : "text-emerald-600 dark:text-emerald-400"
            }
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
                    <ArtistTabTrigger
                      key={id}
                      id={id}
                      label={label}
                      Icon={icon}
                      platform={platform}
                    />
                  ))}
                </Tabs.List>
              </ScrollArea.Viewport>
              <ScrollArea.Scrollbar
                orientation="horizontal"
                className="flex h-0.5 bg-slate-200 dark:bg-slate-700"
              >
                {/* Black scrollbar thumb for iTunes */}
                <ScrollArea.Thumb
                  className={`rounded-full ${
                    isItunes ? "bg-slate-900 dark:bg-white" : "bg-emerald-500"
                  }`}
                />
              </ScrollArea.Scrollbar>
            </ScrollArea.Root>
          </div>

          {/* Tab Content */}
          <div className="p-4 sm:p-6 lg:p-8 min-h-[380px] sm:min-h-[480px]">
            {/* Tracks */}
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

            {/* Albums */}
            <Tabs.Content
              value="albums"
              className="outline-none data-[state=active]:animate-in data-[state=active]:fade-in-0"
            >
              {albumsForDisplay?.length > 0 ? (
                <MediaGrid>
                 {albumsForDisplay.map((album, i) => (
    <AlbumCard key={album.id || i} album={album} index={i} platform={platform} />
  ))}
                </MediaGrid>
              ) : (
                <EmptyState icon={Album} message="No albums available" />
              )}
            </Tabs.Content>

            {/* Singles */}
  {/* Singles */}
<Tabs.Content value="singles" className="outline-none data-[state=active]:animate-in data-[state=active]:fade-in-0">
  {singlesForDisplay?.length > 0 ? (
    <MediaGrid>
      {singlesForDisplay.map((s, i) => (
          <SingleCard key={s.id || i} single={s} index={i} platform={platform} />
        ))}
    </MediaGrid>
  ) : (
    <EmptyState icon={Disc} message="No singles available" />
  )}
</Tabs.Content>

            {/* Popular */}
            <Tabs.Content
              value="popular"
              className="outline-none data-[state=active]:animate-in data-[state=active]:fade-in-0"
            >
              {popularReleases?.length > 0 ? (
                <MediaGrid>
                {enhancedAlbums.map((r, i) => (
  <PopularReleaseCard key={r.id || i} release={r} index={i} platform={platform} />
))}
                </MediaGrid>
              ) : (
                <EmptyState
                  icon={Star}
                  message="No popular releases available"
                />
              )}
            </Tabs.Content>

            {/* Related Artists */}
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

            {/* Top Cities */}
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
