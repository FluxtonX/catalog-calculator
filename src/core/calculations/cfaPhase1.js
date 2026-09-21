import { 
  CFA_RATES, 
  CFA_MATURITY, 
  CFA_MULTIPLIERS,
  CFA_GEO_CONFIDENCE,
  CFA_ATTRIBUTION
} from './constants';
import { getCityRegion } from './spotify';
import { isFeaturedTrack } from './featuredTrackUtils';
export const parseNumber = (str) => {
  if (!str) return 0;
  if (typeof str === 'number') return str;
  const upper = String(str).toUpperCase();
  if (upper.includes("B")) return parseFloat(upper) * 1e9;
  if (upper.includes("M")) return parseFloat(upper) * 1e6;
  if (upper.includes("K")) return parseFloat(upper) * 1e3;
  return parseFloat(upper.replace(/,/g, "")) || 0;
};
const getMonthsBetween = (releaseDate, currentDate) => {
  if (!releaseDate) return 0;
  const release = new Date(releaseDate);
  const current = new Date(currentDate);
  const months =
    (current.getFullYear() - release.getFullYear()) * 12 +
    (current.getMonth() - release.getMonth());
  return Math.max(1, months);
};

export const getMaturityFactor = (monthsLive) => {
  if (monthsLive <= 3) return CFA_MATURITY.FRESH;
  if (monthsLive <= 12) return CFA_MATURITY.RECENT;
  if (monthsLive <= 36) return CFA_MATURITY.MATURE;
  return CFA_MATURITY.LEGACY;
};

export const resolveTrackGeoRate = (track, artistData, platform) => {
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

export const calculateTrackMonthlyStreams = (track, currentDate) => {
  const releaseDate = track.releaseDate || (track.releaseYear ? `${track.releaseYear}-01-01` : null);
  const monthsLive = releaseDate ? getMonthsBetween(releaseDate, currentDate) : 24; // fallback 2 years
  const ageInYears = monthsLive / 12;
  const maturityFactor = getMaturityFactor(monthsLive);
  const lifetimeStreams = parseNumber(track.streamCount || track.streamCountFormatted || track.streams || track.playCount || track.playcount || track.viewCount) || 0;

  // FIRST: Actual Last 30-Day Streams
  if (track.streams_last_30_days || track.last30Days) {
    const last30 = parseNumber(track.streams_last_30_days || track.last30Days);
    if (last30 > 0) {
      return { est: last30, method: "RECENT_30D", maturityFactor: null, ageInYears, monthsLive, lifetimeStreams };
    }
  }

  // SECOND: Actual Last 28-Day Streams
  if (track.streams_last_28_days || track.last28Days) {
    const last28 = parseNumber(track.streams_last_28_days || track.last28Days);
    if (last28 > 0) {
      return { est: Math.round(last28 * (30 / 28)), method: "RECENT_28D_NORMALIZED", maturityFactor: null, ageInYears, monthsLive, lifetimeStreams };
    }
  }

  // THIRD: Lifetime Streams adjusted by track age and maturity factor
  if (!lifetimeStreams) return { est: 0, method: "NONE", maturityFactor: null, ageInYears: 0, monthsLive: 0, lifetimeStreams: 0 };

  const avgMonthly = lifetimeStreams / monthsLive;
  const estMonthly = Math.round(avgMonthly * maturityFactor);

  return {
    est: estMonthly,
    method: "LIFETIME_RUNRATE_ADJ",
    maturityFactor,
    ageInYears,
    monthsLive,
    lifetimeStreams
  };
};

export const calculateCfaPhase1 = (artistData, platform) => {
  const currentDate = new Date();
  const rawTracks = artistData.topTracks || artistData.videos || [];
  let topTracks = rawTracks.slice(0, 10);
  
  let totalAnnualRevenue = 0;
  let totalTrackAge = 0;
  let tracksWithAge = 0;
  
  const trackDetails = [];
  
  let highConfidenceCount = 0;
  let medConfidenceCount = 0;

  topTracks.forEach((track) => {
    // Stream calculation
    const streamInfo = calculateTrackMonthlyStreams(track, currentDate);
    if (streamInfo.est === 0) return;

    if (streamInfo.ageInYears > 0) {
      totalTrackAge += streamInfo.ageInYears;
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
      ageInYears: streamInfo.ageInYears
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
      
      const releaseDate = track.releaseDate || (track.releaseYear ? `${track.releaseYear}-01-01` : null);
      const monthsLive = releaseDate ? getMonthsBetween(releaseDate, currentDate) : 24;
      const ageInYears = monthsLive / 12;

      trackDetails.push({
        title: track.title || track.name,
        artistRole: "PRIMARY",
        attributionFactor: CFA_ATTRIBUTION.PRIMARY,
        lifetimeStreams: 0,
        estimatedMonthlyStreams: 0,
        runRateMethod: "FALLBACK_DISTRIBUTION",
        maturityFactor: getMaturityFactor(monthsLive),
        geoMethod: "PLATFORM_DEFAULT",
        geoConfidence: "LOW",
        effectiveRate: CFA_RATES[platform]?.ROW || 0.003,
        estTrackMonthlyRev,
        artistAttributedMonthlyRev: estTrackMonthlyRev,
        artistAttributedAnnualRev: estTrackAnnualRev,
        ageInYears
      });
      totalTrackAge += ageInYears;
      tracksWithAge++;
    });
  }

  const averageDollarAge = tracksWithAge > 0 ? totalTrackAge / tracksWithAge : 0;
  if (highConfidenceCount > topTracks.length / 2) cfaConfidence = "HIGH";
  else if (medConfidenceCount > topTracks.length / 2) cfaConfidence = "MEDIUM";

  const lowEstimate = totalAnnualRevenue * CFA_MULTIPLIERS.LOW;
  const midEstimate = totalAnnualRevenue * CFA_MULTIPLIERS.MID;
  const highEstimate = totalAnnualRevenue * CFA_MULTIPLIERS.HIGH;
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
