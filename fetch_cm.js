import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

async function run() {
  const res = await fetch(`${process.env.VITE_SUPABASE_URL}/functions/v1/chartmetric`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.VITE_SUPABASE_ANON_KEY}`
    },
    body: JSON.stringify({ query: 'Billie Eilish' })
  });
  const data = await res.json();
  console.log(JSON.stringify(data.rawStats || data, null, 2).substring(0, 3000));
}
run();
