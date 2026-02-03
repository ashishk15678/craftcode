import type { PageServerLoad } from "./$types";
import { db } from "$lib/server/db";

export const load: PageServerLoad = async ({ locals }) => {
  const challenges = await db.course.findMany({
    where: {
      isPublished: true,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
        },
      },
      lessons: {
        select: {
          id: true,
        },
      },
      ...(locals.user
        ? {
            lessons: {
              select: {
                id: true,
                progress: {
                  where: {
                    userId: locals.user.id,
                  },
                  select: {
                    id: true,
                  },
                },
              },
            },
          }
        : {}),
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return {
    challenges: challenges.map((challenge) => ({
      id: challenge.id,
      title: challenge.title,
      slug: challenge.slug,
      description: challenge.description,
      difficulty: challenge.difficulty as
        | "beginner"
        | "intermediate"
        | "advanced",
      iconUrl: challenge.iconUrl,
      authorName: challenge.author.name,
      stageCount: challenge.lessons,
      completedStages: [],
      //   completedStages: locals.user
      //     ? challenge.stages.filter(
      //         (s) => "progress" in s && s.progress.length > 0,
      //       ).length
      //     : 0,
    })),
    //
  };
};
