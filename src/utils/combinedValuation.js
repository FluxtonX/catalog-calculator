import { calculateValuations, getLifetimeStreams, getAverageReleaseDate } from "./calculations";
import { parseViewCount, calculateYouTubeMetrics } from "../components/youtube/hooks/useYouTubeValuationLogic";
import { estimateMonthlyStreams, APPLE_MUSIC_RATE } from "../components/itunes/valuationHelpers";

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
  
  return 0;
};

export const getCombinedValuation = (selectedArtists) => {
  if (!selectedArtists || Object.keys(selectedArtists).length === 0) return 0;
  
  return Object.values(selectedArtists).reduce((sum, artist) => {
    return sum + getPlatformValuation(artist);
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
  
  Object.values(selectedArtists).forEach(artist => {
    totalValuation += getPlatformValuation(artist);
    
    // Parse followers/subscribers
    if (artist.followers) {
      totalFollowers += parseNumber(artist.followers);
    }
    
    // Parse streams/views/monthly listeners
    if (artist.platform === "youtube") {
      totalStreams += parseNumber(artist.totalViews || artist.stats?.totalViews);
    } else if (artist.platform === "spotify" || artist.platform === "apify") {
      totalStreams += parseNumber(artist.monthlyListeners); // or streams, but listeners is typically available
    } else if (artist.platform === "itunes") {
      // Itunes doesn't have a direct "followers" or "streams" easily parseable here without the full calculation, 
      // but we can just use the estimatedMonthlyStreams logic from above if we want, or leave it.
      // We will leave it as is, or approximate it. Let's approximate based on popularity.
      const avgPop = artist.popularity ?? 50;
      totalStreams += estimateMonthlyStreams(avgPop);
    }
  });
  
  return {
    totalValuation,
    totalFollowers,
    totalStreams
  };
};

export const formatCurrency = (n) => {
  if (!n || isNaN(n)) return "$0";
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
};

export const formatNumberAbbrev = (n) => {
  if (!n || isNaN(n)) return "0";
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return `${Math.round(n)}`;
};
