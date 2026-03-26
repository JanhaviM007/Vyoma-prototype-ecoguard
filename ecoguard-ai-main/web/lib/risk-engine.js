/**
 * EcoGuard Neural Risk Engine (V2.0)
 * Logic: Risk = (Hazard x Exposure) * Vulnerability_Multiplier
 */
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function generateAIPredictions(env, violations, forecast) {
    const prompt = `
    You are an AI Urban Risk Expert for EcoGuard. 
    Analyze the following city data and predict environmental risks for the next 6h, 24h, and 72h.
    
    Current Environment:
    - Temperature: ${env.temperature}°C
    - Rain: ${env.rain}mm
    - AQI: ${env.aqi}
    - Wind: ${env.windSpeed}km/h
    
    Current Violations/Reports:
    ${violations.map(v => `- ${v.type}: ${v.description}`).join('\n')}
    
    Weather Forecast (Next 72h):
    ${JSON.stringify(forecast)}
    
    Based on the interaction between current violations (like clogged drains or industrial smoke) and the incoming weather, provide:
    1. A risk level (HIGH, MODERATE, LOW) for Flood, Air Quality, and Heat for each time window (6h, 24h, 72h).
    2. Three concise, high-impact "insights" or "warnings" for authorities (e.g., "Critical flood risk in Zone 4 due to heavy rain + blocked infrastructure").
    
    Return ONLY a JSON object with this structure:
    {
        "forecast6h": "CRITICAL",
        "forecast24h": "MODERATE",
        "forecast72h": "LOW",
        "insights": ["insight 1", "insight 2", "insight 3"]
    }
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        throw new Error("Invalid AI Response");
    } catch (error) {
        console.error("AI Prediction Error:", error);
        return {
            forecast6h: "MODERATE",
            forecast24h: "LOW",
            forecast72h: "LOW",
            insights: ["AI analysis currently unavailable. Baseline monitoring active."]
        };
    }
}

export function calculateRiskScore(environment, violations) {
    // 1. BASELINE CALCULATIONS (Natural Hazard Level)
    const baseFloodRisk = calculateBaseFloodRisk(environment);
    const baseHealthRisk = calculateBaseHealthRisk(environment);

    // 2. VULNERABILITY MULTIPLIERS (Violation Amplifiers)
    // We use a compounding approach: multiple violations in one category 
    // increase risk non-linearly.
    let floodMultiplier = 1.0;
    let healthMultiplier = 1.0;
    let activeFactors = [];

    violations.forEach((v) => {
        const type = v.type?.toLowerCase() || "";

        // Flood Multipliers: Clogged infrastructure vs Illegal Dumping
        if (type.includes("drain") || type.includes("clog")) {
            floodMultiplier += 0.8; // Clogged drains are critical (1.8x)
            activeFactors.push("Critical: Drainage infrastructure obstruction detected.");
        }
        if (type.includes("dumping") || type.includes("trash")) {
            floodMultiplier += 0.3; // Solid waste reduces runoff capacity
            activeFactors.push("Warning: Solid waste dumping reduces absorption capacity.");
        }

        // Health Multipliers: Industrial vs Construction Dust
        if (type.includes("smoke") || type.includes("industrial")) {
            healthMultiplier += 1.0; // Industrial toxins double the risk
            activeFactors.push("Hazard: Industrial emissions detected in urban vicinity.");
        }
        if (type.includes("dust") || type.includes("construction")) {
            healthMultiplier += 0.4; // PM10/PM2.5 particles from construction
            activeFactors.push("Alert: Construction particulates elevating respiratory risk.");
        }
    });

    // 3. FINAL AGGREGATION
    const finalFloodRisk = Math.min(Math.round(baseFloodRisk * floodMultiplier), 100);
    const finalHealthRisk = Math.min(Math.round(baseHealthRisk * healthMultiplier), 100);

    return {
        flood: {
            score: finalFloodRisk,
            level: getRiskLevel(finalFloodRisk),
            isCritical: finalFloodRisk >= 75
        },
        health: {
            score: finalHealthRisk,
            level: getRiskLevel(finalHealthRisk),
            isCritical: finalHealthRisk >= 75
        },
        insights: activeFactors,
        timestamp: new Date().toISOString()
    };
}

/** * Helper: Environmental Baseline for Flooding
 */
function calculateBaseFloodRisk({ rain = 0, windSpeed = 0 }) {
    // 50mm rain is the typical urban "saturation point"
    let score = (rain * 1.6) + (windSpeed * 0.15);
    return Math.min(Math.max(Math.round(score), 0), 80);
}

/** * Helper: Environmental Baseline for Health
 */
function calculateBaseHealthRisk({ aqi = 0, temperature = 25 }) {
    // US-EPA Standard: AQI > 100 is Unhealthy for Sensitive Groups
    let score = (aqi * 0.5);

    // Heat Stress: Risks increase significantly over 35°C
    if (temperature > 35) {
        score += (temperature - 35) * 4;
    }
    return Math.min(Math.max(Math.round(score), 0), 80);
}

function getRiskLevel(score) {
    if (score >= 75) return "CRITICAL";
    if (score >= 45) return "MODERATE";
    return "LOW";
}