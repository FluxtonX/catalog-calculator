import { calculateCfaPhase1 } from "./cfaPhase1";

export const getPlatformValuation = (artistData) => {
  if (!artistData) return 0;
  
  if (["spotify", "apify", "youtube", "itunes"].includes(artistData.platform)) {
    // For these platforms, we now use the CFA Phase 1 logic
    const platformStr = artistData.platform === "apify" ? "spotify" : artistData.platform;
    const result = calculateCfaPhase1(artistData, platformStr);
    // Previously returned marketValuation, now midEstimate maps to 8x
    return result.midEstimate || 0;
  }
  
  if (artistData.platform === "custom") {
    // Treat the manually entered revenue as the LTM revenue, or use streams if revenue is missing
    const revenue = artistData.stats?.totalRevenue || 0;
    const streams = artistData.stats?.totalStreams || 0;
    
    if (revenue > 0) {
      return revenue * 8; // standard 8x multiple on LTM
    } else if (streams > 0) {
      // average blended rate
      return streams * 0.004 * 8;
    }
    return 0;
  }
  
  return 0;
};

export const getCombinedValuation = (selectedArtists) => {
  if (!selectedArtists || Object.keys(selectedArtists).length === 0) return 0;
  
  return Object.values(selectedArtists).reduce((sum, artist) => {
    const val = getPlatformValuation(artist);
    console.log(`[Summation Debug] Platform: ${artist.platform}, Name: ${artist.name}, Valuation: ${val}`);
    return sum + val;
  }, 0);
};

export const getCombinedCfaValuations = (selectedArtists) => {
  if (!selectedArtists || Object.keys(selectedArtists).length === 0) return null;

  const result = {
    monthlyRevenue: 0,
    annualRevenue: 0,
    lowEstimate: 0,
    midEstimate: 0,
    highEstimate: 0,
    breakdown: {}
  };

  const artists = Object.values(selectedArtists);
  const proxyArtist = artists.find(a => a.platform === 'spotify' || a.platform === 'apify' || (a.topTracks && a.topTracks.length > 0));

  artists.forEach(originalArtist => {
    if (!["spotify", "apify", "youtube", "itunes", "apple"].includes(originalArtist.platform)) return;

    // Create a mutable copy
    const artist = { ...originalArtist };
    const platformStr = artist.platform === "apify" ? "spotify" : (artist.platform === "apple" ? "itunes" : artist.platform);

    // Check if the artist actually has valid stream numbers on their tracks
    const hasValidStreams = artist.topTracks && artist.topTracks.length > 0 && 
      artist.topTracks.some(t => t.playcount || t.playCount || t.streams || t.streamCount || t.viewCount || t.streams_last_30_days || t.last30Days || t.streams_last_28_days || t.last28Days);

    // If missing topTracks OR missing stream counts on those tracks, use proxy
    if (!hasValidStreams && proxyArtist && proxyArtist.topTracks) {
      let scaleFactor = 1.0;
      if (platformStr === 'itunes') scaleFactor = 0.40;
      if (platformStr === 'youtube') scaleFactor = 1.20;

      artist.topTracks = proxyArtist.topTracks.map(track => {
        // Parse the stream value from any of the known properties
        const rawStreams = track.playcount || track.playCount || track.streams || track.streamCount || track.viewCount || 0;
        const scaledStreams = Math.round(rawStreams * scaleFactor);
        
        return {
          ...track,
          playcount: scaledStreams,
          playCount: scaledStreams,
          streams: scaledStreams,
          streamCount: scaledStreams
        };
      });
    }

    const cfaResult = calculateCfaPhase1(artist, platformStr);
    
    result.monthlyRevenue += (cfaResult.totalAnnualRevenue / 12) || 0;
    result.annualRevenue += cfaResult.totalAnnualRevenue || 0;
    result.lowEstimate += cfaResult.lowEstimate || 0;
    result.midEstimate += cfaResult.midEstimate || 0;
    result.highEstimate += cfaResult.highEstimate || 0;
    
    result.breakdown[platformStr] = cfaResult;
  });

  return result;
};

