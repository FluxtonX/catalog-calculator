require('dotenv').config({ path: '.env.local' });
const fetch = require('node-fetch');

async function testApple() {
  const url = `${process.env.VITE_SUPABASE_URL}/functions/v1/apify-apple`;
  console.log("URL:", url);
  
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.VITE_SUPABASE_ANON_KEY}`
    },
    body: JSON.stringify({ query: "Lil Tjay" })
  });
  
  const data = await res.json();
  console.log("Stats:", data.stats);
  console.log("Albums array length:", data.albums ? data.albums.length : 0);
  console.log("Top Tracks array length:", data.topTracks ? data.topTracks.length : 0);
}

testApple().catch(console.error);
