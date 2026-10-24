// DIVERGE — YouTube Music InnerTube Search Service
// Ultra-fast, zero-key, full-catalog search engine for global & Indian music

import type { Song } from '$lib/types';

interface CacheEntry {
  timestamp: number;
  songs: Song[];
}

const SEARCH_CACHE = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

function stringToId(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) || 1000;
}

function parseDuration(text: string): number {
  if (!text) return 210;
  const m = text.match(/(\d{1,2}):(\d{2}):(\d{2})/) || text.match(/(\d{1,2}):(\d{2})/);
  if (!m) return 210;
  if (m.length === 4) {
    return parseInt(m[1], 10) * 3600 + parseInt(m[2], 10) * 60 + parseInt(m[3], 10);
  }
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
}

function cleanTitle(raw: string): string {
  if (!raw) return 'Unknown Title';
  return raw
    .replace(/\s*[\(\[]\s*(official|music|video|audio|lyric|hd|4k|full song|original|remastered).+?[\)\]]/gi, '')
    .trim();
}

export async function searchYouTubeMusic(query: string, limit = 25): Promise<Song[]> {
  const cleanQ = query.trim();
  if (!cleanQ) return [];

  const cacheKey = `${cleanQ.toLowerCase()}:${limit}`;
  const cached = SEARCH_CACHE.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.songs;
  }

  const results: Song[] = [];
  const seenIds = new Set<string>();

  // ─── 1. Query YouTube Music InnerTube (WEB_REMIX) ───────────
  try {
    const ytmRes = await fetch('https://music.youtube.com/youtubei/v1/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: JSON.stringify({
        context: {
          client: {
            clientName: 'WEB_REMIX',
            clientVersion: '1.20240101.01.00',
            hl: 'en',
            gl: 'IN'
          }
        },
        query: cleanQ
      }),
      signal: AbortSignal.timeout(4500)
    });

    if (ytmRes.ok) {
      const data = await ytmRes.json();
      const sections =
        data?.contents?.tabbedSearchResultsRenderer?.tabs?.[0]?.tabRenderer?.content
          ?.sectionListRenderer?.contents || [];

      for (const s of sections) {
        // Check top hit card
        const card = s.musicCardShelfRenderer;
        if (card) {
          const cardTitle = card.title?.runs?.[0]?.text;
          const cardVideoId =
            card.title?.runs?.[0]?.navigationEndpoint?.watchEndpoint?.videoId ||
            card.onTap?.watchEndpoint?.videoId;
          const cardArtist = card.subtitle?.runs?.map((r: any) => r.text).join('') || 'Featured Artist';
          const cardThumb =
            card.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails?.slice(-1)[0]?.url || '';

          if (cardTitle && cardVideoId && !seenIds.has(cardVideoId)) {
            seenIds.add(cardVideoId);
            const idNum = stringToId(cardVideoId);
            results.push({
              id: idNum,
              youtube_id: cardVideoId,
              title: cleanTitle(cardTitle),
              artist: { id: idNum + 1, name: cardArtist, bio: '', image_url: cardThumb },
              album: { id: idNum + 2, title: cardTitle, cover_url: cardThumb, artist_id: idNum + 1, release_year: 2024 },
              duration_seconds: parseDuration(cardArtist) || 215,
              audio_url: `youtube:${cardVideoId}`,
              genre: 'Indian Hits',
              bpm: 118,
              energy: 0.85,
              valence: 0.72,
              danceability: 0.76,
              acoustic_x: Math.sin(idNum * 0.17),
              acoustic_y: Math.cos(idNum * 0.23),
              acoustic_z: Math.sin(idNum * 0.31)
            });
          }
        }

        // Check list items
        const list = s?.itemSectionRenderer?.contents || s?.musicShelfRenderer?.contents || [];
        for (const it of list) {
          const item = it?.musicResponsiveListItemRenderer;
          if (!item) continue;
          const flexCols = item.flexColumns || [];
          const title = flexCols[0]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.[0]?.text;
          const videoId =
            flexCols[0]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.[0]
              ?.navigationEndpoint?.watchEndpoint?.videoId ||
            item.overlay?.musicItemThumbnailOverlayRenderer?.content?.musicPlayButtonRenderer
              ?.playNavigationEndpoint?.watchEndpoint?.videoId ||
            item.playlistItemData?.videoId;

          const artistRuns = flexCols[1]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs || [];
          const subtitle = artistRuns.map((r: any) => r.text).join('');
          const thumb =
            item.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails?.slice(-1)[0]?.url || '';

          if (title && videoId && !seenIds.has(videoId)) {
            seenIds.add(videoId);
            const idNum = stringToId(videoId);
            const duration = parseDuration(subtitle);
            const artistName = subtitle.split('•')[1]?.trim() || subtitle.split('•')[0]?.trim() || 'Artist';

            results.push({
              id: idNum,
              youtube_id: videoId,
              title: cleanTitle(title),
              artist: { id: idNum + 1, name: artistName, bio: '', image_url: thumb },
              album: { id: idNum + 2, title: title, cover_url: thumb, artist_id: idNum + 1, release_year: 2024 },
              duration_seconds: duration,
              audio_url: `youtube:${videoId}`,
              genre: 'Soundtrack',
              bpm: 122,
              energy: 0.80,
              valence: 0.68,
              danceability: 0.74,
              acoustic_x: Math.sin(idNum * 0.17),
              acoustic_y: Math.cos(idNum * 0.23),
              acoustic_z: Math.sin(idNum * 0.31)
            });
          }
        }
      }
    }
  } catch (err) {
    console.warn('YouTube Music WEB_REMIX search error:', err);
  }

  // ─── 2. Fallback or augment with standard YouTube Search (WEB) ───
  if (results.length < 8) {
    try {
      const ytWebRes = await fetch('https://www.youtube.com/youtubei/v1/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        body: JSON.stringify({
          context: {
            client: {
              clientName: 'WEB',
              clientVersion: '2.20240101.01.00',
              hl: 'en',
              gl: 'IN'
            }
          },
          query: `${cleanQ} song`
        }),
        signal: AbortSignal.timeout(4500)
      });

      if (ytWebRes.ok) {
        const data = await ytWebRes.json();
        const contents =
          data?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer
            ?.contents?.[0]?.itemSectionRenderer?.contents || [];

        for (const c of contents) {
          const v = c.videoRenderer;
          if (!v || !v.videoId || seenIds.has(v.videoId)) continue;

          const durationSec = parseDuration(v.lengthText?.simpleText || '');
          // Filter out full 2-3 hour movies if user is searching for songs, unless duration is normal track (< 15 mins)
          if (durationSec > 900) continue;

          seenIds.add(v.videoId);
          const idNum = stringToId(v.videoId);
          const title = v.title?.runs?.[0]?.text || cleanQ;
          const artist = v.ownerText?.runs?.[0]?.text || 'DIVERGE Artist';
          const thumbs = v.thumbnail?.thumbnails || [];
          let thumb = thumbs[thumbs.length - 1]?.url || '';
          if (thumb.startsWith('//')) thumb = `https:${thumb}`;

          results.push({
            id: idNum,
            youtube_id: v.videoId,
            title: cleanTitle(title),
            artist: { id: idNum + 1, name: artist, bio: '', image_url: thumb },
            album: { id: idNum + 2, title: title.split('|')[0].trim(), cover_url: thumb, artist_id: idNum + 1, release_year: 2024 },
            duration_seconds: durationSec,
            audio_url: `youtube:${v.videoId}`,
            genre: 'Soundtrack',
            bpm: 124,
            energy: 0.88,
            valence: 0.70,
            danceability: 0.79,
            acoustic_x: Math.sin(idNum * 0.17),
            acoustic_y: Math.cos(idNum * 0.23),
            acoustic_z: Math.sin(idNum * 0.31)
          });

          if (results.length >= limit) break;
        }
      }
    } catch (err) {
      console.warn('YouTube WEB fallback search error:', err);
    }
  }

  const finalResults = results.slice(0, limit);
  if (finalResults.length > 0) {
    SEARCH_CACHE.set(cacheKey, { timestamp: Date.now(), songs: finalResults });
  }

  return finalResults;
}
