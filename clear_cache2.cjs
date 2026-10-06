const fs = require('fs');
let envFile = fs.existsSync('.env') ? fs.readFileSync('.env', 'utf8') : '';
if (fs.existsSync('.env.local')) envFile += '\n' + fs.readFileSync('.env.local', 'utf8');
const env = envFile.split('\n').reduce((acc, line) => {
  if (line.includes('=')) {
    const idx = line.indexOf('=');
    const k = line.slice(0, idx).trim();
    const v = line.slice(idx + 1).trim().replace(/['"]/g, '');
    acc[k] = v;
  }
  return acc;
}, {});

fetch(env.VITE_SUPABASE_URL + '/rest/v1/api_cache?platform=eq.apify', {
  method: 'DELETE',
  headers: {
    'apikey': env.VITE_SUPABASE_ANON_KEY,
    'Authorization': 'Bearer ' + env.VITE_SUPABASE_ANON_KEY
  }
}).then(r => console.log('Apify Cache Cleared:', r.status));
