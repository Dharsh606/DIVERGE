// DIVERGE — Shared TypeScript types
// All entities mirror the Go backend models

export interface User {
  id: number;
  username: string;
  email: string;
  avatar_url: string;
  created_at: string;
}

export interface Artist {
  id: number;
  name: string;
  bio: string;
  image_url: string;
}

export interface Album {
  id: number;
  title: string;
  artist_id: number;
  artist?: Artist;
  cover_url: string;
  release_year: number;
}

export interface Song {
  id: number;
  title: string;
  album_id: number;
  album?: Album;
  artist_id: number;
  artist?: Artist;
  duration_seconds: number;
  audio_url: string;
  jamendo_id: string;
  bpm: number;
  musical_key: string;
  energy_score: number;  // 0.0–1.0
  mood_score: number;    // 0.0–1.0
  tempo_category: 'slow' | 'mid' | 'fast';
  genre: string;
  share_token: string;
}

export interface TrackDNA {
  id: number;
  bpm: number;
  musical_key: string;
  energy_score: number;
  mood_score: number;
  tempo_category: string;
  genre: string;
}

export interface Playlist {
  id: number;
  user_id: number;
  user?: User;
  name: string;
  description: string;
  cover_url: string;
  is_public: boolean;
  share_token: string;
  songs?: Song[];
  created_at: string;
  updated_at: string;
}

export interface ListeningHistory {
  id: number;
  user_id: number;
  song_id: number;
  song?: Song;
  played_at: string;
  play_duration_seconds: number;
  completed: boolean;
  context_tags: string;
}

export interface ContextTag {
  id: number;
  user_id: number;
  song_id: number;
  song?: Song;
  tag_name: string;
  created_at: string;
}

export interface DivergeSession {
  id: number;
  host_user_id: number;
  host?: User;
  name: string;
  share_code: string;
  current_song_id?: number;
  current_song?: Song;
  current_position_seconds: number;
  is_playing: boolean;
}

// API response types
export interface PaginatedSongs {
  songs: Song[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface RecommendationResult {
  songs: Song[];
  reason?: string; // Anti-algorithm reason string
}

export interface TraceNode {
  id: number;
  song_id: number;
  title: string;
  artist_name: string;
  cover_url: string;
  genre: string;
  played_at: string;
  context_tags: string[];
  parent_id?: number;
  depth: number;
  is_branch: boolean;
}

export interface CanvasPoint {
  id: number;
  title: string;
  artist?: Artist;
  x: number;    // energy_score
  y: number;    // mood_score
  bpm: number;
  genre: string;
  tempo: string;
}

// Player state
export type PlayerState = 'idle' | 'loading' | 'playing' | 'paused' | 'error';
export type RepeatMode = 'none' | 'one' | 'all';

// WebSocket message types for Diverge Sessions
export type SessionEventType =
  | 'join'
  | 'leave'
  | 'play'
  | 'pause'
  | 'seek'
  | 'queue_add'
  | 'queue_remove'
  | 'queue_reorder'
  | 'sync_state';

export interface SessionEvent {
  type: SessionEventType;
  user_id?: number;
  username?: string;
  song_id?: number;
  position?: number;
  queue?: Song[];
}
