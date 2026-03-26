import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateRiskScore, generateAIPredictions } from "@/lib/risk-engine";

export const dynamic = "force-dynamic";

export async function GET(request) {
    try {
        // 1. Security Check
        const authHeader = request.headers.get("authorization");
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return new Response("Unauthorized", { status: 401 });
        }

        // 2. Fetch all areas to update
        const areas = await prisma.riskArea.findMany();

        // Pune coords for demonstration
        const lat = 18.5204;
        const lon = 73.8567;

        // Fetch Current + Forecasted Weather (3 days)
        const weatherRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,rain,wind_speed_10m&hourly=temperature_2m,rain&forecast_days=3`,
            { cache: "no-store" }
        );
        const weatherData = await weatherRes.json();

        const aqiRes = await fetch(
            `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi`,
            { cache: "no-store" }
        );
        const aqiData = await aqiRes.json();

        const violations = await prisma.report.findMany({
            where: { status: "PENDING" },
        });

        const current = weatherData.current || {};
        const env = {
            rain: current.rain || 0,
            windSpeed: current.wind_speed_10m || 0,
            aqi: aqiData.current?.us_aqi || 50,
            temperature: current.temperature_2m || 30,
        };

        // 1. Calculate Real-time Risk Score
        const analysis = calculateRiskScore(env, violations);

        // 2. Generate AI Predictions based on Forecast
        const aiPredictions = await generateAIPredictions(env, violations, weatherData.hourly);

        // 3. Update All Areas with fresh data
        await prisma.riskArea.updateMany({
            data: {
                floodRisk: analysis.flood.level,
                airQuality: analysis.health.level,
                heatRisk: env.temperature > 35 ? "HIGH" : "LOW",
                forecast6h: aiPredictions.forecast6h,
                forecast24h: aiPredictions.forecast24h,
                forecast72h: aiPredictions.forecast72h,
                insights: aiPredictions.insights,
                updatedAt: new Date(),
            },
        });

        return NextResponse.json({
            success: true,
            updated: areas.length,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error("Risk Cron Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
