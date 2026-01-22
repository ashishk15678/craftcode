import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "./db";
import {
  polar,
  checkout,
  portal,
  usage,
  webhooks,
} from "@polar-sh/better-auth";
import { Polar } from "@polar-sh/sdk";

const polarClient = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN || "",
  server: (process.env.POLAR_SERVER as "sandbox" | "production") || "sandbox",
});

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      polarCustomerId: { type: "string" },
      isCreator: { type: "boolean" },
    },
  },
  plugins: [
    polar({
      client: polarClient,
      createCustomerOnSignUp: true,
      use: [
        checkout({
          products: [
            {
              productId: "512f6230-d7e8-47f1-8eda-c1e84f02ebf2",
              slug: "pro",
            },
          ],
          successUrl: "/success?checkout_id={CHECKOUT_ID}",
          authenticatedUsersOnly: true,
        }),
        portal(),
        usage(),
        webhooks({
          secret: process.env.POLAR_WEBHOOK_SECRET || "",
          onPayload: async (payload) => {
            const event = payload as { type: string; data: any };
            const POLAR_CREATOR_BENEFIT_ID =
              process.env.POLAR_CREATOR_BENEFIT_ID;

            if (!POLAR_CREATOR_BENEFIT_ID) return;

            if (
              [
                "subscription.created",
                "subscription.updated",
                "subscription.active",
              ].includes(event.type)
            ) {
              const subscription = event.data;
              if (!subscription.customerId) return;

              const user = await db.user.findFirst({
                where: { polarCustomerId: subscription.customerId },
              });
              if (!user) return;

              const hasCreatorBenefit = subscription.product?.benefits?.some(
                // @ts-ignore
                (b: any) => b.id === POLAR_CREATOR_BENEFIT_ID,
              );

              if (hasCreatorBenefit !== undefined) {
                await db.user.update({
                  where: { id: user.id },
                  data: { isCreator: hasCreatorBenefit },
                });
              }
            } else if (
              ["subscription.canceled", "subscription.revoked"].includes(
                event.type,
              )
            ) {
              const subscription = event.data;
              if (!subscription.customerId) return;

              const user = await db.user.findFirst({
                where: { polarCustomerId: subscription.customerId },
              });
              if (!user) return;

              await db.user.update({
                where: { id: user.id },
                data: { isCreator: false },
              });
            }
          },
        }),
      ],
    }),
  ],
});

// Re-export CLI token functions
export { verifyCliToken, generateCliToken } from "./cli-auth";
