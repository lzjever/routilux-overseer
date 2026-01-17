import { create } from "zustand";

export interface SearchResult {
  id: string;
  type: "flow" | "job" | "log";
  title: string;
  description?: string;
  url: string;
  metadata?: Record<string, any>;
}

interface SearchStore {
  query: string;
  results: SearchResult[];
  recentSearches: string[];
  isOpen: boolean;
  selectedIndex: number;
  setQuery: (query: string) => void;
  setResults: (results: SearchResult[]) => void;
  addRecentSearch: (query: string) => void;
  open: () => void;
  close: () => void;
  setSelectedIndex: (index: number) => void;
  clear: () => void;
}

const MAX_RECENT_SEARCHES = 10;
const RECENT_SEARCHES_KEY = "overseer_recent_searches";

// Load recent searches from localStorage
const loadRecentSearches = (): string[] => {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Save recent searches to localStorage
const saveRecentSearches = (searches: string[]): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches));
  } catch {
    // Ignore localStorage errors
  }
};

export const useSearchStore = create<SearchStore>((set) => ({
  query: "",
  results: [],
  recentSearches: loadRecentSearches(),
  isOpen: false,
  selectedIndex: -1,

  setQuery: (query) => set({ query }),

  setResults: (results) => set({ results, selectedIndex: -1 }),

  addRecentSearch: (query) => {
    if (!query.trim()) return;
    set((state) => {
      const updated = [query, ...state.recentSearches.filter((s) => s !== query)].slice(
        0,
        MAX_RECENT_SEARCHES
      );
      saveRecentSearches(updated);
      return { recentSearches: updated };
    });
  },

  open: () => set({ isOpen: true, selectedIndex: -1 }),

  close: () => set({ isOpen: false, query: "", results: [], selectedIndex: -1 }),

  setSelectedIndex: (index) => set({ selectedIndex: index }),

  clear: () => set({ query: "", results: [], selectedIndex: -1 }),
}));
