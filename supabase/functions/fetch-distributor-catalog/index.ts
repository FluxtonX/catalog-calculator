// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts";

// Fix IDE TS warnings for Deno
declare const Deno: any;

console.log("Hello from Functions!");

// This endpoint uses 'publishable' | 'secret' access, apiKey is required.
// Use publishable for Client-facing, key-validated endpoints
// Use secret for Server-to-server, internal calls
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  // 1. Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { distributor, credentials, action, taskRunId } = await req.json();

    if (!distributor) {
      return new Response(JSON.stringify({ error: 'Distributor name is required' }), { 
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const deckApiKey = Deno.env.get('DECK_API_KEY');
    if (!deckApiKey) {
       return new Response(JSON.stringify({ error: 'DECK_API_KEY not configured' }), { 
         status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } 
       });
    }

    const agentMap = {
      'Concord': 'agt_7MoiVpf9t4GTXn7f',
    };

    const agentId = agentMap[distributor as keyof typeof agentMap];

    if (!agentId) {
      return new Response(JSON.stringify({ error: `No Deck.co agent configured for ${distributor} yet.` }), { 
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const deckHeaders = {
      "Authorization": `Bearer ${deckApiKey}`,
      "Content-Type": "application/json"
    };

    // ==========================================
    // ACTION: START
    // ==========================================
    if (action === 'start') {
      console.log(`[Deck.co] ACTION: START - Initiating agent ${agentId} for ${distributor}...`);

      const sourceId = 'src_iJvKAlmXhxgVuf4I'; // Concord Source ID
      const credResponse = await fetch('https://api.deck.co/v2/credentials', {
        method: 'POST',
        headers: deckHeaders,
        body: JSON.stringify({
          auth_method: 'username_password',
          auth_credentials: {
            username: credentials.email,
            password: credentials.password
          },
          source_id: sourceId,
          external_id: credentials.email
        })
      });
      
      if (!credResponse.ok) throw new Error(`Failed to store credentials: ${await credResponse.text()}`);
      const credData = await credResponse.json();
      
      const taskId = 'task_FD3om33QiOJNXK3G'; // Extract tracks and royalty earnings
      const runResponse = await fetch(`https://api.deck.co/v2/tasks/${taskId}/run`, {
        method: 'POST',
        headers: deckHeaders,
        body: JSON.stringify({
          credential_id: credData.id,
          input: {}
        })
      });

      if (!runResponse.ok) throw new Error(`Failed to trigger task: ${await runResponse.text()}`);
      const runData = await runResponse.json();

      return new Response(JSON.stringify({
        success: true,
        message: `Agent started.`,
        taskRunId: runData.id
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // ==========================================
    // ACTION: POLL
    // ==========================================
    if (action === 'poll') {
      console.log(`[Deck.co] ACTION: POLL - Checking task run ${taskRunId}...`);
      
      if (!taskRunId) {
         throw new Error("Missing taskRunId for polling");
      }

      const pollResponse = await fetch(`https://api.deck.co/v2/task-runs/${taskRunId}`, {
        headers: deckHeaders
      });
      
      if (!pollResponse.ok) throw new Error(`Polling error: ${pollResponse.status}`);
      const pollData = await pollResponse.json();
      
      if (pollData.status === 'completed') {
         const resultOutput = pollData.output;
         
         // Format output for UI
         let totalStreams = 0;
         let totalRevenue = 0;
         let totalTracks = 0;

         let extractedArtistName = "Concord Creator";

         const arrayKey = Object.keys(resultOutput).find(k => Array.isArray(resultOutput[k]));
         if (arrayKey && resultOutput[arrayKey].length > 0) {
            const tracks = resultOutput[arrayKey];
            totalTracks = tracks.length;
            
            // Try to extract the artist name from the first track
            if (tracks[0].artist) {
               extractedArtistName = tracks[0].artist;
            }

            tracks.forEach((t: any) => {
               const rev = parseFloat(t.revenue || t.earnings || 0);
               if (!isNaN(rev)) totalRevenue += rev;
               const streams = parseInt(t.streams || t.plays || 0);
               if (!isNaN(streams)) totalStreams += streams;
            });
         }

         const formattedData = {
           artistName: extractedArtistName,
           totalRevenue: totalRevenue.toFixed(2),
           totalStreams: totalStreams.toString(),
           totalTracks: totalTracks.toString()
         };

         return new Response(JSON.stringify({
           success: true,
           status: 'completed',
           data: formattedData
         }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
         
      } else if (pollData.status === 'failed') {
         throw new Error(`Agent task failed: ${JSON.stringify(pollData.errors)}`);
      } else if (pollData.status === 'interaction_required') {
         throw new Error(`Agent requires manual interaction (e.g., 2FA/MFA).`);
      }

      // If still running/queued
      return new Response(JSON.stringify({
         success: true,
         status: pollData.status
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    throw new Error("Invalid action specified");
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: errorMessage }), { 
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/fetch-distributor-catalog' \
    --header 'apiKey: sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH' \
    --data '{"name":"Functions"}'

*/
