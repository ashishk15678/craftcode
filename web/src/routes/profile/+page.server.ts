import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { db } from "$lib/server/db";

export const load: PageServerLoad = async ({ locals, fetch }) => {
  if (!locals.user) {
    throw redirect(303, "/auth/login");
  }

  // Fetch profile statistics from API
  const statsResponse = await fetch("/api/profile/stats");
  const profileData = await statsResponse.json();

  return {
    user: locals.user,
    ...profileData,
  };
};