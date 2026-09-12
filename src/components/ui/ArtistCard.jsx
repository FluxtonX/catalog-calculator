import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import * as Tabs from "@radix-ui/react-tabs";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import * as Separator from "@radix-ui/react-separator";
import * as Tooltip from "@radix-ui/react-tooltip";
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
import CustomValuationTab from "../valuation/CustomValuationTab";
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
  // eslint-disable-next-line no-unused-vars
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
  importedDistributor,
  hideHeader = false,
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("tracks");
  const [enhancedAlbums, setEnhancedAlbums] = useState([]);
  const [showValuation, setShowValuation] = useState(true);
  const valuationSectionRef = useRef(null);

  const isItunes = platform === "itunes";
  const isYouTube = platform === "youtube";
  const isApify = platform === "apify" || platform === "spotify";
  const isCustom = platform === "custom";

  // ── Helpers ───────────────────────────────────────────
  const extractSpotifyId = useCallback((url) => {
    if (!url) return null;
    // eslint-disable-next-line no-useless-escape
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
  const valuationBtnActive = isItunes
    ? "bg-gradient-to-r from-slate-900 to-zinc-800 text-white shadow-xl shadow-slate-900/40 hover:shadow-slate-900/60 hover:scale-105 active:scale-95"
    : isYouTube
      ? "bg-gradient-to-r from-[#FF0000] to-[#FF0000] text-white shadow-xl shadow-[#FF0000]/40 hover:shadow-[#FF0000]/70 hover:scale-105 active:scale-95"
      : "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-xl shadow-emerald-500/40 hover:shadow-emerald-500/70 hover:scale-105 active:scale-95";

  const valuationBorderColor = isItunes
    ? "border-slate-300 dark:border-slate-600"
    : isYouTube
      ? "border-[#FF0000] dark:border-[#FF0000]/70"
      : "border-emerald-300 dark:border-emerald-700/70";

  const valuationBgColor = isItunes
    ? "from-slate-50 via-zinc-50 to-slate-100 dark:from-slate-900/80 dark:via-zinc-900/60 dark:to-slate-900/80"
    : isYouTube
      ? "from-[#FF0000]/10 via-[#FF0000]/5 to-[#FF0000]/10 dark:from-[#FF0000]/20 dark:via-[#FF0000]/10 dark:to-[#FF0000]/20"
      : "from-emerald-50 via-teal-50/80 to-green-50 dark:from-emerald-950/60 dark:via-teal-950/50 dark:to-green-950/60";

  const valuationIconBg = isItunes
    ? "from-slate-900 to-zinc-800"
    : isYouTube
      ? "from-[#FF0000] to-[#FF0000]"
      : "from-emerald-500 to-teal-600";

  const valuationAccentBar = isItunes
    ? "bg-gradient-to-r from-slate-700 via-zinc-500 to-slate-700"
    : isYouTube
      ? "bg-gradient-to-r from-[#FF0000] to-[#FF0000]"
      : "bg-gradient-to-r from-emerald-500 via-teal-400 to-green-500";

  const valuationGlowRing = isItunes
    ? "ring-2 ring-slate-400/30 dark:ring-slate-500/30"
    : isYouTube
      ? "ring-2 ring-[#FF0000]/40 dark:ring-[#FF0000]/40"
      : "ring-2 ring-emerald-400/40 dark:ring-emerald-500/40";

  // ── Render valuation content ───────────────────────────
  const renderValuation = () => {
    if (platform === "custom") {
      return (
        <CustomValuationTab
          artistData={{
            name,
            stats,
            importedDistributor,
          }}
        />
      );
    }
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
            importedDistributor,
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
        {!hideHeader && (
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
        )}

        {/* ── Valuation Auto-Render ──────────────── */}
        <div
          ref={valuationSectionRef}
          className={`relative overflow-hidden border-t-2 border-b-2 ${valuationBorderColor} ${valuationGlowRing} bg-gradient-to-br ${valuationBgColor} transition-all duration-300`}
        >
          {/* Accent bar at top */}
          <div className={`h-1.5 w-full ${valuationAccentBar}`} />

          <div className={`p-5 sm:p-8 lg:p-10 bg-white dark:bg-slate-900`}>
            {renderValuation()}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 lg:p-8">
          <div className="mt-8">
            <ArtistStats
              stats={stats}
              platform={platform}
              topTracks={topTracks}
              albums={albumsForDisplay}
              singles={singlesForDisplay}
            />
          </div>
        </div>
      </div>




    </div>
  );
};

export default ArtistCard;
