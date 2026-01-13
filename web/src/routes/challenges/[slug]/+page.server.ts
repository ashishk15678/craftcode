import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';

export const load: PageServerLoad = async ({ params, locals }) => {
  const challenge = await db.challenge.findUnique({
    where: { slug: params.slug },
    include: {
      author: {
        select: { id: true, name: true }
      },
      stages: {
        orderBy: { order: 'asc' },
        select: {
          id: true,
          order: true,
          title: true,
          instructionsMd: true,
          ...(locals.user ? {
            progress: {
              where: { userId: locals.user.id },
              select: { id: true }
            }
          } : {})
        }
      }
    }
  });

  if (!challenge) {
    throw error(404, 'Challenge not found');
  }

  if (!challenge.isPublished && challenge.authorId !== locals.user?.id) {
    throw error(404, 'Challenge not found');
  }

  return {
    challenge: {
      id: challenge.id,
      title: challenge.title,
      slug: challenge.slug,
      description: challenge.description,
      difficulty: challenge.difficulty,
      iconUrl: challenge.iconUrl,
      coverUrl: challenge.coverUrl,
      authorName: challenge.author.name,
      isOwner: challenge.authorId === locals.user?.id
    },
    stages: challenge.stages.map(s => ({
      id: s.id,
      order: s.order,
      title: s.title,
      instructionsMd: s.instructionsMd,
      isCompleted: 'progress' in s && Array.isArray(s.progress) && s.progress.length > 0
    }))
  };
};
