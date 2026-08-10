import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useArtistStore = create(
  persist(
    (set) => ({
      searchQuery: '',
      selectedArtist: null, // Legacy, kept for backwards compatibility or single view
      selectedArtists: {}, // Map of platform -> artist data
      platform: 'spotify', // Primary platform for theme
      platforms: ['spotify', 'itunes', 'youtube'], // Active platforms
      importedData: null,
      selectedDistributor: null,
      
      setSearchQuery: (query) => set({ searchQuery: query }),
      setSelectedArtist: (artist) => set({ selectedArtist: artist }),
      setSelectedArtists: (artists) => set({ selectedArtists: artists }),
      setPlatform: (platform) => set({ platform }),
      setPlatforms: (platforms) => set({ platforms }),
      setImportedData: (data) => set({ importedData: data }),
      setSelectedDistributor: (dist) => set({ selectedDistributor: dist }),
      
      clearArtist: () => set({ selectedArtist: null, selectedArtists: {}, importedData: null }),
    }),
    {
      name: 'artist-store', // unique name for localStorage key
      partialize: (state) => ({ 
        searchQuery: state.searchQuery,
        importedData: state.importedData,
        selectedDistributor: state.selectedDistributor
      }), // Only persist these specific fields to avoid stale API data on refresh
    }
  )
);