// supabase/functions/apify-apple/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ApifyClient } from "npm:apify-client@2.7.1";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    if (!query) {
      throw new Error("Missing query");
    }

    const APIFY_TOKEN = Deno.env.get("APIFY_TOKEN");
    if (!APIFY_TOKEN) {
      throw new Error("Missing APIFY_TOKEN");
    }

    // Step 1: Use iTunes API to search for the artist and get their Apple Music URL
    const itunesRes = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=musicArtist&limit=1`);
    const itunesData = await itunesRes.json();
    
    if (!itunesData.results || itunesData.results.length === 0) {
      throw new Error("Artist not found on Apple Music");
    }
    
    const artist = itunesData.results[0];
    const artistUrl = artist.artistLinkUrl; // e.g. https://music.apple.com/us/artist/taylor-swift/159260351

    // Step 2: Call the Apify Actor
    const apifyClient = new ApifyClient({ token: APIFY_TOKEN });
    const actorId = "automation-lab/apple-music-scraper";
    
    const input = {
      startUrls: [{ url: artistUrl }],
      maxItems: 1000
    };

    console.log(`[Apify Apple] Starting run for ${artistUrl}`);
    const run = await apifyClient.actor(actorId).call(input);
    
    console.log(`[Apify Apple] Run finished. Fetching dataset...`);
    const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();
    
    // Step 3: Process the items to count Albums, Singles, and Tracks
    let totalAlbums = 0;
    // Strict deduplication logic
    const normalizeTitle = (title) => {
      let t = title.toLowerCase();
      t = t.replace(/\\(feat\\..*?\\)/g, '');
      t = t.replace(/\\[feat\\..*?\\]/g, '');
      t = t.replace(/\\(feat .*?\\)/g, '');
      t = t.replace(/\\(.*?version\\)/g, '');
      t = t.replace(/\\[.*?version\\]/g, '');
      t = t.replace(/\\(.*?remix\\)/g, '');
      t = t.replace(/\\[.*?remix\\]/g, '');
      t = t.replace(/\\(.*?edit\\)/g, '');
      t = t.replace(/radio edit/g, '');
      t = t.replace(/remastered/g, '');
      t = t.replace(/remaster/g, '');
      t = t.replace(/instrumental/g, '');
      t = t.replace(/acoustic/g, '');
      t = t.replace(/live/g, '');
      t = t.replace(/explicit/g, '');
      t = t.replace(/clean/g, '');
      t = t.replace(/[^a-z0-9]/g, '');
      return t.trim();
    };

    const isPrimaryArtist = (itemArtist, queryArtist) => {
      const ia = (itemArtist || '').toLowerCase();
      const qa = (queryArtist || '').toLowerCase();
      // If it's something like "Various Artists" or doesn't start with the artist name, they might be a feature
      return ia.includes(qa) && !ia.includes('feat.') && !ia.includes('ft.');
    };

    let totalSingles = 0;
    const topTracks = [];
    const rawAlbums = [];
    const rawSingles = [];

    items.forEach((item) => {
      const mappedItem = {
        ...item,
        name: item.title || item.collectionName || item.trackName || '',
        title: item.title || item.trackName || item.collectionName || '',
        image: item.artworkUrl600 || null,
      };

      if (item.entityType === "album") {
        // Apply logic to separate Singles/EPs from actual Albums
        const trackCount = item.trackCount || 0;
        if (trackCount > 3) {
          rawAlbums.push(mappedItem);
        } else {
          rawSingles.push(mappedItem);
        }
      } else if (item.entityType === "song" || item.entityType === "track") {
        topTracks.push(mappedItem);
      }
    });

    // Deduplicate Albums
    const albumsList = [];
    const seenAlbumNames = new Set();
    rawAlbums.forEach(album => {
      const nt = normalizeTitle(album.name);
      if (!seenAlbumNames.has(nt) && isPrimaryArtist(album.artistName, artist.artistName)) {
        seenAlbumNames.add(nt);
        albumsList.push(album);
      }
    });

    // Deduplicate Singles & Check if they exist on an album
    const singlesList = [];
    const seenSingleNames = new Set();
    rawSingles.forEach(single => {
      const nt = normalizeTitle(single.name);
      // Skip if we already added it, or if it belongs to an album we already added
      if (!seenSingleNames.has(nt) && !seenAlbumNames.has(nt) && isPrimaryArtist(single.artistName, artist.artistName)) {
        seenSingleNames.add(nt);
        singlesList.push(single);
      }
    });

    totalAlbums = albumsList.length;
    totalSingles = singlesList.length;

    // Format the result to match what the frontend expects for an artist
    const result = {
      platform: "itunes",
      name: artist.artistName,
      artistId: artist.artistId,
      appleUrl: artistUrl,
      stats: {
        totalAlbums,
        totalSingles,
        totalTopTracks: topTracks.length > 0 ? topTracks.length : 10
      },
      albums: albumsList,
      singles: singlesList,
      topTracks: topTracks.length > 0 ? topTracks.slice(0, 10) : [], 
      rawItunesData: artist,
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("[Apify Apple] Error:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
