import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { searchYouTubeMusic } from '$lib/server/youtube';

export const GET: RequestHandler = async () => {
  try {
    const songs = await searchYouTubeMusic('Acoustic Masterpieces and Indie Songs', 12);
    return json(
      {
        songs,
        reason: 'Curated based on your high acoustic depth and harmonic preferences.'
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=600, stale-while-revalidate=1200'
        }
      }
    );
  } catch (err: any) {
    return json({ songs: [], reason: '' }, { status: 500 });
  }
};
