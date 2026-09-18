// utils/artistStorage.js
// This utility helps persist artist data across page navigation

const STORAGE_KEY = 'lastSearchedArtist';

export const artistStorage = {
  // Save artist data to localStorage
  save: (artistData) => {
    try {
      if (artistData) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          data: artistData,
          timestamp: Date.now()
        }));
      }
    } catch (error) {
      console.error('Error saving artist data:', error);
    }
  },

  // Get artist data from localStorage
  get: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;

      const { data, timestamp } = JSON.parse(stored);
      
      // Check if data is less than 1 hour old
      const ONE_HOUR = 60 * 60 * 1000;
      if (Date.now() - timestamp > ONE_HOUR) {
        artistStorage.clear();
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error getting artist data:', error);
      return null;
    }
  },

  // Clear stored artist data
  clear: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing artist data:', error);
    }
  },

  // Check if we have stored data
  hasData: () => {
    return artistStorage.get() !== null;
  }
};
