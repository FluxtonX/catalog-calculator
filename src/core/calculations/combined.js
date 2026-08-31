import { calculateValuations, getLifetimeStreams, getAverageReleaseDate } from "./spotify";
import { parseViewCount, calculateYouTubeMetrics } from "./youtube";
import { estimateMonthlyStreams } from "./itunes";
import { APPLE_MUSIC_RATE } from "./constants";

export const getPlatformValuation = (artistData) => {
  if (!artistData) return 0;
  
  if (artistData.platform === "spotify" || artistData.platform === "apify") {
    const lifetimeStreams = getLifetimeStreams(artistData);
    const releaseDate = getAverageReleaseDate(artistData);
    const result = calculateValuations(artistData, lifetimeStreams, releaseDate, artistData.topCities);
    return result.marketValuation || 0;
  }
  
  if (artistData.platform === "youtube") {
    const totalViews = parseViewCount(artistData.totalViews || artistData.stats?.totalViews);
    const metrics = calculateYouTubeMetrics({
      totalViews,
      annualViewPercentage: 25,
      monetizationRate: 50,
      avgCpm: 2.0,
      creatorCut: 55,
      streamingRate: 0.0054,
    });
    return metrics.marketValuation || 0;
  }
  
  if (artistData.platform === "itunes") {
    const { topTracks, stats, albums, singles, popularity } = artistData;
    const totalAlbums  = stats?.totalAlbums ?? albums?.length ?? 0;
    const totalSingles = singles?.length ?? 0;
    const totalTracks  = stats?.totalTopTracks ?? topTracks?.length ?? 0;

    const top10 = (topTracks ?? []).slice(0, 10);
    const top10Popularities = top10.map((t, i) => {
      const real = t.popularity ?? t.trackPopularity ?? 0;
      if (real > 0) return real;
      const catalogSize = totalAlbums * 3 + totalSingles + totalTracks;
      const catalogMultiplier = Math.min(catalogSize / 50, 1.2);
      const baseScore = Math.round(45 - (i * 4));
      return Math.min(Math.round(baseScore * catalogMultiplier), 100);
    });

    const avgTop10Popularity =
      top10Popularities.length > 0
        ? top10Popularities.reduce((a, b) => a + b, 0) / top10Popularities.length
        : popularity ?? 50;

    const estimatedMonthlyStreams = estimateMonthlyStreams(avgTop10Popularity);
    const monthlyRevenue = estimatedMonthlyStreams * APPLE_MUSIC_RATE;
    const annualRevenue = monthlyRevenue * 12;

    const catalogBonus = Math.min(
      totalAlbums * 0.08 + totalSingles * 0.005,
      0.5
    );
    const ltmRevenue = annualRevenue * (1 + catalogBonus);
    return ltmRevenue * 8 || 0;
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
    
    // Parse streams/views/monthly listeners
    if (artist.platform === "youtube") {
      const streams = parseNumber(artist.totalViews || artist.stats?.totalViews);
      if (!hasCustomData) totalStreams += streams;
      breakdown[platform].streams += streams;
      
      const tracks = parseNumber(artist.stats?.totalVideos || 0);
      if (!hasCustomData) totalTracks += tracks;
      breakdown[platform].tracks += tracks;
    } else if (artist.platform === "spotify" || artist.platform === "apify") {
      let streams = 0;
      const lifetime = getLifetimeStreams(artist);
      if (lifetime > 0) {
        streams = lifetime;
      } else {
        streams = parseNumber(artist.monthlyListeners);
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
    } else if (artist.platform === "itunes") {
      const avgPop = artist.popularity ?? 50;
      const streams = estimateMonthlyStreams(avgPop);
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
    } else if (artist.platform === "custom") {
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


