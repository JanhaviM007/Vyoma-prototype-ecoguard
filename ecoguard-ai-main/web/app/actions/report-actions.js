"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createNotification } from "./notification-actions";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper function for AI Verification
async function verifyReportWithAI(imageUrl, description, location) {
  try {
    // 1. Fetch live weather for context with comprehensive parameters
    const weatherRes = await fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=18.5204&longitude=73.8567&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,rain,weather_code,cloud_cover,wind_speed_10m,wind_gusts_10m,surface_pressure",
      { cache: "no-store" }
    );
    const weatherData = await weatherRes.json();
    const current = weatherData.current || {};

    // Construct rich context
    const weatherContext = `
    - Temperature: ${current.temperature_2m}°C (Feels like ${current.apparent_temperature}°C)
    - Humidity: ${current.relative_humidity_2m}%
    - Precipitation/Rain: ${current.precipitation}mm (Rain: ${current.rain}mm)
    - Wind: ${current.wind_speed_10m} km/h (Gusts: ${current.wind_gusts_10m} km/h)
    - Cloud Cover: ${current.cloud_cover}%
    - Pressure: ${current.surface_pressure} hPa
    - Weather Code: ${current.weather_code} (WMO code)
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
    You are an expert environmental risk analyst. Verify this citizen report with high precision using the provided real-time telemetry.
    
    Report Data:
    - Description: "${description}"
    - Location: "${location}"
    - Image URL: ${imageUrl}
    
    Real-Time Environmental Telemetry (At Location):
    ${weatherContext}

    Task:
    1. **Cross-Reference**: strictly compare the report claims against the telemetry.
       - *Example*: If report says "Flooding", check Precipitation/Rain and Soil Saturation impliations.
       - *Example*: If report says "Smog/Smoke", check Wind patterns (low wind = stagnation) and Cloud Cover.
       - *Example*: If report says "Heatwave", check Apparent Temperature and Humidity.
    2. **Image Analysis**: Check if the image visual matches the described violation and weather context (e.g., wet ground if raining).
    3. **Score Calculation**: Assign a "confidenceScore" (0-100).
       - 0-30: Likely false/spam or weather data completely contradicts claim (e.g., "Flood" during 0mm rain).
       - 31-70: Plausible but unmatched intensity or generic report.
       - 71-100: Highly corroborated by telemetry and visual evidence.
    
    Return JSON ONLY:
    {
      "confidenceScore": number,
      "isVerified": boolean, // true if score > 70
      "reasoning": "Detailed technical explanation citing specific weather metrics (e.g., 'Validated flooding due to 15mm active precipitation')"
    }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().replace(/```json|```/g, "").trim();

    return JSON.parse(text);

  } catch (error) {
    console.error("AI Verification Failed:", error);
    return { confidenceScore: 0, isVerified: false, reasoning: "AI Verification Failed" };
  }
}

export async function uploadReportAction(formData) {
  const { userId } = await auth();

  if (!userId) throw new Error("Unauthorized");

  const file = formData.get("image");
  const type = formData.get("type");
  const title = formData.get("title");
  const location = formData.get("location");
  const description = formData.get("description");

  // 1. Upload image to Supabase Storage
  const fileName = `report-${userId}-${Date.now()}.jpg`;
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("pollution-reports")
    .upload(fileName, file);

  if (uploadError) throw new Error("Image upload failed");

  const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/pollution-reports/${uploadData.path}`;

  // 1.5 Verify with AI
  const verification = await verifyReportWithAI(imageUrl, String(description), String(location));

  // 2. Save report to Database
  await prisma.report.create({
    data: {
      type: String(type || "General"),
      description: String(title ? `${title}: ${description}` : description),
      imageUrl,
      location: String(location || "Pune"),
      authorId: userId,
      status: "PENDING",
      confidenceScore: verification.confidenceScore || 0,
      isVerified: verification.isVerified || false,
    },
  });

  // 5. Create Notification for user
  await createNotification({
    clerkId: userId,
    title: "Report Submitted",
    message: `Your report has been analyzed. Status: ${verification.confidenceScore > 50 ? 'Verified' : 'Flagged for Review'}.`,
    type: verification.confidenceScore > 50 ? "SUCCESS" : "WARNING"
  });

  revalidatePath("/citizen/reports");
  redirect("/citizen/reports");
}
