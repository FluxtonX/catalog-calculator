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

// src/utils/calculations.js - ADD this new function

/**
 * Calculate Dollar Age (Weighted Average Age of Earnings)
 * Formula: Σ(Age of Track × LTM Earnings of Track) / Total LTM Earnings
 */
// In calculateDollarAge — replace the trackLTMEarnings calculation
// Instead of recalculating per-track revenue independently,
// distribute the KNOWN total LTM proportionally by stream count weight

export const calculateDollarAge = (artistData, effectiveSpotifyRate, currentDate, knownLTMRevenue = null) => {
  if (!artistData?.topTracks || artistData.topTracks.length === 0) {
    return { dollarAge: 0, totalWeightedAge: 0, totalLTMEarnings: 0, trackBreakdown: [] };
  }

  const topTracks = artistData.topTracks.slice(0, 10);
  
  // Calculate total streams for proportional distribution
  const totalStreams = topTracks.reduce((sum, track) => {
    let s = 0;
    if (track.streamCount)               s = parseInt(track.streamCount);
    else if (track.streamCountFormatted) s = parseStreamCount(track.streamCountFormatted);
    return sum + s;
  }, 0);

  let totalWeightedAge = 0;
  let totalLTMEarnings = 0;
  const trackBreakdown = [];

  topTracks.forEach((track) => {
    // Get release date
    let releaseDate = track.releaseDate;
    if (!releaseDate && track.releaseYear) releaseDate = `${track.releaseYear}-01-01`;
    if (!releaseDate) {
      const yearsAgo = 2 + (track.rank || 1) * 0.3;
      const fallback = new Date();
      fallback.setFullYear(fallback.getFullYear() - yearsAgo);
      releaseDate = fallback.toISOString().split("T")[0];
    }

    const ageInMonths = getMonthsBetween(releaseDate, currentDate);
    const ageInYears = ageInMonths / 12;

    // Get stream count
    let trackStreams = 0;
    if (track.streamCount)               trackStreams = parseInt(track.streamCount);
    else if (track.streamCountFormatted) trackStreams = parseStreamCount(track.streamCountFormatted);
    else if (track.streams)              trackStreams = parseInt(track.streams);
    else if (track.playCount)            trackStreams = parseInt(track.playCount);

    if (trackStreams === 0) return;

    // ✅ Distribute known LTM proportionally by stream share
    // This ensures Dollar Age LTM total === main valuation LTM
    let trackLTMEarnings;
    if (knownLTMRevenue && totalStreams > 0) {
      trackLTMEarnings = knownLTMRevenue * (trackStreams / totalStreams);
    } else {
      // Fallback to independent calculation only if no known LTM passed in
      const ageInMonthsForDecay = getMonthsBetween(releaseDate, currentDate);
      const trackMonthlyStreams = ageInMonthsForDecay > 0
        ? (trackStreams / ageInMonthsForDecay) * getDecayFactor(ageInMonthsForDecay)
        : trackStreams * 0.1;
      const multiplier = getRevenueMultiplier(track, artistData.name);
      trackLTMEarnings = calculateTrackRevenue(trackMonthlyStreams, effectiveSpotifyRate, multiplier) * 12;
    }

    const weightedAge = ageInYears * trackLTMEarnings;
    totalWeightedAge += weightedAge;
    totalLTMEarnings += trackLTMEarnings;

    trackBreakdown.push({
      name: track.title || track.name,
      ageInYears: parseFloat(ageInYears.toFixed(2)),
      ltmEarnings: trackLTMEarnings,
      weightedAge,
      releaseDate: track.releaseDate || track.releaseYear ? releaseDate : null,
    });
  });

  const dollarAge = totalLTMEarnings > 0 ? totalWeightedAge / totalLTMEarnings : 0;

  return {
    dollarAge: parseFloat(dollarAge.toFixed(2)),
    totalWeightedAge,
    totalLTMEarnings,
    trackBreakdown,
  };
};

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

  // Calculate ranges based on 15% variance to address client feedback about "solid" numbers
  const variance = 0.15;
  const minMonthlyStreams = Math.round(monthlyStreamsEst * (1 - variance));
  const maxMonthlyStreams = Math.round(monthlyStreamsEst * (1 + variance));
  const minMonthlyRevenue = monthlyRevenue * (1 - variance);
  const maxMonthlyRevenue = monthlyRevenue * (1 + variance);

  return {
    monthlyStreamsEst,
    minMonthlyStreams,
    maxMonthlyStreams,
    monthlyRevenue,
    minMonthlyRevenue,
    maxMonthlyRevenue,
    methodUsed,
    featuredTrackCount,
    totalTrackCount,
  };
};

// Update calculateValuations to use the new range data:
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
    minMonthlyStreams,
    maxMonthlyStreams,
    monthlyRevenue,
    minMonthlyRevenue,
    maxMonthlyRevenue,
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
  const minLtmRevenue = minMonthlyRevenue * 12;
  const maxLtmRevenue = maxMonthlyRevenue * 12;

  const conservativeValuation = ltmSpotifyRevenue * VALUATION_MULTIPLES.CONSERVATIVE;
  const minConservativeValuation = minLtmRevenue * VALUATION_MULTIPLES.CONSERVATIVE;
  const maxConservativeValuation = maxLtmRevenue * VALUATION_MULTIPLES.CONSERVATIVE;

  const marketValuation = ltmSpotifyRevenue * VALUATION_MULTIPLES.MARKET;
  const minMarketValuation = minLtmRevenue * VALUATION_MULTIPLES.MARKET;
  const maxMarketValuation = maxLtmRevenue * VALUATION_MULTIPLES.MARKET;

  const premiumValuation = ltmSpotifyRevenue * VALUATION_MULTIPLES.PREMIUM;
  const minPremiumValuation = minLtmRevenue * VALUATION_MULTIPLES.PREMIUM;
  const maxPremiumValuation = maxLtmRevenue * VALUATION_MULTIPLES.PREMIUM;

  return {
    monthsLive,
    monthlyStreamsEst,
    minMonthlyStreams,
    maxMonthlyStreams,
    monthlyRevenue,
    minMonthlyRevenue,
    maxMonthlyRevenue,
    methodUsed,
    effectiveSpotifyRate,
    geoRateData,
    ltmSpotifyRevenue,
    minLtmRevenue,
    maxLtmRevenue,
    conservativeValuation,
    minConservativeValuation,
    maxConservativeValuation,
    marketValuation,
    minMarketValuation,
    maxMarketValuation,
    premiumValuation,
    minPremiumValuation,
    maxPremiumValuation,
    featuredTrackCount,
    totalTrackCount,
  };
};

