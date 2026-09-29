// GENERATED FILE - 100% PARITY WITH WEB APP


const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// --- constants.js ---
// src/utils/constants.js


const RATE_BY_REGION = {
  US_CA_UK_AU: 0.0042,
  EU_WEST: 0.0036,
  LATAM: 0.0018,
  ASIA: 0.0022,
  ROW: 0.0016,
};

const DEFAULT_SPOTIFY_RATE = 0.0035;
const APPLE_MUSIC_RATE = 0.01;

const SUGGESTED_ARTISTS = [
  "Taylor Swift",
  "Drake",
  "The Weeknd",
  "Bad Bunny",
  "Ariana Grande",
];

const DECAY_FACTORS = {
  FRESH: { maxMonths: 3, factor: 1.0 },
  RECENT: { maxMonths: 12, factor: 0.85 },
  MATURE: { maxMonths: 36, factor: 0.65 },
  LEGACY: { maxMonths: Infinity, factor: 0.5 },
};

const VALUATION_MULTIPLES = {
  CONSERVATIVE: 6,
  MARKET: 8,
  PREMIUM: 10,
};

// --- CFA PHASE 1 CONSTANTS ---

const CFA_RATES = {
  spotify: {
    US_CA_UK_AU: 0.0042,
    EU_WEST: 0.0036,
    LATAM: 0.0018,
    ASIA: 0.0022,
    ROW: 0.0016,
  },
  itunes: {
    US_CA_UK_AU: 0.0120,
    EU_WEST: 0.0090,
    LATAM: 0.0050,
    ASIA: 0.0060,
    ROW: 0.0050,
  },
  youtube: {
    US_CA_UK_AU: 0.0025,
    EU_WEST: 0.0020,
    LATAM: 0.0008,
    ASIA: 0.0010,
    ROW: 0.0008,
  }
};

const CFA_MATURITY = {
  FRESH: 1.00,
  RECENT: 0.85,
  MATURE: 0.65,
  LEGACY: 0.50,
};

const CFA_MULTIPLIERS = {
  LOW: 6,
  MID: 8,
  HIGH: 10,
  ACCELERATOR: 1.30, // applied to high estimate
};

const CFA_GEO_CONFIDENCE = {
  ACTUAL_TRACK_GEO: "ACTUAL_TRACK_GEO",
  ARTIST_SAME_PLATFORM_INFERENCE: "ARTIST_SAME_PLATFORM_INFERENCE",
  ARTIST_CROSS_PLATFORM_INFERENCE: "ARTIST_CROSS_PLATFORM_INFERENCE",
  CFA_COMPARABLE_CATALOG_MODEL: "CFA_COMPARABLE_CATALOG_MODEL",
  PLATFORM_DEFAULT: "PLATFORM_DEFAULT",
};

const CFA_ATTRIBUTION = {
  PRIMARY: 1.00,
  FEATURED: 0.25,
};


// --- featuredTrackUtils.js ---
// src/utils/featuredTrackUtils.js

/**
 * Detect if a track is a featured track (artist is not primary)
 * Returns true if track contains "feat." or "featuring" and artist is featured
 */
const isFeaturedTrack = (track, primaryArtistName) => {
  if (!track || !track.title) return false;
  
  const title = track.title.toLowerCase();
  const hasFeatIndicator = 
    title.includes('feat.') || 
    title.includes('featuring') ||
    title.includes('ft.') ||
    title.includes('with ');
  
  if (!hasFeatIndicator) return false;
  
  // Check if primary artist name appears before the feat indicator
  const artistName = primaryArtistName.toLowerCase();
  const featIndex = Math.min(
    title.indexOf('feat.') !== -1 ? title.indexOf('feat.') : Infinity,
    title.indexOf('featuring') !== -1 ? title.indexOf('featuring') : Infinity,
    title.indexOf('ft.') !== -1 ? title.indexOf('ft.') : Infinity,
    title.indexOf('with ') !== -1 ? title.indexOf('with ') : Infinity
  );
  
  // If artist name doesn't appear before feat indicator, they're featured
  const artistBeforeFeat = title.substring(0, featIndex).includes(artistName);
  
  return !artistBeforeFeat;
};

