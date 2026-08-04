import fs from 'fs';

const env = fs.readFileSync('.env', 'utf8');
const envVars = {};
env.split('\n').forEach(line => {
  const parts = line.trim().split('=');
  if (parts.length >= 2) {
    envVars[parts[0].trim()] = parts.slice(1).join('=').trim();
  }
});

const SUPABASE_URL = envVars.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = envVars.VITE_SUPABASE_ANON_KEY;

async function testSearch(platform) {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/${platform}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      // Pass the spotify:artist:id syntax to normal query
      body: JSON.stringify({ query: 'spotify:artist:5KDC4ZyiN2vagtJv7j82WD' })
    });
    
    const data = await response.json();
    console.log(`--- ${platform.toUpperCase()} ---`);
    console.log(JSON.stringify(data, null, 2).substring(0, 500) + '...');
  } catch (err) {
    console.error(`Error in ${platform}:`, err);
  }
}

testSearch('spotify');
