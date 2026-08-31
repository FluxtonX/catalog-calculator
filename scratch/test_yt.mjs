const SUPABASE_URL = "https://ubenhhgxamprkamptpoz.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViZW5oaGd4YW1wcmthbXB0cG96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwNTg4NDYsImV4cCI6MjA4MzYzNDg0Nn0.mlMWE5SIbnUeRurhGDqWez_wy9TK1HwLdSnBFwANX_M";

async function run() {
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/youtube`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ query: 'taylor swift' }),
    });
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(err);
  }
}
run();
