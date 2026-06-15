import { auth } from "@clerk/nextjs/server";
import { seedUserDefaults } from "@/db/seed";

// Per-instance cache of users we've already seeded, so we don't hit the DB with
// a seed check on every single navigation. (Serverless instances are reused, so
// this is warm most of the time; seedUserDefaults is idempotent regardless.)
const seeded = new Set<string>();

/**
 * Returns the current Clerk user id, seeding default body parts / exercises /
 * routines the first time we see this user. Throws if not signed in.
 */
export async function requireUser(): Promise<string> {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");
  if (!seeded.has(userId)) {
    await seedUserDefaults(userId);
    seeded.add(userId);
  }
  return userId;
}
