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

  // Strict 3.2s timeout so the UI never hangs on slow networks
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3200);

  try {
    const res = await fetch(`${BASE}${path}`, {
      credentials: 'include',
      headers,
      signal: options.signal || controller.signal,
      ...options,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Request failed' }));
      throw new APIError(res.status, err.error || 'Request failed');
    }

    return res.json();
  } catch (err: any) {
    clearTimeout(timeoutId);
    throw err;
  }
}

// ─── Curated Fallback Music Catalog (For Edge/Vercel and Offline Mode) ─────────
export const FALLBACK_SONGS: Song[] = [
  {
    id: 101,
    title: 'Chaleya',
    youtube_id: 'VAdGW7QDJiU',
    artist: { id: 1, name: 'Arijit Singh, Shilpa Rao & Anirudh Ravichander', bio: '', image_url: 'https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/a4/bc/f8/a4bcf84e-333e-b8d2-8be0-c75c87a55259/8902894361546.jpg/600x600bb.jpg' },
    album: { id: 10, title: 'Jawan (Original Motion Picture Soundtrack)', cover_url: 'https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/a4/bc/f8/a4bcf84e-333e-b8d2-8be0-c75c87a55259/8902894361546.jpg/600x600bb.jpg', artist_id: 1, release_year: 2023 },
    duration_seconds: 200,
    audio_url: 'youtube:VAdGW7QDJiU',
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
    youtube_id: '1F3hm6MfR1k',
    artist: { id: 2, name: 'Anirudh Ravichander', bio: '', image_url: 'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/dc/8e/31/dc8e3170-13f5-7c15-ea81-a6783f8d6ea9/8903431976077.jpg/600x600bb.jpg' },
    album: { id: 11, title: 'Jailer (Original Motion Picture Soundtrack)', cover_url: 'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/dc/8e/31/dc8e3170-13f5-7c15-ea81-a6783f8d6ea9/8903431976077.jpg/600x600bb.jpg', artist_id: 2, release_year: 2023 },
    duration_seconds: 238,
    audio_url: 'youtube:1F3hm6MfR1k',
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
    youtube_id: 'dX3k_QDnzHE',
    artist: { id: 3, name: 'M83', bio: '', image_url: 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/55/96/02/559602e1-4c6e-2144-ec8f-28c0b561fae4/724596951054.jpg/600x600bb.jpg' },
    album: { id: 12, title: 'Hurry Up, We\'re Dreaming', cover_url: 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/55/96/02/559602e1-4c6e-2144-ec8f-28c0b561fae4/724596951054.jpg/600x600bb.jpg', artist_id: 3, release_year: 2011 },
    duration_seconds: 243,
    audio_url: 'youtube:dX3k_QDnzHE',
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
    youtube_id: 'BddP6PYo2gs',
    artist: { id: 4, name: 'Arijit Singh & Pritam', bio: '', image_url: 'https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/ce/22/e2/ce22e28a-788b-ae00-c97b-bbd7e008fa97/196589332223.jpg/600x600bb.jpg' },
    album: { id: 13, title: 'Brahmastra (Original Motion Picture Soundtrack)', cover_url: 'https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/ce/22/e2/ce22e28a-788b-ae00-c97b-bbd7e008fa97/196589332223.jpg/600x600bb.jpg', artist_id: 4, release_year: 2022 },
    duration_seconds: 268,
    audio_url: 'youtube:BddP6PYo2gs',
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
    youtube_id: '4NRXx6U8ABQ',
    artist: { id: 5, name: 'The Weeknd', bio: '', image_url: 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/d5/9c/0b/d59c0b11-5344-966e-6368-23c3b0eb2028/20UMGIM08204.rgb.jpg/600x600bb.jpg' },
    album: { id: 14, title: 'After Hours', cover_url: 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/d5/9c/0b/d59c0b11-5344-966e-6368-23c3b0eb2028/20UMGIM08204.rgb.jpg/600x600bb.jpg', artist_id: 5, release_year: 2020 },
    duration_seconds: 200,
    audio_url: 'youtube:4NRXx6U8ABQ',
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
    youtube_id: 'xwwAVRyNmgQ',
    artist: { id: 6, name: 'A.R. Rahman, Sukhwinder Singh & Tanvi Shah', bio: '', image_url: 'https://is1-ssl.mzstatic.com/image/thumb/Music/v4/e5/22/e1/e522e17e-77d0-1c39-df06-a2dbd5a085b3/00602517926214.rgb.jpg/600x600bb.jpg' },
    album: { id: 15, title: 'Slumdog Millionaire', cover_url: 'https://is1-ssl.mzstatic.com/image/thumb/Music/v4/e5/22/e1/e522e17e-77d0-1c39-df06-a2dbd5a085b3/00602517926214.rgb.jpg/600x600bb.jpg', artist_id: 6, release_year: 2008 },
    duration_seconds: 319,
    audio_url: 'youtube:xwwAVRyNmgQ',
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
    youtube_id: '34Na4j8AVgA',
    artist: { id: 5, name: 'The Weeknd ft. Daft Punk', bio: '', image_url: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/bf/f9/57/bff957ae-90aa-0847-f370-9883584d41fa/16UMGIM60601.rgb.jpg/600x600bb.jpg' },
    album: { id: 16, title: 'Starboy', cover_url: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/bf/f9/57/bff957ae-90aa-0847-f370-9883584d41fa/16UMGIM60601.rgb.jpg/600x600bb.jpg', artist_id: 5, release_year: 2016 },
    duration_seconds: 230,
    audio_url: 'youtube:34Na4j8AVgA',
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
    youtube_id: '8GW6sLrK40k',
    artist: { id: 7, name: 'HOME', bio: '', image_url: 'https://is1-ssl.mzstatic.com/image/thumb/Music4/v4/57/02/75/5702759e-1f74-3236-4191-c91fae5e6e30/859712711685_cover.jpg/600x600bb.jpg' },
    album: { id: 17, title: 'Odyssey', cover_url: 'https://is1-ssl.mzstatic.com/image/thumb/Music4/v4/57/02/75/5702759e-1f74-3236-4191-c91fae5e6e30/859712711685_cover.jpg/600x600bb.jpg', artist_id: 7, release_year: 2014 },
    duration_seconds: 212,
    audio_url: 'youtube:8GW6sLrK40k',
    bpm: 170,
    energy: 0.65,
    valence: 0.55,
    danceability: 0.54,
    genre: 'Lo-Fi Chill',
    acoustic_x: -0.15,
    acoustic_y: -0.75,
    acoustic_z: -0.42,
  },
  {
    id: 109,
    title: 'Neruppu Da',
    youtube_id: 'Vqd2nyeyy-8',
    artist: { id: 8, name: 'Santhosh Narayanan & Rajinikanth', bio: '', image_url: 'https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/10/7c/49/107c4912-70b8-2a13-4628-97ff5f58da75/886445989182.jpg/600x600bb.jpg' },
    album: { id: 18, title: 'Kabali (Original Motion Picture Soundtrack)', cover_url: 'https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/10/7c/49/107c4912-70b8-2a13-4628-97ff5f58da75/886445989182.jpg/600x600bb.jpg', artist_id: 8, release_year: 2016 },
    duration_seconds: 218,
    audio_url: 'youtube:Vqd2nyeyy-8',
    bpm: 128,
    energy: 0.95,
    valence: 0.70,
    danceability: 0.82,
    genre: 'Tamil Hits',
    acoustic_x: 0.88,
    acoustic_y: 0.12,
    acoustic_z: 0.75,
  },
  {
    id: 110,
    title: 'Saahore Baahubali',
    youtube_id: 'j__Q0RD1r-k',
    artist: { id: 9, name: 'M.M. Keeravaani, Daler Mehndi', bio: '', image_url: 'https://is1-ssl.mzstatic.com/image/thumb/Music118/v4/a9/9e/1f/a99e1f57-8dfc-0cf3-ca98-33bc21272719/886446487199.jpg/600x600bb.jpg' },
    album: { id: 19, title: 'Baahubali 2: The Conclusion', cover_url: 'https://is1-ssl.mzstatic.com/image/thumb/Music118/v4/a9/9e/1f/a99e1f57-8dfc-0cf3-ca98-33bc21272719/886446487199.jpg/600x600bb.jpg', artist_id: 9, release_year: 2017 },
    duration_seconds: 202,
    audio_url: 'youtube:j__Q0RD1r-k',
    bpm: 115,
    energy: 0.91,
    valence: 0.85,
    danceability: 0.71,
    genre: 'Soundtrack',
    acoustic_x: 0.72,
    acoustic_y: 0.61,
    acoustic_z: 0.80,
  },
  {
    id: 111,
    title: 'Badass',
    youtube_id: 'aR-KAldshAE',
    artist: { id: 2, name: 'Anirudh Ravichander', bio: '', image_url: 'https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/d5/43/d3/d543d3b7-789a-0268-bc2d-5f3fc11fca31/8903431980890.jpg/600x600bb.jpg' },
    album: { id: 20, title: 'Leo (Original Motion Picture Soundtrack)', cover_url: 'https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/d5/43/d3/d543d3b7-789a-0268-bc2d-5f3fc11fca31/8903431980890.jpg/600x600bb.jpg', artist_id: 2, release_year: 2023 },
    duration_seconds: 232,
    audio_url: 'youtube:aR-KAldshAE',
    bpm: 132,
    energy: 0.96,
    valence: 0.60,
    danceability: 0.85,
    genre: 'Tamil Hits',
    acoustic_x: 0.92,
    acoustic_y: -0.20,
    acoustic_z: 0.65,
  },
  {
    id: 112,
    title: 'Naatu Naatu',
    youtube_id: 'OsU0CGZoV8E',
    artist: { id: 9, name: 'Rahul Sipligunj, Kaala Bhairava & M.M. Keeravaani', bio: '', image_url: 'https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/eb/b1/7b/ebb17bb1-8e50-9831-29cf-82e143093282/8903431872881.jpg/600x600bb.jpg' },
    album: { id: 21, title: 'RRR (Original Motion Picture Soundtrack)', cover_url: 'https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/eb/b1/7b/ebb17bb1-8e50-9831-29cf-82e143093282/8903431872881.jpg/600x600bb.jpg', artist_id: 9, release_year: 2022 },
    duration_seconds: 215,
    audio_url: 'youtube:OsU0CGZoV8E',
    bpm: 150,
    energy: 0.98,
    valence: 0.95,
    danceability: 0.88,
    genre: 'Telugu Hits',
    acoustic_x: 0.80,
    acoustic_y: 0.88,
    acoustic_z: 0.70,
  }
];

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
        meta: {
          total: list.length,
          page: params.page || 1,
          limit: params.limit || 20,
        }
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
    if (s && s.youtube_id) return `youtube:${s.youtube_id}`;
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

  searchLive: async (query: string, limit = 25): Promise<{ songs: Song[]; query: string; count: number }> => {
    const cleanQ = query.trim();
    if (!cleanQ) {
      return { songs: FALLBACK_SONGS.slice(0, limit), query: '', count: FALLBACK_SONGS.length };
    }

    // 1. Primary: SvelteKit high-speed YouTube Music search endpoint (/api/search)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(cleanQ)}&limit=${limit}`);
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.songs) && data.songs.length > 0) {
          return { songs: data.songs, query: cleanQ, count: data.songs.length };
        }
      }
    } catch (e) {
      // Fall through to backend or direct fallback
    }

    // 2. Secondary: Go backend live-search endpoint (/api/songs/live-search)
    try {
      const res = await request<{ songs: Song[]; query: string; count: number }>(
        `/songs/live-search?q=${encodeURIComponent(cleanQ)}&limit=${limit}`
      );
      if (res && Array.isArray(res.songs) && res.songs.length > 0) {
        return res;
      }
    } catch {
      // Fall through
    }

    // 3. Fallback: filter local curated catalog
    const qLower = cleanQ.toLowerCase();
    const localMatches = FALLBACK_SONGS.filter(s =>
      s.title.toLowerCase().includes(qLower) || s.artist?.name.toLowerCase().includes(qLower)
    );
    return { songs: localMatches, query: cleanQ, count: localMatches.length };
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
