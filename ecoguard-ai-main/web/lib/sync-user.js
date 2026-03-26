
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "./prisma";

export async function syncUserToDatabase() {
  const user = await currentUser();
  if (!user) return null;

  const email = user.emailAddresses?.[0]?.emailAddress;
  if (!email) return null;

  try {
    // Primary path: upsert by Clerk user id
    const profile = await prisma.profile.upsert({
      where: { clerkId: user.id },
      update: { email },
      create: {
        clerkId: user.id,
        email,
        role: "CITIZEN",
      },
    });

    return profile;
  } catch (err) {
    // If the email already exists (e.g. old Clerk account removed/recreated),
    // "adopt" the existing profile row by updating its clerkId.
    if (err?.code === "P2002") {
      const profile = await prisma.profile.update({
        where: { email },
        data: { clerkId: user.id },
      });
      return profile;
    }

    throw err;
  }

  // unreachable
}
