import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { createTestRunner } from '$lib/server/test-runners';
import { writeFile, mkdir, rm } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

export const POST: RequestHandler = async ({ params, request, locals }) => {
  if (!locals.user) {
    return json({ error: 'Authentication required' }, { status: 401 });
  }

  const { slug } = params;

  try {
    const body = await request.json();
    const { lessonId, userCode } = body;

    if (!lessonId) {
      return json({ error: 'lessonId is required' }, { status: 400 });
    }

    if (!userCode || typeof userCode !== 'string') {
      return json({ error: 'userCode is required' }, { status: 400 });
    }

    // Find the lesson and verify it belongs to this challenge
    const lesson = await db.lesson.findUnique({
      where: { id: lessonId },
      include: {
        course: true
      }
    });

    if (!lesson) {
      return json({ error: 'Lesson not found' }, { status: 404 });
    }

    if (lesson.course.slug !== slug) {
      return json({ error: 'Lesson does not belong to this challenge' }, { status: 400 });
    }

    // Check if lesson has a test script
    if (!lesson.testScript && !lesson.testScriptUrl) {
      return json({ error: 'No test script available for this lesson' }, { status: 400 });
    }

    // Create temporary working directory
    const workingDir = join(tmpdir(), `craftcode-${locals.user.id}-${Date.now()}`);
    await mkdir(workingDir, { recursive: true });

    try {
      // Write user code to file
      // Determine file extension based on test runner type
      const extensions: Record<string, string> = {
        NODE: 'js',
        PYTHON: 'py',
        BASH: 'sh',
        IO_MATCHING: 'bin',
        CUSTOM: 'txt'
      };
      const ext = extensions[lesson.course.testRunnerType] || 'txt';
      const userCodePath = join(workingDir, `solution.${ext}`);
      await writeFile(userCodePath, userCode, 'utf-8');

      // Write test script if inline
      if (lesson.testScript) {
        const testScriptPath = join(workingDir, 'test.sh');
        await writeFile(testScriptPath, lesson.testScript, { mode: 0o755 });
      }

      // Create test runner
      const testRunner = createTestRunner({
        type: lesson.course.testRunnerType,
        script: lesson.testScript || undefined,
        scriptUrl: lesson.testScriptUrl || undefined,
        timeout: 60000 // 60 seconds
      });

      // Execute tests
      const result = await testRunner.execute(workingDir, userCode);

      // If tests passed, mark lesson as complete
      if (result.success) {
        // Check if already completed
        const existingProgress = await db.userProgress.findUnique({
          where: {
            userId_lessonId: {
              userId: locals.user.id,
              lessonId
            }
          }
        });

        if (!existingProgress) {
          await db.userProgress.create({
            data: {
              userId: locals.user.id,
              lessonId
            }
          });
        }

        // Get updated progress
        const totalLessons = await db.lesson.count({
          where: { courseId: lesson.course.id }
        });

        const completedLessons = await db.userProgress.count({
          where: {
            userId: locals.user.id,
            lesson: { courseId: lesson.course.id }
          }
        });

        // Find next lesson
        const nextLesson = await db.lesson.findFirst({
          where: {
            courseId: lesson.course.id,
            order: lesson.order + 1
          }
        });

        return json({
          success: true,
          result: {
            success: result.success,
            output: result.output,
            error: result.error,
            duration: result.duration
          },
          progress: {
            completed: completedLessons,
            total: totalLessons,
            percentage: Math.round((completedLessons / totalLessons) * 100)
          },
          lessonComplete: true,
          challengeComplete: !nextLesson,
          nextLesson: nextLesson ? {
            id: nextLesson.id,
            order: nextLesson.order,
            title: nextLesson.title
          } : null
        });
      } else {
        // Tests failed
        return json({
          success: false,
          result: {
            success: result.success,
            output: result.output,
            error: result.error,
            duration: result.duration
          },
          lessonComplete: false
        });
      }
    } finally {
      // Cleanup working directory
      try {
        await rm(workingDir, { recursive: true, force: true });
      } catch (err) {
        console.error('Failed to cleanup working directory:', err);
      }
    }
  } catch (error) {
    console.error('Test execution error:', error);
    return json(
      { 
        error: 'Test execution failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }, 
      { status: 500 }
    );
  }
};
