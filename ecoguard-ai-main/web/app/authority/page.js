import { prisma } from "@/lib/prisma";
import AuthorityDashboardClient from "@/components/AuthorityDashboardClient";
import { getDashboardAnalyticsAction } from "@/app/actions/authority-actions";

export default async function AuthorityOverview() {
  // 1. Fetch dynamic stats from database
  const stats = {
    total: await prisma.report.count(),
    pending: await prisma.report.count({ where: { status: "PENDING" } }),
    resolved: await prisma.report.count({ where: { status: "RESOLVED" } }),
  };

  // 2. Fetch reports for heatmap visualization and feed
  const reports = await prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    take: 50, // Broader context for the heatmap
  });

  const recentReports = reports.slice(0, 5); // Latest 5 for the sidebar feed

  // 3. Fetch Analytics for charts
  const analytics = await getDashboardAnalyticsAction();

  // 4. Fetch Live Weather & AQI from external APIs (Pune Default)
  const lat = 18.5204;
  const lon = 73.8567;

  const weatherPromise = fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,rain`,
    { cache: "no-store" }
  ).then((res) => res.json());

  const aqiPromise = fetch(
    `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi`,
    { cache: "no-store" }
  ).then((res) => res.json());

  const [weatherData, aqiData] = await Promise.all([
    weatherPromise,
    aqiPromise,
  ]).catch(() => [null, null]);

  // 5. Transform DB data for the Heatmap component
  const heatmapData = reports
    .map((v) => {
      const parts = v.location?.split(",").map((s) => parseFloat(s.trim()));
      if (parts?.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        return {
          lat: parts[0],
          lon: parts[1],
          type: v.type,
          isVerified: v.isVerified,
          intensity: v.isVerified ? 1 : 0.6
        };
      }
      return null;
    })
    .filter(Boolean);

  return (
    <AuthorityDashboardClient
      stats={stats}
      recentReports={reports} // Pass all for better management context
      heatmapData={heatmapData}
      analytics={analytics}
      weather={{
        temp: weatherData?.current?.temperature_2m || '--',
      }}
      aqi={{
        val: aqiData?.current?.us_aqi || '--',
        status: aqiData?.current?.us_aqi > 100 ? "UNHEALTHY" : (aqiData?.current?.us_aqi ? "GOOD" : "UNKNOWN"),
      }}
    />
  );
}
