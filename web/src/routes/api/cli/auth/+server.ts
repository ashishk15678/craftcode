import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { generateCliToken, verifyCliToken } from "$lib/server/cli-auth";

// GET - Verify CLI token
export const GET: RequestHandler = async ({ request }) => {
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    return json({ error: "Token required" }, { status: 401 });
  }

  const user = await verifyCliToken(token);
  if (!user) {
    return json({ error: "Invalid or expired token" }, { status: 401 });
  }

  return json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  });
};

// POST - Generate new CLI token (requires browser authentication)
export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) {
    return json({ error: "Authentication required" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const deviceName = body.deviceName || "CLI";

  const token = await generateCliToken(locals.user.id, deviceName);

  return json({
    token,
    user: {
      id: locals.user.id,
      email: locals.user.email,
      name: locals.user.name,
    },
  });
};
