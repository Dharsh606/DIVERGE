import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
  return json(
    ['Bollywood', 'Tamil Hits', 'Punjabi', 'Telugu Hits', 'Soundtrack', 'Synthwave', 'Lo-Fi Chill', 'Pop'],
    {
      headers: {
        'Cache-Control': 'public, max-age=86400'
      }
    }
  );
};
