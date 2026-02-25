

// import React from "react";
// import StatCard from "../ui/StatCard";
// import { DollarSign, Music, TrendingUp, Album, Users, Eye } from "lucide-react";

// const ArtistStats = ({ stats, platform, topTracks, albums }) => {
//   const isApify = platform === "apify";
//   const isYouTube = platform === "youtube"; // ADDED

//   if (!stats) return null;

//   return (
//     <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
//       {isYouTube ? (
//         // ADDED: YouTube-specific stats
//         <>
//           <StatCard
//             icon={Users}
//             label="Subscribers"
//             value={stats.totalSubscribers}
//           />
//           <StatCard
//             icon={Eye}
//             label="Total Views"
//             value={stats.totalViews}
//           />
//           <StatCard
//             icon={TrendingUp}
//             label="Popularity"
//             value={`${stats.averageTrackPopularity}/100`}
//           />
//           <StatCard
//             icon={Music}
//             label="Videos"
//             value={stats.totalVideos}
//           />
//         </>
//       ) : isApify ? (
//         // KEEP your existing Spotify stats
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
//         // KEEP your existing regular Spotify stats
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


import React from "react";
import StatCard from "../ui/StatCard";
import { DollarSign, Music, TrendingUp, Album, Users, Eye, Disc } from "lucide-react";

const ArtistStats = ({ stats, platform, topTracks, albums }) => {
  const isApify = platform === "apify";
  const isYouTube = platform === "youtube";
  const isItunes = platform === "itunes";

  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
      {isYouTube ? (
        // YouTube stats
        <>
          <StatCard icon={Users} label="Subscribers" value={stats.totalSubscribers} />
          <StatCard icon={Eye} label="Total Views" value={stats.totalViews} />
          <StatCard icon={TrendingUp} label="Popularity" value={`${stats.averageTrackPopularity}/100`} />
          <StatCard icon={Music} label="Videos" value={stats.totalVideos} />
        </>
      ) : isItunes ? (
        // iTunes/Apple Music stats
        <>
          <StatCard
            icon={Music}
            label="Top Tracks"
            value={stats.totalTopTracks}
            iconBg="bg-pink-500/20"
            iconColor="text-pink-600 dark:text-pink-400"
          />
          <StatCard
            icon={Album}
            label="Albums"
            value={stats.totalAlbums}
            iconBg="bg-rose-500/20"
            iconColor="text-rose-600 dark:text-rose-400"
          />
          <StatCard
            icon={TrendingUp}
            label="Popularity"
            value={`${Math.round(stats.averageTrackPopularity)}/100`}
            iconBg="bg-red-500/20"
            iconColor="text-red-600 dark:text-red-400"
          />
          <StatCard
            icon={Disc}
            label="Singles"
            value={albums?.filter(a => a.type === 'single').length || 0}
            iconBg="bg-purple-500/20"
            iconColor="text-purple-600 dark:text-purple-400"
          />
        </>
      ) : isApify ? (
        // Spotify stats
        <>
          <StatCard icon={Music} label="Total Streams" value={stats.totalStreams} />
          <StatCard icon={TrendingUp} label="Avg Streams" value={stats.averageStreams} />
          <StatCard icon={Music} label="Top Tracks" value={topTracks?.length || 0} />
          <StatCard icon={Album} label="Albums" value={albums?.length || 0} />
        </>
      ) : (
        // Default stats
        <>
          <StatCard icon={TrendingUp} label="Avg Popularity" value={stats.averageTrackPopularity} />
          <StatCard icon={Album} label="Total Albums" value={stats.totalAlbums} />
          <StatCard icon={Music} label="Top Tracks" value={stats.totalTopTracks} />
          <StatCard icon={DollarSign} label="Related" value={stats.totalRelatedArtists} />
        </>
      )}
    </div>
  );
};

export default ArtistStats;