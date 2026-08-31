import { getPlatformValuation, getCombinedValuation } from '../src/core/calculations/combined.js';

const artistsMap = {
  spotify: {
    platform: 'spotify',
    name: 'Test Artist',
    monthlyListeners: 1000000,
    topTracks: [{ streamCount: 10000000, title: 'Track 1' }],
    stats: { totalStreams: 50000000 }
  },
  youtube: {
    platform: 'youtube',
    name: 'Test Artist Channel',
    totalViews: 50000000,
    stats: { totalViews: 50000000 }
  },
  itunes: {
    platform: 'itunes',
    name: 'Test Artist iTunes',
    popularity: 80,
    stats: { totalAlbums: 5, totalTopTracks: 20 }
  }
};

console.log('Spotify Valuation:', getPlatformValuation(artistsMap.spotify));
console.log('YouTube Valuation:', getPlatformValuation(artistsMap.youtube));
console.log('iTunes Valuation:', getPlatformValuation(artistsMap.itunes));
console.log('Combined Valuation:', getCombinedValuation(artistsMap));
