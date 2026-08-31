

export const estimateMonthlyStreams = (popularityScore) => {
  if (!popularityScore) return 0;
  return Math.round(Math.pow(popularityScore / 100, 2.5) * 6_000_000);
};

export const formatRange = (min, max, formatter) => {
  if (!min && !max) return formatter(0);
  return `${formatter(min)} - ${formatter(max)}`;
};