export const parseNumber = (str) => {
  if (!str) return 0;
  if (typeof str === 'number') return str;
  const upper = String(str).toUpperCase();
  if (upper.includes("B")) return parseFloat(upper) * 1e9;
  if (upper.includes("M")) return parseFloat(upper) * 1e6;
  if (upper.includes("K")) return parseFloat(upper) * 1e3;
  return parseFloat(upper.replace(/,/g, "")) || 0;
};

export const getCombinedMetrics = (selectedArtists) => {
  if (!selectedArtists || Object.keys(selectedArtists).length === 0) return null;
  
  let totalValuation = 0;
  let totalFollowers = 0;
  let totalStreams = 0;
  let totalAlbums = 0;
  let totalSingles = 0;
  let totalTracks = 0;
  
  const breakdown = {};
  
  // Check if custom distributor data exists. If it does, we use it for financial valuation
  // instead of estimating from public platforms to avoid double-counting.
  const hasCustomData = !!selectedArtists["custom"];
  
  Object.values(selectedArtists).forEach(artist => {
    const platform = artist.platform === 'apify' ? 'spotify' : artist.platform;
    if (!breakdown[platform]) {
      breakdown[platform] = { valuation: 0, followers: 0, streams: 0, albums: 0, singles: 0, tracks: 0 };
    }
    
    // Only calculate valuation from public platforms if we DON'T have custom distributor data,
    // OR if this is the custom data itself.
    if (!hasCustomData || platform === "custom") {
      const val = getPlatformValuation(artist);
      totalValuation += val;
      breakdown[platform].valuation += val;
    }
    
    // Parse followers/subscribers
    const followers = artist.followers || artist.subscribers || artist.stats?.totalSubscribers || artist.stats?.subscribers;
    if (followers) {
      const parsedFollowers = parseNumber(followers);
      totalFollowers += parsedFollowers;
      breakdown[platform].followers += parsedFollowers;
    }
    
    // Fallbacks for tracks, albums, singles
    if (platform === "youtube") {
      const streams = parseNumber(artist.totalViews || artist.stats?.totalViews);
      if (!hasCustomData) totalStreams += streams;
      breakdown[platform].streams += streams;
      
      const tracks = parseNumber(artist.stats?.totalVideos || 0);
      if (!hasCustomData) totalTracks += tracks;
      breakdown[platform].tracks += tracks;
    } else if (platform === "spotify" || platform === "itunes") {
      // In CFA Phase 1 we calculate Streams based on top 10 tracks or use lifetime directly.
      // Here we just use the raw parsed string for UI total stream count metric.
      let streams = 0;
      if (artist.stats?.totalStreams) {
        streams = parseNumber(artist.stats.totalStreams);
      } else if (artist.monthlyListeners) {
         streams = parseNumber(artist.monthlyListeners) * 12 * 15;
      }
      
      if (!hasCustomData) totalStreams += streams;
      breakdown[platform].streams += streams;
      
      const albums = artist.stats?.totalAlbums || artist.albums?.length || 0;
      if (!hasCustomData) totalAlbums += albums;
      breakdown[platform].albums += albums;
      
      const singles = artist.stats?.totalSingles || artist.singles?.length || 0;
      if (!hasCustomData) totalSingles += singles;
      breakdown[platform].singles += singles;
      
      const tracks = artist.stats?.totalTopTracks || artist.topTracks?.length || 0;
      if (!hasCustomData) totalTracks += tracks;
      breakdown[platform].tracks += tracks;
    } else if (platform === "custom") {
      const streams = parseNumber(artist.stats?.totalStreams || 0);
      totalStreams += streams;
      breakdown[platform].streams += streams;
      
      const tracks = parseNumber(artist.stats?.totalTracks || 0);
      totalTracks += tracks;
      breakdown[platform].tracks += tracks;
    }
  });
  
  return {
    totalValuation,
    totalFollowers,
    totalStreams,
    totalAlbums,
    totalSingles,
    totalTracks,
    breakdown
  };
};


