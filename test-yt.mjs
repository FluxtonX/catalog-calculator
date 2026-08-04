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

async function testChannelDetails() {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/youtube`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({ query: 'bilal khattak', channelId: 'UCSvAlRTJ7IBst9nlhjYRUsQ' })
    });
    
    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(`Error:`, err);
  }
}

testChannelDetails();
