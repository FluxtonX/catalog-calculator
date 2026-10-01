// supabase/functions/apify/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

async function safeJson(res: Response): Promise<any> {
  const text = await res.text();
  try { return JSON.parse(text); } catch (e) {
    throw new Error(`[safeJson] Error parsing JSON. Status: ${res.status}. Raw text: ${text.slice(0, 500)}`);
  }
}

async function getSpotifyToken(): Promise<string> {
  const clientId = Deno.env.get("SPOTIFY_CLIENT_ID");
  const clientSecret = Deno.env.get("SPOTIFY_CLIENT_SECRET");
  if (!clientId || !clientSecret) throw new Error("Missing Spotify credentials");
  const auth = btoa(`${clientId}:${clientSecret}`);
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Authorization": `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials",
  });
  const data = await safeJson(res);
  if (!data?.access_token) throw new Error(`Spotify token failed: ${JSON.stringify(data)}`);
  return data.access_token;
}

function fmt(num: number): string {
  if (!num) return "0";
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}

function fmtDur(ms: number): string {
  if (!ms) return "0:00";
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method === "GET") return new Response(JSON.stringify({ status: "ready" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    let query: string | undefined;
    try { const b = await req.json(); query = b.query; } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (!query?.trim()) return new Response(JSON.stringify({ error: "Query required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    // Supabase client for cache
    const sbUrl = Deno.env.get("SUPABASE_URL") || "";
    const sbKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_ANON_KEY") || "";
    const supabase = createClient(sbUrl, sbKey);

    const normalizedQuery = query.toLowerCase().trim();
    const cacheId = `apify_${normalizedQuery}`;

    // Try cache (non-fatal if DB is paused or returns non-JSON)
    try {
      const { data: cacheData, error: cacheError } = await supabase.from("api_cache").select("*").eq("id", cacheId).single();
      if (cacheData && !cacheError) {
        const age = Date.now() - new Date(cacheData.updated_at).getTime();
        if (age < 7 * 24 * 60 * 60 * 1000) {
          console.log(`[Apify] Cache hit: ${query}`);
          return new Response(JSON.stringify(cacheData.data), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
      }
    } catch (e) {
      console.warn("[Apify] Cache lookup failed (non-fatal):", e);
    }

    console.log(`[Apify] Fetching from Spotify API: ${query}`);
    const token = await getSpotifyToken();
    const auth = { Authorization: `Bearer ${token}` };

    // Search for artist
    const searchData = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=artist&limit=1`, { headers: auth }).then(safeJson);
    const artist = searchData?.artists?.items?.[0];
    if (!artist) {
      console.error("[Apify] Artist not found. Spotify response:", JSON.stringify(searchData));
      return new Response(JSON.stringify({ error: "Artist not found on Spotify", details: searchData }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const artistId = artist.id;
    const spotifyUrl = artist.external_urls?.spotify;
    console.log(`[Apify] Found: ${artist.name} (${artistId})`);

    // Fetch all data in parallel from Spotify — fast, reliable, no timeout issues
    // NOTE: Apify sync scraper removed — it held connections open 60+ seconds causing 502s
    const [topTracksData, fullArtist, albumsRes, singlesRes, relatedRes] = await Promise.all([
      fetch(`https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=US`, { headers: auth }).then(safeJson).catch(() => ({ tracks: [] })),
      fetch(`https://api.spotify.com/v1/artists/${artistId}`, { headers: auth }).then(safeJson).catch(() => ({})),
      fetch(`https://api.spotify.com/v1/artists/${artistId}/albums?include_groups=album&limit=20&market=US`, { headers: auth }).then(safeJson).catch(() => ({ items: [] })),
      fetch(`https://api.spotify.com/v1/artists/${artistId}/albums?include_groups=single&limit=20&market=US`, { headers: auth }).then(safeJson).catch(() => ({ items: [] })),
      fetch(`https://api.spotify.com/v1/artists/${artistId}/related-artists`, { headers: auth }).then(safeJson).catch(() => ({ artists: [] })),
    ]);

    const topTracks = (topTracksData?.tracks || []).slice(0, 10).map((t: any, i: number) => ({
      id: t.id, rank: i + 1, title: t.name, name: t.name,
      album: t.album?.name || null,
      albumImage: t.album?.images?.[0]?.url || null,
      releaseDate: t.album?.release_date || null,
      releaseYear: t.album?.release_date?.slice(0, 4) || null,
      duration: t.duration_ms, durationFormatted: fmtDur(t.duration_ms),
      previewUrl: t.preview_url || null,
      spotifyUrl: t.external_urls?.spotify || `https://open.spotify.com/track/${t.id}`,
      popularity: t.popularity || 0, explicit: t.explicit || false,
      streamCount: null, streamCountFormatted: null,
    }));

    const albums = (albumsRes?.items || []).map((a: any) => ({
      id: a.id, name: a.name, image: a.images?.[0]?.url || null,
      releaseDate: a.release_date || null, releaseYear: a.release_date?.slice(0, 4) || null,
      totalTracks: a.total_tracks || 0, type: "album",
      spotifyUrl: a.external_urls?.spotify || `https://open.spotify.com/album/${a.id}`,
    }));

    const singles = (singlesRes?.items || []).map((s: any) => ({
      id: s.id, name: s.name, image: s.images?.[0]?.url || null,
      releaseDate: s.release_date || null, releaseYear: s.release_date?.slice(0, 4) || null,
      totalTracks: s.total_tracks || 0, type: "single",
      spotifyUrl: s.external_urls?.spotify || `https://open.spotify.com/album/${s.id}`,
    }));

    const relatedArtists = (relatedRes?.artists || []).slice(0, 10).map((a: any) => ({
      id: a.id, name: a.name, image: a.images?.[0]?.url || null,
      genres: a.genres || [], followers: a.followers?.total || 0,
      followersFormatted: fmt(a.followers?.total), popularity: a.popularity || 0,
      popularityFormatted: `${a.popularity}/100`, spotifyUrl: a.external_urls?.spotify,
    }));

    const followersRaw = fullArtist?.followers?.total || artist.followers?.total || 0;
    const avgPopularity = topTracks.length > 0
      ? Math.round(topTracks.reduce((s: number, t: any) => s + t.popularity, 0) / topTracks.length)
      : 0;

    const result = {
      platform: "apify",
      id: artistId,
      name: fullArtist?.name || artist.name,
      image: fullArtist?.images?.[0]?.url || artist.images?.[0]?.url || null,
      images: fullArtist?.images || artist.images || [],
      coverArt: (fullArtist?.images || artist.images || []).map((img: any) => ({ url: img.url })),
      followers: fmt(followersRaw), followersRaw,
      monthlyListeners: null, monthlyListenersRaw: null,
      popularity: fullArtist?.popularity || 0,
      popularityFormatted: `${fullArtist?.popularity || 0}/100`,
      genres: fullArtist?.genres || [],
      spotifyUrl, youtubeUrl: spotifyUrl, apifyUrl: spotifyUrl,
      verified: false,
      topTracks, relatedArtists, albums, singles, popularReleases: [], topCities: [],
      stats: {
        totalFollowers: followersRaw, monthlyListeners: null, worldRank: null,
        popularity: fullArtist?.popularity || 0,
        totalGenres: (fullArtist?.genres || []).length,
        totalTopTracks: topTracks.length, totalRelatedArtists: relatedArtists.length,
        totalAlbums: albums.length, totalSingles: singles.length, totalPopularReleases: 0,
        averageTrackPopularity: avgPopularity,
        totalStreams: "N/A", averageStreams: "N/A",
      },
      biography: null, externalLinks: [],
    };

    console.log(`[Apify] Done: ${result.name} | Tracks:${topTracks.length} Albums:${albums.length} Singles:${singles.length}`);

    // Cache result (non-fatal)
    try {
      await supabase.from("api_cache").upsert({ id: cacheId, query: normalizedQuery, platform: "apify", data: result, updated_at: new Date().toISOString() });
    } catch (e) { console.warn("[Apify] Cache save failed:", e); }

    return new Response(JSON.stringify(result), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (err: any) {
    console.error("[Apify] Error:", err);
    return new Response(JSON.stringify({ error: err.message || "Internal server error", details: err.toString() }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
