import React from "react";
import { PlayCircle } from "lucide-react";
import { formatToMillions } from "../hooks/useValuationLogic";

// Custom SVG Icons
const SpotifyIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="#1DB954" className="shrink-0">
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.84.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.84.241 1.2zM19.08 10.26c-3.959-2.34-10.44-2.58-14.16-1.44-.6.18-1.2-.12-1.38-.72-.18-.6.12-1.2.72-1.38 4.32-1.26 11.4-1.02 15.84 1.62.54.3.72 1.02.42 1.56-.24.54-.9.72-1.44.42z"/>
  </svg>
);

const TikTokIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="shrink-0 text-slate-900 dark:text-white">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.01.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 2.78-1.15 5.54-3.33 7.39-1.95 1.7-4.94 2.37-7.22 1.25-2.25-1.11-3.84-3.14-4.22-5.71-.38-2.67.56-5.49 2.53-7.28 1.88-1.74 4.86-2.25 7.15-1.19.06.85.06 1.7.07 2.55-1.15-.55-2.61-.43-3.64.33-1.06.77-1.63 2.1-1.47 3.42.17 1.34 1.09 2.54 2.29 3.08 1.4.63 3.19.46 4.32-.67 1.03-1.03 1.41-2.59 1.4-4.04.01-4.92.01-9.84.01-14.76h.13z"/>
  </svg>
);

const PandoraIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="#005483" className="shrink-0">
    <path d="M2.38 0v24h4.76v-5.24h2.14C15.42 18.76 21.6 14.57 21.6 9.38 21.6 4.19 15.42 0 9.28 0H2.38zm4.76 4.28h2.14c3.48 0 7.39 1.95 7.39 5.1 0 3.15-3.9 5.1-7.39 5.1H7.14V4.28z"/>
  </svg>
);

const YouTubeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="#FF0000" className="shrink-0">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.501 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.55 9.377.55 9.377.55s7.505 0 9.377-.55a3.016 3.016 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const ShazamIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="#0088FF" className="shrink-0">
    <path d="M11.96 0C5.355 0 0 5.355 0 11.96s5.355 11.96 11.96 11.96 11.96-5.355 11.96-11.96S18.565 0 11.96 0zm5.116 16.516c-1.397 1.397-3.674 1.397-5.071 0l-.825-.826.825-.825.826.826c.94.94 2.474.94 3.414 0 .94-.94.94-2.474 0-3.414l-2.438-2.437c-1.272-1.273-3.344-1.273-4.617 0-1.272 1.272-1.272 3.344 0 4.617l.825.825-.825.826-.826-.826c-1.728-1.728-1.728-4.542 0-6.27l2.438-2.437c1.728-1.728 4.542-1.728 6.27 0 1.73 1.728 1.73 4.542.001 6.271zm-9.356-9.031c1.397-1.397 3.674-1.397 5.071 0l.825.825-.825.826-.826-.826c-.94-.94-2.474-.94-3.414 0-.94.94-.94 2.474 0 3.414l2.437 2.437c1.273 1.273 3.344 1.273 4.617 0 1.273-1.272 1.273-3.344 0-4.616l-.825-.826.825-.825.826.826c1.728 1.727 1.728 4.542 0 6.27l-2.437 2.437c-1.728 1.728-4.542 1.728-6.27 0-1.73-1.729-1.73-4.543-.001-6.272l2.437-2.437z"/>
  </svg>
);

const StatBlock = ({ label, value }) => (
  <div className="flex flex-col gap-1">
    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest truncate">{label}</p>
    <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight truncate">{formatToMillions(value || 0)}</p>
  </div>
);

const StreamingStatsSection = ({ artistData }) => {
  const stats = artistData?.stats || {};
  
  // Extract all the required fields from the expanded stats object
  const spFollowers = stats.sp_followers || 0;
  const spMonthlyListeners = stats.sp_monthly_listeners || 0;
  const spPlaylists = stats.sp_playlists || 0;
  const spPlaylistReach = stats.sp_playlist_total_reach || 0;
  
  const ttFollowers = stats.tiktok_followers || 0;
  const ttLikes = stats.tiktok_likes || 0;
  const ttPosts = stats.tiktok_track_posts || 0;
  const ttViews = stats.tiktok_top_video_views || 0;
  
  const pdListeners = stats.pandora_listeners_28_day || 0;
  const pdStreams = stats.pandora_lifetime_streams || 0;
  
  const ytSubs = stats.youtube_subscribers || 0;
  const ytViews = stats.ycs_views || 0;
  const ytMonthlyViews = stats.youtube_monthly_video_views || 0;
  const ytDailyViews = stats.youtube_daily_video_views || 0;
  
  const shazams = stats.shazam_count || 0;

  return (
    <div className="mt-8 flex flex-col gap-4">
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-2">
        <PlayCircle className="text-slate-800 dark:text-white" size={20} />
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Streaming Stats</h3>
      </div>
      
      {/* Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        
        {/* Left Column */}
        <div className="flex flex-col gap-4 sm:gap-6">
          
          {/* Spotify Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-slate-300 dark:hover:border-slate-700">
            <div className="flex items-center gap-3 mb-6">
              <SpotifyIcon />
              <h4 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Spotify</h4>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <StatBlock label="Followers" value={spFollowers} />
              <StatBlock label="Monthly Listeners" value={spMonthlyListeners} />
              <StatBlock label="Playlist Count" value={spPlaylists} />
            </div>
            <div>
              <StatBlock label="Playlist Reach" value={spPlaylistReach} />
            </div>
          </div>
          
          {/* Pandora Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-slate-300 dark:hover:border-slate-700">
            <div className="flex items-center gap-3 mb-6">
              <PandoraIcon />
              <h4 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Pandora</h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <StatBlock label="Monthly Listeners" value={pdListeners} />
              <StatBlock label="Streams" value={pdStreams} />
            </div>
          </div>
          
          {/* Shazam Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-slate-300 dark:hover:border-slate-700">
            <div className="flex items-center gap-3 mb-6">
              <ShazamIcon />
              <h4 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Shazam</h4>
            </div>
            <div>
              <StatBlock label="Shazams" value={shazams} />
            </div>
          </div>
          
        </div>
        
        {/* Right Column */}
        <div className="flex flex-col gap-4 sm:gap-6">
          
          {/* TikTok Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-slate-300 dark:hover:border-slate-700">
            <div className="flex items-center gap-3 mb-6">
              <TikTokIcon />
              <h4 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">TikTok</h4>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatBlock label="Followers" value={ttFollowers} />
              <StatBlock label="Likes" value={ttLikes} />
              <StatBlock label="Post Count" value={ttPosts} />
              <StatBlock label="Top Video Views" value={ttViews} />
            </div>
          </div>
          
          {/* YouTube Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-slate-300 dark:hover:border-slate-700 h-full">
            <div className="flex items-center gap-3 mb-6">
              <YouTubeIcon />
              <h4 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">YouTube</h4>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <StatBlock label="Subscribers" value={ytSubs} />
              <StatBlock label="Total Views" value={ytViews} />
              <StatBlock label="Monthly Video Views" value={ytMonthlyViews} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <StatBlock label="Daily Video Views" value={ytDailyViews} />
              {/* Note: We don't have Most Popular Video string readily available from basic stats, so omitting it to maintain accuracy, or can add a placeholder if strict layout matching is required */}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default StreamingStatsSection;
