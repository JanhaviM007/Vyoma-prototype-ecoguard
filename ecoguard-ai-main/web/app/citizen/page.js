import { currentUser } from "@clerk/nextjs/server";
import DashboardClient from "@/components/DashboardClient";
import { prisma } from "@/lib/prisma";
import { calculateRiskScore } from "@/lib/risk-engine";

export default async function CitizenDashboardPage() {
  const user = await currentUser();

  // 1. Fetch User Profile for Location (Default: Pune)
  const profile = await prisma.profile.findUnique({
    where: { clerkId: user?.id },
  });

  const lat = 18.5204; // Default Pune
  const lon = 73.8567;

  // 2. Fetch Live Weather & AQI (Parallel)
  const weatherPromise = fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,rain,wind_speed_10m`,
    { cache: "no-store" }
  ).then((res) => res.json());

  const aqiPromise = fetch(
    `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm2_5`,
    { cache: "no-store" }
  ).then((res) => res.json());

  // 3. Fetch Active Violations (Pending Reports)
  const violationsPromise = prisma.report.findMany({
    where: { status: "PENDING" },
    select: { id: true, type: true, description: true, location: true, confidenceScore: true, isVerified: true, status: true, createdAt: true },
    orderBy: { confidenceScore: 'desc' } // Prioritize high confidence
  });

  const [weatherData, aqiData, violations] = await Promise.all([
    weatherPromise,
    aqiPromise,
    violationsPromise,
  ]);

  // 4. Transform Data for Risk Engine & Heatmap
  const environment = {
    rain: weatherData.current.rain,
    windSpeed: weatherData.current.wind_speed_10m,
    aqi: aqiData.current.us_aqi,
    temperature: weatherData.current.temperature_2m,
  };

  // Parse locations for Heatmap (Filter LOW CONFIDENCE if needed, for now show ALL but prioritize visual?)
  // Let's filter out very low confidence spam (<30)
  // 4. Transform Data for Heatmap with full context
  const heatmapData = violations
    .filter(v => v.confidenceScore === null || v.confidenceScore > 30)
    .map((v) => {
      const parts = v.location?.split(",").map((s) => parseFloat(s.trim()));
      if (parts?.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        return {
          id: v.id,
          lat: parts[0],
          lon: parts[1],
          type: v.type,
          description: v.description,
          status: v.status,
          confidenceScore: v.confidenceScore,
          isVerified: v.isVerified,
          createdAt: v.createdAt
        };
      }
      return null;
    })
    .filter(Boolean);

  // 5. Calculate Risk
  const riskAnalysis = calculateRiskScore(environment, violations);

  return (
    <DashboardClient
      firstName={user?.firstName || "Citizen"}
      riskAnalysis={riskAnalysis}
      weather={{
        temp: weatherData.current.temperature_2m,
        condition: weatherData.current.rain > 0 ? "Rainy" : "Clear",
      }}
      aqi={{
        val: aqiData.current.us_aqi,
        status: aqiData.current.us_aqi > 100 ? "Poor" : "Good",
      }}
      heatmapData={heatmapData}
    />
  );
}