/**
 * Calculate revenue multiplier for a track
 * Featured tracks: 0.25 (25%)
 * Primary tracks: 1.0 (100%)
 */
const getRevenueMultiplier = (track, primaryArtistName) => {
  return isFeaturedTrack(track, primaryArtistName) ? 0.25 : 1.0;
};

/**
 * Calculate track-level revenue with featured track logic
 */
const calculateTrackRevenue = (streamCount, payoutRate, multiplier) => {
  return streamCount * payoutRate * multiplier;
};


// --- spotify.js ---
// src/utils/calculations.js




/**
 * Get decay factor based on months since release
 */
const getDecayFactor = (monthsLive) => {
  if (monthsLive <= DECAY_FACTORS.FRESH.maxMonths) return DECAY_FACTORS.FRESH.factor;
  if (monthsLive <= DECAY_FACTORS.RECENT.maxMonths) return DECAY_FACTORS.RECENT.factor;
  if (monthsLive <= DECAY_FACTORS.MATURE.maxMonths) return DECAY_FACTORS.MATURE.factor;
  return DECAY_FACTORS.LEGACY.factor;
};

/**
 * Calculate months between two dates
 */
// removed;

/**
 * Map city/country to region for geo-weighting
 */
const getCityRegion = (cityObj) => {
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
const calculateGeoWeightedRate = (topCities) => {
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
const getLifetimeStreams = (artistData) => {
  if (!artistData) return 0;

  if (artistData.stats?.totalStreams) {
    return parseStreamCount(artistData.stats.totalStreams);
  }

  if (artistData.topTracks && artistData.topTracks.length > 0) {
    let totalFromTracks = 0;
    artistData.topTracks.forEach((track) => {
      let trackStreams = 0;
      if (track.streamCount) {
        trackStreams = parseInt(String(track.streamCount).replace(/,/g, "")) || 0;
      } else if (track.streamCountFormatted) {
        trackStreams = parseStreamCount(track.streamCountFormatted);
      } else if (track.streams) {
        trackStreams = parseInt(String(track.streams).replace(/,/g, "")) || 0;
      } else if (track.playCount) {
        trackStreams = parseInt(String(track.playCount).replace(/,/g, "")) || 0;
      }
      totalFromTracks += trackStreams;
    });
    if (totalFromTracks > 0) return totalFromTracks;
  }

  if (artistData.monthlyListeners) {
    const listenersNum = parseFloat(
      String(artistData.monthlyListeners).replace(/[^0-9.]/g, ""),
    ) || 0;
    return listenersNum * 15 * 12;
  }

  return 0;
};

/**
 * Get average release date from top tracks and albums
 */
const getAverageReleaseDate = (artistData) => {
  const dates = [];
  
  if (artistData?.albums) {
    artistData.albums.forEach((a) => {
      if (a.releaseDate) {
        const t = new Date(a.releaseDate).getTime();
        if (!isNaN(t)) dates.push(t);
      }
    });
  }
  
  if (artistData?.topTracks) {
    artistData.topTracks.forEach((t) => {
      let d = t.releaseDate || (t.releaseYear ? `${t.releaseYear}-01-01` : null);
      if (d) {
        const ts = new Date(d).getTime();
        if (!isNaN(ts)) dates.push(ts);
      }
    });
  }

  if (dates.length === 0) {
    return "2022-01-01";
  }

  const avgTimestamp = dates.reduce((a, b) => a + b, 0) / dates.length;
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

const calculateDollarAge = (artistData, effectiveSpotifyRate, currentDate, knownLTMRevenue = null) => {
  if (!artistData?.topTracks || artistData.topTracks.length === 0) {
    return { dollarAge: 0, trackBreakdown: [] };
  }

  const topTracks = artistData.topTracks.slice(0, 10);
  
  let totalAge = 0;
  let validTracks = 0;
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

    totalAge += ageInYears;
    validTracks++;

    trackBreakdown.push({
      name: track.title || track.name,
      ageInYears: parseFloat(ageInYears.toFixed(2)),
      releaseDate: track.releaseDate || track.releaseYear ? releaseDate : null,
    });
  });

  const averageCatalogAge = validTracks > 0 ? totalAge / validTracks : 0;

  return {
    dollarAge: parseFloat(averageCatalogAge.toFixed(2)), // Kept name 'dollarAge' for compatibility
    trackBreakdown,
  };
};

const calculateMonthlyStreamsAndRevenue = (
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
    monthlyStreamsEst = parseFloat(String(artistData.streams_last_30_days).replace(/,/g, "")) || 0;
    monthlyRevenue = monthlyStreamsEst * effectiveSpotifyRate;
    methodUsed = "RECENT_30D";
  }
  // Priority 2: Recent 28 days (normalized to 30)
  else if (artistData.streams_last_28_days) {
    const last28 = parseFloat(String(artistData.streams_last_28_days).replace(/,/g, "")) || 0;
    monthlyStreamsEst = Math.round(last28 * (30 / 28));
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

       console.log("TRACK FIELDS:", JSON.stringify(track, null, 2));
      let trackStreams = 0;
      
      // Parse stream count
      if (track.streamCount) {
        trackStreams = parseInt(String(track.streamCount).replace(/,/g, "")) || 0;
      } else if (track.streamCountFormatted) {
        trackStreams = parseStreamCount(track.streamCountFormatted);
      } else if (track.streams) {
        trackStreams = parseInt(String(track.streams).replace(/,/g, "")) || 0;
      } else if (track.playCount) {
        trackStreams = parseInt(String(track.playCount).replace(/,/g, "")) || 0;
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

const calculateValuations = (
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



// --- cfaPhase1.js ---



// removed;
// removed;

const getMaturityFactor = (monthsLive) => {
  if (monthsLive <= 3) return CFA_MATURITY.FRESH;
  if (monthsLive <= 12) return CFA_MATURITY.RECENT;
  if (monthsLive <= 36) return CFA_MATURITY.MATURE;
  return CFA_MATURITY.LEGACY;
};

const resolveTrackGeoRate = (track, artistData, platform) => {
  const defaultRate = CFA_RATES[platform]?.ROW || 0.0016;
  const rates = CFA_RATES[platform];
  
  if (!rates) {
    return {
      rate: defaultRate,
      method: CFA_GEO_CONFIDENCE.PLATFORM_DEFAULT,
      confidence: "LOW"
    };
  }

  // Level 1 & 2: We use artist level top cities since specific track level geo is rarely provided
  if (artistData.topCities && artistData.topCities.length > 0) {
    let totalListeners = 0;
    const regionWeights = {};
    
    artistData.topCities.forEach((city) => {
      const region = getCityRegion(city);
      const listeners = city.numberOfListeners || 0;
      regionWeights[region] = (regionWeights[region] || 0) + listeners;
      totalListeners += listeners;
    });

    if (totalListeners > 0) {
      let effectiveRate = 0;
      Object.keys(regionWeights).forEach((region) => {
        const share = regionWeights[region] / totalListeners;
        effectiveRate += share * (rates[region] || rates.ROW);
      });

      return {
        rate: effectiveRate,
        method: CFA_GEO_CONFIDENCE.ARTIST_SAME_PLATFORM_INFERENCE,
        confidence: "MEDIUM"
      };
    }
  }

  // Level 5: Platform global fallback
  return {
    rate: defaultRate,
    method: CFA_GEO_CONFIDENCE.PLATFORM_DEFAULT,
    confidence: "LOW"
  };
};

const calculateTrackMonthlyStreams = (track, currentDate) => {
  const releaseDate = track.releaseDate || (track.releaseYear ? `${track.releaseYear}-01-01` : null);
  const monthsLive = releaseDate ? getMonthsBetween(releaseDate, currentDate) : 24; // fallback 2 years
  const ageInYears = monthsLive / 12;
  const maturityFactor = getMaturityFactor(monthsLive);
  const lifetimeStreams = parseNumber(track.streamCount || track.streamCountFormatted || track.streams || track.playCount || track.playcount || track.viewCount) || 0;

  // FIRST: Actual Last 30-Day Streams
  if (track.streams_last_30_days || track.last30Days) {
    const last30 = parseNumber(track.streams_last_30_days || track.last30Days);
    if (last30 > 0) {
      return { est: last30, method: "RECENT_30D", maturityFactor: null, ageInYears, monthsLive, lifetimeStreams, releaseDate };
    }
  }

  // SECOND: Actual Last 28-Day Streams
  if (track.streams_last_28_days || track.last28Days) {
    const last28 = parseNumber(track.streams_last_28_days || track.last28Days);
    if (last28 > 0) {
      return { est: Math.round(last28 * (30 / 28)), method: "RECENT_28D_NORMALIZED", maturityFactor: null, ageInYears, monthsLive, lifetimeStreams, releaseDate };
    }
  }

  // THIRD: Lifetime Streams adjusted by track age and maturity factor
  if (!lifetimeStreams) return { est: 0, method: "NONE", maturityFactor: null, ageInYears, monthsLive, lifetimeStreams: 0, releaseDate };

  const avgMonthly = lifetimeStreams / monthsLive;
  const estMonthly = Math.round(avgMonthly * maturityFactor);

  return {
    est: estMonthly,
    method: "LIFETIME_RUNRATE_ADJ",
    maturityFactor,
    ageInYears,
    monthsLive,
    lifetimeStreams,
    releaseDate
  };
};

const calculateCfaPhase1 = (artistData, platform) => {
  const currentDate = new Date();
  
  const rawTracks = artistData.topTracks || artistData.videos || [];
  let topTracks = rawTracks.slice(0, 10);

  // Prepare all known valid releases for fallback assignment
  const allReleases = [
    ...(artistData.albums || []),
    ...(artistData.singles || []),
    ...(artistData.popularReleases || [])
  ].filter(r => r.releaseDate || r.releaseYear);

  let defaultAvgDate = null;
  if (allReleases.length > 0) {
    let totalTime = 0;
    allReleases.forEach(r => {
      const d = new Date(r.releaseDate || `${r.releaseYear}-01-01`);
      if (!isNaN(d.getTime())) totalTime += d.getTime();
    });
    if (totalTime > 0) {
      defaultAvgDate = new Date(totalTime / allReleases.length).toISOString().split('T')[0];
    }
  }
  
  let totalAnnualRevenue = 0;
  let totalTrackAge = 0;
  let tracksWithAge = 0;
  
  const trackDetails = [];
  
  let highConfidenceCount = 0;
  let medConfidenceCount = 0;

  topTracks.forEach((track, idx) => {
    // 1. Calculate streams strictly using the original default logic (24 months fallback) to preserve valuation exactly
    const streamInfo = calculateTrackMonthlyStreams(track, currentDate);
    if (streamInfo.est === 0) return;

    // 2. Calculate the UI fallback date strictly for the presentation layer (Age section)
    let trackFallbackDate = defaultAvgDate;

    if (allReleases.length > 0) {
      const exactMatch = allReleases.find(r => r.name.toLowerCase() === track.title.toLowerCase());
      const partialMatch = allReleases.find(r => track.title.toLowerCase().includes(r.name.toLowerCase()) || r.name.toLowerCase().includes(track.title.toLowerCase()));
      
      if (exactMatch && (exactMatch.releaseDate || exactMatch.releaseYear)) {
        trackFallbackDate = exactMatch.releaseDate || `${exactMatch.releaseYear}-01-01`;
      } else if (partialMatch && (partialMatch.releaseDate || partialMatch.releaseYear)) {
        trackFallbackDate = partialMatch.releaseDate || `${partialMatch.releaseYear}-01-01`;
      } else {
        const hash = track.title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const pickedRelease = allReleases[(hash + idx) % allReleases.length];
        trackFallbackDate = pickedRelease.releaseDate || `${pickedRelease.releaseYear}-01-01`;
      }
    }
    
    const explicitReleaseDate = track.releaseDate || (track.releaseYear ? `${track.releaseYear}-01-01` : null);
    const finalUiReleaseDate = explicitReleaseDate || trackFallbackDate;
    
    const uiMonthsLive = finalUiReleaseDate ? getMonthsBetween(finalUiReleaseDate, currentDate) : 24;
    const uiAgeInYears = uiMonthsLive / 12;

    if (uiAgeInYears > 0) {
      totalTrackAge += uiAgeInYears;
      tracksWithAge++;
    }

    // Geo Rate calculation
    const geoInfo = resolveTrackGeoRate(track, artistData, platform);
    
    // Revenue estimation
    const estTrackMonthlyRev = streamInfo.est * geoInfo.rate;
    
    // Attribution logic
    const artistRole = isFeaturedTrack(track, artistData.name) ? "FEATURED" : "PRIMARY";
    const attributionFactor = artistRole === "FEATURED" ? CFA_ATTRIBUTION.FEATURED : CFA_ATTRIBUTION.PRIMARY;
    
    const artistAttributedMonthlyRev = estTrackMonthlyRev * attributionFactor;
    const artistAttributedAnnualRev = artistAttributedMonthlyRev * 12;
    
    totalAnnualRevenue += artistAttributedAnnualRev;
    
    trackDetails.push({
      title: track.title || track.name,
      artistRole,
      attributionFactor,
      lifetimeStreams: streamInfo.lifetimeStreams,
      estimatedMonthlyStreams: streamInfo.est,
      runRateMethod: streamInfo.method,
      maturityFactor: streamInfo.maturityFactor,
      geoMethod: geoInfo.method,
      geoConfidence: geoInfo.confidence,
      effectiveRate: geoInfo.rate,
      estTrackMonthlyRev,
      artistAttributedMonthlyRev,
      artistAttributedAnnualRev,
      ageInYears: uiAgeInYears,
      releaseDate: finalUiReleaseDate
    });
    
    if (geoInfo.confidence === "HIGH") highConfidenceCount++;
    if (geoInfo.confidence === "MEDIUM") medConfidenceCount++;
  });
  let cfaConfidence = "LOW";

  // --- PLATFORM LEVEL FALLBACK ---
  // If no track-level revenue was found (either no topTracks or tracks have no stream counts), fallback to platform level stats
  if (totalAnnualRevenue === 0) {
    const totalViews = artistData.totalViews || artistData.stats?.totalViews || artistData.channel?.totalViews;
    const popularity = artistData.popularity || artistData.stats?.popularity || artistData.chartStats?.popularity;
    
    console.log(`[CFA Fallback] Platform: ${platform}, totalViews: ${totalViews}, popularity: ${popularity}`);
    
    if (platform === 'youtube' && totalViews) {
      // YouTube Fallback: estimate run-rate from lifetime views assuming 24 months average age
      const estMonthlyViews = parseNumber(totalViews) / 24;
      const rate = CFA_RATES.youtube?.ROW || 0.001;
      const estMonthlyRev = estMonthlyViews * rate;
      totalAnnualRevenue = estMonthlyRev * 12;
      cfaConfidence = "LOW";
    } else if ((platform === 'itunes' || platform === 'apple') && popularity) {
      // Apple Music Fallback: Use popularity score to estimate monthly streams
      const estMonthlyStreams = Math.round(Math.pow(parseNumber(popularity) / 100, 4) * 60000000);
      const rate = CFA_RATES.itunes?.ROW || 0.00675;
      const estMonthlyRev = estMonthlyStreams * rate;
      totalAnnualRevenue = estMonthlyRev * 12;
      cfaConfidence = "LOW";
    } else if (artistData.monthlyListeners) {
      // Generic Fallback using monthly listeners (approx 3.5 streams per listener)
      const estMonthlyStreams = parseNumber(artistData.monthlyListeners) * 3.5;
      const rate = CFA_RATES[platform]?.ROW || 0.003;
      totalAnnualRevenue = estMonthlyStreams * rate * 12;
      cfaConfidence = "LOW";
    }
  }
  // --------------------------------

  if (trackDetails.length === 0 && totalAnnualRevenue > 0) {
    if (topTracks.length === 0) {
      topTracks = Array.from({ length: 10 }).map((_, i) => ({ title: `Catalog Track ${i + 1}` }));
    }
    
    // Distribute platform fallback revenue across top tracks to populate Dollar Age Analysis
    const weights = [0.30, 0.20, 0.15, 0.10, 0.08, 0.05, 0.05, 0.03, 0.02, 0.02];
    
    topTracks.forEach((track, idx) => {
      const weight = weights[idx] || (0.1);
      const estTrackAnnualRev = totalAnnualRevenue * weight;
      const estTrackMonthlyRev = estTrackAnnualRev / 12;
      
      // Use the deterministically assigned fallback logic from above here as well
      let trackFallbackDate = defaultAvgDate;
      if (allReleases.length > 0) {
        const hash = track.title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const pickedRelease = allReleases[(hash + idx) % allReleases.length];
        trackFallbackDate = pickedRelease.releaseDate || `${pickedRelease.releaseYear}-01-01`;
      } else {
        // Procedurally generated realistic UI dates for synthetic tracks (e.g., YouTube fallback)
        // Spreads dates progressively from ~2 years up to ~11 years ago based on their rank
        const syntheticMonthsLive = 24 + (idx * 12);
        const d = new Date(currentDate.getTime());
        d.setMonth(d.getMonth() - syntheticMonthsLive);
        trackFallbackDate = d.toISOString().split('T')[0];
      }
      
      const explicitReleaseDate = track.releaseDate || (track.releaseYear ? `${track.releaseYear}-01-01` : null);
      const finalUiReleaseDate = explicitReleaseDate || trackFallbackDate;
      const uiMonthsLive = finalUiReleaseDate ? getMonthsBetween(finalUiReleaseDate, currentDate) : 24;
      const uiAgeInYears = uiMonthsLive / 12;

      trackDetails.push({
        title: track.title || track.name,
        artistRole: "PRIMARY",
        attributionFactor: CFA_ATTRIBUTION.PRIMARY,
        lifetimeStreams: 0,
        estimatedMonthlyStreams: 0,
        runRateMethod: "FALLBACK_DISTRIBUTION",
        maturityFactor: getMaturityFactor(24),
        geoMethod: "PLATFORM_DEFAULT",
        geoConfidence: "LOW",
        effectiveRate: CFA_RATES[platform]?.ROW || 0.003,
        estTrackMonthlyRev,
        artistAttributedMonthlyRev: estTrackMonthlyRev,
        artistAttributedAnnualRev: estTrackAnnualRev,
        ageInYears: uiAgeInYears,
        releaseDate: finalUiReleaseDate
      });
      totalTrackAge += uiAgeInYears;
      tracksWithAge++;
    });
  }

  const averageDollarAge = tracksWithAge > 0 ? totalTrackAge / tracksWithAge : 0;
  if (highConfidenceCount > topTracks.length / 2) cfaConfidence = "HIGH";
  else if (medConfidenceCount > topTracks.length / 2) cfaConfidence = "MEDIUM";

  const totalAlbums = artistData.albums?.length || artistData.stats?.totalAlbums || 0;
  const totalSingles = artistData.singles?.length || artistData.stats?.totalSingles || 0;
  const catalogBonus = Math.min(totalAlbums * 0.08 + totalSingles * 0.005, 0.5);
  const adjustedAnnualRevenue = totalAnnualRevenue * (1 + catalogBonus);

  const lowEstimate = adjustedAnnualRevenue * CFA_MULTIPLIERS.LOW;
  const midEstimate = adjustedAnnualRevenue * CFA_MULTIPLIERS.MID;
  const highEstimate = adjustedAnnualRevenue * CFA_MULTIPLIERS.HIGH;
  const acceleratorValue = highEstimate * CFA_MULTIPLIERS.ACCELERATOR;

  return {
    platform,
    tracksAnalyzed: trackDetails.length,
    averageDollarAge,
    totalAnnualRevenue,
    lowEstimate,
    midEstimate,
    highEstimate,
    acceleratorValue,
    cfaConfidence,
    trackDetails
  };
};


// --- combined.js ---



const getPlatformValuation = (artistData) => {
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

const getCombinedValuation = (selectedArtists) => {
  if (!selectedArtists || Object.keys(selectedArtists).length === 0) return 0;
  
  // Upgrade to use the new cross-pollination engine so platforms without stats (Apple Music) 
  // can mathematically borrow track streams from proxy platforms
  const cfa = getCombinedCfaValuations(selectedArtists);
  return cfa ? cfa.midEstimate : 0;
};

const getCombinedCfaValuations = (selectedArtists) => {
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

// removed;

const getCombinedMetrics = (selectedArtists) => {
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









