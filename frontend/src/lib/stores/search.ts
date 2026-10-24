// DIVERGE — Central Reactive Search Store
// Coordinates the global search input in TopHeader and the main /search route
// Real-time synchronization, multi-genre switching, and instant memory caching

import { writable, get } from 'svelte/store';
import type { Song, PaginatedSongs } from '$lib/types';
import { songs as songsAPI } from '$lib/services/api';

export interface SearchState {
  query: string;
  selectedGenre: string;
  results: Song[];
  loading: boolean;
  error: string | null;
}

function createSearchStore() {
  const { subscribe, set, update } = writable<SearchState>({
    query: '',
    selectedGenre: '',
    results: [],
    loading: false,
    error: null
  });

  let debounceTimer: any = null;
  let currentRequestId = 0;

  // Local instant memory cache (0ms instant roundtrip when toggling filters)
  const memoryCache = new Map<string, Song[]>();

  async function execute(queryText: string, genre: string) {
    const requestId = ++currentRequestId;
    const cleanQ = queryText.trim();
    const cleanGenre = genre.trim();
    const cacheKey = `${cleanQ.toLowerCase()}__${cleanGenre.toLowerCase()}`;

    // 1. Instant Cache Hit (0ms response)
    if (memoryCache.has(cacheKey)) {
      const cached = memoryCache.get(cacheKey)!;
      update(s => ({
        ...s,
        query: queryText,
        selectedGenre: genre,
        results: cached,
        loading: false,
        error: null
      }));
      return;
    }

    update(s => ({
      ...s,
      query: queryText,
      selectedGenre: genre,
      loading: true,
      error: null
    }));

    try {
      let songList: Song[] = [];

      if (cleanQ.length > 0) {
        // High-speed live query for track / movie / album / artist
        const res = await songsAPI.searchLive(cleanQ, 30);
        songList = res.songs || [];
      } else if (cleanGenre.length > 0) {
        // Query catalog by genre
        const res = await songsAPI.list({ genre: cleanGenre, limit: 30 }) as PaginatedSongs;
        songList = res.songs || [];
        if (songList.length === 0) {
          const live = await songsAPI.searchLive(`${cleanGenre} songs`, 30);
          songList = live.songs || [];
        }
      } else {
        // Default trending catalog
        const res = await songsAPI.trending();
        songList = res || [];
      }

      // Check if another request has been triggered since this one started
      if (requestId !== currentRequestId) return;

      if (songList.length > 0) {
        memoryCache.set(cacheKey, songList);
      }

      update(s => ({
        ...s,
        results: songList,
        loading: false,
        error: null
      }));
    } catch (err: any) {
      if (requestId !== currentRequestId) return;
      update(s => ({
        ...s,
        loading: false,
        error: err?.message || 'Search failed'
      }));
    }
  }

  return {
    subscribe,

    // Real-time query updater with debounce
    setQuery(newQuery: string, immediate = false) {
      clearTimeout(debounceTimer);
      const clean = newQuery;
      update(s => ({ ...s, query: clean, selectedGenre: '' }));

      if (immediate || !clean.trim()) {
        execute(clean, '');
      } else {
        debounceTimer = setTimeout(() => {
          execute(clean, '');
        }, 160);
      }
    },

    // Instant genre filter toggle
    setGenre(genreName: string) {
      clearTimeout(debounceTimer);
      const cur = get({ subscribe });
      const nextGenre = cur.selectedGenre.toLowerCase() === genreName.toLowerCase() ? '' : genreName;
      update(s => ({ ...s, query: '', selectedGenre: nextGenre }));
      execute('', nextGenre);
    },

    // Clear search and reset to trending
    clear() {
      clearTimeout(debounceTimer);
      update(s => ({ ...s, query: '', selectedGenre: '' }));
      execute('', '');
    },

    // Refresh current query
    refresh() {
      const cur = get({ subscribe });
      execute(cur.query, cur.selectedGenre);
    }
  };
}

export const searchStore = createSearchStore();
