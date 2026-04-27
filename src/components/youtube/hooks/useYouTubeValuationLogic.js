// All YouTube calculation logic — zero changes to original logic

export const CONTENT_ID_MULTIPLIER = 1;

export const parseViewCount = (viewString) => {
  if (!viewString) return 0;
  if (typeof viewString === "number") return viewString;
  const str = String(viewString).toUpperCase();
  if (str.includes("B")) return parseFloat(str) * 1e9;
  if (str.includes("M")) return parseFloat(str) * 1e6;
  if (str.includes("K")) return parseFloat(str) * 1e3;
  return parseFloat(str.replace(/,/g, "")) || 0;
};

export const calculateYouTubeMetrics = ({
  totalViews,
  annualViewPercentage,
  monetizationRate,
  avgCpm,
  creatorCut,
  streamingRate,
}) => {
  const estimatedAnnualViews = totalViews * (annualViewPercentage / 100);
  const monetizedViews = estimatedAnnualViews * (monetizationRate / 100);
  const grossAdRevenue = (monetizedViews / 1000) * avgCpm;
  const adRevenue = grossAdRevenue * (creatorCut / 100);
  const estimatedTotalPlays = estimatedAnnualViews * CONTENT_ID_MULTIPLIER;
  const streamingRevenue = estimatedTotalPlays * streamingRate;
  const totalAnnualRevenue = adRevenue + streamingRevenue;

  const conservativeValuation = totalAnnualRevenue * 6;
  const marketValuation = totalAnnualRevenue * 8;
  const premiumValuation = totalAnnualRevenue * 10;

  const advanceCalculation = totalAnnualRevenue * 0.15;
  const caccAdjustedValuation = totalAnnualRevenue * 8 * 1.3;
// CORRECT — total equals the base advance calculation
const totalAdvancePackage = advanceCalculation;

  return {
    estimatedAnnualViews, monetizedViews, grossAdRevenue,
    adRevenue, estimatedTotalPlays, streamingRevenue,
    totalAnnualRevenue, conservativeValuation, marketValuation,
    premiumValuation, advanceCalculation, caccAdjustedValuation,
    totalAdvancePackage,
  };
};

export const formatNumber = (num) => {
  if (!num || isNaN(num)) return "0";
  return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export const formatCurrency = (num) => {
  if (!num || isNaN(num)) return "$0";
  if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`;
  if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
  return `$${num.toFixed(0)}`;
};