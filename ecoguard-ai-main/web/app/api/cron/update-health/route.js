import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createNotification } from "@/app/actions/notification-actions";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const dynamic = "force-dynamic";

export async function GET(request) {
    try {
        // 1. Security Check
        const authHeader = request.headers.get("authorization");
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return new Response("Unauthorized", { status: 401 });
        }

        // 2. Fetch active profiles that need updates
        // Batch limit to 10 to prevent timeout and API rate limits during cron
        const profiles = await prisma.profile.findMany({
            where: { hasSetupProfile: true },
            take: 10,
        });

        const lat = 18.5204; // Default Pune
        const lon = 73.8567;

        // Fetch common telemetry for the batch
        const [weatherRes, aqiRes] = await Promise.all([
            fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,uv_index,visibility`, { cache: "no-store" }),
            fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm2_5,us_aqi`, { cache: "no-store" })
        ]);

        const weatherData = await weatherRes.json();
        const aqiData = await aqiRes.json();
        const current = weatherData.current || {};
        const aqi = aqiData.current || {};

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const results = [];

        // 3. Process each profile
        for (const profile of profiles) {
            const prompt = `
        You are EcoGuard Neural Health Engine. Generate a structured health insight.
        
        USER: Age ${profile.ageRange}, Conditions: ${profile.chronicConditions.join(",")}, Symptoms: ${profile.currentSymptoms.join(",")}
        ENV: Temp ${current.temperature_2m}C, UV ${current.uv_index}, AQI ${aqi.us_aqi}, PM2.5 ${aqi.pm2_5}
        
        Return JSON:
        {
          "insight": "1-sentence summary",
          "riskLevel": "LOW/MODERATE/HIGH/CRITICAL",
          "recommendations": { "immediate": "...", "lifestyle": "...", "protectiveGear": "..." }
        }
        `;

            const result = await model.generateContent(prompt);
            const text = result.response.text().replace(/```json|```/g, "").trim();
            const data = JSON.parse(text);

            await prisma.healthInsight.create({
                data: {
                    clerkId: profile.clerkId,
                    insight: data.insight,
                    temperature: current.temperature_2m,
                    humidity: current.relative_humidity_2m,
                    aqi: aqi.us_aqi,
                    pm25: aqi.pm2_5,
                    uv: current.uv_index,
                    visibility: current.visibility,
                    riskLevel: data.riskLevel,
                    recommendations: JSON.stringify(data.recommendations),
                }
            });

            // 4. Notify user about new auto-generated insight
            await createNotification({
                clerkId: profile.clerkId,
                title: "New Health Insight",
                message: `Proactive analysis complete: ${data.insight.slice(0, 50)}...`,
                type: data.riskLevel === 'CRITICAL' || data.riskLevel === 'HIGH' ? "ALERT" : "INFO"
            });

            results.push({ userId: profile.clerkId, risk: data.riskLevel });
        }

        return NextResponse.json({
            success: true,
            processed: results.length,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error("Health Cron Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
