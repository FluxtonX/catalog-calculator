// src/utils/calculations.js
import { RATE_BY_REGION, DEFAULT_SPOTIFY_RATE, DECAY_FACTORS, VALUATION_MULTIPLES } from "./constants";
import { parseStreamCount } from "./formatters";
import { getRevenueMultiplier, calculateTrackRevenue } from './featuredTrackUtils';

/**
 * Get decay factor based on months since release
 */
export const getDecayFactor = (monthsLive) => {
  if (monthsLive <= DECAY_FACTORS.FRESH.maxMonths) return DECAY_FACTORS.FRESH.factor;
  if (monthsLive <= DECAY_FACTORS.RECENT.maxMonths) return DECAY_FACTORS.RECENT.factor;
  if (monthsLive <= DECAY_FACTORS.MATURE.maxMonths) return DECAY_FACTORS.MATURE.factor;
  return DECAY_FACTORS.LEGACY.factor;
};

/**
 * Calculate months between two dates
 */
export const getMonthsBetween = (releaseDate, currentDate) => {
  const release = new Date(releaseDate);
  const current = new Date(currentDate);
  const months =
    (current.getFullYear() - release.getFullYear()) * 12 +
    (current.getMonth() - release.getMonth());
  return Math.max(1, months);
};

/**
 * Map city/country to region for geo-weighting
 */
export const getCityRegion = (cityObj) => {
  if (!cityObj) return "ROW";
  
  const cityStr = typeof cityObj === 'string' ? cityObj : cityObj.city;
  const countryCode = typeof cityObj === 'object' ? cityObj.country : null;
  
  if (!cityStr) return "ROW";
  
  const cityLower = cityStr.toLowerCase();
  
  // Use country code first if available (more reliable)
  if (countryCode) {
    const code = countryCode.toUpperCase();
    
    if (['US', 'CA', 'GB', 'UK', 'AU'].includes(code)) {
      return "US_CA_UK_AU";
    }
    
    if (['DE', 'FR', 'ES', 'IT', 'NL', 'BE', 'AT', 'PT', 'IE', 'SE', 'DK', 'FI', 'NO', 'CH'].includes(code)) {
      return "EU_WEST";
    }
    
    if (['MX', 'BR', 'AR', 'CO', 'CL', 'PE', 'VE', 'EC', 'GT', 'CU', 'BO', 'DO', 'HN', 'PY', 'NI', 'SV', 'CR', 'PA', 'UY', 'NG', 'ZA'].includes(code)) {
      return "LATAM";
    }
    
    if (['IN', 'CN', 'JP', 'KR', 'TH', 'VN', 'PH', 'ID', 'MY', 'SG', 'TW', 'HK', 'PK', 'BD'].includes(code)) {
      return "ASIA";
    }
  }
  
  // Fallback to city name matching
  if (
    cityLower.includes("london") ||
    cityLower.includes("new york") ||
    cityLower.includes("los angeles") ||
    cityLower.includes("toronto") ||
    cityLower.includes("sydney") ||
    cityLower.includes("melbourne") ||
    cityLower.includes("chicago") ||
    cityLower.includes("miami")
  ) {
    return "US_CA_UK_AU";
  }
  
  if (
    cityLower.includes("amsterdam") ||
    cityLower.includes("berlin") ||
    cityLower.includes("paris") ||
    cityLower.includes("madrid") ||
    cityLower.includes("barcelona") ||
    cityLower.includes("oslo") ||
    cityLower.includes("stockholm")
  ) {
    return "EU_WEST";
  }
  
  if (
    cityLower.includes("são paulo") ||
    cityLower.includes("sao paulo") ||
    cityLower.includes("mexico city") ||
    cityLower.includes("buenos aires") ||
    cityLower.includes("santiago") ||
    cityLower.includes("lima") ||
    cityLower.includes("bogota") ||
    cityLower.includes("curitiba") ||
    cityLower.includes("lagos")
  ) {
    return "LATAM";
  }
  
  if (
    cityLower.includes("mumbai") ||
    cityLower.includes("delhi") ||
    cityLower.includes("tokyo") ||
    cityLower.includes("seoul") ||
    cityLower.includes("bangkok") ||
    cityLower.includes("manila") ||
    cityLower.includes("jakarta")
  ) {
    return "ASIA";
  }
  
  return "ROW";
};

/**
 * Calculate geo-weighted effective Spotify rate
 */
