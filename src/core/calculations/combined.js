import { calculateCfaPhase1 } from "./cfaPhase1";
import { CFA_MULTIPLIERS } from "./constants";

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
    // Revenue from edge function is already LTM (last 12 months)
    const revenue = artistData.stats?.totalRevenue || 0;
    const streams = artistData.stats?.totalStreams || 0;
    
    if (revenue > 0) {
      return revenue * CFA_MULTIPLIERS.MID; // 8x multiple on LTM
    } else if (streams > 0) {
      // average blended rate
      return streams * 0.004 * CFA_MULTIPLIERS.MID;
    }
    return 0;
  }
  
  return 0;
};

export const getCombinedValuation = (selectedArtists) => {
  if (!selectedArtists || Object.keys(selectedArtists).length === 0) return 0;
  
  // Upgrade to use the new cross-pollination engine so platforms without stats (Apple Music) 
  // can mathematically borrow track streams from proxy platforms
  const cfa = getCombinedCfaValuations(selectedArtists);
  return cfa ? cfa.midEstimate : 0;
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
  // Find a proxy artist (like Spotify) that actually has stream counts on their tracks
  const proxyArtist = artists.find(a => ['spotify', 'apify', 'spotify_proxy'].includes(a.platform) || (a.topTracks && a.topTracks.length > 0));

  artists.forEach(originalArtist => {
    // ── Handle custom/distributor data (Concord, TuneCore, etc.) ──
    if (originalArtist.platform === "custom") {
      const revenue = originalArtist.stats?.totalRevenue || 0;
      if (revenue > 0) {
        const unrecoupedBalance = originalArtist.stats?.unrecoupedBalance || 0;
        const absUnrecouped = Math.abs(unrecoupedBalance);
        
        result.annualRevenue += revenue;
        result.monthlyRevenue += revenue / 12;
        result.lowEstimate  += revenue * CFA_MULTIPLIERS.LOW;   // 6x
        result.midEstimate  += revenue * CFA_MULTIPLIERS.MID;   // 8x
        result.highEstimate += revenue * CFA_MULTIPLIERS.HIGH;  // 10x
        
        result.breakdown["custom"] = {
          platform: "custom",
          totalAnnualRevenue: revenue,
          lowEstimate:  revenue * CFA_MULTIPLIERS.LOW,
          midEstimate:  revenue * CFA_MULTIPLIERS.MID,
          highEstimate: revenue * CFA_MULTIPLIERS.HIGH,
          acceleratorValue: revenue * CFA_MULTIPLIERS.HIGH * (CFA_MULTIPLIERS.ACCELERATOR || 1.30),
          unrecoupedBalance,
          // Net valuations: subtract unrecouped advance if negative balance exists
          netLowEstimate:  (revenue * CFA_MULTIPLIERS.LOW)  - absUnrecouped,
          netMidEstimate:  (revenue * CFA_MULTIPLIERS.MID)  - absUnrecouped,
          netHighEstimate: (revenue * CFA_MULTIPLIERS.HIGH) - absUnrecouped,
          cfaConfidence: "HIGH", // Distributor data is ground truth
          tracksAnalyzed: 0,
          trackDetails: [],
          lifetimeRevenue: originalArtist.stats?.lifetimeRevenue || 0,
          growthRate: originalArtist.stats?.growthRate || 0,
        };
      }
      return; // Don't run CFA Phase 1 on custom data
    }

    if (!["spotify", "apify", "youtube", "itunes", "apple", "spotify_proxy", "youtube_proxy"].includes(originalArtist.platform)) return;

    // Create a mutable copy
    const artist = { ...originalArtist };
    
    // Normalize platform string and strip _proxy suffix for correct rate lookup
    let platformStr = artist.platform === "apify" ? "spotify" : (artist.platform === "apple" ? "itunes" : artist.platform);
    const isProxy = platformStr.includes('_proxy');
    platformStr = platformStr.replace('_proxy', '');

    // Check if the artist actually has valid stream numbers on their tracks
    const hasValidStreams = artist.topTracks && artist.topTracks.length > 0 && 
      artist.topTracks.some(t => t.playcount || t.playCount || t.streams || t.streamCount || t.viewCount || t.streams_last_30_days || t.last30Days || t.streams_last_28_days || t.last28Days);

    // If missing topTracks OR missing stream counts on those tracks, use proxy
    if (!hasValidStreams && proxyArtist && proxyArtist.topTracks) {
      let scaleFactor = 1.0;
      // To achieve Target Revenue = Spotify Revenue * Ratio
      // Target Revenue = (Spotify Streams * 0.004) * Ratio
      // Platform Revenue = (Spotify Streams * scaleFactor) * Platform Rate
      // scaleFactor = (0.004 * Ratio) / Platform Rate
      
      if (platformStr === 'itunes' || platformStr === 'apple') {
        // Ratio = 0.40, Platform Rate = 0.01
        // scaleFactor = (0.004 * 0.40) / 0.01 = 0.16
        scaleFactor = 0.16;
      }
      if (platformStr === 'youtube') {
        // Ratio = 1.20, Platform Rate = ~0.00164
        // scaleFactor = (0.004 * 1.20) / 0.00164 = 2.92
        scaleFactor = 2.92;
      }

      artist.topTracks = proxyArtist.topTracks.map(track => {
        // Parse the stream value from any of the known properties
        const rawStreams = parseNumber(track.playcount || track.playCount || track.streams || track.streamCount || track.viewCount || 0);
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
    
    // We add proxies to the breakdown so they can be used for mathematical inference,
    // but we use their original proxy name so they don't overwrite the real platform.
    result.breakdown[originalArtist.platform] = cfaResult;
    
    // Do NOT add proxy values to the final user-facing sum
    if (!isProxy) {
      result.monthlyRevenue += (cfaResult.totalAnnualRevenue / 12) || 0;
      result.annualRevenue += cfaResult.totalAnnualRevenue || 0;
      result.lowEstimate += cfaResult.lowEstimate || 0;
      result.midEstimate += cfaResult.midEstimate || 0;
      result.highEstimate += cfaResult.highEstimate || 0;
    }
  });

  // SECOND PASS: Mathematical Revenue Inference for Platforms with Missing Data
  const successfulPlatforms = Object.values(result.breakdown).filter(r => r && r.totalAnnualRevenue > 0);
  
  Object.keys(result.breakdown).forEach(key => {
    // Only infer for real platforms, skip inferring for broken proxies
    if (key.includes('_proxy')) return;
    
    const cfaResult = result.breakdown[key];
    const platformStr = key;
    
    // Always use anchor's track details and age for Apple Music / Custom 
    // because they often lack real track release dates or use dummy tracks
    const anchor = successfulPlatforms.find(r => r.platform === 'spotify' || r.platform === 'spotify_proxy') || successfulPlatforms[0];
    
    if (anchor && (platformStr === 'itunes' || platformStr === 'apple' || cfaResult.cfaConfidence === 'LOW' || cfaResult.cfaConfidence === 'POPULARITY_INFERENCE')) {
       cfaResult.averageDollarAge = anchor.averageDollarAge || cfaResult.averageDollarAge;
       cfaResult.trackDetails = anchor.trackDetails || cfaResult.trackDetails;
    }
    
    if (cfaResult.totalAnnualRevenue === 0 && successfulPlatforms.length > 0) {
      const ratios = {
        'spotify': 1.0,
        'itunes': 0.40,
        'youtube': 1.20,
        'custom': 1.0
      };
      
      const anchorType = anchor.platform.replace('_proxy', '');
      const anchorRatio = ratios[anchorType] || 1.0;
      const targetRatio = ratios[platformStr] || 1.0;
      
      const inferredRevenue = anchor.totalAnnualRevenue * (targetRatio / anchorRatio);
      
      cfaResult.totalAnnualRevenue = inferredRevenue;
      cfaResult.midEstimate = inferredRevenue * CFA_MULTIPLIERS.MID;
      cfaResult.lowEstimate = inferredRevenue * CFA_MULTIPLIERS.LOW;
      cfaResult.highEstimate = inferredRevenue * CFA_MULTIPLIERS.HIGH;
      cfaResult.cfaConfidence = "ARTIST_CROSS_PLATFORM_INFERENCE";
      
      result.monthlyRevenue += (cfaResult.totalAnnualRevenue / 12) || 0;
      result.annualRevenue += cfaResult.totalAnnualRevenue || 0;
      result.lowEstimate += cfaResult.lowEstimate || 0;
      result.midEstimate += cfaResult.midEstimate || 0;
      result.highEstimate += cfaResult.highEstimate || 0;
    }
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


