import type { PageServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";
import { db } from "$lib/server/db";

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) {
    throw redirect(303, "/auth/login?redirect=/studio");
  }

  // Check creator status from Polar (now synced to user record)
  const isCreator = await db.user.findUniqueOrThrow({
    where: {
      id: locals.user.id,
      polarCustomerId: locals.user.polarCustomerId,
    },
  });

  // Get user's challenges
  const challenges = await db.challenge.findMany({
    where: {
      authorId: locals.user.id,
    },
    include: {
      stages: {
        select: { id: true },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return {
    isCreator: isCreator.isCreator,
    challenges: challenges.map((c) => ({
      id: c.id,
      title: c.title,
      slug: c.slug,
      description: c.description,
      difficulty: c.difficulty,
      isPublished: c.isPublished,
      stageCount: c.stages.length,
      updatedAt: c.updatedAt.toISOString(),
    })),
  };
};
