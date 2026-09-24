import { getNormalizedArtistData } from './src/utils/api.js';

async function test() {
  const d = await getNormalizedArtistData('Katy Perry');
  console.log(JSON.stringify(d.topTracks.map(t => ({ title: t.title, releaseDate: t.releaseDate })), null, 2));
}

test();
