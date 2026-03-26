
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "./prisma";

export async function syncUserToDatabase() {
  try {
    const user = await currentUser();
    if (!user || !user.id) return null;

    const email = user.emailAddresses?.[0]?.emailAddress;
    if (!email) return null;

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
    // Handle specific Prisma errors
    if (err?.code === "P2002") {
      // Unique constraint violation - try to adopt existing profile
      try {
        const user = await currentUser();
        if (user?.emailAddresses?.[0]?.emailAddress) {
          const profile = await prisma.profile.update({
            where: { email: user.emailAddresses[0].emailAddress },
            data: { clerkId: user.id },
          });
          return profile;
        }
      } catch (innerErr) {
        console.error("Failed to adopt existing profile:", innerErr.message);
      }
    }
    
    // Log the error but don't crash - allow the page to render even if sync fails
    console.error("User sync failed:", err.message);
    return null;
  }
}
