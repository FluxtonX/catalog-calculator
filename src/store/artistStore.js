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
      importedData: null,       // NOT persisted — cleared on every fresh session
      selectedDistributor: null, // NOT persisted — cleared on every fresh session
      royaltyShare: 100, // Persisted user royalty share setting
      currency: 'USD', // Persisted user currency setting
      exchangeRates: { USD: 1 }, // In-memory exchange rates
      
      setSearchQuery: (query) => set({ searchQuery: query }),
      setSelectedArtist: (artist) => set({ selectedArtist: artist }),
      setSelectedArtists: (artists) => set({ selectedArtists: artists }),
      setPlatform: (platform) => set({ platform }),
      setPlatforms: (platforms) => set({ platforms }),
      setImportedData: (data) => set({ importedData: data }),
      setSelectedDistributor: (dist) => set({ selectedDistributor: dist }),
      setRoyaltyShare: (share) => set({ royaltyShare: share }),
      setCurrency: (currency) => set({ currency }),
      fetchExchangeRates: async () => {
        try {
          const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
          const data = await res.json();
          if (data && data.rates) {
            set({ exchangeRates: data.rates });
          }
        } catch (e) {
          console.error("Failed to fetch exchange rates");
        }
      },
      
      // Clears everything including imported data
      clearArtist: () => set({ selectedArtist: null, selectedArtists: {}, importedData: null, selectedDistributor: null }),
      // Clears ONLY imported data — called when user starts a fresh search
      clearImportedData: () => set({ importedData: null, selectedDistributor: null }),
    }),
    {
      name: 'artist-store', // unique name for localStorage key
      partialize: (state) => ({ 
        searchQuery: state.searchQuery,
        royaltyShare: state.royaltyShare,
        currency: state.currency,
        // importedData and selectedDistributor are intentionally NOT persisted
        // to prevent stale distributor data from polluting fresh searches.
      }),
    }
  )
);
