import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import { getCombinedCfaValuations } from './src/core/calculations/combined.js';

const env = fs.readFileSync('.env', 'utf8');
const url = env.match(/VITE_SUPABASE_URL=(.*)/)[1].trim().replace(/['"]/g, '');
const key = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1].trim().replace(/['"]/g, '');
const supabase = createClient(url, key);

async function runTest() {
  const { data } = await supabase.from('api_cache').select('data').eq('id', 'apify_lil tjay').single();
  const spotifyData = data.data;

  const itunesData = {
    name: 'Lil Tjay',
    platform: 'itunes',
    topTracks: []
  };

  const youtubeData = {
    name: 'Lil Tjay',
    platform: 'youtube',
    totalViews: 909042128,
    topTracks: []
  };

  console.log('=====================================================');
  console.log('INCREMENTAL MULTI-PLATFORM VERIFICATION FOR LIL TJAY');
  console.log('=====================================================');

  // 1. One platform individually (Spotify)
  console.log('\n--- 1. SINGLE PLATFORM: SPOTIFY ONLY ---');
  const res1 = getCombinedCfaValuations({
    spotify: { ...spotifyData, platform: 'spotify' }
  });
  console.log('Spotify Annual Revenue: $' + Math.round(res1.annualRevenue).toLocaleString());
  console.log('Spotify Valuation (8x): $' + Math.round(res1.midEstimate).toLocaleString());
  console.log('Average Dollar Age: ' + res1.breakdown.spotify?.averageDollarAge + ' Years');

  // 2. Two platforms simultaneously (Spotify + Apple Music)
  console.log('\n--- 2. TWO PLATFORMS: SPOTIFY + APPLE MUSIC ---');
  const res2 = getCombinedCfaValuations({
    spotify: { ...spotifyData, platform: 'spotify' },
    itunes: itunesData
  });
  console.log('Combined Annual Revenue: $' + Math.round(res2.annualRevenue).toLocaleString());
  console.log('Combined Valuation (8x): $' + Math.round(res2.midEstimate).toLocaleString());
  console.log('Apple Music Added: $' + Math.round(res2.midEstimate - res1.midEstimate).toLocaleString());

  // 3. Three platforms simultaneously (Spotify + Apple Music + YouTube)
  console.log('\n--- 3. THREE PLATFORMS: SPOTIFY + APPLE MUSIC + YOUTUBE ---');
  const res3 = getCombinedCfaValuations({
    spotify: { ...spotifyData, platform: 'spotify' },
    itunes: itunesData,
    youtube: youtubeData
  });
  console.log('Combined Annual Revenue: $' + Math.round(res3.annualRevenue).toLocaleString());
  console.log('Combined Valuation (8x): $' + Math.round(res3.midEstimate).toLocaleString());
  console.log('YouTube Added: $' + Math.round(res3.midEstimate - res2.midEstimate).toLocaleString());

  console.log('\n=====================================================');
  console.log('FINAL RESULT: $' + Math.round(res3.midEstimate).toLocaleString() + ' ($' + Math.round(res3.midEstimate) + ')');
  console.log('Exact Match with Live Website ($58,683,222):', Math.round(res3.midEstimate) === 58683222);
  console.log('Breakdown:', JSON.stringify(Object.fromEntries(Object.entries(res3.breakdown).map(([k, v]) => [k, { annualRevenue: Math.round(v.annualRevenue), midEstimate: Math.round(v.midEstimate) }])), null, 2));
  console.log('=====================================================');
}

runTest();