export const calculateGeoWeightedRate = (topCities) => {
  if (!topCities || topCities.length === 0) {
    return {
      rate: DEFAULT_SPOTIFY_RATE,
      method: "DEFAULT",
    };
  }

  const totalListeners = topCities.reduce((sum, city) => {
    return sum + (city.numberOfListeners || 0);
  }, 0);

  if (totalListeners === 0) {
    return {
      rate: DEFAULT_SPOTIFY_RATE,
      method: "DEFAULT",
    };
  }

  const regionWeights = {};
  topCities.forEach((city) => {
    const region = getCityRegion(city);
    const listeners = city.numberOfListeners || 0;
    regionWeights[region] = (regionWeights[region] || 0) + listeners;
  });

  const regionShares = {};
  Object.keys(regionWeights).forEach((region) => {
    regionShares[region] = regionWeights[region] / totalListeners;
  });

  let effectiveRate = 0;
  Object.keys(regionShares).forEach((region) => {
    effectiveRate += regionShares[region] * (RATE_BY_REGION[region] || DEFAULT_SPOTIFY_RATE);
  });

  return {
    rate: effectiveRate,
    method: "WEIGHTED",
    breakdown: regionShares,
  };
};

/**
 * Calculate lifetime streams from artist data
 */
export const getLifetimeStreams = (artistData) => {
  if (!artistData) return 0;

  if (artistData.platform === "apify" && artistData.stats?.totalStreams) {
    return parseStreamCount(artistData.stats.totalStreams);
  }

  if (artistData.topTracks && artistData.topTracks.length > 0) {
    let totalFromTracks = 0;
    artistData.topTracks.forEach((track) => {
      if (track.streamCount) {
        totalFromTracks += parseInt(track.streamCount);
      } else if (track.streamCountFormatted) {
        totalFromTracks += parseStreamCount(track.streamCountFormatted);
      }
    });
    if (totalFromTracks > 0) return totalFromTracks;
  }

  if (artistData.monthlyListeners) {
    const listenersNum = parseFloat(
      String(artistData.monthlyListeners).replace(/[^0-9.]/g, ""),
    );
    return listenersNum * 15 * 12;
  }

  return 0;
};

/**
 * Get average release date from top tracks
 */
export const getAverageReleaseDate = (artistData) => {
  if (!artistData?.topTracks || artistData.topTracks.length === 0) {
    return "2022-01-01";
  }

  const releaseDates = artistData.topTracks
    .filter((track) => track.releaseDate)
    .map((track) => new Date(track.releaseDate).getTime());

  if (releaseDates.length === 0) {
    return "2022-01-01";
  }

  const avgTimestamp =
    releaseDates.reduce((a, b) => a + b, 0) / releaseDates.length;
  const avgDate = new Date(avgTimestamp);
  return avgDate.toISOString().split("T")[0];
};

/**
 * Calculate monthly streams estimate with priority logic
 */
// export const calculateMonthlyStreams = (artistData, lifetimeStreams, monthsLive) => {
//   let monthlyStreamsEst = 0;
//   let methodUsed = "";

//   // Priority 1: Recent 30 days
//   if (artistData.streams_last_30_days) {
//     monthlyStreamsEst = artistData.streams_last_30_days;
//     methodUsed = "RECENT_30D";
//   }
//   // Priority 2: Recent 28 days (normalized to 30)
//   else if (artistData.streams_last_28_days) {
//     monthlyStreamsEst = Math.round(artistData.streams_last_28_days * (30 / 28));
//     methodUsed = "RECENT_28D_NORMALIZED";
//   }
//   // Priority 3: Lifetime with decay
//   else {
//     const avgMonthly = monthsLive > 0 ? lifetimeStreams / monthsLive : 0;
//     const decayFactor = getDecayFactor(monthsLive);
//     monthlyStreamsEst = Math.round(avgMonthly * decayFactor);
//     methodUsed = "LIFETIME_RUNRATE_ADJ";
//   }

//   return { monthlyStreamsEst, methodUsed };
// };

/**
 * Calculate all valuations
 */


// export const calculateValuations = (


//   artistData,
//   lifetimeStreams,
//   releaseDate,
//   topCities
// ) => {
//   const currentDate = new Date();
//   const monthsLive = getMonthsBetween(releaseDate, currentDate);

//   const { monthlyStreamsEst, methodUsed } = calculateMonthlyStreams(
//     artistData,
//     lifetimeStreams,
//     monthsLive
//   );

//   const geoRateData = calculateGeoWeightedRate(topCities);
//   const effectiveSpotifyRate = geoRateData.rate;

//   const monthlySpotifyRevenue = monthlyStreamsEst * effectiveSpotifyRate;
//   const ltmSpotifyRevenue = monthlySpotifyRevenue * 12;

//   const conservativeValuation = ltmSpotifyRevenue * VALUATION_MULTIPLES.CONSERVATIVE;
//   const marketValuation = ltmSpotifyRevenue * VALUATION_MULTIPLES.MARKET;
//   const premiumValuation = ltmSpotifyRevenue * VALUATION_MULTIPLES.PREMIUM;

