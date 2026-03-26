"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

async function checkAuthorityRole() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const profile = await prisma.profile.findUnique({
    where: { clerkId: userId },
    select: { role: true }
  });

  if (!profile || profile.role !== "AUTHORITY") {
    throw new Error("Forbidden: Authority access required");
  }

  return userId;
}

/**
 * Updates a report status with optional resolution notes.
 */
export async function updateReportStatusAction(reportId, newStatus, notes = null) {
  await checkAuthorityRole();

  await prisma.report.update({
    where: { id: reportId },
    data: {
      status: newStatus,
      resolutionNotes: notes,
      updatedAt: new Date()
    },
  });

  revalidatePath("/authority");
  revalidatePath("/citizen/reports");
  return { success: true };
}

export async function resolveViolationAction(formData) {
  const id = formData.get("id");
  return await updateReportStatusAction(id, "RESOLVED", "Manually resolved via investigation page.");
}

/**
 * Manually verifies a report, overriding AI score.
 */
export async function manualVerifyReportAction(reportId) {
  const userId = await checkAuthorityRole();

  await prisma.report.update({
    where: { id: reportId },
    data: {
      isVerified: true,
      confidenceScore: 100,
      manuallyVerifiedBy: userId,
      status: "VERIFIED",
      updatedAt: new Date()
    },
  });

  revalidatePath("/authority");
  revalidatePath("/citizen/reports");
  return { success: true };
}

/**
 * Broadcasts a global alert to all citizens.
 */
export async function broadcastAlertAction(title, message, type = "INFO") {
  const userId = await checkAuthorityRole();

  // 1. Create the GlobalAlert record
  let alert;
  try {
    alert = await prisma.globalAlert.create({
      data: {
        title,
        message,
        type,
        authorId: userId
      }
    });
  } catch (error) {
    console.error("Prisma specific error:", error);
    // Fallback if the model is still being weird in some environments
    throw new Error("Broadcast database synchronization in progress. Please try again in 5 seconds.");
  }

  // 2. Create individual notifications for ALL citizens for the bell icon
  const profiles = await prisma.profile.findMany({
    where: { role: "CITIZEN" },
    select: { clerkId: true }
  });

  if (profiles.length > 0) {
    await prisma.notification.createMany({
      data: profiles.map(p => ({
        clerkId: p.clerkId,
        title: `BROADCAST: ${title}`,
        message: message,
        type: type === "CRITICAL" ? "ALERT" : (type === "WARNING" ? "WARNING" : "INFO")
      }))
    });
  }

  revalidatePath("/authority");
  revalidatePath("/citizen");
  return { success: true };
}

/**
 * Fetches analytics for charts.
 */
export async function getDashboardAnalyticsAction() {
  // Aggregate report types
  const typeCounts = await prisma.report.groupBy({
    by: ['type'],
    _count: {
      id: true
    }
  });

  // Fetch recent health insights for AQI trends (mocking grouping by date for now)
  const recentHealth = await prisma.healthInsight.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    select: { createdAt: true, aqi: true, temperature: true }
  });

  return {
    distribution: typeCounts.map(t => ({ name: t.type, value: t._count.id })),
    trends: recentHealth.reverse().map(h => ({
      time: new Date(h.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      aqi: h.aqi,
      temp: h.temperature
    }))
  };
}

/**
 * Optimized fetch for latest reports (for real-time polling)
 */
export async function getLatestReportsAction(limit = 50) {
  const reports = await prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return reports.map((v) => {
    const parts = v.location?.split(",").map((s) => parseFloat(s.trim()));
    return {
      ...v,
      lat: parts?.length === 2 ? parts[0] : null,
      lon: parts?.length === 2 ? parts[1] : null,
    };
  }).filter(r => r.lat !== null);
}
