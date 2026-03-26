"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

// 1. Initialize the API with your key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function analyzeImageAction(base64Image) {
  try {
    // 2. Now genAI is defined and can be used to get the model
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const prompt = `Analyze this environmental issue photo. 
    Provide a JSON response with:
    1. "title": (short name)
    2. "type": ("Pollution", "Waste", "Water Log", or "Industrial")
    3. "description": (one detailed sentence)
    Return ONLY the raw JSON without any markdown formatting or backticks.`;

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: base64Image, mimeType: "image/jpeg" } },
    ]);

    const response = await result.response;
    let text = response.text();

    // 3. Clean the text to ensure it's valid JSON
    const cleanJson = text.replace(/```json|```/g, "").trim();

    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return null;
  }
}
