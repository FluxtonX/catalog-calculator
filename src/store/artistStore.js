import { create } from 'zustand';

export const useArtistStore = create((set) => ({
  searchQuery: '',
  selectedArtist: null, // Legacy, kept for backwards compatibility or single view
  selectedArtists: {}, // Map of platform -> artist data
  platform: 'spotify', // Primary platform for theme
  platforms: ['spotify'], // Array of selected platforms
  
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedArtist: (artist) => set({ selectedArtist: artist }),
  setSelectedArtists: (artists) => set({ selectedArtists: artists }),
  setPlatform: (platform) => set({ platform }),
  setPlatforms: (platforms) => set({ platforms }),
  
  clearArtist: () => set({ selectedArtist: null, selectedArtists: {} }),
}));