/**
 * Calculates the Weighted Average Catalog Age (Dollar Age).
 * Formula: Σ(Track Age in Years × Track LTM Earnings) / Total LTM Earnings
 * 
 * @param {Array} tracks - Array of track objects. Each must have `ageInYears` and an annual/monthly revenue.
 * @param {String} revenueKey - The key to use for track revenue (e.g., 'artistAttributedAnnualRev')
 * @returns {Number} The weighted average age in years.
 */
export const calculateWeightedCatalogAge = (tracks, revenueKey = 'artistAttributedAnnualRev') => {
  if (!tracks || tracks.length === 0) return 0;

  let totalWeightedAge = 0;
  let totalRevenue = 0;

  tracks.forEach(track => {
    const age = parseFloat(track.ageInYears) || 0;
    const revenue = parseFloat(track[revenueKey]) || 0;
    
    if (age > 0 && revenue > 0) {
      totalWeightedAge += (age * revenue);
      totalRevenue += revenue;
    }
  });

  if (totalRevenue === 0) {
    // Fallback: If no revenue data, do unweighted arithmetic mean
    const validTracks = tracks.filter(t => (parseFloat(t.ageInYears) || 0) > 0);
    if (validTracks.length === 0) return 0;
    const sumAge = validTracks.reduce((sum, t) => sum + (parseFloat(t.ageInYears) || 0), 0);
    return sumAge / validTracks.length;
  }

  return totalWeightedAge / totalRevenue;
};
