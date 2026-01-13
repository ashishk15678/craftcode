import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { generateCliToken } from '$lib/server/cli-auth';

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) {
    return json({ error: 'Authentication required' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const deviceName = body.deviceName || 'CLI';

  const token = await generateCliToken(locals.user.id, deviceName);

  return json({
    token,
    user: {
      id: locals.user.id,
      email: locals.user.email,
      name: locals.user.name
    }
  });
};
