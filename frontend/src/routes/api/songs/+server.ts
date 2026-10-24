import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { searchYouTubeMusic } from '$lib/server/youtube';

export const GET: RequestHandler = async ({ url }) => {
  const genre = url.searchParams.get('genre') || '';
  const search = url.searchParams.get('search') || '';
  const limit = Math.min(30, Math.max(1, Number(url.searchParams.get('limit') || 20)));
  const page = Math.max(1, Number(url.searchParams.get('page') || 1));

  let query = search.trim();
  if (!query) {
    if (genre.trim()) {
      query = `${genre.trim()} songs`;
    } else {
      query = 'Top Indian and Global Hit Songs 2024';
    }
  }

  try {
    const songs = await searchYouTubeMusic(query, limit);
    return json(
      {
        songs,
        meta: {
          page,
          limit,
          total: songs.length
        }
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=600, stale-while-revalidate=1200'
        }
      }
    );
  } catch (err: any) {
    return json(
      {
        songs: [],
        meta: { page: 1, limit, total: 0 },
        error: err?.message || 'Failed to load songs'
      },
      { status: 500 }
    );
  }
};
