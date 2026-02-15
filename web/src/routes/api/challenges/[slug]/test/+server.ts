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
    const { lessonId, userCode, language, stdin } = body;

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
        course: true,
        testCases: {
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!lesson) {
      return json({ error: 'Lesson not found' }, { status: 404 });
    }

    if (lesson.course.slug !== slug) {
      return json({ error: 'Lesson does not belong to this challenge' }, { status: 400 });
    }

    // For JUDGE0 runner type, we don't need a test script
    const isJudge0 = lesson.course.testRunnerType === 'JUDGE0';
    
    // Check if lesson has a test script (not required for Judge0)
    if (!isJudge0 && !lesson.testScript && !lesson.testScriptUrl) {
      return json({ error: 'No test script available for this lesson' }, { status: 400 });
    }

    // For Judge0, execute directly without temp directory
    if (isJudge0) {
      const testCases = lesson.testCases || [];
      let allPassed = true;
      let totalOutput = "";
      const startTime = Date.now();

      const testRunner = createTestRunner({
        type: 'JUDGE0' as any,
        language: language || 'javascript',
        timeout: 10000,
      });

      if (testCases.length > 0) {
        // Run against each test case
        for (const testCase of testCases) {
          const result = await testRunner.execute(
            '',
            userCode,
            testCase.input || stdin || ''
          );

          const passed = testCase.expectedOutput 
            ? result.output.trim() === testCase.expectedOutput.trim()
            : result.success;
          
          allPassed = allPassed && passed;
          totalOutput += `${testCase.name}: ${passed ? '✓ PASS' : '✗ FAIL'}\n`;
          
          if (!passed && !testCase.isHidden) {
            if (testCase.expectedOutput) {
              totalOutput += `  Expected: ${testCase.expectedOutput.trim()}\n`;
              totalOutput += `  Got: ${result.output.trim()}\n`;
            }
            if (result.error) {
              totalOutput += `  Error: ${result.error}\n`;
            }
          }
          totalOutput += '\n';
        }
      } else {
        // No test cases, just execute and check for successful run
        const result = await testRunner.execute('', userCode, stdin || '');
        allPassed = result.success;
        totalOutput = result.output || '';
        if (result.error) {
          totalOutput += `\nError: ${result.error}`;
        }
      }

      const duration = Date.now() - startTime;

      if (allPassed) {
        return await handleSuccessfulTest(locals.user.id, lessonId, lesson, {
          success: true,
          output: totalOutput,
          duration,
        });
      } else {
        return json({
          success: false,
          result: {
            success: false,
            output: totalOutput,
            duration,
          },
          lessonComplete: false
        });
      }
    }

    // For non-Judge0 runners, use temp directory
    const workingDir = join(tmpdir(), `craftcode-${locals.user.id}-${Date.now()}`);
    await mkdir(workingDir, { recursive: true });

    try {
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

      if (lesson.testScript) {
        const testScriptPath = join(workingDir, 'test.sh');
        await writeFile(testScriptPath, lesson.testScript, { mode: 0o755 });
      }

      const testRunner = createTestRunner({
        type: lesson.course.testRunnerType,
        script: lesson.testScript || undefined,
        scriptUrl: lesson.testScriptUrl || undefined,
        timeout: 60000
      });

      const result = await testRunner.execute(workingDir, userCode);

      if (result.success) {
        return await handleSuccessfulTest(locals.user.id, lessonId, lesson, result);
      } else {
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

async function handleSuccessfulTest(userId: string, lessonId: string, lesson: any, result: any) {
  const existingProgress = await db.userProgress.findUnique({
    where: {
      userId_lessonId: {
        userId,
        lessonId
      }
    }
  });

  if (!existingProgress) {
    await db.userProgress.create({
      data: {
        userId,
        lessonId
      }
    });
  }

  const totalLessons = await db.lesson.count({
    where: { courseId: lesson.course.id }
  });

  const completedLessons = await db.userProgress.count({
    where: {
      userId,
      lesson: { courseId: lesson.course.id }
    }
  });

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
}
