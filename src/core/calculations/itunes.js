

export const estimateMonthlyStreams = (popularityScore) => {
  if (!popularityScore) return 0;
  // Use a steeper exponential curve so small artists remain realistic while superstars scale massively
  return Math.round(Math.pow(popularityScore / 100, 4) * 60_000_000);
};

export const formatRange = (min, max, formatter) => {
  if (!min && !max) return formatter(0);
  return `${formatter(min)} - ${formatter(max)}`;
};
