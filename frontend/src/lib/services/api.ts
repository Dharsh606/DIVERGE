// DIVERGE — API Service Layer
// Typed fetch wrapper for the Go backend

const BASE = 'http://localhost:8080/api';

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
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include', // send httpOnly cookie
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new APIError(res.status, err.error || 'Request failed');
  }

  return res.json();
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
  list: (params: { page?: number; limit?: number; genre?: string; search?: string } = {}) => {
    const q = new URLSearchParams();
    if (params.page)   q.set('page',   String(params.page));
    if (params.limit)  q.set('limit',  String(params.limit));
    if (params.genre)  q.set('genre',  params.genre);
    if (params.search) q.set('search', params.search);
    return request(`/songs?${q}`);
  },

  get: (id: number) => request(`/songs/${id}`),

  stream: (id: number) => `${BASE}/songs/${id}/stream`,

  dna: (id: number) => request(`/songs/${id}/dna`),

  trending: () => request('/songs/trending'),

  genres: () => request<string[]>('/genres'),
};

// ─── Playlists ─────────────────────────────────────────────────────────────

export const playlists = {
  list: () => request('/playlists'),

  create: (data: { name: string; description?: string; is_public?: boolean }) =>
    request('/playlists', { method: 'POST', body: JSON.stringify(data) }),

  get: (id: number) => request(`/playlists/${id}`),

  update: (id: number, data: { name?: string; description?: string; is_public?: boolean }) =>
    request(`/playlists/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (id: number) => request(`/playlists/${id}`, { method: 'DELETE' }),

  addSong: (playlistId: number, songId: number) =>
    request(`/playlists/${playlistId}/songs`, {
      method: 'POST',
      body: JSON.stringify({ song_id: songId }),
    }),

  removeSong: (playlistId: number, songId: number) =>
    request(`/playlists/${playlistId}/songs/${songId}`, { method: 'DELETE' }),

  getByShareToken: (token: string) => request(`/share/playlist/${token}`),
};

// ─── Recommendations ───────────────────────────────────────────────────────

export const recommendations = {
  standard: () => request('/recommendations'),
  anti: ()      => request('/recommendations/anti'),
  canvas: ()    => request('/recommendations/canvas'),
  context: (tag: string) => request(`/recommendations/context?tag=${encodeURIComponent(tag)}`),
};

// ─── History + Trace ───────────────────────────────────────────────────────

export const history = {
  log: (data: {
    song_id: number;
    play_duration_seconds?: number;
    completed?: boolean;
    context_tags?: string;
  }) => request('/history', { method: 'POST', body: JSON.stringify(data) }),

  trace: () => request('/history/trace'),
};

// ─── Context Tags ──────────────────────────────────────────────────────────

export const tags = {
  list: ()                            => request('/tags'),
  add: (song_id: number, tag_name: string) =>
    request('/tags', { method: 'POST', body: JSON.stringify({ song_id, tag_name }) }),
  delete: (id: number)                => request(`/tags/${id}`, { method: 'DELETE' }),
};

export { APIError };
