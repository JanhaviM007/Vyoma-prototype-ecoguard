import { Webhook } from "svix";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";


export async function POST(req) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("❌ MISSING CLERK_WEBHOOK_SECRET in .env.local");
    return new Response("Error: Webhook secret not configured", {
      status: 500,
    });
  }

  // 1. Get the headers for verification
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // 2. If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error("❌ Missing Svix headers");
    return new Response("Error: Missing svix headers", { status: 400 });
  }

  // 3. Get the RAW body (Crucial: Use .text() not .json())
  const payload = await req.text();
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt;

  // 4. Verify the payload with Svix
  try {
    evt = wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error("❌ Webhook verification failed:", err.message);
    return new Response("Error: Verification failed", { status: 400 });
  }

  // 5. Handle the "user.created" event
  if (evt.type === "user.created") {
    const { id, email_addresses } = evt.data;

    // Defensive check: Ensure email exists
    const email =
      email_addresses && email_addresses.length > 0
        ? email_addresses[0].email_address
        : null;

    if (!email) {
      console.error("❌ No email address found for user:", id);
      return new Response("Error: No email provided", { status: 400 });
    }

    try {
      // 6. Save the user to DB via Prisma (idempotent)
      // Prefer upsert by clerkId; if the email already exists, "adopt" the row.
      await prisma.profile
        .upsert({
          where: { clerkId: id },
          update: { email },
          create: {
            clerkId: id,
            email,
            role: "CITIZEN", // Default role
          },
        })
        .catch(async (err) => {
          if (err?.code === "P2002") {
            await prisma.profile.update({
              where: { email },
              data: { clerkId: id },
            });
            return;
          }
          throw err;
        });

      console.log(`✅ SUCCESS: User ${id} (${email}) saved to Supabase!`);
    } catch (dbError) {
      console.error("❌ PRISMA DATABASE ERROR:", dbError);
      return new Response("Database Error", { status: 500 });
    }
  }

  return new Response("Webhook processed successfully", { status: 200 });
}
