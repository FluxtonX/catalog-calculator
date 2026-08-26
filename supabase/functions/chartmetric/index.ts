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

    // 2. Get artist detailed stats, Facebook stats, and Audience stats in parallel
    const [detailRes, fbRes, audRes] = await Promise.all([
      fetch(`https://api.chartmetric.com/api/artist/${artistId}`, { headers: authHeader }),
      fetch(`https://api.chartmetric.com/api/artist/${artistId}/stat/facebook`, { headers: authHeader }),
      fetch(`https://api.chartmetric.com/api/artist/${artistId}/where-people-listen`, { headers: authHeader })
    ]);
    
    let detailObj = null;
    let cmStats = null;
    if (detailRes.ok) {
      const detailData = await detailRes.json();
      detailObj = detailData.obj || null;
      cmStats = detailObj?.cm_statistics || {};
    }

    let fbFollowers = 0;
    if (fbRes.ok) {
      try {
        const fbData = await fbRes.json();
        const likes = fbData.obj?.likes || [];
        if (likes.length > 0) {
          fbFollowers = likes[likes.length - 1].value || 0;
        }
      } catch (e) {
        console.error("Error parsing facebook stats:", e);
      }
    }

    let primaryMarket = null;
    let secondaryMarket = null;
    if (audRes.ok) {
      try {
        const audData = await audRes.json();
        const countries = audData.obj?.countries || {};
        
        const countryStats: {name: string, listeners: number}[] = [];
        for (const [countryName, dataPoints] of Object.entries(countries)) {
           const points = dataPoints as any[];
           if (points && points.length > 0) {
              const latest = points[points.length - 1];
              if (latest && latest.listeners) {
                 countryStats.push({ name: countryName, listeners: latest.listeners });
              }
           }
        }
        
        countryStats.sort((a, b) => b.listeners - a.listeners);
        
        if (countryStats.length > 0) primaryMarket = countryStats[0].name.toUpperCase();
        if (countryStats.length > 1) secondaryMarket = countryStats[1].name.toUpperCase();
      } catch (e) {
        console.error("Error parsing audience stats:", e);
      }
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
      chartmetricRank: detailObj?.cm_artist_rank || null,
      primaryGenre: artistMatch.primary_genre_smart,
      primaryMarket,
      secondaryMarket,
      // Format strings for UI compatibility
      followersFormatted: formatNumber(artistMatch.sp_followers || 0),
      monthlyListenersFormatted: formatNumber(artistMatch.sp_monthly_listeners || 0),
      worldRankFormatted: detailObj?.cm_artist_rank ? `#${detailObj.cm_artist_rank}` : "N/A",
      
      // Full Social Stats extracted from cm_statistics and direct endpoint
      stats: {
        ig_followers: cmStats?.ins_followers || detailObj?.instagram_followers || artistMatch.instagram_followers || artistMatch.ig_followers || 0,
        tiktok_followers: cmStats?.tiktok_followers || detailObj?.tiktok_followers || artistMatch.tiktok_followers || 0,
        youtube_subscribers: cmStats?.ycs_subscribers || detailObj?.youtube_channel_subscribers || artistMatch.youtube_subscribers || 0,
        twitter_followers: cmStats?.twitter_followers || detailObj?.twitter_followers || artistMatch.twitter_followers || 0,
        facebook_fans: fbFollowers || cmStats?.facebook_fans || detailObj?.facebook_fans || artistMatch.facebook_fans || 0,
        sp_followers: cmStats?.sp_followers || detailObj?.sp_followers || artistMatch.sp_followers || 0,
        sp_playlists: cmStats?.num_sp_playlists || detailObj?.sp_playlists || artistMatch.sp_playlists || 0,
      },
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
