import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { searchYouTubeMusic } from '$lib/server/youtube';

export const GET: RequestHandler = async () => {
  try {
    const songs = await searchYouTubeMusic('Trending Songs India 2024', 20);
    return json(songs, {
      headers: {
        'Cache-Control': 'public, max-age=600, stale-while-revalidate=1200'
      }
    });
  } catch (err: any) {
    return json([], { status: 500 });
  }
};
