import React, { useState, useRef, useEffect } from "react";
import { 
  Instagram, 
  Youtube, 
  Twitter, 
  Facebook, 
  Music,
  TrendingUp,
  BarChart2,
  ListMusic,
  Play,
  Pause,
  Loader2,
  Radio
} from "lucide-react";
import { formatNumber, formatToMillions } from "../hooks/useValuationLogic";

const SocialStatCard = ({ icon: Icon, label, value, colorClass, iconColorClass, showExact }) => (
  <div 
    className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center gap-2.5 min-w-[140px] flex-1 transition-all text-center hover:border-slate-300 dark:hover:border-slate-700"
    title={value !== undefined && value !== null && value !== '' ? formatNumber(value) : "N/A"}
  >
    <p className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest w-full truncate">{label}</p>
    <div className="flex items-center justify-center gap-2">
      <Icon size={22} className={iconColorClass} />
      <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-none tracking-tight">
        {value !== undefined && value !== null && value !== '' ? (showExact ? formatNumber(value) : formatToMillions(value)) : "N/A"}
      </p>
    </div>
  </div>
);

const SocialStatsSection = ({ artistData }) => {
  const [showExact, setShowExact] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const audioRef = useRef(null);
  
  const { topTracks, stats, monthlyListeners, image, name: artistName } = artistData || {};

  // Clean up audio on unmount or when artist changes
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, [artistName]);

  const handlePlayPreview = async (e) => {
    if (e) e.stopPropagation();
    if (!mostPopularTrack) return;
    
    // If currently playing, pause it
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }
    
    // If we already have audio loaded and it's paused, just resume
    if (audioRef.current && audioRef.current.src) {
      audioRef.current.play();
      setIsPlaying(true);
      return;
    }
    
    setIsLoadingAudio(true);
    
    try {
      let previewUrl = mostPopularTrack.previewUrl;
      
      // Fallback to iTunes Search API if no Spotify preview
      if (!previewUrl) {
        const trackTitle = mostPopularTrack.title || mostPopularTrack.name;
        if (trackTitle) {
          const query = encodeURIComponent(`${trackTitle} ${artistName || ''}`);
          const res = await fetch(`https://itunes.apple.com/search?term=${query}&entity=song&limit=1`);
          const data = await res.json();
          if (data.results && data.results.length > 0) {
            previewUrl = data.results[0].previewUrl;
          }
        }
      }
      
      if (previewUrl) {
        audioRef.current = new Audio(previewUrl);
        audioRef.current.volume = 0.5;
        audioRef.current.onended = () => setIsPlaying(false);
        audioRef.current.play();
        setIsPlaying(true);
      } else {
        // Fallback: open Spotify
        if (mostPopularTrack.spotifyUrl) {
          window.open(mostPopularTrack.spotifyUrl, "_blank");
        }
      }
    } catch (err) {
      console.error("Failed to play preview", err);
    } finally {
      setIsLoadingAudio(false);
    }
  };
  
  // Extract most popular track
  const mostPopularTrack = topTracks && topTracks.length > 0 ? topTracks[0] : null;
  const popularTrackImage = mostPopularTrack?.album?.images?.[0]?.url || image;
  const popularTrackStreams = mostPopularTrack?.streamCount || mostPopularTrack?.playcount || mostPopularTrack?.streams || 0;
  
  // Extract stats
  const chartmetricRank = artistData?.chartmetricRank || stats?.cm_artist_rank || stats?.chartmetricRank || stats?.rank || 0;
  const playlistCount = artistData?.sp_playlists || stats?.sp_playlists || stats?.playlistCount || 0;
  
  // Social stats extraction
  const igFollowers = stats?.ig_followers || stats?.instagramFollowers || 0;
  const tiktokFollowers = stats?.tiktok_followers || stats?.tiktokFollowers || 0;
  const spotifyFollowers = stats?.sp_followers || stats?.spotifyFollowers || artistData?.followers || 0;
  const youtubeSubscribers = stats?.youtube_subscribers || stats?.youtubeSubscribers || stats?.totalSubscribers || 0;
  const xFollowers = stats?.twitter_followers || stats?.twitterFollowers || stats?.xFollowers || 0;
  const facebookFollowers = stats?.facebook_fans || stats?.facebookFollowers || stats?.facebookLikes || 0;
  const radioSpins = stats?.radio_spins || 0;

  // Render Spotify Logo SVG
  const SpotifyLogo = ({ size = 20, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.84.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.84.241 1.2zM19.08 10.26c-3.959-2.34-10.44-2.58-14.16-1.44-.6.18-1.2-.12-1.38-.72-.18-.6.12-1.2.72-1.38 4.32-1.26 11.4-1.02 15.84 1.62.54.3.72 1.02.42 1.56-.24.54-.9.72-1.44.42z"/>
    </svg>
  );

  // Render TikTok Logo SVG
  const TikTokLogo = ({ size = 20, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.01.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 2.78-1.15 5.54-3.33 7.39-1.95 1.7-4.94 2.37-7.22 1.25-2.25-1.11-3.84-3.14-4.22-5.71-.38-2.67.56-5.49 2.53-7.28 1.88-1.74 4.86-2.25 7.15-1.19.06.85.06 1.7.07 2.55-1.15-.55-2.61-.43-3.64.33-1.06.77-1.63 2.1-1.47 3.42.17 1.34 1.09 2.54 2.29 3.08 1.4.63 3.19.46 4.32-.67 1.03-1.03 1.41-2.59 1.4-4.04.01-4.92.01-9.84.01-14.76h.13z"/>
    </svg>
  );


  return (
    <div className="flex flex-col gap-6 mt-6">
      {/* Top Cards Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Most Popular Track Card */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-md flex items-center justify-between relative overflow-hidden">
          <div className="z-10 flex flex-col justify-between h-full">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">Most Popular Track</p>
            <div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-[250px] mb-2">
                {(mostPopularTrack && (mostPopularTrack.title || mostPopularTrack.name)) ? (mostPopularTrack.title || mostPopularTrack.name) : "Unknown Track"}
              </h3>
              <div className="flex items-center gap-2">
                <SpotifyLogo size={24} className="text-[#1DB954]" />
                <span className="text-2xl font-black text-slate-900 dark:text-white" title={mostPopularTrack ? formatNumber(popularTrackStreams) : "0"}>
                  {mostPopularTrack && popularTrackStreams > 0 ? (showExact ? formatNumber(popularTrackStreams) : formatToMillions(popularTrackStreams)) : "0"}
                </span>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest mt-1">Streams</span>
              </div>
            </div>
          </div>
          
          {/* Track Image Collage / Artwork */}
          <div 
            className="relative z-10 w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden shadow-lg border-2 border-white dark:border-slate-800 group cursor-pointer"
            onClick={handlePlayPreview}
            title={isPlaying ? "Pause Preview" : "Play Preview"}
          >
            <img src={popularTrackImage || "/placeholder-artwork.png"} alt="Artwork" className={`w-full h-full object-cover transition-transform duration-500 ${isPlaying ? 'scale-110' : 'group-hover:scale-110'}`} />
            <div className={`absolute inset-0 bg-black/30 flex items-center justify-center transition-opacity ${isPlaying || isLoadingAudio ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
               <div className="w-10 h-10 bg-[#0095FF] hover:bg-[#007acc] transition-colors rounded-full flex items-center justify-center shadow-lg">
                 {isLoadingAudio ? (
                   <Loader2 className="w-5 h-5 text-white animate-spin" />
                 ) : isPlaying ? (
                   <Pause className="w-5 h-5 text-white" fill="currentColor" />
                 ) : (
                   <Play className="w-5 h-5 text-white ml-1" fill="currentColor" />
                 )}
               </div>
            </div>
            
            {/* Equalizer animation when playing */}
            {isPlaying && (
              <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 items-end h-4 px-2">
                <div className="w-1 bg-white rounded-t-sm animate-[bounce_1s_infinite] h-2"></div>
                <div className="w-1 bg-white rounded-t-sm animate-[bounce_1.2s_infinite_0.1s] h-4"></div>
                <div className="w-1 bg-white rounded-t-sm animate-[bounce_0.9s_infinite_0.2s] h-3"></div>
                <div className="w-1 bg-white rounded-t-sm animate-[bounce_1.1s_infinite_0.3s] h-2"></div>
              </div>
            )}
          </div>
          
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 dark:bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        </div>

        {/* Stats Grid */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Chartmetric Rank */}
          <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 rounded-3xl p-5 border border-slate-200 dark:border-slate-700 shadow-md flex flex-col justify-center items-center text-center group hover:-translate-y-1 transition-all duration-300">
            <div className="mb-3 p-2 bg-[#48D3B4]/10 rounded-full">
              <TrendingUp size={24} className="text-[#48D3B4]" />
            </div>
            <div className="flex items-baseline justify-center">
              <span className="text-3xl font-black text-[#48D3B4]">{chartmetricRank ? formatNumber(chartmetricRank) : "N/A"}</span>
              {chartmetricRank > 0 && <span className="text-[#48D3B4] font-bold text-sm ml-0.5">th</span>}
            </div>
            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-2">Chartmetric Rank</p>
          </div>

          {/* Monthly Listeners */}
          <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 rounded-3xl p-5 border border-slate-200 dark:border-slate-700 shadow-md flex flex-col justify-center items-center text-center group hover:-translate-y-1 transition-all duration-300" title={monthlyListeners ? formatNumber(monthlyListeners) : "N/A"}>
            <div className="mb-3 p-2 bg-[#1DB954]/10 rounded-full">
              <SpotifyLogo size={24} className="text-[#1DB954]" />
            </div>
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {monthlyListeners ? (showExact ? formatNumber(monthlyListeners) : formatToMillions(monthlyListeners)) : "N/A"}
            </span>
            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-2">Monthly Listeners</p>
          </div>

          {/* Playlist Count */}
          <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 rounded-3xl p-5 border border-slate-200 dark:border-slate-700 shadow-md flex flex-col justify-center items-center text-center group hover:-translate-y-1 transition-all duration-300" title={playlistCount ? formatNumber(playlistCount) : "N/A"}>
            <div className="mb-3 p-2 bg-[#1DB954]/10 rounded-full">
              <ListMusic size={24} className="text-[#1DB954]" />
            </div>
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {playlistCount ? (showExact ? formatNumber(playlistCount) : formatToMillions(playlistCount)) : "N/A"}
            </span>
            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-2">Playlist Count</p>
          </div>
        </div>
      </div>

      {/* Quick Social Stats Section */}
      <div className="w-full mt-4">
        {/* Header section with toggle */}
        <div className="flex justify-between items-center mb-6 px-1">
          <h3 className="text-xl font-black text-slate-900 dark:text-white">Quick Social Stats</h3>
          
          <button 
            onClick={() => setShowExact(!showExact)}
            className="flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
          >
            <div className={`w-2 h-2 rounded-full ${showExact ? 'bg-green-500' : 'bg-slate-400'}`}></div>
            {showExact ? 'Exact Numbers' : 'Abbreviated'}
          </button>
        </div>
        
        <div className="flex overflow-x-auto pb-4 gap-4 hide-scrollbar">
          {radioSpins > 0 && (
            <SocialStatCard 
              icon={Radio} 
              label="Radio Spins (Soundcharts)" 
              value={radioSpins} 
              iconColorClass="text-[#8B5CF6]" 
              showExact={showExact}
            />
          )}
          <SocialStatCard 
            icon={Instagram} 
            label="IG Followers" 
            value={igFollowers} 
            iconColorClass="text-[#E1306C]" 
            showExact={showExact}
          />
          <SocialStatCard 
            icon={TikTokLogo} 
            label="TikTok Followers" 
            value={tiktokFollowers} 
            iconColorClass="text-black dark:text-white" 
            showExact={showExact}
          />
          <SocialStatCard 
            icon={SpotifyLogo} 
            label="Spotify Followers" 
            value={spotifyFollowers} 
            iconColorClass="text-[#1DB954]" 
            showExact={showExact}
          />
          <SocialStatCard 
            icon={Youtube} 
            label="YouTube Subscribers" 
            value={youtubeSubscribers} 
            iconColorClass="text-[#FF0000]" 
            showExact={showExact}
          />
          <SocialStatCard 
            icon={Twitter} 
            label="X Followers" 
            value={xFollowers} 
            iconColorClass="text-black dark:text-white" 
            showExact={showExact}
          />
          <SocialStatCard 
            icon={Facebook} 
            label="Facebook Followers" 
            value={facebookFollowers} 
            iconColorClass="text-[#1877F2]" 
            showExact={showExact}
          />
        </div>
      </div>
      
      {/* Hide scrollbar styling */}
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
};

export default SocialStatsSection;
