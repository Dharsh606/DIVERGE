import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { searchYouTubeMusic } from '$lib/server/youtube';

export const GET: RequestHandler = async ({ url }) => {
  const query = url.searchParams.get('q') || url.searchParams.get('search') || '';
  const limit = Math.min(30, Math.max(1, Number(url.searchParams.get('limit') || 25)));

  if (!query.trim()) {
    return json({ songs: [], query: '', count: 0 });
  }

  try {
    const songs = await searchYouTubeMusic(query, limit);
    return json(
      { songs, query, count: songs.length },
      {
        headers: {
          'Cache-Control': 'public, max-age=600, stale-while-revalidate=1200'
        }
      }
    );
  } catch (err: any) {
    return json(
      { error: err?.message || 'Search failed', songs: [], query, count: 0 },
      { status: 500 }
    );
  }
};
