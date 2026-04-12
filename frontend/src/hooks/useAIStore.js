import { create } from 'zustand';

/**
 * useAIStore — Controls global AI search filters and integration.
 * This allows the AIChatbot to update the ServicesPage in real-time.
 */
const useAIStore = create((set) => ({
  aiFilters: null, // { category, maxPrice, city, search }
  isSyncing: false,

  setAIFilters: (filters) => set({ aiFilters: filters }),
  
  clearAIFilters: () => set({ aiFilters: null }),
  
  syncWithApp: () => {
    set({ isSyncing: true });
    // Simulate a brief "thinking" state for UX
    setTimeout(() => set({ isSyncing: false }), 800);
  }
}));

export default useAIStore;
