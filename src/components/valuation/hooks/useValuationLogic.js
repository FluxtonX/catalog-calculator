// All calculation logic extracted — zero changes to original logic
import { useMemo } from "react";

export const RATE_BY_REGION = {
  US_CA_UK_AU: 0.0042,
  EU_WEST: 0.0036,
  LATAM: 0.0018,
  ASIA: 0.0022,
  ROW: 0.0016,
};
export const DEFAULT_SPOTIFY_RATE = 0.0035;

export const getDecayFactor = (monthsLive) => {
  if (monthsLive <= 3) return 1.0;
  if (monthsLive <= 12) return 0.85;
  if (monthsLive <= 36) return 0.65;
  return 0.5;
};

export const getMonthsBetween = (releaseDate, currentDate) => {
  const release = new Date(releaseDate);
  const current = new Date(currentDate);
  const months =
    (current.getFullYear() - release.getFullYear()) * 12 +
    (current.getMonth() - release.getMonth());
  return Math.max(1, months);
};

export const getCityRegion = (cityObj) => {
  if (!cityObj) return "ROW";
  const cityStr = typeof cityObj === "string" ? cityObj : cityObj.city;
  const countryCode = typeof cityObj === "object" ? cityObj.country : null;
  if (!cityStr) return "ROW";
  const cityLower = cityStr.toLowerCase();
  if (countryCode) {
    const code = countryCode.toUpperCase();
    if (["US","CA","GB","UK","AU"].includes(code)) return "US_CA_UK_AU";
    if (["DE","FR","ES","IT","NL","BE","AT","PT","IE","SE","DK","FI","NO","CH"].includes(code)) return "EU_WEST";
    if (["MX","BR","AR","CO","CL","PE","VE","EC","GT","CU","BO","DO","HN","PY","NI","SV","CR","PA","UY","NG","ZA"].includes(code)) return "LATAM";
    if (["IN","CN","JP","KR","TH","VN","PH","ID","MY","SG","TW","HK","PK","BD"].includes(code)) return "ASIA";
  }
  if (["london","new york","los angeles","toronto","sydney","melbourne","chicago","miami"].some(c => cityLower.includes(c))) return "US_CA_UK_AU";
  if (["amsterdam","berlin","paris","madrid","barcelona","oslo","stockholm"].some(c => cityLower.includes(c))) return "EU_WEST";
  if (["são paulo","sao paulo","mexico city","buenos aires","santiago","lima","bogota","curitiba","lagos"].some(c => cityLower.includes(c))) return "LATAM";
  if (["mumbai","delhi","tokyo","seoul","bangkok","manila","jakarta"].some(c => cityLower.includes(c))) return "ASIA";
  return "ROW";
};

export const calculateGeoWeightedRate = (topCities) => {
  if (!topCities || topCities.length === 0) return { rate: DEFAULT_SPOTIFY_RATE, method: "DEFAULT" };
  const totalListeners = topCities.reduce((sum, city) => sum + (city.numberOfListeners || 0), 0);
  if (totalListeners === 0) return { rate: DEFAULT_SPOTIFY_RATE, method: "DEFAULT" };
  const regionWeights = {};
  topCities.forEach((city) => {
    const region = getCityRegion(city);
    regionWeights[region] = (regionWeights[region] || 0) + (city.numberOfListeners || 0);
  });
  const regionShares = {};
  Object.keys(regionWeights).forEach((r) => { regionShares[r] = regionWeights[r] / totalListeners; });
  let effectiveRate = 0;
  Object.keys(regionShares).forEach((r) => { effectiveRate += regionShares[r] * (RATE_BY_REGION[r] || DEFAULT_SPOTIFY_RATE); });
  return { rate: effectiveRate, method: "WEIGHTED", breakdown: regionShares };
};

export const getLifetimeStreams = (artistData) => {
  if (!artistData) return 0;
  if (artistData.platform === "apify" && artistData.stats?.totalStreams) {
    const s = artistData.stats.totalStreams;
    if (s.includes("B")) return parseFloat(s) * 1e9;
    if (s.includes("M")) return parseFloat(s) * 1e6;
    if (s.includes("K")) return parseFloat(s) * 1e3;
    return parseFloat(s.replace(/,/g, ""));
  }
  if (artistData.topTracks?.length > 0) {
    let total = 0;
    artistData.topTracks.forEach((t) => {
      if (t.streamCount) { total += parseInt(t.streamCount); }
      else if (t.streamCountFormatted) {
        const c = t.streamCountFormatted;
        if (c.includes("B")) total += parseFloat(c) * 1e9;
        else if (c.includes("M")) total += parseFloat(c) * 1e6;
        else if (c.includes("K")) total += parseFloat(c) * 1e3;
      }
    });
    if (total > 0) return total;
  }
  if (artistData.monthlyListeners) {
    return parseFloat(String(artistData.monthlyListeners).replace(/[^0-9.]/g, "")) * 15 * 12;
  }
  return 0;
};

export const getAverageReleaseDate = (artistData) => {
  const dates = [];
  artistData?.albums?.forEach((a) => { if (a.releaseDate) { const t = new Date(a.releaseDate).getTime(); if (!isNaN(t)) dates.push(t); } });
  artistData?.topTracks?.forEach((t) => {
    let d = t.releaseDate || (t.releaseYear ? `${t.releaseYear}-01-01` : null);
    if (d) { const ts = new Date(d).getTime(); if (!isNaN(ts)) dates.push(ts); }
  });
  if (dates.length === 0) return "2022-01-01";
  return new Date(dates.reduce((s, t) => s + t, 0) / dates.length).toISOString().split("T")[0];
};

// Formatters
export const formatNumber = (num) => {
  if (!num || isNaN(num)) return "0";
  return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};
export const formatToMillions = (num) => (!num || isNaN(num)) ? "0.00M" : (num / 1e6).toFixed(2) + "M";
export const formatCurrency = (num) => {
  if (!num || isNaN(num)) return "$0";
  if (num >= 1e6) return "$" + formatToMillions(num);
  if (num >= 1000) return "$" + (num / 1000).toFixed(2) + "K";
  return "$" + num.toFixed(2);
};