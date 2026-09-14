import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://ubenhhgxamprkamptpoz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViZW5oaGd4YW1wcmthbXB0cG96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwNTg4NDYsImV4cCI6MjA4MzYzNDg0Nn0.mlMWE5SIbnUeRurhGDqWez_wy9TK1HwLdSnBFwANX_M';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.functions.invoke('apify', {
    body: { query: 'Bon Jovi' }
  });
  
  if (error) {
    console.error(error);
  } else {
    fs.writeFileSync('debug_apify.json', JSON.stringify(data, null, 2));
    console.log('Saved to debug_apify.json');
  }
}
run();
