"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function createSosAlertAction(location = "Unknown") {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const alert = await prisma.sosAlert.create({
        data: {
            clerkId: userId,
            location: location,
            status: "ACTIVE",
        },
    });

    // Notify authorities (Simplified: create individual notifications for all authority profiles)
    const authorities = await prisma.profile.findMany({
        where: { role: "AUTHORITY" },
        select: { clerkId: true }
    });

    if (authorities.length > 0) {
        await prisma.notification.createMany({
            data: authorities.map(a => ({
                clerkId: a.clerkId,
                title: "🚨 EMERGENCY SOS ALERT",
                message: `High-priority SOS received from ${userId} at ${location}. Respond immediately.`,
                type: "ALERT"
            }))
        });
    }

    revalidatePath("/authority");
    return { success: true, alertId: alert.id };
}

export async function resolveSosAlertAction(alertId) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Check if user is authority
    const profile = await prisma.profile.findUnique({
        where: { clerkId: userId },
        select: { role: true }
    });

    if (profile?.role !== "AUTHORITY") {
        throw new Error("Only authorities can resolve SOS alerts");
    }

    await prisma.sosAlert.update({
        where: { id: alertId },
        data: { status: "RESOLVED" },
    });

    revalidatePath("/authority");
    return { success: true };
}
