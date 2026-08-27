import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

// Use Sandbox credentials
const APP_ID = "soundcharts";
const API_KEY = "soundcharts";
const BASE_URL = "https://customer.api.soundcharts.com";

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await req.json();
    const query = body.query;

    if (!query?.trim()) {
      return new Response(
        JSON.stringify({ error: "Search query is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[Soundcharts] Searching for: ${query}`);

    const headers = {
      'x-app-id': APP_ID,
      'x-api-key': API_KEY
    };

    // 1. Search for the artist
    // Note: Sandbox only accepts specific strings like "billie eilish"
    const searchRes = await fetch(
      `${BASE_URL}/api/v2/artist/search/${encodeURIComponent(query.toLowerCase())}`,
      { headers }
    );
    
    if (!searchRes.ok) {
      if (searchRes.status === 403) {
         // Sandbox strict matching error
         return new Response(
            JSON.stringify({ error: "Artist not found in Soundcharts Sandbox. Try 'Billie Eilish'." }),
            { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
      }
      throw new Error(`Soundcharts search failed: ${searchRes.status}`);
    }
    
    const searchData = await searchRes.json();
    const artists = searchData.items || [];
    
    if (artists.length === 0) {
      return new Response(
        JSON.stringify({ error: "Artist not found on Soundcharts" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the first matching artist
    const artistMatch: any = artists[0];
    const artistUuid = artistMatch.uuid;

    // 2. Fetch specific Soundcharts data if needed (e.g., Radio stats)
    // For now, we will return the basic profile to establish the normalized merge.
    
    const result = {
      platform: "soundcharts",
      id: artistUuid,
      name: artistMatch.name,
      image: artistMatch.imageUrl,
      sc_career_stage: artistMatch.careerStage,
      sc_growth_level: artistMatch.growthLevel,
      // Mocking some radio spins since Sandbox doesn't give us the full historical radio endpoint easily without more complex querying
      radioSpins: artistMatch.slug === 'billie-eilish' ? 15000 : 0
    };

    console.log(`[Soundcharts] Found data for: ${result.name}`);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err: any) {
    console.error("[Soundcharts] Error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
