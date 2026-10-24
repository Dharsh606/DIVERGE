// DIVERGE — Liked Songs Store
// Manages personal favorite tracks with persistent localStorage synchronization

import { writable, get } from 'svelte/store';
import type { Song } from '$lib/types';
import { player } from '$lib/stores/player';

const STORAGE_KEY = 'diverge_liked_songs';

function loadInitialLiked(): Song[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function createLikedStore() {
  const { subscribe, set, update } = writable<Song[]>(loadInitialLiked());

  function persist(songs: Song[]) {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(songs));
      } catch (e) {
        console.warn('Failed to persist liked songs', e);
      }
    }
  }

  return {
    subscribe,

    toggleLike: (song: Song) => {
      if (!song) return;
      update(list => {
        const exists = list.some(
          s => s.id === song.id || (song.youtube_id && s.youtube_id === song.youtube_id)
        );
        let next: Song[];
        if (exists) {
          next = list.filter(
            s => s.id !== song.id && (!song.youtube_id || s.youtube_id !== song.youtube_id)
          );
        } else {
          next = [song, ...list];
        }
        persist(next);
        return next;
      });
    },

    isLiked: (song: Song | null): boolean => {
      if (!song) return false;
      const list = get({ subscribe });
      return list.some(
        s => s.id === song.id || (song.youtube_id && s.youtube_id === song.youtube_id)
      );
    },

    playLikedSongs: (startSong?: Song) => {
      const list = get({ subscribe });
      if (list.length === 0) return;
      const target = startSong || list[0];
      player.playSong(target, list);
    },

    clearLiked: () => {
      persist([]);
      set([]);
    }
  };
}

export const likedSongs = createLikedStore();
