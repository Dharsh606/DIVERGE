import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

function stringHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) || 101;
}

export const POST: RequestHandler = async ({ request, cookies }) => {
  try {
    const body = await request.json().catch(() => ({}));
    const cleanEmail = String(body.email || 'member@diverge.stream').trim();
    const cleanUsername = String(body.username || cleanEmail.split('@')[0] || 'StudioMember').trim();

    const user = {
      id: stringHash(cleanEmail),
      username: cleanUsername,
      email: cleanEmail,
      avatar_url: '',
      created_at: new Date().toISOString()
    };

    const token = 'diverge_' + Buffer.from(JSON.stringify(user)).toString('base64');

    cookies.set('token', token, {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30
    });

    return json({ user, token });
  } catch (err: any) {
    return json({ error: 'Registration failed' }, { status: 400 });
  }
};
