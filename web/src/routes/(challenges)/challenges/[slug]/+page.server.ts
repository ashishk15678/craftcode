import type { PageServerLoad } from "./$types";
import { error, redirect } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import { goto } from "$app/navigation";
import { HandleError } from "$lib/custom-error-handler";
import { JUDGE0_API_URL, JUDGE0_API_KEY } from "$env/static/private";

export const load: PageServerLoad = async ({ params, locals }) => {
  const userId = locals.user?.id;

  const user = HandleError({
    fn: await db.user.findFirstOrThrow,
  }).run({
    where: {
      id: userId,
    },
  });
  const challenge = await db.course.findUnique({
    where: { slug: params.slug },
    include: {
      author: {
        select: { id: true, name: true },
      },
      lessons: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          order: true,
          title: true,
          instructionsMd: true,
          testScript: true,
          testScriptUrl: true,
          // CSS Challenge specific fields
          targetImageUrl: true,
          targetCode: true, // Added
          canvasWidth: true,
          canvasHeight: true,
          matchThreshold: true,
        },
      },
    },
  });

  if (!challenge) {
    throw error(404, "Challenge not found");
  }

  if (!userId) {
    throw error(401, "User not logged in");
  }

  if (!challenge.isPublished && challenge.authorId !== userId) {
    throw error(404, "Challenge not found");
  }

  // Get user's progress if authenticated
  let userProgress: any[] = [];
  if (userId) {
    userProgress = await db.userProgress.findMany({
      where: {
        userId,
        lesson: {
          courseId: challenge.id,
        },
      },
      select: {
        lessonId: true,
        completedAt: true,
      },
    });
  }

  const completedLessonIds = new Set(userProgress.map((p) => p.lessonId));
  const isEnrolled = userProgress.length > 0;

  // Find current lesson (first incomplete)
  const currentLesson =
    challenge.lessons.find((lesson) => !completedLessonIds.has(lesson.id)) ||
    challenge.lessons[0];

  let languages = await (
    await fetch(`${JUDGE0_API_URL}/languages`, {
      method: "GET",
      headers: {
        "X-AUTH-TOKEN": "chaicodecodebox",
        "Content-Type": "application/json",
      },
      cache: "force-cache",
    })
  ).json();

  return {
    challenge: {
      id: challenge.id,
      title: challenge.title,
      slug: challenge.slug,
      description: challenge.description,
      difficulty: challenge.difficulty,
      type: challenge.type,
      testRunnerType: challenge.testRunnerType,
      iconUrl: challenge.iconUrl,
      coverUrl: challenge.coverUrl,
      authorName: challenge.author.name,
      isOwner: challenge.authorId === userId,
    },
    stages: challenge.lessons.map((lesson) => ({
      id: lesson.id,
      order: lesson.order,
      title: lesson.title,
      instructionsMd: lesson.instructionsMd,
      hasTestScript: !!(lesson.testScript || lesson.testScriptUrl),
      isCompleted: completedLessonIds.has(lesson.id),
      // CSS Challenge specific fields
      targetImageUrl: lesson.targetImageUrl,
      targetCode: lesson.targetCode, // Added
      canvasWidth: lesson.canvasWidth,
      canvasHeight: lesson.canvasHeight,
      matchThreshold: lesson.matchThreshold,
    })),
    isEnrolled,
    isAuthenticated: !!userId,
    currentLessonId: currentLesson?.id || null,
    completedLessonIds: Array.from(completedLessonIds),
    languages: await languages,
  };
};

export let ssr = false;
