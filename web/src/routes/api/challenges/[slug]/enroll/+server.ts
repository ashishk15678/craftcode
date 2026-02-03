import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';

export const POST: RequestHandler = async ({ params, locals }) => {
  if (!locals.user) {
    return json({ error: 'Authentication required' }, { status: 401 });
  }

  const { slug } = params;

  // Find the challenge
  const challenge = await db.course.findUnique({
    where: { slug },
    include: {
      lessons: {
        orderBy: { order: 'asc' },
        take: 1
      }
    }
  });

  if (!challenge) {
    return json({ error: 'Challenge not found' }, { status: 404 });
  }

  if (!challenge.isPublished) {
    return json({ error: 'Challenge is not published' }, { status: 403 });
  }

  if (challenge.lessons.length === 0) {
    return json({ error: 'Challenge has no lessons' }, { status: 400 });
  }

  const firstLesson = challenge.lessons[0];

  // Check if already enrolled (has any progress)
  const existingProgress = await db.userProgress.findFirst({
    where: {
      userId: locals.user.id,
      lesson: {
        courseId: challenge.id
      }
    }
  });

  if (existingProgress) {
    return json({
      message: 'Already enrolled',
      alreadyEnrolled: true,
      challenge: {
        id: challenge.id,
        title: challenge.title,
        slug: challenge.slug
      }
    });
  }

  // Enrollment is implicit - no separate enrollment record needed
  // User is considered enrolled when they start working on lessons
  return json({
    success: true,
    message: 'Enrolled successfully',
    challenge: {
      id: challenge.id,
      title: challenge.title,
      slug: challenge.slug,
      type: challenge.type,
      difficulty: challenge.difficulty,
      testRunnerType: challenge.testRunnerType
    },
    firstLesson: {
      id: firstLesson.id,
      order: firstLesson.order,
      title: firstLesson.title
    }
  });
};
