import { getCombinedCfaValuations } from './src/core/calculations/combined.js';

const mockSpotify = {
  platform: 'spotify',
  topTracks: [
    { playcount: 100000000, ageInYears: 2, monthsLive: 24, streamCount: 100000000 }
  ],
  popularity: 95,
  monthlyListeners: 20000000
};

const mockItunes = {
  platform: 'itunes',
  name: 'Billie Eilish'
};

const artists = {
  spotify: mockSpotify,
  itunes: mockItunes
};

console.log(JSON.stringify(getCombinedCfaValuations(artists), null, 2));
