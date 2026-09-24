const fs = require('fs');

const envFile = fs.readFileSync('.env', 'utf8');
let url = '', key = '';
for (const line of envFile.split('\n')) {
  if (line.startsWith('VITE_SUPABASE_URL=')) url = line.split('=')[1].trim().replace(/['"]/g, '');
  if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) key = line.split('=')[1].trim().replace(/['"]/g, '');
}

fetch(url + '/functions/v1/spotify', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${key}`
  },
  body: JSON.stringify({ query: 'Katy Perry' })
}).then(r => r.json()).then(data => {
  fs.writeFileSync('scratch/spotify_data.json', JSON.stringify(data, null, 2));
  console.log('Saved to scratch/spotify_data.json');
}).catch(console.error);
