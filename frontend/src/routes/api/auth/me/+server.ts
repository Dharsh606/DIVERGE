import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ cookies }) => {
  const token = cookies.get('token');
  if (token && token.startsWith('diverge_')) {
    try {
      const raw = Buffer.from(token.replace('diverge_', ''), 'base64').toString('utf-8');
      const user = JSON.parse(raw);
      return json(user);
    } catch {}
  }
  return json({ error: 'Unauthorized' }, { status: 401 });
};
