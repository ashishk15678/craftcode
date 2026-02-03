import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import crypto from "crypto";

const POLAR_WEBHOOK_SECRET = process.env.POLAR_WEBHOOK_SECRET;

function verifyWebhookSignature(
  payload: string,
  signature: string | null,
): boolean {
  if (!POLAR_WEBHOOK_SECRET || !signature) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac("sha256", POLAR_WEBHOOK_SECRET)
    .update(payload)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature),
  );
}

export const POST: RequestHandler = async ({ request }) => {
  const payload = await request.text();
  const signature = request.headers.get("x-polar-signature");

  // Verify signature in production
  if (process.env.NODE_ENV === "production") {
    if (!verifyWebhookSignature(payload, signature)) {
      console.error("Invalid webhook signature");
      return json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  try {
    const event = JSON.parse(payload);

    console.log("Polar webhook received:", event.type);

    // Webhook handling is done in auth.ts via Better Auth Polar plugin
    // This endpoint just validates and logs the webhook

    return json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return json({ error: "Webhook processing failed" }, { status: 500 });
  }
};
