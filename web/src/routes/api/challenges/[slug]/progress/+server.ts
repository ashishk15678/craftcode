import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';

export const GET: RequestHandler = async ({ params, locals }) => {
  if (!locals.user) {
    return json({ error: 'Authentication required' }, { status: 401 });
  }

  const { slug } = params;

  // Find the challenge
  const challenge = await db.course.findUnique({
    where: { slug },
    include: {
      lessons: {
        orderBy: { order: 'asc' }
      }
    }
  });

  if (!challenge) {
    return json({ error: 'Challenge not found' }, { status: 404 });
  }

  // Get user's progress for this challenge
  const userProgress = await db.userProgress.findMany({
    where: {
      userId: locals.user.id,
      lesson: {
        courseId: challenge.id
      }
    },
    include: {
      lesson: true
    },
    orderBy: {
      lesson: {
        order: 'asc'
      }
    }
  });

  const completedLessonIds = new Set(userProgress.map(p => p.lessonId));
  const totalLessons = challenge.lessons.length;
  const completedCount = userProgress.length;

  // Find current lesson (first incomplete)
  const currentLesson = challenge.lessons.find(
    lesson => !completedLessonIds.has(lesson.id)
  );

  // Find next lesson after current
  const nextLesson = currentLesson 
    ? challenge.lessons.find(l => l.order === currentLesson.order + 1)
    : null;

  const isEnrolled = userProgress.length > 0;
  const isComplete = completedCount === totalLessons && totalLessons > 0;

  return json({
    challenge: {
      id: challenge.id,
      title: challenge.title,
      slug: challenge.slug,
      type: challenge.type,
      difficulty: challenge.difficulty,
      testRunnerType: challenge.testRunnerType
    },
    progress: {
      isEnrolled,
      isComplete,
      completedCount,
      totalLessons,
      percentage: totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0
    },
    currentLesson: currentLesson ? {
      id: currentLesson.id,
      order: currentLesson.order,
      title: currentLesson.title,
      instructionsMd: currentLesson.instructionsMd,
      testScript: currentLesson.testScript,
      testScriptUrl: currentLesson.testScriptUrl
    } : null,
    nextLesson: nextLesson ? {
      id: nextLesson.id,
      order: nextLesson.order,
      title: nextLesson.title
    } : null,
    completedLessons: userProgress.map(p => ({
      id: p.lesson.id,
      order: p.lesson.order,
      title: p.lesson.title,
      completedAt: p.completedAt
    }))
  });
};
