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

fetch(env.VITE_SUPABASE_URL + '/rest/v1/api_cache', {
  method: 'DELETE',
  headers: {
    'apikey': env.VITE_SUPABASE_ANON_KEY,
    
    'Authorization': 'Bearer ' + env.VITE_SUPABASE_ANON_KEY
  }
}).then(r => console.log('Cache cleared status:', r.status)).catch(e => console.log(e));
