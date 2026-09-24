import fs from 'fs';

const envFile = fs.readFileSync('.env', 'utf8');
let url = '', key = '';
for (const line of envFile.split('\n')) {
  if (line.startsWith('VITE_SUPABASE_URL=')) url = line.split('=')[1].trim().replace(/['"]/g, '');
  if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) key = line.split('=')[1].trim().replace(/['"]/g, '');
}

async function run() {
  const res = await fetch(url + '/functions/v1/apify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`
    },
    body: JSON.stringify({ query: 'Katy Perry' })
  });
  const data = await res.json();
  fs.writeFileSync('scratch/katy.json', JSON.stringify(data, null, 2));
  console.log("Done. Saved to scratch/katy.json");
}
run();
