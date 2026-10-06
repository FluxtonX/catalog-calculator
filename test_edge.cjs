const fs = require('fs');
let envFile = fs.existsSync('.env') ? fs.readFileSync('.env', 'utf8') : '';
if (fs.existsSync('.env.local')) envFile += '\n' + fs.readFileSync('.env.local', 'utf8');
const env = envFile.split('\n').reduce((acc, line) => {
  if (line.includes('=')) {
    const [k, ...vs] = line.split('=');
    acc[k.trim()] = vs.join('=').trim().replace(/['"]/g, '');
  }
  return acc;
}, {});
const url = env.VITE_SUPABASE_URL + '/functions/v1/spotify';
const key = env.VITE_SUPABASE_ANON_KEY;
console.log('URL:', url);
fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + key
  },
  body: JSON.stringify({ query: 'Lil Tjay' })
}).then(res => res.json()).then(data => {
  console.log('Keys present?', Object.keys(data));
  console.log('Top Tracks length:', data?.topTracks?.length);
  if (data?.topTracks) console.log('First track:', data.topTracks[0]);
  if (data?.error) console.log('Error:', data.error, data.details);
}).catch(err => console.error(err));
