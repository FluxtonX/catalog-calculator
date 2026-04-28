export const APPLE_MUSIC_RATE = 0.008;

export const formatCurrency = (n) => {
  if (!n || isNaN(n)) return "$0";
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
};

export const formatNumber = (n) => {
  if (!n || isNaN(n)) return "0";
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return `${Math.round(n)}`;
};

export const estimateMonthlyStreams = (popularityScore) => {
  if (!popularityScore) return 0;
  return Math.round(Math.pow(popularityScore / 100, 2.5) * 10_000_000);
};

export const formatRange = (min, max, formatter) => {
  if (!min && !max) return formatter(0);
  return `${formatter(min)} - ${formatter(max)}`;
};
