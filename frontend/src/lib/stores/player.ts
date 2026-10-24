// DIVERGE — Music Player Store
// Central state for playback: current song, queue, controls, position
// Supports both HTML Audio and YouTube Music Player Engine for 100% full-length songs

import { writable, derived, get } from 'svelte/store';
import type { Song, PlayerState, RepeatMode } from '$lib/types';
import { songs as songsAPI, history } from '$lib/services/api';
import { preferences } from '$lib/stores/preferences';

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
  playbackEngine: 'youtube' | 'audio';
}

let audioEl: HTMLAudioElement | null = null;
let ytPlayer: any = null;
let ytIframeReady = false;
let ytPendingVideoId: string | null = null;
let ytScriptLoading = false;
let tickerInterval: any = null;
let playStartTime = 0;

function extractYouTubeId(song: Song): string | null {
  if (song.youtube_id && song.youtube_id.trim().length > 0) {
    return song.youtube_id.trim();
  }
  if (song.audio_url) {
    if (song.audio_url.startsWith('youtube:')) {
      return song.audio_url.replace('youtube:', '').trim();
    }
    const match = song.audio_url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([\w-]{11})/);
    if (match) return match[1];
  }
  return null;
}

function updateMediaSession(song: Song | null) {
  if (typeof navigator !== 'undefined' && 'mediaSession' in navigator && song) {
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: song.title,
        artist: song.artist?.name || 'DIVERGE Artist',
        album: song.album?.title || 'DIVERGE Music',
        artwork: [
          {
            src: song.album?.cover_url || '/logo.png',
            sizes: '512x512',
            type: 'image/jpeg'
          }
        ]
      });
    } catch {
      // Ignore if MediaMetadata is restricted in some environments
    }
  }
}

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
    playbackEngine: 'youtube'
  });

  function startTicker() {
    stopTicker();
    tickerInterval = setInterval(() => {
      const s = get({ subscribe });
      if (s.playbackEngine === 'youtube' && ytPlayer && ytIframeReady) {
        try {
          const cur = ytPlayer.getCurrentTime();
          const dur = ytPlayer.getDuration();
          update(st => ({
            ...st,
            currentTime: typeof cur === 'number' && !isNaN(cur) ? cur : st.currentTime,
            duration: dur && dur > 0 ? dur : st.duration || st.currentSong?.duration_seconds || 0
          }));
        } catch {
          // Player state transitioning
        }
      }
    }, 250);
  }

  function stopTicker() {
    if (tickerInterval) {
      clearInterval(tickerInterval);
      tickerInterval = null;
    }
  }

  function initYouTube(): Promise<any> {
    if (typeof window === 'undefined') return Promise.resolve(null);
    if (ytPlayer && ytIframeReady) return Promise.resolve(ytPlayer);

    return new Promise(resolve => {
      // Ensure hidden container exists in document body
      let container = document.getElementById('diverge-yt-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'diverge-yt-container';
        container.style.cssText =
          'position: fixed; bottom: -9999px; left: -9999px; width: 200px; height: 200px; opacity: 0; pointer-events: none; z-index: -9999;';
        const playerDiv = document.createElement('div');
        playerDiv.id = 'diverge-yt-iframe';
        container.appendChild(playerDiv);
        document.body.appendChild(container);
      }

      const onAPIReady = () => {
        if (ytPlayer) {
          resolve(ytPlayer);
          return;
        }
        try {
          ytPlayer = new (window as any).YT.Player('diverge-yt-iframe', {
            height: '200',
            width: '200',
            playerVars: {
              autoplay: 1,
              controls: 0,
              disablekb: 1,
              enablejsapi: 1,
              fs: 0,
              iv_load_policy: 3,
              modestbranding: 1,
              playsinline: 1,
              rel: 0,
              origin: window.location.origin
            },
            events: {
              onReady: () => {
                ytIframeReady = true;
                const curVol = get({ subscribe }).volume;
                ytPlayer.setVolume(curVol * 100);
                if (get({ subscribe }).muted) ytPlayer.mute();

                if (ytPendingVideoId) {
                  const vid = ytPendingVideoId;
                  ytPendingVideoId = null;
                  ytPlayer.loadVideoById(vid, 0);
                  ytPlayer.playVideo();
                }
                resolve(ytPlayer);
              },
              onStateChange: (event: any) => {
                // -1 unstarted, 0 ended, 1 playing, 2 paused, 3 buffering, 5 cued
                if (event.data === 1) {
                  const dur = ytPlayer.getDuration();
                  update(st => ({
                    ...st,
                    state: 'playing',
                    duration: dur && dur > 0 ? dur : st.duration || st.currentSong?.duration_seconds || 0
                  }));
                  startTicker();
                  updateMediaSession(get({ subscribe }).currentSong);
                } else if (event.data === 2) {
                  update(st => ({ ...st, state: 'paused' }));
                  stopTicker();
                } else if (event.data === 3) {
                  update(st => ({ ...st, state: 'loading' }));
                } else if (event.data === 0) {
                  stopTicker();
                  logCurrentPlay(true);
                  store.next();
                }
              },
              onError: (err: any) => {
                console.warn('YouTube Player error code:', err?.data);
                stopTicker();
                const s = get({ subscribe });
                if (s.currentSong?.audio_url && !s.currentSong.audio_url.startsWith('youtube:')) {
                  // Fallback to HTML audio element
                  playViaAudioEl(s.currentSong);
                } else {
                  update(st => ({ ...st, state: 'error' }));
                }
              }
            }
          });
        } catch (e) {
          console.warn('Error instantiating YT.Player:', e);
          resolve(null);
        }
      };

      if ((window as any).YT && (window as any).YT.Player) {
        onAPIReady();
      } else {
        if (!ytScriptLoading) {
          ytScriptLoading = true;
          const tag = document.createElement('script');
          tag.id = 'diverge-yt-script';
          tag.src = 'https://www.youtube.com/iframe_api';
          document.head.appendChild(tag);
        }
        const prev = (window as any).onYouTubeIframeAPIReady;
        (window as any).onYouTubeIframeAPIReady = () => {
          if (typeof prev === 'function') prev();
          onAPIReady();
        };
      }
    });
  }

  function getAudio(): HTMLAudioElement {
    if (!audioEl) {
      audioEl = new Audio();
      audioEl.preload = 'metadata';
      audioEl.volume = get({ subscribe }).volume;

      audioEl.addEventListener('timeupdate', () => {
        const s = get({ subscribe });
        if (s.playbackEngine === 'audio') {
          update(st => ({ ...st, currentTime: audioEl!.currentTime }));
        }
      });
      audioEl.addEventListener('loadedmetadata', () => {
        const s = get({ subscribe });
        if (s.playbackEngine === 'audio') {
          update(st => ({ ...st, duration: audioEl!.duration, state: 'playing' }));
        }
      });
      audioEl.addEventListener('play', () => {
        const s = get({ subscribe });
        if (s.playbackEngine === 'audio') {
          update(st => ({ ...st, state: 'playing' }));
          playStartTime = Date.now();
          updateMediaSession(s.currentSong);
        }
      });
      audioEl.addEventListener('pause', () => {
        const s = get({ subscribe });
        if (s.playbackEngine === 'audio') {
          update(st => ({ ...st, state: 'paused' }));
          logCurrentPlay();
        }
      });
      audioEl.addEventListener('ended', () => {
        const s = get({ subscribe });
        if (s.playbackEngine === 'audio') {
          logCurrentPlay(true);
          store.next();
        }
      });
      audioEl.addEventListener('error', () => {
        const s = get({ subscribe });
        if (s.playbackEngine === 'audio') {
          update(st => ({ ...st, state: 'error' }));
        }
      });
      audioEl.addEventListener('waiting', () => {
        const s = get({ subscribe });
        if (s.playbackEngine === 'audio') {
          update(st => ({ ...st, state: 'loading' }));
        }
      });
      audioEl.addEventListener('canplay', () => {
        const s = get({ subscribe });
        if (s.playbackEngine === 'audio' && s.state === 'loading') {
          update(st => ({ ...st, state: 'playing' }));
        }
      });
    }
    return audioEl;
  }

  function playViaAudioEl(song: Song) {
    stopTicker();
    if (ytPlayer && ytIframeReady) {
      try {
        ytPlayer.pauseVideo();
      } catch {}
    }
    const audio = getAudio();
    update(s => ({ ...s, playbackEngine: 'audio', state: 'loading' }));
    audio.src = songsAPI.stream(song.id);
    audio.load();
    audio.play().catch(() => update(s => ({ ...s, state: 'error' })));
  }

  async function logCurrentPlay(completed = false) {
    if (get(preferences).privateSession) return;
    const s = get({ subscribe });
    if (!s.currentSong) return;
    const duration = Math.round((Date.now() - playStartTime) / 1000);
    try {
      await history.log({
        song_id: s.currentSong.id,
        play_duration_seconds: duration,
        completed
      });
    } catch {
      /* silent */
    }
  }

  // Bind navigator.mediaSession controls once
  if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
    try {
      navigator.mediaSession.setActionHandler('play', () => store.toggle());
      navigator.mediaSession.setActionHandler('pause', () => store.toggle());
      navigator.mediaSession.setActionHandler('previoustrack', () => store.prev());
      navigator.mediaSession.setActionHandler('nexttrack', () => store.next());
      navigator.mediaSession.setActionHandler('seekto', details => {
        if (details.seekTime !== undefined) store.seek(details.seekTime);
      });
    } catch {}
  }

  const store = {
    subscribe,

    // ─── Play a song directly (100% full song via YouTube Music engine) ───
    playSong(song: Song, queue: Song[] = []) {
      const queueToUse = queue.length ? queue : [song];
      const idx = queueToUse.findIndex(s => s.id === song.id);

      const ytId = extractYouTubeId(song);

      if (ytId) {
        // High-definition YouTube Music streaming (Full 3-5+ minute tracks)
        if (audioEl) {
          audioEl.pause();
          audioEl.currentTime = 0;
        }

        update(s => ({
          ...s,
          currentSong: song,
          queue: queueToUse,
          queueIndex: idx >= 0 ? idx : 0,
          state: 'loading',
          currentTime: 0,
          duration: song.duration_seconds || 0,
          playbackEngine: 'youtube'
        }));

        playStartTime = Date.now();
        updateMediaSession(song);

        initYouTube().then(player => {
          if (player && ytIframeReady) {
            try {
              player.loadVideoById(ytId, 0);
              player.playVideo();
            } catch (e) {
              console.warn('Failed to start YouTube video playback:', e);
            }
          } else {
            ytPendingVideoId = ytId;
          }
        });
      } else {
        // Standard audio file playback via HTML Audio Element
        update(s => ({
          ...s,
          currentSong: song,
          queue: queueToUse,
          queueIndex: idx >= 0 ? idx : 0,
          currentTime: 0,
          duration: song.duration_seconds || 0,
          playbackEngine: 'audio'
        }));
        playViaAudioEl(song);
      }
    },

    // ─── Play / Pause toggle ──────────────────────────────────────────────
    toggle() {
      const s = get({ subscribe });
      if (!s.currentSong) return;

      if (s.playbackEngine === 'youtube' && ytPlayer && ytIframeReady) {
        if (s.state === 'playing') {
          ytPlayer.pauseVideo();
        } else {
          ytPlayer.playVideo();
        }
      } else {
        const audio = getAudio();
        if (s.state === 'playing') {
          audio.pause();
        } else {
          audio.play();
        }
      }
    },

    // ─── Seek ─────────────────────────────────────────────────────────────
    seek(time: number) {
      const s = get({ subscribe });
      const targetTime = Math.max(0, time);

      if (s.playbackEngine === 'youtube' && ytPlayer && ytIframeReady) {
        try {
          ytPlayer.seekTo(targetTime, true);
          update(st => ({ ...st, currentTime: targetTime }));
        } catch {}
      } else {
        const audio = getAudio();
        audio.currentTime = targetTime;
        update(st => ({ ...st, currentTime: targetTime }));
      }
    },

    // ─── Volume ───────────────────────────────────────────────────────────
    setVolume(vol: number) {
      const clamped = Math.max(0, Math.min(1, vol));
      if (audioEl) audioEl.volume = clamped;
      if (ytPlayer && ytIframeReady) {
        try {
          ytPlayer.setVolume(clamped * 100);
        } catch {}
      }
      update(s => ({ ...s, volume: clamped, muted: clamped === 0 }));
    },

    toggleMute() {
      const s = get({ subscribe });
      const nextMuted = !s.muted;
      if (audioEl) audioEl.muted = nextMuted;
      if (ytPlayer && ytIframeReady) {
        try {
          if (nextMuted) ytPlayer.mute();
          else ytPlayer.unMute();
        } catch {}
      }
      update(st => ({ ...st, muted: nextMuted }));
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
      const s = get({ subscribe });
      if (s.currentTime > 3) {
        store.seek(0);
        return;
      }

      const prevIdx = Math.max(0, s.queueIndex - 1);
      if (s.queue[prevIdx]) {
        store.playSong(s.queue[prevIdx], s.queue);
      }
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

    removeFromQueue(index: number) {
      update(s => {
        const nextQueue = s.queue.filter((_, i) => i !== index);
        let nextIdx = s.queueIndex;
        if (index < s.queueIndex) {
          nextIdx = Math.max(0, s.queueIndex - 1);
        } else if (index === s.queueIndex) {
          if (nextQueue.length === 0) {
            nextIdx = -1;
          } else if (nextIdx >= nextQueue.length) {
            nextIdx = 0;
          }
        }
        return { ...s, queue: nextQueue, queueIndex: nextIdx };
      });
    },

    playIndex(index: number) {
      const s = get({ subscribe });
      if (s.queue[index]) {
        store.playSong(s.queue[index], s.queue);
      }
    },

    clearQueue() {
      update(s => ({ ...s, queue: [], queueIndex: -1 }));
    },

    // ─── Fullscreen player toggle ─────────────────────────────────────────
    toggleFullscreen() {
      update(s => ({ ...s, showFullscreen: !s.showFullscreen }));
    }
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
  if (!secs || isNaN(secs) || secs < 0) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}
