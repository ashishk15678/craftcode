import type { PageServerLoad, Actions } from "./$types";
import { redirect, fail } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import { randomUUID } from "crypto";

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) {
    throw redirect(303, "/auth/login");
  }

  const tokens = await db.cliToken.findMany({
    where: { userId: locals.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      createdAt: true,
      lastUsed: true,
      expiresAt: true,
      // Do not select the actual token string for security, 
      // except we can't show it anyway if we don't.
      // Strategy: Only show full token on creation. 
      // Existing tokens show a masked version or just metadata.
      // But the Schema stores valid tokens. Let's just return what we have 
      // but the UI should be careful. 
      // Actually, standard practice is: return partial here, 
      // and full token ONLY in the action return.
    }
  });

  return { tokens };
};

export const actions: Actions = {
  create: async ({ request, locals }) => {
    if (!locals.user) throw redirect(303, "/auth/login");

    const formData = await request.formData();
    const name = formData.get("name")?.toString() || "CLI Token";

    // Generate a secure token
    const token = `cc_${randomUUID().replace(/-/g, "")}`;
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1); // 1 year expiry

    await db.cliToken.create({
      data: {
        token,
        name,
        expiresAt,
        userId: locals.user.id
      }
    });

    return { success: true, newToken: token };
  },

  delete: async ({ request, locals }) => {
    if (!locals.user) throw redirect(303, "/auth/login");

    const formData = await request.formData();
    const tokenId = formData.get("tokenId")?.toString();

    if (!tokenId) {
      return fail(400, { error: "Token ID required" });
    }

    // Ensure user owns the token
    const token = await db.cliToken.findFirst({
      where: { id: tokenId, userId: locals.user.id }
    });

    if (!token) {
      return fail(404, { error: "Token not found" });
    }

    await db.cliToken.delete({
      where: { id: tokenId }
    });

    return { success: true };
  }
};
