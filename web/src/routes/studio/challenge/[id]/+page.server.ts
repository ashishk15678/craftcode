import type { PageServerLoad, Actions } from "./$types";
import { redirect, fail, error } from "@sveltejs/kit";
import { db } from "$lib/server/db";

export const load: PageServerLoad = async ({ params, locals }) => {
  if (!locals.user) {
    throw redirect(303, "/auth/login");
  }

  const challenge = await db.course.findUnique({
    where: { id: params.id },
    include: {
      lessons: {
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

  const creatorStatus = locals.user.isCreator;

  return {
    challenge: {
      id: challenge.id,
      title: challenge.title,
      slug: challenge.slug,
      description: challenge.description,
      difficulty: challenge.difficulty,
      isPublished: challenge.isPublished,
      testRunnerType: challenge.testRunnerType,
    },
    stages: challenge.lessons.map((s: any) => ({
      id: s.id,
      order: s.order,
      title: s.title,
      instructionsMd: s.instructionsMd,
      testScriptUrl: s.testScriptUrl,
      testScript: s.testScript,
      // CSS Challenge specific fields
      targetImageUrl: s.targetImageUrl,
      canvasWidth: s.canvasWidth,
      canvasHeight: s.canvasHeight,
      matchThreshold: s.matchThreshold,
    })),
    isCreator: creatorStatus,
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

    await db.course.update({
      where: { id: params.id },
      data: { title, description, difficulty },
    });

    return { success: true };
  },

  addStage: async ({ params, locals }) => {
    if (!locals.user) throw redirect(303, "/auth/login");

    const stageCount = await db.lesson.count({
      where: { courseId: params.id },
    });

    await db.lesson.create({
      data: {
        courseId: params.id,
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
    // CSS Challenge specific fields
    const targetImageUrl = formData.get("targetImageUrl")?.toString();
    const canvasWidth = formData.get("canvasWidth")?.toString();
    const canvasHeight = formData.get("canvasHeight")?.toString();
    const matchThreshold = formData.get("matchThreshold")?.toString();

    if (!stageId) {
      return fail(400, { error: "Stage ID required" });
    }

    await db.lesson.update({
      where: { id: stageId },
      data: {
        title: title || undefined,
        instructionsMd: instructionsMd || undefined,
        testScript: testScript || undefined,
        // CSS Challenge specific fields
        targetImageUrl: targetImageUrl || undefined,
        canvasWidth: canvasWidth ? parseInt(canvasWidth) : undefined,
        canvasHeight: canvasHeight ? parseInt(canvasHeight) : undefined,
        matchThreshold: matchThreshold ? parseFloat(matchThreshold) : undefined,
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

    await db.lesson.delete({ where: { id: stageId } });

    return { success: true };
  },

  publish: async ({ params, locals }) => {
    if (!locals.user) throw redirect(303, "/auth/login");

    const creatorStatus = locals.user.isCreator;

    if (!creatorStatus) {
      return fail(403, { error: "Creator subscription required to publish" });
    }

    await db.course.update({
      where: { id: params.id },
      data: { isPublished: true },
    });

    return { success: true, published: true };
  },

  unpublish: async ({ params, locals }) => {
    if (!locals.user) throw redirect(303, "/auth/login");

    await db.course.update({
      where: { id: params.id },
      data: { isPublished: false },
    });

    return { success: true, published: false };
  },
};
