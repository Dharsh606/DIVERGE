// DIVERGE — API Service Layer
// Typed fetch wrapper for the Go backend with autonomous client-side fallback
import type { Song, PaginatedSongs } from '$lib/types';

const BASE = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || '/api';

class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'APIError';
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('diverge_auth_token');
    if (token && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include', // send httpOnly cookie
    headers,
    ...options,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new APIError(res.status, err.error || 'Request failed');
  }

  return res.json();
}

// ─── Curated Fallback Music Catalog (For Edge/Vercel and Offline Mode) ─────────
const FALLBACK_SONGS: Song[] = [
  {
    id: 101,
    title: 'Chaleya',
    artist: { id: 1, name: 'Arijit Singh, Shilpa Rao & Anirudh Ravichander' },
    album: { id: 10, title: 'Jawan (Original Motion Picture Soundtrack)', cover_url: 'https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/a4/bc/f8/a4bcf84e-333e-b8d2-8be0-c75c87a55259/8902894361546.jpg/600x600bb.jpg' },
    duration_seconds: 200,
    audio_url: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview116/v4/71/84/01/71840134-8c83-0975-f5ae-8f9215099238/mzaf_1773099908020846174.plus.aac.p.m4a',
    bpm: 108,
    energy: 0.74,
    valence: 0.82,
    danceability: 0.78,
    genre: 'Bollywood',
    acoustic_x: -0.22,
    acoustic_y: 0.65,
    acoustic_z: 0.41,
  },
  {
    id: 102,
    title: 'Hukum - Thalaivar Alappara',
    artist: { id: 2, name: 'Anirudh Ravichander' },
    album: { id: 11, title: 'Jailer (Original Motion Picture Soundtrack)', cover_url: 'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/dc/8e/31/dc8e3170-13f5-7c15-ea81-a6783f8d6ea9/8903431976077.jpg/600x600bb.jpg' },
    duration_seconds: 238,
    audio_url: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview116/v4/ae/2e/30/ae2e308f-7e8c-84d4-6510-6395dcdd4b82/mzaf_10444393666245136869.plus.aac.p.m4a',
    bpm: 130,
    energy: 0.94,
    valence: 0.68,
    danceability: 0.81,
    genre: 'Tamil Hits',
    acoustic_x: 0.78,
    acoustic_y: -0.15,
    acoustic_z: 0.62,
  },
  {
    id: 103,
    title: 'Midnight City',
    artist: { id: 3, name: 'M83' },
    album: { id: 12, title: 'Hurry Up, We\'re Dreaming', cover_url: 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/55/96/02/559602e1-4c6e-2144-ec8f-28c0b561fae4/724596951054.jpg/600x600bb.jpg' },
    duration_seconds: 243,
    audio_url: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/33/c4/85/33c485eb-e362-d273-0599-236b2f4f228d/mzaf_17208365287421832431.plus.aac.p.m4a',
    bpm: 105,
    energy: 0.88,
    valence: 0.65,
    danceability: 0.60,
    genre: 'Synthwave',
    acoustic_x: 0.45,
    acoustic_y: 0.82,
    acoustic_z: -0.32,
  },
  {
    id: 104,
    title: 'Kesariya',
    artist: { id: 4, name: 'Arijit Singh & Pritam' },
    album: { id: 13, title: 'Brahmastra (Original Motion Picture Soundtrack)', cover_url: 'https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/ce/22/e2/ce22e28a-788b-ae00-c97b-bbd7e008fa97/196589332223.jpg/600x600bb.jpg' },
    duration_seconds: 268,
    audio_url: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview122/v4/c3/0f/6c/c30f6cbe-039c-bc4a-ae5a-db821b033d6b/mzaf_7829281781216503920.plus.aac.p.m4a',
    bpm: 94,
    energy: 0.68,
    valence: 0.72,
    danceability: 0.61,
    genre: 'Bollywood',
    acoustic_x: -0.55,
    acoustic_y: 0.42,
    acoustic_z: 0.28,
  },
  {
    id: 105,
    title: 'Blinding Lights',
    artist: { id: 5, name: 'The Weeknd' },
    album: { id: 14, title: 'After Hours', cover_url: 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/d5/9c/0b/d59c0b11-5344-966e-6368-23c3b0eb2028/20UMGIM08204.rgb.jpg/600x600bb.jpg' },
    duration_seconds: 200,
    audio_url: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/44/2e/0f/442e0fa5-3a05-592f-b44e-d67b2d28dc1c/mzaf_10672199042594611598.plus.aac.p.m4a',
    bpm: 171,
    energy: 0.80,
    valence: 0.38,
    danceability: 0.51,
    genre: 'Synthpop',
    acoustic_x: 0.85,
    acoustic_y: 0.41,
    acoustic_z: 0.77,
  },
  {
    id: 106,
    title: 'Jai Ho',
    artist: { id: 6, name: 'A.R. Rahman, Sukhwinder Singh & Tanvi Shah' },
    album: { id: 15, title: 'Slumdog Millionaire', cover_url: 'https://is1-ssl.mzstatic.com/image/thumb/Music/v4/e5/22/e1/e522e17e-77d0-1c39-df06-a2dbd5a085b3/00602517926214.rgb.jpg/600x600bb.jpg' },
    duration_seconds: 319,
    audio_url: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/ba/65/59/ba6559b1-ec59-5f25-ce5a-3375836fa5a8/mzaf_3991206103347594950.plus.aac.p.m4a',
    bpm: 135,
    energy: 0.92,
    valence: 0.89,
    danceability: 0.75,
    genre: 'Soundtrack',
    acoustic_x: 0.20,
    acoustic_y: 0.91,
    acoustic_z: 0.55,
  },
  {
    id: 107,
    title: 'Starboy',
    artist: { id: 5, name: 'The Weeknd ft. Daft Punk' },
    album: { id: 16, title: 'Starboy', cover_url: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/bf/f9/57/bff957ae-90aa-0847-f370-9883584d41fa/16UMGIM60601.rgb.jpg/600x600bb.jpg' },
    duration_seconds: 230,
    audio_url: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/ec/3b/b1/ec3bb1fb-789a-dc1d-ee31-01b3bfa09fbc/mzaf_6717592476579691949.plus.aac.p.m4a',
    bpm: 186,
    energy: 0.59,
    valence: 0.49,
    danceability: 0.68,
    genre: 'Electronic',
    acoustic_x: 0.62,
    acoustic_y: -0.35,
    acoustic_z: 0.18,
  },
  {
    id: 108,
    title: 'Resonance',
    artist: { id: 7, name: 'HOME' },
    album: { id: 17, title: 'Odyssey', cover_url: 'https://is1-ssl.mzstatic.com/image/thumb/Music4/v4/57/02/75/5702759e-1f74-3236-4191-c91fae5e6e30/859712711685_cover.jpg/600x600bb.jpg' },
    duration_seconds: 212,
    audio_url: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview114/v4/f5/66/d8/f566d871-2dc0-58fe-89dc-0639d6718d7f/mzaf_16887557165037180425.plus.aac.p.m4a',
    bpm: 170,
    energy: 0.65,
    valence: 0.55,
    danceability: 0.54,
    genre: 'Lo-Fi Chill',
    acoustic_x: -0.15,
    acoustic_y: -0.75,
    acoustic_z: -0.42,
  }
];

// Helper to map iTunes raw song to DIVERGE model
function mapItunesTrack(item: any): Song {
  const art600 = item.artworkUrl100
    ? item.artworkUrl100.replace('100x100bb', '600x600bb').replace('100x100', '600x600')
    : '';

  // Generate deterministic pseudo acoustic coordinates from trackId
  const idNum = Number(item.trackId) || 100;
  const acoustic_x = Math.sin(idNum * 0.17);
  const acoustic_y = Math.cos(idNum * 0.23);
  const acoustic_z = Math.sin(idNum * 0.31);

  return {
    id: item.trackId,
    title: item.trackName || 'Unknown Title',
    artist: { id: item.artistId || 1, name: item.artistName || 'Unknown Artist' },
    album: { id: item.collectionId || 1, title: item.collectionName || item.trackName || '', cover_url: art600 },
    duration_seconds: Math.round((item.trackTimeMillis || 180000) / 1000),
    audio_url: item.previewUrl || '',
    genre: item.primaryGenreName || 'Curated',
    bpm: 120,
    energy: 0.75,
    valence: 0.65,
    danceability: 0.70,
    acoustic_x,
    acoustic_y,
    acoustic_z,
  };
}

// ─── Auth ──────────────────────────────────────────────────────────────────

export const auth = {
  register: (username: string, email: string, password: string) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    }),

  login: (email: string, password: string) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  logout: () => request('/auth/logout', { method: 'POST' }),

  me: () => request('/auth/me'),
};

// ─── Songs ─────────────────────────────────────────────────────────────────

export const songs = {
  list: async (params: { page?: number; limit?: number; genre?: string; search?: string } = {}): Promise<PaginatedSongs> => {
    try {
      const q = new URLSearchParams();
      if (params.page)   q.set('page',   String(params.page));
      if (params.limit)  q.set('limit',  String(params.limit));
      if (params.genre)  q.set('genre',  params.genre);
      if (params.search) q.set('search', params.search);
      return await request<PaginatedSongs>(`/songs?${q}`);
    } catch {
      // Graceful catalog fallback
      let list = [...FALLBACK_SONGS];
      if (params.genre) {
        list = list.filter(s => s.genre?.toLowerCase() === params.genre?.toLowerCase());
      }
      if (params.search) {
        const query = params.search.toLowerCase();
        list = list.filter(s =>
          s.title.toLowerCase().includes(query) ||
          s.artist?.name.toLowerCase().includes(query)
        );
      }
      return {
        songs: list,
        total: list.length,
        page: params.page || 1,
        limit: params.limit || 20,
      };
    }
  },

  get: async (id: number): Promise<Song> => {
    try {
      return await request<Song>(`/songs/${id}`);
    } catch {
      const found = FALLBACK_SONGS.find(s => s.id === id);
      if (found) return found;
      return FALLBACK_SONGS[0];
    }
  },

  stream: (id: number) => {
    const s = FALLBACK_SONGS.find(item => item.id === id);
    if (s && s.audio_url) return s.audio_url;
    return `${BASE}/songs/${id}/stream`;
  },

  dna: async (id: number) => {
    try {
      return await request(`/songs/${id}/dna`);
    } catch {
      const s = FALLBACK_SONGS.find(item => item.id === id) || FALLBACK_SONGS[0];
      return {
        song_id: s.id,
        track_title: s.title,
        artist_name: s.artist?.name,
        bpm: s.bpm,
        energy: s.energy,
        valence: s.valence,
        dna_hash: `0x${s.id.toString(16).padStart(8, '0')}`,
        dna_bars: [0.8, 0.45, 0.92, 0.61, 0.73, 0.52, 0.88, 0.65],
      };
    }
  },

  trending: async (): Promise<Song[]> => {
    try {
      return await request<Song[]>('/songs/trending');
    } catch {
      return FALLBACK_SONGS;
    }
  },

  searchLive: async (query: string, limit = 20): Promise<{ songs: Song[]; query: string; count: number }> => {
    if (!query.trim()) {
      return { songs: FALLBACK_SONGS.slice(0, limit), query: '', count: FALLBACK_SONGS.length };
    }
    try {
      return await request<{ songs: Song[]; query: string; count: number }>(
        `/songs/live-search?q=${encodeURIComponent(query)}&limit=${limit}`
      );
    } catch {
      // Live iTunes API query (Worldwide CDN, CORS enabled)
      try {
        const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(query.trim())}&entity=song&limit=${limit}`;
        const resp = await fetch(itunesUrl);
        if (resp.ok) {
          const data = await resp.json();
          const mapped = (data.results || []).map(mapItunesTrack);
          return { songs: mapped, query, count: mapped.length };
        }
      } catch (itunesErr) {
        console.warn('iTunes direct query failed', itunesErr);
      }

      // Filter local fallback catalog
      const q = query.toLowerCase();
      const localMatches = FALLBACK_SONGS.filter(s =>
        s.title.toLowerCase().includes(q) || s.artist?.name.toLowerCase().includes(q)
      );
      return { songs: localMatches, query, count: localMatches.length };
    }
  },

  genres: async (): Promise<string[]> => {
    try {
      return await request<string[]>('/genres');
    } catch {
      return ['Bollywood', 'Tamil Hits', 'Synthwave', 'Soundtrack', 'Electronic', 'Lo-Fi Chill', 'Pop'];
    }
  },
};

// ─── Playlists ─────────────────────────────────────────────────────────────

export const playlists = {
  list: () => request('/playlists').catch(() => []),

  create: (data: { name: string; description?: string; is_public?: boolean }) =>
    request('/playlists', { method: 'POST', body: JSON.stringify(data) }).catch(() => ({ id: Date.now(), ...data })),

  get: (id: number) => request(`/playlists/${id}`).catch(() => ({ id, name: 'Favorites', songs: FALLBACK_SONGS })),

  update: (id: number, data: { name?: string; description?: string; is_public?: boolean }) =>
    request(`/playlists/${id}`, { method: 'PUT', body: JSON.stringify(data) }).catch(() => ({ id, ...data })),

  delete: (id: number) => request(`/playlists/${id}`, { method: 'DELETE' }).catch(() => ({ ok: true })),

  addSong: (playlistId: number, songId: number) =>
    request(`/playlists/${playlistId}/songs`, {
      method: 'POST',
      body: JSON.stringify({ song_id: songId }),
    }).catch(() => ({ ok: true })),

  removeSong: (playlistId: number, songId: number) =>
    request(`/playlists/${playlistId}/songs/${songId}`, { method: 'DELETE' }).catch(() => ({ ok: true })),

  getByShareToken: (token: string) => request(`/share/playlist/${token}`).catch(() => ({ token, name: 'Shared Mix', songs: FALLBACK_SONGS })),
};

// ─── Recommendations ───────────────────────────────────────────────────────

export const recommendations = {
  standard: () => request('/recommendations').catch(() => ({ songs: FALLBACK_SONGS.slice(0, 6) })),
  anti: ()      => request('/recommendations/anti').catch(() => ({ songs: FALLBACK_SONGS.slice(3, 8) })),
  canvas: ()    => request('/recommendations/canvas').catch(() => ({ songs: FALLBACK_SONGS })),
  context: (tag: string) => request(`/recommendations/context?tag=${encodeURIComponent(tag)}`).catch(() => ({ songs: FALLBACK_SONGS })),
};

// ─── History + Trace ───────────────────────────────────────────────────────

export const history = {
  log: (data: {
    song_id: number;
    play_duration_seconds?: number;
    completed?: boolean;
    context_tags?: string;
  }) => request('/history', { method: 'POST', body: JSON.stringify(data) }).catch(() => ({ ok: true })),

  trace: () => request('/history/trace').catch(() => ({
    nodes: FALLBACK_SONGS.map(s => ({
      song_id: s.id,
      title: s.title,
      artist: s.artist?.name,
      genre: s.genre,
      acoustic_x: s.acoustic_x,
      acoustic_y: s.acoustic_y,
      timestamp: new Date().toISOString(),
    })),
    divergence_score: 0.84,
  })),
};

// ─── Context Tags ──────────────────────────────────────────────────────────

export const tags = {
  list: () => request('/tags').catch(() => []),
  add: (song_id: number, tag_name: string) =>
    request('/tags', { method: 'POST', body: JSON.stringify({ song_id, tag_name }) }).catch(() => ({ ok: true })),
  delete: (id: number) => request(`/tags/${id}`, { method: 'DELETE' }).catch(() => ({ ok: true })),
};

export { APIError };
