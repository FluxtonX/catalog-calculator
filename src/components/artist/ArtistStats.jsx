// src/components/artist/ArtistStats.jsx
import React from "react";
import StatCard from "../ui/StatCard"; // Your existing StatCard
import { DollarSign, Music, TrendingUp, Album } from "lucide-react";

const ArtistStats = ({ stats, platform, topTracks, albums }) => {
  const isApify = platform === "apify";
  console.log("ArtistStats props:", { stats, platform, topTracks, albums });


  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
      {isApify ? (
        <>
          <StatCard
            icon={Music}
            label="Total Streams"
            value={stats.totalStreams}
          />
          <StatCard
            icon={TrendingUp}
            label="Avg Streams"
            value={stats.averageStreams}
          />
          <StatCard
            icon={Music}
            label="Top Tracks"
            value={topTracks?.length || 0}
          />
          <StatCard
            icon={Album}
            label="Albums"
            value={albums?.length || 0}
          />
        </>
      ) : (
        <>
          <StatCard
            icon={TrendingUp}
            label="Avg Popularity"
            value={stats.averageTrackPopularity}
          />
          <StatCard
            icon={Album}
            label="Total Albums"
            value={stats.totalAlbums}
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