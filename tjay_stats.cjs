const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8');
const urlMatch = env.match(/VITE_SUPABASE_URL=(.*)/);
const keyMatch = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/);
const supabase = createClient(urlMatch[1], keyMatch[1]);
supabase.from('api_cache').select('data').eq('platform', 'apify').ilike('query', '%lil tjay%').then(res => {
  const data = res.data[0].data;
  const tracks = data.topTracks;
  let streams = 0;
  tracks.forEach(t => streams += (t.streamCount || 0));
  console.log('Total Spotify Streams:', streams);
  tracks.forEach(t => console.log(t.title, t.streamCount));
});
