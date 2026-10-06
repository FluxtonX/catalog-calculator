const fs = require('fs');
const envStr = fs.readFileSync('.env.local', 'utf8');
const env = {};
envStr.split('\n').forEach(line => {
  const parts = line.split('=');
  if(parts.length > 1) env[parts[0]] = parts.slice(1).join('=').trim();
});
const fetch = require('node-fetch');

async function testCM() {
  const url = env.VITE_SUPABASE_URL + "/functions/v1/chartmetric";
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + env.VITE_SUPABASE_ANON_KEY
    },
    body: JSON.stringify({ query: "Bad Bunny" })
  });
  const data = await res.json();
  console.log(data);
}
testCM().catch(console.error);
