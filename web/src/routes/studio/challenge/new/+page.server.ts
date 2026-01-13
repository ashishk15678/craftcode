import type { Actions } from './$types';
import { redirect, fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const actions: Actions = {
  default: async ({ request, locals }) => {
    if (!locals.user) {
      throw redirect(303, '/auth/login');
    }

    const formData = await request.formData();
    const title = formData.get('title')?.toString();
    const description = formData.get('description')?.toString();
    const difficulty = formData.get('difficulty')?.toString();

    if (!title || !description || !difficulty) {
      return fail(400, { error: 'All fields are required' });
    }

    // Generate slug
    let slug = slugify(title);
    
    // Check if slug exists and make unique
    const existing = await db.challenge.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    // Create challenge
    const challenge = await db.challenge.create({
      data: {
        title,
        slug,
        description,
        difficulty,
        authorId: locals.user.id
      }
    });

    throw redirect(303, `/studio/challenge/${challenge.id}`);
  }
};
