import React from "react";
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

  if (!stats) return null;

  return (
    <div className={`grid ${gridColsClass} gap-2 sm:gap-4`}>
      {isYouTube ? (
        // YouTube stats
        <>
          <StatCard
            icon={Users}
            label="Subscribers"
            value={stats.totalSubscribers}
          />
          <StatCard icon={Eye} label="Total Views" value={stats.totalViews} />
         
          <StatCard icon={Music} label="Videos" value={stats.totalVideos} />
        </>
    
) : isItunes ? (
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
