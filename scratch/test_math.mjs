import { searchYouTube, searchItunes, searchAppleMusic } from '../src/utils/api.js';
import { getCombinedValuation, getPlatformValuation } from '../src/core/calculations/combined.js';

// Simulate LandingPage.jsx logic
async function run() {
  // Just dummy objects to test the pure math
  const spotifyData = { platform: 'spotify', stats: { totalStreams: 1000000000 }, topTracks: [] };
  const youtubeData = { platform: 'youtube', totalViews: 1000000000 };
  const itunesData = { platform: 'itunes', popularity: 80 };
  
  const artistsMap = {
    spotify: spotifyData,
    youtube: youtubeData,
    itunes: itunesData
  };
  
  console.log("Spotify Val:", getPlatformValuation(spotifyData));
  console.log("YouTube Val:", getPlatformValuation(youtubeData));
  console.log("iTunes Val:", getPlatformValuation(itunesData));
  console.log("Combined Val:", getCombinedValuation(artistsMap));
}

run();
