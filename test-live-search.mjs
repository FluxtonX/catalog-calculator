import { getNormalizedArtistData } from './src/utils/api.js';
import { getCombinedValuation } from './src/core/calculations/combined.js';

async function run() {
  try {
    console.log("Fetching Bad Bunny from Spotify...");
    const spotifyData = await getNormalizedArtistData('bad bunny');
    console.log("Data fetched:", JSON.stringify(spotifyData).substring(0, 500) + "...");
    
    const artistsMap = {
      spotify: { ...spotifyData, platform: 'spotify' }
    };
    
    console.log("Calculating valuation...");
    const val = getCombinedValuation(artistsMap);
    console.log("Resulting Valuation:", val);
    
    // Also let's see the streams on the top track
    if (spotifyData.topTracks && spotifyData.topTracks.length > 0) {
      console.log("Top track 0:", spotifyData.topTracks[0]);
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
