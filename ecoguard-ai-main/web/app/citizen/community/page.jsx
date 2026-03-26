import { prisma } from "@/lib/prisma";
import CommunityHubClient from "@/components/CommunityHubClient";

export default async function CommunityHubPage() {
    const reports = await prisma.report.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            _count: {
                select: { comments: true }
            }
        }
    });

    return <CommunityHubClient initialReports={reports} />;
}
