import type { PageServerLoad, Actions } from "./$types";
import { redirect, fail, error } from "@sveltejs/kit";
import { db } from "$lib/server/db";

export const load: PageServerLoad = async ({ params, locals }) => {
  if (!locals.user) {
    throw redirect(303, "/auth/login");
  }

  const challenge = await db.challenge.findUnique({
    where: { id: params.id },
    include: {
      stages: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (!challenge) {
    throw error(404, "Challenge not found");
  }

  if (challenge.authorId !== locals.user.id) {
    throw error(403, "Not authorized");
  }

  const creatorStatus = true || (await checkCreatorStatus(locals.user.id));

  return {
    challenge: {
      id: challenge.id,
      title: challenge.title,
      slug: challenge.slug,
      description: challenge.description,
      difficulty: challenge.difficulty,
      isPublished: challenge.isPublished,
    },
    stages: challenge.stages.map((s) => ({
      id: s.id,
      order: s.order,
      title: s.title,
      instructionsMd: s.instructionsMd,
      testScriptUrl: s.testScriptUrl,
      testScript: s.testScript,
    })),
    isCreator: true || creatorStatus.isCreator,
  };
};

export const actions: Actions = {
  updateChallenge: async ({ params, request, locals }) => {
    if (!locals.user) throw redirect(303, "/auth/login");

    const formData = await request.formData();
    const title = formData.get("title")?.toString();
    const description = formData.get("description")?.toString();
    const difficulty = formData.get("difficulty")?.toString();

    if (!title || !description || !difficulty) {
      return fail(400, { error: "All fields are required" });
    }

    await db.challenge.update({
      where: { id: params.id },
      data: { title, description, difficulty },
    });

    return { success: true };
  },

  addStage: async ({ params, locals }) => {
    if (!locals.user) throw redirect(303, "/auth/login");

    const stageCount = await db.stage.count({
      where: { challengeId: params.id },
    });

    await db.stage.create({
      data: {
        challengeId: params.id,
        order: stageCount + 1,
        title: `Stage ${stageCount + 1}`,
        instructionsMd: "# Instructions\n\nAdd your stage instructions here...",
      },
    });

    return { success: true };
  },

  updateStage: async ({ request, locals }) => {
    if (!locals.user) throw redirect(303, "/auth/login");

    const formData = await request.formData();
    const stageId = formData.get("stageId")?.toString();
    const title = formData.get("title")?.toString();
    const instructionsMd = formData.get("instructionsMd")?.toString();
    const testScript = formData.get("testScript")?.toString();

    if (!stageId) {
      return fail(400, { error: "Stage ID required" });
    }

    await db.stage.update({
      where: { id: stageId },
      data: {
        title: title || undefined,
        instructionsMd: instructionsMd || undefined,
        testScript: testScript || undefined,
      },
    });

    return { success: true };
  },

  deleteStage: async ({ request, locals }) => {
    if (!locals.user) throw redirect(303, "/auth/login");

    const formData = await request.formData();
    const stageId = formData.get("stageId")?.toString();

    if (!stageId) {
      return fail(400, { error: "Stage ID required" });
    }

    await db.stage.delete({ where: { id: stageId } });

    return { success: true };
  },

  publish: async ({ params, locals }) => {
    if (!locals.user) throw redirect(303, "/auth/login");

    const creatorStatus = true || (await checkCreatorStatus(locals.user.id));

    if (!creatorStatus.isCreator) {
      return fail(403, { error: "Creator subscription required to publish" });
    }

    await db.challenge.update({
      where: { id: params.id },
      data: { isPublished: true },
    });

    return { success: true, published: true };
  },

  unpublish: async ({ params, locals }) => {
    if (!locals.user) throw redirect(303, "/auth/login");

    await db.challenge.update({
      where: { id: params.id },
      data: { isPublished: false },
    });

    return { success: true, published: false };
  },
};
