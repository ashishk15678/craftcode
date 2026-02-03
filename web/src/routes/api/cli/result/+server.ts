import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { verifyCliToken } from '$lib/server/cli-auth';
import { db } from '$lib/server/db';

interface TestResult {
  testId: string;
  passed: boolean;
  duration: number; // milliseconds
  output?: string;
  error?: string;
}

interface ResultRequest {
  lessonId: string;
  results: TestResult[];
  allPassed: boolean;
  totalDuration: number;
}

interface ResultResponse {
  success: boolean;
  message: string;
  progress: {
    completed: number;
    total: number;
    percentage: number;
  };
  lessonComplete: boolean;
  challengeComplete: boolean;
  nextLesson?: {
    id: string;
    order: number;
    title: string;
  } | null;
  stats: {
    testsPassed: number;
    testsFailed: number;
    totalTests: number;
    duration: number;
  };
}

// POST /api/cli/result - Submit test results
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

  let body: ResultRequest;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { lessonId, results, allPassed, totalDuration } = body;

  if (!lessonId) {
    return json({ error: 'lessonId is required' }, { status: 400 });
  }

  if (!Array.isArray(results)) {
    return json({ error: 'results array is required' }, { status: 400 });
  }

  // Get the lesson
  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    include: {
      course: {
        select: { id: true, title: true, slug: true, authorId: true }
      },
      testCases: {
        select: { id: true }
      }
    }
  });

  if (!lesson) {
    return json({ error: 'Lesson not found' }, { status: 404 });
  }

  // Calculate stats
  const testsPassed = results.filter(r => r.passed).length;
  const testsFailed = results.filter(r => !r.passed).length;
  // Use results.length since tests are stored on lesson, not in testCases relation
  const totalTests = results.length;

  // Only mark as complete if all tests passed
  let lessonComplete = false;
  let challengeComplete = false;
  let nextLesson = null;

  // allPassed from CLI indicates all tests were successful
  if (allPassed && testsFailed === 0) {
    // Check if already completed
    const existingProgress = await db.userProgress.findUnique({
      where: {
        userId_lessonId: {
          userId: user.id,
          lessonId
        }
      }
    });

    if (!existingProgress) {
      // Create progress record
      await db.userProgress.create({
        data: {
          userId: user.id,
          lessonId
        }
      });

      // Update user statistics
      await db.userStatistics.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          lastActivityDate: new Date()
        },
        update: {
          lastActivityDate: new Date()
        }
      });
    }

    lessonComplete = true;

    // Check for next lesson
    const next = await db.lesson.findFirst({
      where: {
        courseId: lesson.course.id,
        order: lesson.order + 1
      },
      select: { id: true, order: true, title: true }
    });

    if (next) {
      nextLesson = next;
    } else {
      challengeComplete = true;
    }
  }

  // Get overall progress
  const totalLessons = await db.lesson.count({
    where: { courseId: lesson.course.id }
  });

  const completedLessons = await db.userProgress.count({
    where: {
      userId: user.id,
      lesson: { courseId: lesson.course.id }
    }
  });

  const response: ResultResponse = {
    success: allPassed,
    message: allPassed 
      ? `All ${testsPassed} tests passed!`
      : `${testsFailed} of ${testsPassed + testsFailed} tests failed`,
    progress: {
      completed: completedLessons,
      total: totalLessons,
      percentage: Math.round((completedLessons / totalLessons) * 100)
    },
    lessonComplete,
    challengeComplete,
    nextLesson,
    stats: {
      testsPassed,
      testsFailed,
      totalTests,
      duration: totalDuration || 0
    }
  };

  return json(response);
};
