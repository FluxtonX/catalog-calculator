import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

// Replace this with Deno.env.get("CHARTMETRIC_REFRESH_TOKEN") when deployed securely.
const REFRESH_TOKEN = Deno.env.get("CHARTMETRIC_REFRESH_TOKEN") || "8k7e3gw3zw5S8NdKA6UgzmDiJnSXKdINnsyDHeGZZTUMnw7ewqkcGVSKHrl1ElPT";

// Global cache for the access token to avoid fetching it on every request
let cachedAccessToken: string | null = null;
let tokenExpiresAt: number = 0;

async function getChartmetricToken(): Promise<string> {
  const now = Date.now();
  if (cachedAccessToken && now < tokenExpiresAt) {
    return cachedAccessToken;
  }

  const res = await fetch("https://api.chartmetric.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshtoken: REFRESH_TOKEN }),
  });

  if (!res.ok) {
    throw new Error(`Failed to get Chartmetric token: ${res.status}`);
  }

  const data = await res.json();
  cachedAccessToken = data.token;
  // Subtract 5 minutes from expiration as a buffer
  tokenExpiresAt = now + (data.expires_in * 1000) - (5 * 60 * 1000);
  
  return cachedAccessToken as string;
}

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

    console.log(`[Chartmetric] Searching for: ${query}`);

    const token = await getChartmetricToken();
    const authHeader = { Authorization: `Bearer ${token}` };

    // 1. Search for the artist
    const searchRes = await fetch(
      `https://api.chartmetric.com/api/search?q=${encodeURIComponent(query)}`,
      { headers: authHeader }
    );
    
    if (!searchRes.ok) {
      throw new Error(`Chartmetric search failed: ${searchRes.status}`);
    }
    
    const searchData = await searchRes.json();
    const artists = searchData.obj?.artists || [];
    
    if (artists.length === 0) {
      return new Response(
        JSON.stringify({ error: "Artist not found on Chartmetric" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the first matching artist
    const artistMatch = artists[0];
    const artistId = artistMatch.id;

    // 2. Get artist detailed stats (to get cm_artist_rank etc.)
    const detailRes = await fetch(
      `https://api.chartmetric.com/api/artist/${artistId}`,
      { headers: authHeader }
    );
    
    let cm_artist_rank = null;
    if (detailRes.ok) {
      const detailData = await detailRes.json();
      cm_artist_rank = detailData.obj?.cm_artist_rank || null;
    }

    // Combine data to match the expected format used in the app
    const result = {
      platform: "chartmetric",
      id: artistMatch.id,
      name: artistMatch.name,
      image: artistMatch.image_url,
      verified: artistMatch.verified,
      followers: artistMatch.sp_followers || 0,
      monthlyListeners: artistMatch.sp_monthly_listeners || 0,
      chartmetricScore: artistMatch.cm_artist_score || 0,
      chartmetricRank: cm_artist_rank,
      primaryGenre: artistMatch.primary_genre_smart,
      // Format strings for UI compatibility
      followersFormatted: formatNumber(artistMatch.sp_followers || 0),
      monthlyListenersFormatted: formatNumber(artistMatch.sp_monthly_listeners || 0),
      worldRankFormatted: cm_artist_rank ? `#${cm_artist_rank}` : "N/A",
    };

    console.log(`[Chartmetric] Found data for: ${result.name}`);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err: any) {
    console.error("[Chartmetric] Error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function formatNumber(num: number): string {
  if (!num) return "0";
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toLocaleString();
}
