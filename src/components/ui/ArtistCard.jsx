import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import * as Tabs from "@radix-ui/react-tabs";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import * as Separator from "@radix-ui/react-separator";
import {
  Music, Facebook, Instagram, Twitter, Globe,
  Users, MapPin, Star, Disc, BarChart3,
  Map, Disc3, ListMusic, Heart, Album,
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

// ── Tab config ────────────────────────────────────────────
const buildTabs = ({ platform, hasRelated, hasCities, hasPopularReleases, hasSingles }) => {
  const tabs = [
    { id: "valuation", label: "Valuation", icon: BarChart3, always: true },
    { id: "tracks",   label: "Tracks",    icon: ListMusic,  always: true },
    { id: "albums",   label: "Albums",    icon: Disc3,      always: true },
    { id: "singles",  label: "Singles",   icon: Disc,       show: hasSingles },
    { id: "popular",  label: "Popular",   icon: Star,       show: hasPopularReleases },
    { id: "related",  label: "Related",   icon: Heart,      show: hasRelated },
    { id: "cities",   label: "Cities",    icon: Map,        show: hasCities && platform === "apify" },
  ];
  return tabs.filter((t) => t.always || t.show);
};

// ── Tab trigger with active indicator ────────────────────
const TabTrigger = ({ id, label, Icon }) => (
  <Tabs.Trigger
    value={id}
    className="
      group relative flex items-center gap-1.5 sm:gap-2
      px-3 sm:px-4 py-2.5 sm:py-3
      text-[11px] sm:text-sm font-semibold rounded-t-xl
      whitespace-nowrap outline-none select-none
      transition-all duration-200
      data-[state=inactive]:text-slate-500 dark:data-[state=inactive]:text-slate-400
      data-[state=inactive]:hover:text-slate-700 dark:data-[state=inactive]:hover:text-slate-200
      data-[state=inactive]:hover:bg-slate-200/60 dark:data-[state=inactive]:hover:bg-slate-700/50
      data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400
      data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900
    "
  >
    <Icon size={13} className="sm:w-4 sm:h-4 flex-shrink-0 transition-transform group-hover:scale-110 group-data-[state=active]:scale-110" />
    <span>{label}</span>
    {/* Active underline */}
    <span className="
      absolute bottom-0 left-0 right-0 h-0.5 rounded-full
      bg-emerald-500
      scale-x-0 data-[state=active]:scale-x-100
      transition-transform duration-200
    " />
  </Tabs.Trigger>
);

// ── Grid wrapper for media cards ─────────────────────────
const MediaGrid = ({ children }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
    {children}
  </div>
);

const ArtistCard = ({
  name, image, followers, popularity, genres,
  topTracks, relatedArtists, albums, singles, popularReleases,
  totalViews, stats, spotifyUrl, youtubeUrl, platform,
  monthlyListeners, biography, topCities, externalLinks,
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("valuation");
  const [enhancedAlbums, setEnhancedAlbums] = useState([]);

  // ── All original logic — UNCHANGED ───────────────────────
  const extractSpotifyId = useCallback((url) => {
    if (!url) return null;
    const match = url.match(/track[\/:]([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
  }, []);

  const getSocialIcon = useCallback((label) => {
    const iconMap = { facebook: Facebook, instagram: Instagram, twitter: Twitter, x: Twitter };
    return iconMap[label?.toLowerCase()] || Globe;
  }, []);

  const handleLaunchValuation = useCallback(() => {
    sessionStorage.setItem("artistCardScrollPos", window.scrollY.toString());
    navigate("/valuation/detail", {
      state: { artist: { name, image, followers, popularity, genres, topTracks, stats, monthlyListeners, platform } },
    });
  }, [navigate, name, image, followers, popularity, genres, topTracks, stats, monthlyListeners, platform]);

  useEffect(() => {
    let isMounted = true;
    const enhanceAlbumsWithSpotifyImages = async () => {
      const allReleases = [...(albums || []), ...(singles || []), ...(popularReleases || [])];
      if (allReleases.length === 0) { setEnhancedAlbums([]); return; }
      const uniqueReleases = allReleases.reduce((acc, current) => {
        if (!acc.find((item) => item.id === current.id)) acc.push(current);
        return acc;
      }, []);
      const sortedReleases = uniqueReleases.sort((a, b) => new Date(b.releaseDate || 0) - new Date(a.releaseDate || 0));
      setEnhancedAlbums(sortedReleases);
      try {
        const spotifyImages = await getSpotifyAlbumImages(name, sortedReleases);
        if (!isMounted) return;
        setEnhancedAlbums(sortedReleases.map((album) => {
          const spotifyData = spotifyImages.find((s) => s.id === album.id);
          return { ...album, image: spotifyData?.image || album.image };
        }));
      } catch {
        if (isMounted) setEnhancedAlbums(sortedReleases);
      }
    };
    if (activeTab === "albums") enhanceAlbumsWithSpotifyImages();
    return () => { isMounted = false; };
  }, [albums, singles, popularReleases, name, activeTab, platform]);

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

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">

      {/* ── Artist Info Card ─────────────────────────────── */}
      <div className="rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
        <ArtistHeader
          name={name} image={image} followers={followers}
          monthlyListeners={monthlyListeners} popularity={popularity}
          genres={genres} platform={platform} spotifyUrl={spotifyUrl}
          youtubeUrl={youtubeUrl} externalLinks={externalLinks}
          onLaunchValuation={handleLaunchValuation} getSocialIcon={getSocialIcon}
        />
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 lg:p-8">
          <ArtistStats stats={stats} platform={platform} topTracks={topTracks} albums={albums} />
        </div>
      </div>

      {/* ── Biography ────────────────────────────────────── */}
      {platform === "apify" && biography && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200 dark:border-slate-800 shadow-xl p-4 sm:p-6 lg:p-8">
          <SectionHeader
            icon={Music} title="Biography"
            iconBg="from-emerald-500/20 to-blue-500/20"
            iconColor="text-emerald-600 dark:text-emerald-400"
          />
          <Separator.Root className="bg-slate-100 dark:bg-slate-800 h-px mb-4" decorative />
          <BioText text={biography} />
        </div>
      )}

      {/* ── Radix Tabs Card ──────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        <Tabs.Root value={activeTab} onValueChange={setActiveTab}>

          {/* Tab List with horizontal scroll on mobile */}
          <div className="bg-slate-50 dark:bg-slate-800/70 border-b-2 border-slate-200 dark:border-slate-700">
            <ScrollArea.Root className="w-full">
              <ScrollArea.Viewport className="w-full">
                <Tabs.List
                  className="flex px-3 sm:px-5 pt-2 gap-0.5 sm:gap-1 min-w-max"
                  aria-label="Artist content"
                >
                  {tabs.map(({ id, label, icon }) => (
                    <TabTrigger key={id} id={id} label={label} Icon={icon} />
                  ))}
                </Tabs.List>
              </ScrollArea.Viewport>
              <ScrollArea.Scrollbar
                orientation="horizontal"
                className="flex h-0.5 bg-slate-200 dark:bg-slate-700"
              >
                <ScrollArea.Thumb className="bg-emerald-500 rounded-full" />
              </ScrollArea.Scrollbar>
            </ScrollArea.Root>
          </div>

          {/* Tab Content */}
          <div className="p-4 sm:p-6 lg:p-8 min-h-[380px] sm:min-h-[480px]">

            <Tabs.Content value="valuation" className="outline-none data-[state=active]:animate-in data-[state=active]:fade-in-0">
              {platform === "youtube" ? (
                <YouTubeValuationTab
                  artistData={{ name, image, totalViews: stats?.totalViews || 0, followers, popularity, platform }}
                />
              ) : (
                <ValuationTab
                  artistData={{ name, image, topTracks, albums, monthlyListeners, stats, platform, topCities }}
                />
              )}
            </Tabs.Content>

            <Tabs.Content value="tracks" className="outline-none data-[state=active]:animate-in data-[state=active]:fade-in-0">
              {topTracks?.length > 0
                ? <TrackList tracks={topTracks} platform={platform} extractSpotifyId={extractSpotifyId} />
                : <EmptyState icon={Music} message="No top tracks available" />}
            </Tabs.Content>

            <Tabs.Content value="albums" className="outline-none data-[state=active]:animate-in data-[state=active]:fade-in-0">
              {enhancedAlbums?.length > 0
                ? <MediaGrid>{enhancedAlbums.map((album, i) => <AlbumCard key={album.id || i} album={album} index={i} />)}</MediaGrid>
                : <EmptyState icon={Album} message="No albums available" />}
            </Tabs.Content>

            <Tabs.Content value="singles" className="outline-none data-[state=active]:animate-in data-[state=active]:fade-in-0">
              {singles?.length > 0
                ? <MediaGrid>{singles.map((s, i) => <SingleCard key={s.id || i} single={s} index={i} />)}</MediaGrid>
                : <EmptyState icon={Disc} message="No singles available" />}
            </Tabs.Content>

            <Tabs.Content value="popular" className="outline-none data-[state=active]:animate-in data-[state=active]:fade-in-0">
              {popularReleases?.length > 0
                ? <MediaGrid>{popularReleases.map((r, i) => <PopularReleaseCard key={r.id || i} release={r} index={i} />)}</MediaGrid>
                : <EmptyState icon={Star} message="No popular releases available" />}
            </Tabs.Content>

            <Tabs.Content value="related" className="outline-none data-[state=active]:animate-in data-[state=active]:fade-in-0">
              {relatedArtists?.length > 0
                ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                    {relatedArtists.map((a, i) => <RelatedArtistCard key={a.id || i} artist={a} index={i} />)}
                  </div>
                )
                : <EmptyState icon={Users} message="No related artists found" />}
            </Tabs.Content>

            <Tabs.Content value="cities" className="outline-none data-[state=active]:animate-in data-[state=active]:fade-in-0">
              {topCities?.length > 0
                ? <TopCitiesList cities={topCities} />
                : <EmptyState icon={MapPin} message="No city data available" />}
            </Tabs.Content>

          </div>
        </Tabs.Root>
      </div>
    </div>
  );
};

export default ArtistCard;