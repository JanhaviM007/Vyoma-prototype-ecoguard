"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function addCommentAction(reportId, content) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const comment = await prisma.comment.create({
        data: {
            content,
            reportId,
            authorId: userId,
        },
    });

    revalidatePath(`/citizen/reports/${reportId}`);
    return { success: true, commentId: comment.id };
}

export async function getCommentsAction(reportId) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const comments = await prisma.comment.findMany({
        where: { reportId },
        include: {
            author: {
                select: {
                    email: true,
                    role: true,
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    return comments;
}
