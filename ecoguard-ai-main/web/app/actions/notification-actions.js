"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function fetchNotifications() {
    const { userId } = await auth();
    if (!userId) return [];

    return await prisma.notification.findMany({
        where: { clerkId: userId },
        orderBy: { createdAt: "desc" },
        take: 20,
    });
}

export async function markNotificationAsRead(id) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    await prisma.notification.update({
        where: { id },
        data: { isRead: true },
    });

    revalidatePath("/citizen");
    return { success: true };
}

export async function markAllNotificationsAsRead() {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    await prisma.notification.updateMany({
        where: { clerkId: userId, isRead: false },
        data: { isRead: true },
    });

    revalidatePath("/citizen");
    return { success: true };
}

// Internal helper for create (to be called from other server actions)
export async function createNotification({ clerkId, title, message, type = "INFO" }) {
    return await prisma.notification.create({
        data: {
            clerkId,
            title,
            message,
            type,
        },
    });
}
