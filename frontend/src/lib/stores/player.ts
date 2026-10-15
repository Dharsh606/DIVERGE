// DIVERGE — Music Player Store
// Central state for playback: current song, queue, controls, position

import { writable, derived, get } from 'svelte/store';
import type { Song, PlayerState, RepeatMode } from '$lib/types';
import { songs as songsAPI, history } from '$lib/services/api';

interface PlayerStoreState {
  currentSong: Song | null;
  queue: Song[];
  queueIndex: number;
  state: PlayerState;
  currentTime: number;
  duration: number;
  volume: number;
  muted: boolean;
  shuffle: boolean;
  repeat: RepeatMode;
  showFullscreen: boolean;
}

// The actual HTML Audio element — lives outside the store
let audioEl: HTMLAudioElement | null = null;
let playStartTime = 0;

function createPlayerStore() {
  const { subscribe, set, update } = writable<PlayerStoreState>({
    currentSong: null,
    queue: [],
    queueIndex: -1,
    state: 'idle',
    currentTime: 0,
    duration: 0,
    volume: 0.8,
    muted: false,
    shuffle: false,
    repeat: 'none',
    showFullscreen: false,
  });

  function getAudio(): HTMLAudioElement {
    if (!audioEl) {
      audioEl = new Audio();
      audioEl.preload = 'metadata';
      audioEl.volume = get({ subscribe }).volume;

      audioEl.addEventListener('timeupdate', () => {
        update(s => ({ ...s, currentTime: audioEl!.currentTime }));
      });
      audioEl.addEventListener('loadedmetadata', () => {
        update(s => ({ ...s, duration: audioEl!.duration, state: 'playing' }));
      });
      audioEl.addEventListener('play', () => {
        update(s => ({ ...s, state: 'playing' }));
        playStartTime = Date.now();
      });
      audioEl.addEventListener('pause', () => {
        update(s => ({ ...s, state: 'paused' }));
        logCurrentPlay();
      });
      audioEl.addEventListener('ended', () => {
        logCurrentPlay(true);
        store.next();
      });
      audioEl.addEventListener('error', () => {
        update(s => ({ ...s, state: 'error' }));
      });
      audioEl.addEventListener('waiting', () => {
        update(s => ({ ...s, state: 'loading' }));
      });
      audioEl.addEventListener('canplay', () => {
        const s = get({ subscribe });
        if (s.state === 'loading') {
          update(s => ({ ...s, state: 'playing' }));
        }
      });
    }
    return audioEl;
  }

  async function logCurrentPlay(completed = false) {
    const s = get({ subscribe });
    if (!s.currentSong) return;
    const duration = Math.round((Date.now() - playStartTime) / 1000);
    try {
      await history.log({
        song_id: s.currentSong.id,
        play_duration_seconds: duration,
        completed,
      });
    } catch { /* silent — don't break playback on history errors */ }
  }

  const store = {
    subscribe,

    // ─── Play a song directly ─────────────────────────────────────────────
    playSong(song: Song, queue: Song[] = []) {
      const audio = getAudio();
      const queueToUse = queue.length ? queue : [song];
      const idx = queueToUse.findIndex(s => s.id === song.id);

      update(s => ({
        ...s,
        currentSong: song,
        queue: queueToUse,
        queueIndex: idx >= 0 ? idx : 0,
        state: 'loading',
        currentTime: 0,
        duration: 0,
      }));

      audio.src = songsAPI.stream(song.id);
      audio.load();
      audio.play().catch(() => update(s => ({ ...s, state: 'error' })));
    },

    // ─── Play / Pause toggle ──────────────────────────────────────────────
    toggle() {
      const audio = getAudio();
      const s = get({ subscribe });
      if (s.state === 'playing') {
        audio.pause();
      } else if (s.currentSong) {
        audio.play();
      }
    },

    // ─── Seek ─────────────────────────────────────────────────────────────
    seek(time: number) {
      const audio = getAudio();
      audio.currentTime = time;
      update(s => ({ ...s, currentTime: time }));
    },

    // ─── Volume ───────────────────────────────────────────────────────────
    setVolume(vol: number) {
      const audio = getAudio();
      const clamped = Math.max(0, Math.min(1, vol));
      audio.volume = clamped;
      update(s => ({ ...s, volume: clamped, muted: clamped === 0 }));
    },

    toggleMute() {
      const audio = getAudio();
      const s = get({ subscribe });
      audio.muted = !s.muted;
      update(st => ({ ...st, muted: !st.muted }));
    },

    // ─── Next track ───────────────────────────────────────────────────────
    next() {
      const s = get({ subscribe });
      if (!s.queue.length) return;

      let nextIdx: number;
      if (s.repeat === 'one') {
        nextIdx = s.queueIndex;
      } else if (s.shuffle) {
        nextIdx = Math.floor(Math.random() * s.queue.length);
      } else {
        nextIdx = s.queueIndex + 1;
        if (nextIdx >= s.queue.length) {
          if (s.repeat === 'all') nextIdx = 0;
          else return;
        }
      }

      store.playSong(s.queue[nextIdx], s.queue);
    },

    // ─── Previous track ───────────────────────────────────────────────────
    prev() {
      const audio = getAudio();
      const s = get({ subscribe });

      // If more than 3s played, restart. Otherwise go previous.
      if (s.currentTime > 3) {
        audio.currentTime = 0;
        return;
      }

      const prevIdx = Math.max(0, s.queueIndex - 1);
      store.playSong(s.queue[prevIdx], s.queue);
    },

    // ─── Shuffle toggle ───────────────────────────────────────────────────
    toggleShuffle() {
      update(s => ({ ...s, shuffle: !s.shuffle }));
    },

    // ─── Repeat cycle: none → all → one → none ────────────────────────────
    cycleRepeat() {
      update(s => {
        const cycle: RepeatMode[] = ['none', 'all', 'one'];
        const next = cycle[(cycle.indexOf(s.repeat) + 1) % cycle.length];
        return { ...s, repeat: next };
      });
    },

    // ─── Queue management ─────────────────────────────────────────────────
    addToQueue(song: Song) {
      update(s => ({ ...s, queue: [...s.queue, song] }));
    },

    clearQueue() {
      update(s => ({ ...s, queue: [], queueIndex: -1 }));
    },

    // ─── Fullscreen player toggle ─────────────────────────────────────────
    toggleFullscreen() {
      update(s => ({ ...s, showFullscreen: !s.showFullscreen }));
    },
  };

  return store;
}

export const player = createPlayerStore();

// Derived helpers
export const isPlaying = derived(player, $p => $p.state === 'playing');
export const progressPercent = derived(player, $p =>
  $p.duration > 0 ? ($p.currentTime / $p.duration) * 100 : 0
);

export function formatTime(secs: number): string {
  if (!secs || isNaN(secs)) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}
