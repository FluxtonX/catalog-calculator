const fs = require('fs');
const dotenv = require('dotenv');
const env = dotenv.parse(fs.readFileSync('.env.local'));

const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY;

async function test() {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/chartmetric`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ query: 'Katy Perry' }),
    });
    
    const cmData = await response.json();
    console.log("CHARTMETRIC TOP TRACKS:");
    if (cmData.topTracks && cmData.topTracks.length > 0) {
      console.log(JSON.stringify(cmData.topTracks[0], null, 2));
    }
    
    const apifyRes = await fetch(`${SUPABASE_URL}/functions/v1/apify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ query: 'Katy Perry' }),
    });
    
    const apifyData = await apifyRes.json();
    console.log("\nAPIFY (SPOTIFY) TOP TRACKS:");
    if (apifyData.topTracks && apifyData.topTracks.length > 0) {
      console.log(JSON.stringify(apifyData.topTracks[0], null, 2));
    }
  } catch (err) {
    console.error(err);
  }
}
test();