//   return {
//     monthsLive,
//     monthlyStreamsEst,
//     methodUsed,
//     effectiveSpotifyRate,
//     geoRateData,
//     monthlySpotifyRevenue,
//     ltmSpotifyRevenue,
//     conservativeValuation,
//     marketValuation,
//     premiumValuation,
//   };
// };



export const calculateMonthlyStreamsAndRevenue = (
  artistData,
  lifetimeStreams,
  monthsLive,
  effectiveSpotifyRate
) => {
  let monthlyStreamsEst = 0;
  let monthlyRevenue = 0;
  let methodUsed = "";
  let featuredTrackCount = 0;
  let totalTrackCount = 0;

  // Priority 1: Recent 30 days
  if (artistData.streams_last_30_days) {
    monthlyStreamsEst = artistData.streams_last_30_days;
    monthlyRevenue = monthlyStreamsEst * effectiveSpotifyRate;
    methodUsed = "RECENT_30D";
  }
  // Priority 2: Recent 28 days (normalized to 30)
  else if (artistData.streams_last_28_days) {
    monthlyStreamsEst = Math.round(artistData.streams_last_28_days * (30 / 28));
    monthlyRevenue = monthlyStreamsEst * effectiveSpotifyRate;
    methodUsed = "RECENT_28D_NORMALIZED";
  }
  // Priority 3: Top tracks with featured logic
  else if (artistData.topTracks && artistData.topTracks.length > 0) {
    const topTracks = artistData.topTracks.slice(0, 10); // Only use top 10
    totalTrackCount = topTracks.length;
    
    let totalMonthlyStreams = 0;
    let totalMonthlyRevenue = 0;

    topTracks.forEach((track) => {
      let trackStreams = 0;
      
      // Parse stream count
      if (track.streamCount) {
        trackStreams = parseInt(track.streamCount);
      } else if (track.streamCountFormatted) {
        trackStreams = parseStreamCount(track.streamCountFormatted);
      }

      if (trackStreams > 0) {
        // Estimate monthly streams (assuming track is evenly distributed over time)
        const trackMonthlyStreams = monthsLive > 0 
          ? (trackStreams / monthsLive) * getDecayFactor(monthsLive)
          : trackStreams * 0.1; // 10% monthly if no release date

        // Apply featured track logic
        const multiplier = getRevenueMultiplier(track, artistData.name);
        if (multiplier === 0.25) {
          featuredTrackCount++;
        }

        const trackRevenue = calculateTrackRevenue(
          trackMonthlyStreams,
          effectiveSpotifyRate,
          multiplier
        );

        totalMonthlyStreams += trackMonthlyStreams;
        totalMonthlyRevenue += trackRevenue;
      }
    });

    monthlyStreamsEst = Math.round(totalMonthlyStreams);
    monthlyRevenue = totalMonthlyRevenue;
    methodUsed = "TOP_TRACKS_FEATURED_ADJ";
  }
  // Priority 4: Lifetime with decay (fallback)
  else {
    const avgMonthly = monthsLive > 0 ? lifetimeStreams / monthsLive : 0;
    const decayFactor = getDecayFactor(monthsLive);
    monthlyStreamsEst = Math.round(avgMonthly * decayFactor);
    monthlyRevenue = monthlyStreamsEst * effectiveSpotifyRate;
    methodUsed = "LIFETIME_RUNRATE_ADJ";
  }

  return {
    monthlyStreamsEst,
    monthlyRevenue,
    methodUsed,
    featuredTrackCount,
    totalTrackCount,
  };
};

// Update calculateValuations to use the new function:

export const calculateValuations = (
  artistData,
  lifetimeStreams,
  releaseDate,
  topCities
) => {
  const currentDate = new Date();
  const monthsLive = getMonthsBetween(releaseDate, currentDate);

  const geoRateData = calculateGeoWeightedRate(topCities);
  const effectiveSpotifyRate = geoRateData.rate;

  const {
    monthlyStreamsEst,
    monthlyRevenue,
    methodUsed,
    featuredTrackCount,
    totalTrackCount,
  } = calculateMonthlyStreamsAndRevenue(
    artistData,
    lifetimeStreams,
    monthsLive,
    effectiveSpotifyRate
  );

  const ltmSpotifyRevenue = monthlyRevenue * 12;

  const conservativeValuation = ltmSpotifyRevenue * VALUATION_MULTIPLES.CONSERVATIVE;
  const marketValuation = ltmSpotifyRevenue * VALUATION_MULTIPLES.MARKET;
  const premiumValuation = ltmSpotifyRevenue * VALUATION_MULTIPLES.PREMIUM;

  return {
    monthsLive,
    monthlyStreamsEst,
    monthlyRevenue,
    methodUsed,
    effectiveSpotifyRate,
    geoRateData,
    ltmSpotifyRevenue,
    conservativeValuation,
    marketValuation,
    premiumValuation,
    featuredTrackCount,
    totalTrackCount,
  };
};