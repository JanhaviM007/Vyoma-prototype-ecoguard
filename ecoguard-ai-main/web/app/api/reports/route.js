import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const reports = await prisma.report.findMany({
      select: {
        id: true,
        type: true,
        location: true,
        status: true,
        // Using sample coords since current schema uses string locations
      },
    });

    // In a real app, you'd use a geocoding service to turn strings into lat/lng
    const reportsWithCoords = reports.map((r, i) => ({
      ...r,
      position: [18.5204 + i * 0.01, 73.8567 + i * 0.01],
    }));

    return NextResponse.json(reportsWithCoords);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
