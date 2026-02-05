import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { db } from "$lib/server/db";

// POST /api/onboarding - Mark onboarding as complete
export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) {
    return json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { preferences } = body;

    // Update user to mark onboarding as complete
    await db.user.update({
      where: { id: locals.user.id },
      data: {
        onboardingCompleted: true,
        // Optionally update name if provided during onboarding
        ...(preferences?.name && { name: preferences.name }),
      },
    });

    return json({ 
      success: true,
      message: "Onboarding completed successfully" 
    });
  } catch (err) {
    console.error("Onboarding API error:", err);
    return json({ error: "Failed to complete onboarding" }, { status: 500 });
  }
};

// GET /api/onboarding - Get onboarding status
export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.user) {
    return json({ error: "Authentication required" }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { id: locals.user.id },
    select: { onboardingCompleted: true },
  });

  return json({
    onboardingCompleted: user?.onboardingCompleted ?? false,
  });
};
