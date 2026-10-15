// DIVERGE — Offline Storage Service
// Powered by browser IndexedDB for local audio storage and playback without internet

import type { Song } from '$lib/types';

const DB_NAME = 'diverge_offline_db';
const DB_VERSION = 1;
const STORE_NAME = 'tracks';

interface OfflineRecord {
  id: number;
  song: Song;
  audioBlob: Blob;
  savedAt: number;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported in this environment'));
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export const offlineStorage = {
  async saveTrack(song: Song): Promise<void> {
    const db = await openDB();
    const streamUrl = `/api/songs/${song.id}/stream`;

    // Fetch audio bytes
    const res = await fetch(streamUrl);
    if (!res.ok) throw new Error('Failed to download audio for offline use');
    const audioBlob = await res.blob();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const record: OfflineRecord = {
        id: song.id,
        song,
        audioBlob,
        savedAt: Date.now(),
      };
      const req = store.put(record);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  },

  async isTrackSaved(songId: number): Promise<boolean> {
    try {
      const db = await openDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(songId);
        req.onsuccess = () => resolve(!!req.result);
        req.onerror = () => resolve(false);
      });
    } catch {
      return false;
    }
  },

  async getTrackBlobUrl(songId: number): Promise<string | null> {
    try {
      const db = await openDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(songId);
        req.onsuccess = () => {
          if (req.result && req.result.audioBlob) {
            resolve(URL.createObjectURL(req.result.audioBlob));
          } else {
            resolve(null);
          }
        };
        req.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  },

  async getAllTracks(): Promise<Song[]> {
    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();
        req.onsuccess = () => {
          const songs = (req.result || []).map((r: OfflineRecord) => r.song);
          resolve(songs);
        };
        req.onerror = () => reject(req.error);
      });
    } catch {
      return [];
    }
  },

  async removeTrack(songId: number): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(songId);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  },

  async getStorageEstimate(): Promise<{ usedBytes: number; quotaBytes: number }> {
    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      return {
        usedBytes: estimate.usage || 0,
        quotaBytes: estimate.quota || 0,
      };
    }
    return { usedBytes: 0, quotaBytes: 0 };
  },
};
