import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
  return json(
    [
      'Bollywood',
      'Tamil Hits',
      'Telugu Hits',
      'Kannada Hits',
      'Punjabi Beats',
      'Hip Hop',
      'Indian Hits',
      'World Pop',
      'A.R. Rahman',
      'Soundtrack',
      'Lo-Fi Chill',
      'Country'
    ],
    {
      headers: {
        'Cache-Control': 'public, max-age=86400'
      }
    }
  );
};
