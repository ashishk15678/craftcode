import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { verifyCliToken } from '$lib/server/auth';
import { db } from '$lib/server/db';

export const POST: RequestHandler = async ({ request }) => {
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    return json({ error: 'Token required' }, { status: 401 });
  }

  const user = await verifyCliToken(token);
  if (!user) {
    return json({ error: 'Invalid or expired token' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  // Accept both 'lessonId' and 'stageId' for backward compatibility
  const lessonId = body.lessonId || body.stageId;

  if (!lessonId) {
    return json({ error: 'lessonId or stageId is required' }, { status: 400 });
  }

  // Verify lesson exists
  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    include: {
      course: {
        select: { id: true, title: true, slug: true }
      }
    }
  });

  if (!lesson) {
    return json({ error: 'Lesson not found' }, { status: 404 });
  }

  // Check if already completed
  const existing = await db.userProgress.findUnique({
    where: {
      userId_lessonId: {
        userId: user.id,
        lessonId
      }
    }
  });

  if (existing) {
    return json({
      message: 'Lesson already completed',
      alreadyCompleted: true
    });
  }

  // Create progress record
  await db.userProgress.create({
    data: {
      userId: user.id,
      lessonId
    }
  });

  // Check if this was the last lesson
  const nextLesson = await db.lesson.findFirst({
    where: {
      courseId: lesson.course.id,
      order: lesson.order + 1
    }
  });

  const totalLessons = await db.lesson.count({
    where: { courseId: lesson.course.id }
  });

  const completedLessons = await db.userProgress.count({
    where: {
      userId: user.id,
      lesson: { courseId: lesson.course.id }
    }
  });

  return json({
    success: true,
    message: `Lesson ${lesson.order} completed!`,
    progress: {
      completed: completedLessons,
      total: totalLessons
    },
    courseComplete: !nextLesson,
    nextLesson: nextLesson ? {
      id: nextLesson.id,
      order: nextLesson.order,
      title: nextLesson.title
    } : null
  });
};
