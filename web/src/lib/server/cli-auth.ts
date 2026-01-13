import { db } from "./db";
import type { User } from "@prisma/client";

/**
 * Generate CLI authentication token
 */
export async function generateCliToken(
  userId: string,
  name?: string,
): Promise<string> {
  const expiresAt = new Date();
  expiresAt.setDate(
    expiresAt.getDate() + parseInt(process.env.CLI_TOKEN_EXPIRES_DAYS || "30"),
  );

  const token = crypto.randomUUID() + "-" + crypto.randomUUID();

  await db.cliToken.create({
    data: {
      token,
      userId,
      name,
      expiresAt,
    },
  });

  return token;
}

/**
 * Verify CLI token and get user
 */
export async function verifyCliToken(
  token: string,
): Promise<Omit<User, "passwordHash"> | null> {
  const cliToken = await db.cliToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!cliToken || cliToken.expiresAt < new Date()) {
    return null;
  }

  // Update last used
  await db.cliToken.update({
    where: { id: cliToken.id },
    data: { lastUsed: new Date() },
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash: _, ...userWithoutPassword } = cliToken.user;
  return userWithoutPassword; // Note: type mismatch if passwordHash removed from User, checks schema
}
