// src/utils/featuredTrackUtils.js

/**
 * Detect if a track is a featured track (artist is not primary)
 * Returns true if track contains "feat." or "featuring" and artist is featured
 */
export const isFeaturedTrack = (track, primaryArtistName) => {
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
export const getRevenueMultiplier = (track, primaryArtistName) => {
  return isFeaturedTrack(track, primaryArtistName) ? 0.25 : 1.0;
};

/**
 * Calculate track-level revenue with featured track logic
 */
export const calculateTrackRevenue = (streamCount, payoutRate, multiplier) => {
  return streamCount * payoutRate * multiplier;
};