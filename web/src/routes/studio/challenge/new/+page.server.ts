import type { Actions } from "./$types";
import { redirect, fail } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import { CourseType, TestRunnerType } from "@prisma/client";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const actions: Actions = {
  default: async ({ request, locals }) => {
    if (!locals.user) {
      throw redirect(303, "/auth/login");
    }

    const formData = await request.formData();
    const title = formData.get("title")?.toString();
    const description = formData.get("description")?.toString();
    const difficulty = formData.get("difficulty")?.toString();
    const test_type = formData.get("type")?.toString();

    if (!title || !description || !difficulty || !test_type) {
      return fail(400, { error: "All fields are required" });
    }

    // Generate slug
    let slug = slugify(title);

    // Check if slug exists and make unique
    const existing = await db.course.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    // Create challenge
    const challenge = await db.course.create({
      data: {
        title,
        slug,
        description,
        // TODO: Hard coded for now , please change later
        type: "CHALLENGE",
        testRunnerType: getEnumType(test_type),
        difficulty,
        authorId: locals.user.id,
      },
    });

    throw redirect(303, `/studio/challenge/${challenge.id}`);
  },
};

function getEnumType(type: string) {
  switch (type) {
    case "bash":
      return TestRunnerType.BASH;
    case "css":
      return TestRunnerType.CSS;
    case "io-matching":
      return TestRunnerType.IO_MATCHING;
    case "node":
      return TestRunnerType.NODE;
    default:
      return TestRunnerType.CUSTOM;
      break;
  }
}
