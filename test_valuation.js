import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import { getCombinedValuation } from './src/core/calculations/combined.js';

const env = fs.readFileSync('.env', 'utf8');
const urlMatch = env.match(/VITE_SUPABASE_URL=(.*)/);
const keyMatch = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/);
const supabase = createClient(urlMatch[1], keyMatch[1]);

async function test() {
  const res = await supabase.from('api_cache').select('data').eq('platform', 'apify').ilike('query', '%lil tjay%');
  const spotifyData = res.data[0].data;
  
  // Format the same way the frontend does
  const artists = {
    spotify: { ...spotifyData, platform: 'spotify' },
    itunes: { ...spotifyData, platform: 'itunes_proxy' },
    youtube: { ...spotifyData, platform: 'youtube_proxy' }
  };
  
  const valuation = getCombinedValuation(artists);
  console.log('Valuation:', valuation);
}
test();
