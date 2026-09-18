import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  X,
  Sparkles,
  AlertTriangle,
  Loader2,
  Info,
  Music,
  Zap,
  Radio,
  Users,
  Trophy,
  Instagram,
  Youtube,
  Music2,
  Globe
} from "lucide-react";

import SocialStatsSection from "./sections/SocialStatsSection";
import StreamingStatsSection from "./sections/StreamingStatsSection";
import BioText from "../artist/BioText";
import SectionHeader from "../common/SectionHeader";
import * as Separator from "@radix-ui/react-separator";
import {
  searchYouTube,
  getNormalizedArtistData,
  getArtistSuggestions,
  getYouTubeChannelDetails,
  searchAppleMusic,
  searchItunes,
} from "../../utils/api";
import { useArtistStore } from "../../store/artistStore";
import ChannelSelector from "../youtube/ChannelSelector";
import CfaMasterValuation from "./CfaMasterValuation";
import { getCombinedValuation } from "../../core/calculations";
import { formatCurrency } from "./hooks/useValuationLogic";

const SUGGESTED_ARTISTS = [
  "Taylor Swift",
  "Drake",
  "The Weeknd",
  "Bad Bunny",
  "Ariana Grande",
  "KCee",
];

const formatNum = (num) => {
  if (!num) return '0';
  if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
  return num.toString();
};

