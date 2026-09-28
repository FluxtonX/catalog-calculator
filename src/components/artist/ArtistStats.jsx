import React, { useState } from "react";
import StatCard from "../ui/StatCard";
import {
  DollarSign,
  Music,
  TrendingUp,
  Album,
  Users,
  Eye,
  Disc,
} from "lucide-react";

const ArtistStats = ({ stats, platform, topTracks, albums, singles }) => {
  const isApify = platform === "apify" || platform === "spotify";
  const isYouTube = platform === "youtube";
  const isItunes = platform === "itunes";
  const gridColsClass = isApify ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-2 lg:grid-cols-3";
  const [showExactYouTube, setShowExactYouTube] = useState(false);

  if (!stats) return null;

  const renderYouTubeCard = (icon, label, value) => {
    const numValue = typeof value === 'string' ? parseInt(value.toString().replace(/,/g, ''), 10) : value;
    const formattedValue = showExactYouTube || isNaN(numValue) || !numValue
      ? value 
      : Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(numValue);
      
    return (
      <StatCard
        icon={icon}
        label={label}
        value={formattedValue}
        iconBg="bg-[#FF0000]/20"
        iconColor="text-[#FF0000]"
      />
    );
  };

  if (isYouTube) {
    return (
      <div className="w-full flex flex-col gap-3">
        <div className="flex justify-end">
          <button 
            onClick={() => setShowExactYouTube(!showExactYouTube)}
            className="text-xs px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md transition-colors font-medium border border-slate-200 dark:border-slate-700 shadow-sm"
          >
            {showExactYouTube ? "Show Compact Numbers" : "Show Exact Numbers"}
          </button>
        </div>
        <div className={`grid ${gridColsClass} gap-2 sm:gap-4`}>
          {renderYouTubeCard(Users, "Subscribers", stats.totalSubscribers)}
          {renderYouTubeCard(Eye, "Total Views", stats.totalViews)}
          {renderYouTubeCard(Music, "Videos", stats.totalVideos)}
        </div>
      </div>
    );
  }

  return (
    <div className={`grid ${gridColsClass} gap-2 sm:gap-4`}>
      {isItunes ? (
        // iTunes/Apple Music stats
        <>
          <StatCard
            icon={Music}
            label="Top Tracks"
            value={stats.totalTopTracks ?? topTracks?.length ?? 0}
            iconBg="bg-pink-500/20"
            iconColor="text-pink-600 dark:text-pink-400"
          />
         <StatCard
        icon={Album}
        label="Albums"
        value={albums?.length ?? stats.totalAlbums ?? 0}
        iconBg="bg-rose-500/20"
        iconColor="text-rose-600 dark:text-rose-400"
      />
        
          <StatCard
            icon={Disc}
            label="Singles"
            value={singles?.length ?? stats.totalSingles ?? 0}
            iconBg="bg-purple-500/20"
            iconColor="text-purple-600 dark:text-purple-400"
          />
        </>
      ) : isApify ? (
        // Spotify stats — all values are from Top 10 tracks only
        <>
          <StatCard
            icon={Music}
            label="Total Streams (Top 10)"
            value={stats.totalStreams}
          />
          <StatCard
            icon={TrendingUp}
            label="Avg Streams (Top 10)"
            value={stats.averageStreams}
          />
          <StatCard
            icon={Music}
            label="Top 10 Tracks"
            value={topTracks?.length || 0}
          />
          <StatCard icon={Album} label="Albums" value={albums?.length || stats.totalAlbums || 0} />
        </>
      ) : (
        // Default stats
        <>
          <StatCard
            icon={TrendingUp}
            label="Avg Popularity"
            value={stats.averageTrackPopularity}
          />
          <StatCard
            icon={Album}
            label="Total Albums"
            value={albums?.length || 0}
          />
          <StatCard
            icon={Music}
            label="Top Tracks"
            value={stats.totalTopTracks}
          />
          <StatCard
            icon={DollarSign}
            label="Related"
            value={stats.totalRelatedArtists}
          />
        </>
      )}
    </div>
  );
};

export default ArtistStats;
