const fs = require('fs');
const https = require('https');

// Extract env vars
const envFile = fs.readFileSync('.env.local', 'utf8');
let url = '', key = '';
for (const line of envFile.split('\n')) {
  if (line.startsWith('VITE_SUPABASE_URL=')) url = line.split('=')[1].trim();
  if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) key = line.split('=')[1].trim();
}

const req = https.request(url.replace('https://', 'https://') + '/functions/v1/apify', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${key}`
  }
}, (res) => {
  let body = '';
  res.on('data', c => body += c);
  res.on('end', () => {
    fs.writeFileSync('scratch/apify_data.json', body);
    console.log('Saved to scratch/apify_data.json');
  });
});

req.on('error', console.error);
req.write(JSON.stringify({ query: 'Katy Perry' }));
req.end();
