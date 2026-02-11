// // src/components/artist/ArtistStats.jsx
// import React from "react";
// import StatCard from "../ui/StatCard"; // Your existing StatCard
// import { DollarSign, Music, TrendingUp, Album } from "lucide-react";

// const ArtistStats = ({ stats, platform, topTracks, albums }) => {
//   const isApify = platform === "apify";



//   if (!stats) return null;

//   return (
//     <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
//       {isApify ? (
//         <>
//           <StatCard
//             icon={Music}
//             label="Total Streams"
//             value={stats.totalStreams}
//           />
//           <StatCard
//             icon={TrendingUp}
//             label="Avg Streams"
//             value={stats.averageStreams}
//           />
//           <StatCard
//             icon={Music}
//             label="Top Tracks"
//             value={topTracks?.length || 0}
//           />
//           <StatCard
//             icon={Album}
//             label="Albums"
//             value={albums?.length || 0}
//           />
//         </>
//       ) : (
//         <>
//           <StatCard
//             icon={TrendingUp}
//             label="Avg Popularity"
//             value={stats.averageTrackPopularity}
//           />
//           <StatCard
//             icon={Album}
//             label="Total Albums"
//             value={stats.totalAlbums}
//           />
//           <StatCard
//             icon={Music}
//             label="Top Tracks"
//             value={stats.totalTopTracks}
//           />
//           <StatCard
//             icon={DollarSign}
//             label="Related"
//             value={stats.totalRelatedArtists}
//           />
//         </>
//       )}
//     </div>
//   );
// };

// export default ArtistStats;

// src/components/artist/ArtistStats.jsx - UPDATE to handle YouTube
// src/components/artist/ArtistStats.jsx - UPDATE to handle YouTube

import React from "react";
import StatCard from "../ui/StatCard";
import { DollarSign, Music, TrendingUp, Album, Users, Eye } from "lucide-react";

const ArtistStats = ({ stats, platform, topTracks, albums }) => {
  const isApify = platform === "apify";
  const isYouTube = platform === "youtube"; // ADDED

  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
      {isYouTube ? (
        // ADDED: YouTube-specific stats
        <>
          <StatCard
            icon={Users}
            label="Subscribers"
            value={stats.totalSubscribers}
          />
          <StatCard
            icon={Eye}
            label="Total Views"
            value={stats.totalViews}
          />
          <StatCard
            icon={TrendingUp}
            label="Popularity"
            value={`${stats.averageTrackPopularity}/100`}
          />
          <StatCard
            icon={Music}
            label="Videos"
            value={stats.totalVideos}
          />
        </>
      ) : isApify ? (
        // KEEP your existing Spotify stats
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
        // KEEP your existing regular Spotify stats
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