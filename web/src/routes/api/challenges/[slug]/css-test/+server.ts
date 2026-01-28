import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { db } from "$lib/server/db";

export const POST: RequestHandler = async ({ params, request, locals }) => {
  if (!locals.user) {
    return json({ error: "Authentication required" }, { status: 401 });
  }

  const { slug } = params;

  try {
    const body = await request.json();
    const { lessonId, userCode, mode, matchPercentage } = body;

    if (!lessonId) {
      return json({ error: "lessonId is required" }, { status: 400 });
    }

    if (typeof matchPercentage !== "number") {
      return json({ error: "matchPercentage is required" }, { status: 400 });
    }

    // Find the lesson and verify it belongs to this challenge
    const lesson = await db.lesson.findUnique({
      where: { id: lessonId },
      include: {
        course: true,
      },
    });

    if (!lesson) {
      return json({ error: "Lesson not found" }, { status: 404 });
    }

    if (lesson.course.slug !== slug) {
      return json(
        { error: "Lesson does not belong to this challenge" },
        { status: 400 },
      );
    }

    // Verify this is a CSS challenge
    if (lesson.course.testRunnerType !== "CSS") {
      return json(
        { error: "This endpoint is only for CSS challenges" },
        { status: 400 },
      );
    }

    // Get match threshold (default 95%)
    const matchThreshold = (lesson as any).matchThreshold || 95.0;

    // Check if match percentage meets threshold
    const success = matchPercentage >= matchThreshold;

    if (success) {
      // Check if already completed
      const existingProgress = await db.userProgress.findUnique({
        where: {
          userId_lessonId: {
            userId: locals.user.id,
            lessonId,
          },
        },
      });

      if (!existingProgress) {
        await db.userProgress.create({
          data: {
            userId: locals.user.id,
            lessonId,
          },
        });
      }

      // Get updated progress
      const totalLessons = await db.lesson.count({
        where: { courseId: lesson.course.id },
      });

      const completedLessons = await db.userProgress.count({
        where: {
          userId: locals.user.id,
          lesson: { courseId: lesson.course.id },
        },
      });

      // Find next lesson
      const nextLesson = await db.lesson.findFirst({
        where: {
          courseId: lesson.course.id,
          order: lesson.order + 1,
        },
      });

      return json({
        success: true,
        matchPercentage,
        matchThreshold,
        progress: {
          completed: completedLessons,
          total: totalLessons,
          percentage: Math.round((completedLessons / totalLessons) * 100),
        },
        lessonComplete: true,
        challengeComplete: !nextLesson,
        nextLesson: nextLesson
          ? {
              id: nextLesson.id,
              order: nextLesson.order,
              title: nextLesson.title,
            }
          : null,
      });
    } else {
      // Tests failed - match percentage below threshold
      return json({
        success: false,
        matchPercentage,
        matchThreshold,
        error: `Match percentage ${matchPercentage.toFixed(1)}% is below the required ${matchThreshold}%`,
        lessonComplete: false,
      });
    }
  } catch (error) {
    console.error("CSS test execution error:", error);
    return json(
      {
        error: "Test execution failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
};
