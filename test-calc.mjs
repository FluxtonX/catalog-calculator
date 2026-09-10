import { getCombinedValuation, getCombinedCfaValuations } from './src/core/calculations/combined.js';

const mockSelectedArtists = {
  spotify: {
    platform: 'spotify',
    name: 'Bad Bunny',
    monthlyListeners: '69,000,000',
    topTracks: [
      {
        title: 'Dakiti',
        playcount: '1,500,000,000',
        releaseDate: '2020-10-30'
      }
    ]
  }
};

try {
  const masterData = getCombinedCfaValuations(mockSelectedArtists);
  console.log("masterData:", masterData);
} catch (err) {
  console.error("Error in getCombinedCfaValuations:", err);
}

try {
  const val = getCombinedValuation(mockSelectedArtists);
  console.log("val:", val);
} catch (err) {
  console.error("Error in getCombinedValuation:", err);
}
