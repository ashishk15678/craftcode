import type { Handle } from "@sveltejs/kit";
import { auth } from "$lib/server/auth";
import { svelteKitHandler } from "better-auth/svelte-kit";
import { building } from "$app/environment";

export const handle: Handle = async ({ event, resolve }) => {
  const session = await auth.api.getSession({
    headers: event.request.headers,
  });
  event.locals.user = session?.user || null;

  return svelteKitHandler({ event, resolve, auth, building });
};
