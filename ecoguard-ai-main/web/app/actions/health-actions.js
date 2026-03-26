"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function normalizeListField(value) {
  if (!value) return [];
  // If it's already an array (from getAll), return as-is
  if (Array.isArray(value)) return value.filter(Boolean).map((v) => String(v).trim());
  // If it's a comma-separated string, split it
  return String(value)
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

export async function saveHealthProfileAction(formData) {
  try {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    // 🔹 Raw values from form
    const chronicRaw = formData.get("chronicDiseases") || "";
    const symptomsRaw = formData.get("currentSymptoms") || "";
    const age = formData.get("ageRange") || "Unknown";

    const latitude = formData.get("latitude") || "18.5204";
    const longitude = formData.get("longitude") || "73.8567";

    // Normalize to arrays so they fit your Prisma schema (String[])
    const chronicConditions = normalizeListField(chronicRaw);
    const currentSymptoms = normalizeListField(symptomsRaw);

    // 🌦 WEATHER API (current conditions)
    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,uv_index,visibility`,
      { cache: "no-store" }
    );

    const weatherData = await weatherRes.json();
    const current = weatherData.current || {};

    // 🌫 AQI API (Open-Meteo Air Quality)
    const aqiRes = await fetch(
      `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=pm2_5,pm10,us_aqi,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone`,
      { cache: "no-store" }
    );

    const aqiData = await aqiRes.json();
    const aqi = aqiData.current || {};

    // Determine Vulnerability (Age 60+ OR has chronic conditions)
    const isVulnerable = age === "60+" || chronicConditions.length > 0;

    // 1️⃣ Update the user's health profile in the DB
    await prisma.profile.update({
      where: { clerkId: user.id },
      data: {
        ageRange: age === "Unknown" ? null : age,
        chronicConditions,
        currentSymptoms,
        hasSetupProfile: true,
        isVulnerable,
      },
    });

    // 2️⃣ Generate insight from (health text + current weather)
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const prompt = `
You are the EcoGuard Neural Health Engine. Provide a highly precise medical-environmental correlation.

USER PROFILE:
- Age: ${age}
- Chronic Conditions: ${chronicConditions.join(", ") || "None"}
- Symptoms: ${currentSymptoms.join(", ") || "None"}

LIVE TELEMETRY:
- Temp: ${current.temperature_2m}°C (Feels like ${current.apparent_temperature}°C)
- Humidity: ${current.relative_humidity_2m}%
- UV Index: ${current.uv_index}
- Visibility: ${current.visibility}m
- AQI: ${aqi.us_aqi}
- PM2.5: ${aqi.pm2_5} / PM10: ${aqi.pm10}
- Gases: CO (${aqi.carbon_monoxide}), NO2 (${aqi.nitrogen_dioxide}), SO2 (${aqi.sulphur_dioxide})

TASK:
Analyze how these metrics interact with the user's conditions.
Return JSON ONLY:
{
  "insight": "Concise 1-sentence headline summary",
  "riskLevel": "LOW" | "MODERATE" | "HIGH" | "CRITICAL",
  "recommendations": {
    "immediate": "Short-term action (e.g., stay indoors, take inhaler)",
    "lifestyle": "Long-term adjustment based on trends",
    "protectiveGear": "Specific mask or tech needed today"
  }
}
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().replace(/```json|```/g, "").trim();
    const structuredData = JSON.parse(responseText);

    // 3️⃣ Store a new HealthInsight row (history)
    await prisma.healthInsight.create({
      data: {
        clerkId: user.id,
        insight: structuredData.insight,
        temperature: current.temperature_2m,
        humidity: current.relative_humidity_2m,
        aqi: aqi.us_aqi,
        pm25: aqi.pm2_5,
        uv: current.uv_index,
        visibility: current.visibility,
        riskLevel: structuredData.riskLevel,
        recommendations: JSON.stringify(structuredData.recommendations),
      },
    });

    return {
      success: true,
      insight: structuredData.insight,
      weather: current.temperature_2m,
      aqi: aqi.us_aqi,
      isVulnerable,
    };
  } catch (error) {
    console.error("Health AI Error:", error);
    return { success: false };
  }
}

export async function refreshHealthInsightAction() {
  try {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    // 1. Fetch User Profile
    const profile = await prisma.profile.findUnique({
      where: { clerkId: user.id },
    });

    if (!profile) throw new Error("Profile not found");

    // 2. Telemetry (Default to Pune)
    const lat = "18.5204";
    const lon = "73.8567";

    // 🌦 WEATHER & AQI
    const [weatherRes, aqiRes] = await Promise.all([
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,uv_index,visibility`, { cache: "no-store" }),
      fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm2_5,pm10,us_aqi,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone`, { cache: "no-store" })
    ]);

    const weatherData = await weatherRes.json();
    const aqiData = await aqiRes.json();
    const current = weatherData.current || {};
    const aqi = aqiData.current || {};

    // 3. AI Correlation
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `
You are the EcoGuard Neural Health Engine. Provide a highly precise medical-environmental correlation.

USER PROFILE:
- Age: ${profile.ageRange || "Unknown"}
- Chronic Conditions: ${profile.chronicConditions.join(", ") || "None"}
- Symptoms: ${profile.currentSymptoms.join(", ") || "None"}

LIVE TELEMETRY:
- Temp: ${current.temperature_2m}°C
- Humidity: ${current.relative_humidity_2m}%
- UV Index: ${current.uv_index}
- Visibility: ${current.visibility}m
- AQI: ${aqi.us_aqi}
- PM2.5: ${aqi.pm2_5}

TASK:
Analyze how these metrics interact with the user's specific health profile.
Return JSON ONLY:
{
  "insight": "Concise headline summary",
  "riskLevel": "LOW" | "MODERATE" | "HIGH" | "CRITICAL",
  "recommendations": {
    "immediate": "Action now",
    "lifestyle": "Long-term adapt",
    "protectiveGear": "Specific mask/tech"
  }
}
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().replace(/```json|```/g, "").trim();
    let structuredData;
    try {
      structuredData = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse Gemini JSON:", responseText);
      throw new Error("AI Engine produced malformed response");
    }

    // 4. Store Insight with strict Float casting to avoid Prisma errors
    await prisma.healthInsight.create({
      data: {
        clerkId: user.id,
        insight: structuredData.insight || "Stable environmental conditions detected.",
        temperature: parseFloat(current.temperature_2m) || 0,
        humidity: parseFloat(current.relative_humidity_2m) || 0,
        aqi: parseFloat(aqi.us_aqi) || 0,
        pm25: parseFloat(aqi.pm2_5) || 0,
        uv: parseFloat(current.uv_index) || 0,
        visibility: parseFloat(current.visibility) || 10000,
        riskLevel: structuredData.riskLevel || "LOW",
        recommendations: JSON.stringify(structuredData.recommendations || {}),
      },
    });

    const { revalidatePath } = require("next/cache");
    revalidatePath("/citizen/health");

    return { success: true };
  } catch (error) {
    console.error("Refresh Health Error:", error);
    return { success: false, error: error.message };
  }
}