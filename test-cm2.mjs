import { createClient } from '@supabase/supabase-js';


const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
  try {
    console.log("Calling Chartmetric Edge Function...");
    const { data, error } = await supabase.functions.invoke('chartmetric', {
      body: { query: 'Bon Jovi' }
    });
    console.log("Result:", JSON.stringify(data, null, 2));
    if (error) console.error("Error:", error);
  } catch(e) {
    console.error("Exception:", e);
  }
}
test();
