import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { verifyCliToken } from "$lib/server/cli-auth";
import { db } from "$lib/server/db";

interface TestCaseResponse {
  id: string;
  order: number;
  input?: string;
  expectedOutput?: string;
  testScript?: string;
  timeout: number;
  isHidden: boolean;
}

interface TestsResponse {
  tests: TestCaseResponse[];
  metadata: {
    lessonId: string;
    lessonTitle: string;
    lessonOrder: number;
    totalTests: number;
    challengeSlug: string;
    challengeTitle: string;
    environmentType: string | null;
  };
}

// GET /api/cli/tests/[lessonId] - Get test cases for a lesson
export const GET: RequestHandler = async ({ params, request }) => {
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    return json({ error: "Token required" }, { status: 401 });
  }

  const user = await verifyCliToken(token);
  if (!user) {
    return json({ error: "Invalid or expired token" }, { status: 401 });
  }

  const { lessonId } = params;
  if (!lessonId) {
    return json({ error: "Lesson ID required" }, { status: 400 });
  }

  // Get the lesson with its test cases
  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    include: {
      course: {
        select: {
          id: true,
          slug: true,
          title: true,
          authorId: true,
          isPublished: true,
          testRunnerType: true,
        },
      },
      testCases: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (!lesson) {
    return json({ error: "Lesson not found" }, { status: 404 });
  }

  // Check access - must be published or user is the author
  if (!lesson.course.isPublished && lesson.course.authorId !== user.id) {
    return json({ error: "Challenge not available" }, { status: 403 });
  }

  // Check if user has completed previous lessons (for sequential challenges)
  if (lesson.order > 1) {
    const previousLesson = await db.lesson.findFirst({
      where: {
        courseId: lesson.courseId,
        order: lesson.order - 1,
      },
    });

    if (previousLesson) {
      const previousCompleted = await db.userProgress.findUnique({
        where: {
          userId_lessonId: {
            userId: user.id,
            lessonId: previousLesson.id,
          },
        },
      });

      // Allow if it's the author, otherwise enforce sequential completion
      if (!previousCompleted && lesson.course.authorId !== user.id) {
        return json(
          {
            error: "Previous lesson not completed",
            previousLesson: {
              id: previousLesson.id,
              order: previousLesson.order,
              title: previousLesson.title,
            },
          },
          { status: 403 },
        );
      }
    }
  }

  // Map test cases to response format
  // For hidden tests, don't include input/expectedOutput in response
  // : TestCaseResponse
  const tests = {
    id: lesson.id,
    order: lesson.order,
    testScript: lesson.testScript!,
    // timeout: lesson.timeout,
    // isHidden: tc.isHidden,
  };

  // : TestsResponse
  const response = {
    tests,
    metadata: {
      testRunnerType: lesson.course.testRunnerType,
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      lessonOrder: lesson.order,
      totalTests: 1,
      challengeSlug: lesson.course.slug,
      challengeTitle: lesson.course.title,
      environmentType: lesson.environmentType,
    },
  };

  console.log({ response, lesson });
  return json(response);
};
