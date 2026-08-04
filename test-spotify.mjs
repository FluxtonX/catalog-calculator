import fs from 'fs';

const env = fs.readFileSync('.env', 'utf8');
const envVars = {};
env.split('\n').forEach(line => {
  const parts = line.trim().split('=');
  if (parts.length >= 2) {
    envVars[parts[0].trim()] = parts.slice(1).join('=').trim();
  }
});

const SPOTIFY_CLIENT_ID = envVars.SPOTIFY_CLIENT_ID || 'd02947927352511cef0d5207bb87626194ffe1cc5ab0dc05dc9fdfb532541941';
const SPOTIFY_CLIENT_SECRET = envVars.SPOTIFY_CLIENT_SECRET || 'c587e16b23c0e41a7aa4a0eea104d7aaf175250e1ef7e33a439341374762c312';

async function testSpotifyDirect() {
  const auth = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64');
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Authorization": `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const data = await res.json();
  const token = data.access_token;

  console.log("Search:");
  const searchRes = await fetch("https://api.spotify.com/v1/search?q=taylor+swift&type=artist&limit=1", {
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log(await searchRes.json());
}

testSpotifyDirect();