const OverviewModal = ({ onClose }) => {
  const {
    searchQuery,
    setSearchQuery,
    selectedArtists,
    setSelectedArtists,
    platforms,
    importedData,
    selectedDistributor,
    clearImportedData,
  } = useArtistStore();

  const isInitialMount = useRef(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showSuggestionsDropdown, setShowSuggestionsDropdown] = useState(false);
  const [youtubeChannels, setYoutubeChannels] = useState([]);
  const [showChannelSelector, setShowChannelSelector] = useState(false);
  const [shouldShowSuggestions, setShouldShowSuggestions] = useState(true);

  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("recentSearches") || "[]");
    } catch {
      return [];
    }
  });

  const saveRecentSearch = (artist) => {
    const updated = [
      artist,
      ...recentSearches.filter((a) => a !== artist),
    ].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };
  const inputRef = useRef(null);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      if (importedData && searchQuery.trim()) {
        handleSearch();
      }
      return;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!shouldShowSuggestions) return;
      if (!searchQuery.trim()) {
        setSuggestions([]);
        setShowSuggestionsDropdown(false);
        return;
      }
      setIsLoadingSuggestions(true);
      setShowSuggestionsDropdown(true);
      try {
        let results = SUGGESTED_ARTISTS.filter((a) =>
          a.toLowerCase().includes(searchQuery.toLowerCase()),
        );
        if (searchQuery.length > 3) {
          try {
            const apiResults = await getArtistSuggestions(
              searchQuery,
              "spotify",
            );
            results = [
              ...new Set([...results, ...apiResults.map((r) => r.name)]),
            ];
          // eslint-disable-next-line no-empty
          } catch { }
        }
        if (results.length === 0 && searchQuery.length > 1)
          results = [searchQuery];
        setSuggestions(results);
      } catch {
        setSuggestions([]);
      } finally {
        setIsLoadingSuggestions(false);
      }
    };
    const timer = setTimeout(
      fetchSuggestions,
      searchQuery.length < 3 ? 150 : 350,
    );
    return () => clearTimeout(timer);
  }, [searchQuery, shouldShowSuggestions]);

  const isReasonableMatch = (query, resultName) => {
     if (!resultName) return false;
     const q = query.toLowerCase().replace(/[^a-z0-9]/g, '');
     const r = resultName.toLowerCase().replace(/[^a-z0-9]/g, '');
     return q.includes(r) || r.includes(q) || q.length === 0;
  };

  const doSearchForPlatform = async (query, plt) => {
    switch (plt) {
      case "spotify":
        return await getNormalizedArtistData(query);
      case "youtube": {
        const result = await searchYouTube(query);
        if (result.type === "channel_list")
          return { type: "channel_list", channels: result.channels, platform: plt };
        if (result.type === "single_channel")
          return { type: "single_channel", channel: result.channel, platform: plt };
        return { ...result, platform: plt };
      }
      case "itunes":
        try {
          const res = await searchAppleMusic(query);
          return { ...res, platform: plt };
        } catch {
          const res = await searchItunes(query);
          return { ...res, platform: plt };
        }
      default:
        throw new Error("Invalid platform selected");
    }
  };

  useEffect(() => {
    if ((importedData || searchQuery.trim()) && Object.keys(selectedArtists).length === 0 && !isLoading && !error) {
      if (searchQuery.trim()) {
        handleSearch();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [importedData, searchQuery, isLoading, error]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError("Please enter a search query");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSelectedArtists({});
    clearImportedData();
    setShowSuggestionsDropdown(false);
    setShowChannelSelector(false);
    setYoutubeChannels([]);
    let hasChannelList = false;

    try {
      const results = await Promise.allSettled(
        platforms.map(p => doSearchForPlatform(searchQuery, p))
      );
      
      const newSelectedArtists = {};
      let youtubeChannelsData = [];
      let foundValidPublicArtist = false;

      results.forEach((res, i) => {
        const p = platforms[i];
        if (res.status === 'fulfilled') {
          const data = res.value;
          if (data?.type === "channel_list") {
            youtubeChannelsData = data.channels;
            hasChannelList = true;
            foundValidPublicArtist = true;
          } else if (data?.type === "single_channel") {
            youtubeChannelsData = [data.channel];
            hasChannelList = true;
            foundValidPublicArtist = true;
          } else if (data?.name) {
             if (isReasonableMatch(searchQuery, data.name)) {
                newSelectedArtists[p] = { ...data, platform: p };
                foundValidPublicArtist = true;
             }
          }
        }
      });
      
      if (hasChannelList && youtubeChannelsData.length > 0) {
        const sortedChannels = [...youtubeChannelsData].sort((a, b) => (b.subscribers || 0) - (a.subscribers || 0));
        const bestChannel = sortedChannels[0];
        setYoutubeChannels([bestChannel]);
        try {
          const details = await getYouTubeChannelDetails(searchQuery, bestChannel.id);
          if (isReasonableMatch(searchQuery, details.name)) {
             newSelectedArtists["youtube"] = { ...details, platform: "youtube" };
          }
        } catch (err) {}
        setShowChannelSelector(true);
      }
      
      if (!foundValidPublicArtist && !importedData) {
        throw new Error(`We couldn't find public catalog information for "${searchQuery}".`);
      }
      
      if (importedData) {
        newSelectedArtists["custom"] = {
          name: searchQuery,
          platform: "custom",
          importedDistributor: selectedDistributor,
          stats: {
            totalRevenue: parseFloat(importedData.totalRevenue || 0),
            lifetimeRevenue: parseFloat(importedData.lifetimeRevenue || importedData.totalRevenue || 0),
            unrecoupedBalance: parseFloat(importedData.unrecoupedBalance || 0),
            growthRate: parseFloat(importedData.growthRate || 0),
            totalStreams: parseInt(importedData.totalStreams || 0, 10),
            totalTracks: parseInt(importedData.totalTracks || 0, 10)
          }
        };
      }

      setSelectedArtists(newSelectedArtists);
      setError(null);
      saveRecentSearch(searchQuery);

    } catch (err) {
      setError(err.message || "Search failed");
      setSelectedArtists({});
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = async (artist) => {
    setSearchQuery(artist);
    setShowSuggestionsDropdown(false);
    setShouldShowSuggestions(false);
    setError(null);

    setIsLoading(true);
    setSelectedArtists({});
    setShowChannelSelector(false);
    setYoutubeChannels([]);
    let hasChannelList = false;
    let historyYoutubeChannelsData = [];
    try {
      const results = await Promise.allSettled(
        platforms.map(p => doSearchForPlatform(artist, p))
      );
      
      const newSelectedArtists = {};
      
      results.forEach((res, i) => {
        const p = platforms[i];
        if (res.status === 'fulfilled') {
          const data = res.value;
          if (data?.type === "channel_list") {
            historyYoutubeChannelsData = data.channels;
            hasChannelList = true;
          } else if (data?.type === "single_channel") {
            historyYoutubeChannelsData = [data.channel];
            hasChannelList = true;
          } else if (data?.name) {
            newSelectedArtists[p] = { ...data, platform: p };
          }
        }
      });
      
      if (hasChannelList && historyYoutubeChannelsData.length > 0) {
        const sortedChannels = [...historyYoutubeChannelsData].sort((a, b) => (b.subscribers || 0) - (a.subscribers || 0));
        const bestChannel = sortedChannels[0];
        setYoutubeChannels([bestChannel]);
        setShowChannelSelector(true);
        try {
          const details = await getYouTubeChannelDetails(artist, bestChannel.id);
          if (isReasonableMatch(artist, details.name)) {
             newSelectedArtists["youtube"] = { ...details, platform: "youtube" };
          }
        } catch (err) {}
      }

      setSelectedArtists(newSelectedArtists);
      setError(null);
      saveRecentSearch(artist);

    } catch (err) {
      setError(err.message || "Search failed");
      setSelectedArtists({});
    } finally {
      setIsLoading(false);
    }
  };

  const handleChannelSelect = async (channel) => {
    setIsLoading(true);
    setError(null);
    setShowChannelSelector(false);
    try {
      const result = await getYouTubeChannelDetails(searchQuery, channel.id);
      if (!result?.name) throw new Error("Invalid response from API");
      
      const newYoutubeArtist = { ...result, platform: 'youtube' };
      const currentSelectedArtists = useArtistStore.getState().selectedArtists || {};
      const nextSelectedArtists = { ...currentSelectedArtists, youtube: newYoutubeArtist };
      setSelectedArtists(nextSelectedArtists);
      saveRecentSearch(searchQuery);

    } catch (err) {
      setError(err.message || "Failed to load channel details");
    } finally {
      setIsLoading(false);
    }
  };

  const estimatedValue = Object.keys(selectedArtists).length > 0 ? getCombinedValuation(selectedArtists) : null;



  // Extract master data for the banner
  const primaryArtist = selectedArtists.spotify || selectedArtists.youtube || selectedArtists.itunes || Object.values(selectedArtists)[0] || null;

  return (
    // Modal Overlay
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 sm:p-6">
      {/* Modal Container */}
      <div className="relative w-full max-w-5xl max-h-[85vh] bg-[#f8fafc] rounded-3xl shadow-2xl overflow-y-auto flex flex-col hide-scrollbar">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all backdrop-blur-sm border border-white/20"
        >
          <X size={20} />
        </button>

        {/* Hero Banner Section */}
        <div className="relative pt-12 pb-24 px-8 bg-gradient-to-br from-slate-900 via-emerald-950 to-emerald-900 flex-shrink-0">
           {/* Decorative elements */}
           <div className="absolute inset-0 overflow-hidden pointer-events-none">
             <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[150%] bg-white/5 blur-3xl rounded-full" />
             <div className="absolute top-[20%] -left-[10%] w-[30%] h-[100%] bg-emerald-500/10 blur-3xl rounded-full" />
           </div>
           
           <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 w-full">
              <div className="flex flex-col md:flex-row items-center gap-6">
                {/* Artist Avatar */}
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white/10 shadow-2xl flex-shrink-0 bg-slate-800">
                  {primaryArtist?.image ? (
                    <img src={primaryArtist.image} alt={primaryArtist.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-500">
                      <Music2 size={40} />
                    </div>
                  )}
                </div>
                
                {/* Artist Info */}
                <div className="text-center md:text-left text-white">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-3">
                    <Sparkles size={12} className="text-[#1DB954]" />
                    <span className="text-[10px] font-bold tracking-widest uppercase text-white/90">Music Stats</span>
                  </div>
                  <h1 className="text-2xl md:text-4xl font-black tracking-tight mb-1 flex flex-col">
                    <span className="text-sm md:text-lg font-semibold text-white/70">Quick overview of</span>
                    <span>{primaryArtist?.name || "Artist"}</span>
                  </h1>
                  <p className="text-white/60 font-medium text-sm">
                     United States • Global Catalog
                  </p>
               </div>
              </div>

              {/* Estimated Catalog Value (Right Aligned in Header) */}
              {!isLoading && estimatedValue && (
                <div className="md:ml-auto flex flex-col items-center md:items-end text-center md:text-right bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl">
                  <p className="text-[#00E5FF] text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-1.5">Estimated Catalog Value</p>
                  <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-1">
                    {formatCurrency(estimatedValue)}
                  </p>
                  <p className="text-white/50 text-[10px] sm:text-xs font-medium uppercase mt-2 max-w-[200px]">
                    THIS ESTIMATE IS AN INDICATION BASED ON YOUR TOP 10 TRACKS
                  </p>
                </div>
              )}
           </div>
        </div>

        <div className="flex-1 p-6 sm:p-8 -mt-14 relative z-20 space-y-8">
          
          {/* Top Overlapping Stats Card */}
          {primaryArtist && (
             <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200 p-6 grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                <div className="flex flex-col items-center justify-center text-center p-2">
                   <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mb-3">
                     <Trophy size={20} />
                   </div>
                   <p className="text-3xl font-black text-slate-900 mb-1">{primaryArtist.popularity || 'N/A'}</p>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Popularity Score</p>
                </div>
                <div className="flex flex-col items-center justify-center text-center p-2">
                   <div className="w-10 h-10 rounded-full bg-[#1DB954]/5 text-[#1DB954] flex items-center justify-center mb-3">
                     <Radio size={20} />
                   </div>
                   <p className="text-3xl font-black text-slate-900 mb-1">
                      {primaryArtist.monthlyListeners ? formatNum(primaryArtist.monthlyListeners) : 'N/A'}
                   </p>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Monthly Listeners</p>
                </div>
                <div className="flex flex-col items-center justify-center text-center p-2">
                   <div className="w-10 h-10 rounded-full bg-[#1DB954]/5 text-[#1DB954] flex items-center justify-center mb-3">
                     <Users size={20} />
                   </div>
                   <p className="text-3xl font-black text-slate-900 mb-1">
                      {primaryArtist.followers ? formatNum(primaryArtist.followers) : 'N/A'}
                   </p>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Followers</p>
                </div>
             </div>
          )}

          {/* Search Card Removed Per User Request */}

          {/* Loading skeleton */}
          {isLoading && (
            <div className="space-y-4 animate-pulse">
              <div className="h-40 bg-white border border-slate-200 rounded-2xl" />
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-24 bg-white border border-slate-200 rounded-2xl" />
                ))}
              </div>
            </div>
          )}

          {/* Channel Selector */}
          {!isLoading && showChannelSelector && youtubeChannels.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
               <ChannelSelector
                 channels={youtubeChannels}
                 onSelectChannel={handleChannelSelect}
                 isLoading={isLoading}
               />
            </div>
          )}

          {/* Biography & Official Profiles */}
          {!isLoading && Object.keys(selectedArtists).length > 0 && (
             <div className="flex flex-col gap-6">
                
                {/* Biography */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                  {(() => {
                    const bioArtist = Object.values(selectedArtists).find(a => a.biography);
                    if (!bioArtist) return (
                      <div className="flex flex-col items-center justify-center text-slate-400 py-6">
                         <Info size={32} className="mb-2" />
                         <p>No biography available.</p>
                      </div>
                    );
                    return (
                      <>
                        <div className="flex items-center gap-2 mb-4">
                          <Info size={18} className="text-slate-400" />
                          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">BIOGRAPHY</h3>
                        </div>
                        <div>
                          <BioText text={bioArtist.biography} forceLightMode={true} />
                        </div>
                      </>
                    );
                  })()}
                </div>

                {/* Official Profiles */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                   <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-6">Official Profiles</h3>
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {selectedArtists.spotify && (
                        <a 
                          href={selectedArtists.spotify.spotifyUrl || selectedArtists.spotify.url || `https://open.spotify.com/artist/${selectedArtists.spotify.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors border border-slate-100 cursor-pointer"
                        >
                           <Music2 size={24} className="text-[#1DB954]" />
                           <div className="flex-1 min-w-0">
                             <p className="text-sm font-bold text-slate-900 truncate">Spotify</p>
                             <p className="text-xs text-slate-500 truncate">Listen on Spotify</p>
                           </div>
                        </a>
                      )}
                      {selectedArtists.youtube && (
                        <a 
                          href={selectedArtists.youtube.url || selectedArtists.youtube.customUrl ? `https://youtube.com/${selectedArtists.youtube.customUrl}` : `https://youtube.com/channel/${selectedArtists.youtube.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors border border-slate-100 cursor-pointer"
                        >
                           <Youtube size={24} className="text-[#CC0000]" />
                           <div className="flex-1 min-w-0">
                             <p className="text-sm font-bold text-slate-900 truncate">YouTube</p>
                             <p className="text-xs text-slate-500 truncate">Watch on YouTube</p>
                           </div>
                        </a>
                      )}
                      {selectedArtists.itunes && (
                        <a 
                          href={selectedArtists.itunes.artistLinkUrl || selectedArtists.itunes.url || `https://music.apple.com/artist/${selectedArtists.itunes.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors border border-slate-100 cursor-pointer"
                        >
                           <Globe size={24} className="text-slate-700" />
                           <div className="flex-1 min-w-0">
                             <p className="text-sm font-bold text-slate-900 truncate">Apple Music</p>
                             <p className="text-xs text-slate-500 truncate">Listen on Apple Music</p>
                           </div>
                        </a>
                      )}
                   </div>
                </div>

             </div>
          )}

          {/* Social Stats */}
          {!isLoading && Object.keys(selectedArtists).length > 0 && (
             <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 overflow-x-auto hide-scrollbar">
                <SocialStatsSection 
                  artistData={selectedArtists.spotify || selectedArtists.youtube || selectedArtists.itunes || selectedArtists.apify || Object.values(selectedArtists)[0]} 
                  forceLightMode={true}
                />
             </div>
          )}

          {/* Streaming Stats Grid */}
          {!isLoading && Object.keys(selectedArtists).length > 0 && (
             <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                  <StreamingStatsSection 
                    artistData={{
                      ...(selectedArtists.apify || selectedArtists.spotify || Object.values(selectedArtists)[0]),
                      stats: {
                        ...(selectedArtists.apify?.stats || {}),
                        sp_followers: selectedArtists.apify?.stats?.sp_followers || selectedArtists.spotify?.followers?.total || selectedArtists.spotify?.followers || 0,
                        youtube_subscribers: selectedArtists.apify?.stats?.youtube_subscribers || selectedArtists.youtube?.subscriberCount || 0,
                        ycs_views: selectedArtists.apify?.stats?.ycs_views || selectedArtists.youtube?.viewCount || 0,
                      }
                    }} 
                    forceLightMode={true}
                  />
                </div>
             </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default OverviewModal;
