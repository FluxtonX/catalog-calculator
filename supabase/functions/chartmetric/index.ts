import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

// Replace this with Deno.env.get("CHARTMETRIC_REFRESH_TOKEN") when deployed securely.
const REFRESH_TOKEN = Deno.env.get("CHARTMETRIC_REFRESH_TOKEN") || "VYjZz3ngzgtO3w3ZDD7TeeOIuKSzoxnxonARPUPTmoGUwDFOsdsKGTbel5mGceMy";

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

    // Initialize Supabase Client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check Cache First
    const normalizedQuery = query.toLowerCase().trim();
    const cacheId = `chartmetric_${normalizedQuery}`;
    
    const { data: cacheData, error: cacheError } = await supabase
      .from('api_cache')
      .select('*')
      .eq('id', cacheId)
      .single();

    if (cacheData && !cacheError) {
      const updatedAt = new Date(cacheData.updated_at).getTime();
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      if (updatedAt > sevenDaysAgo) {
        console.log(`[Chartmetric] Cache hit for: ${query}`);
        return new Response(JSON.stringify(cacheData.data), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    console.log(`[Chartmetric] Cache miss (or expired) for: ${query}. Fetching from API...`);

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
    const artistMatch: any = artists[0];
    const artistId = artistMatch.id;

    // 2. Get artist detailed stats (Dropped expensive FB and Audience fetches to save credits)
    const detailRes = await fetch(`https://api.chartmetric.com/api/artist/${artistId}`, { headers: authHeader });
    
    let detailObj: any = null;
    let cmStats: any = null;
    if (detailRes.ok) {
      const detailData = await detailRes.json();
      detailObj = detailData.obj || null;
      cmStats = detailObj?.cm_statistics || {};
    }

    let fbFollowers = 0;
    let primaryMarket = null;
    let secondaryMarket = null;

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
        
        // Streaming Stats Section Data
        sp_monthly_listeners: cmStats?.sp_monthly_listeners || detailObj?.sp_monthly_listeners || artistMatch.sp_monthly_listeners || 0,
        sp_playlist_total_reach: cmStats?.sp_playlist_total_reach || 0,
        
        tiktok_likes: cmStats?.tiktok_likes || 0,
        tiktok_top_video_views: cmStats?.tiktok_top_video_views || 0,
        tiktok_track_posts: cmStats?.tiktok_track_posts || 0,
        
        pandora_listeners_28_day: cmStats?.pandora_listeners_28_day || 0,
        pandora_lifetime_streams: cmStats?.pandora_lifetime_streams || 0,
        
        ycs_views: cmStats?.ycs_views || 0,
        youtube_daily_video_views: cmStats?.youtube_daily_video_views || 0,
        youtube_monthly_video_views: cmStats?.youtube_monthly_video_views || 0,
        
        shazam_count: cmStats?.shazam_count || 0,
      },
    };

    console.log(`[Chartmetric] Found data for: ${result.name}`);

    // Save to cache (MUST await so Deno does not terminate before saving)
    if (supabase) {
      const { error } = await supabase.from('api_cache').upsert({
        id: cacheId,
        query: normalizedQuery,
        platform: 'chartmetric',
        data: result,
        updated_at: new Date().toISOString()
      });
      if (error) console.error("[Chartmetric] Error caching result:", error);
    }

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
