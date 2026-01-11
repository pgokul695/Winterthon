import { GoogleGenerativeAI } from "@google/generative-ai";

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || "";

let genAI: GoogleGenerativeAI | null = null;

if (GOOGLE_API_KEY) {
  genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
}

export function getGeminiModels(): string[] {
  return [
    // Gemini 2.0 Series
    "gemini-2.0-flash",
    "gemini-2.0-flash-exp",
    
    // Gemini 1.5 Series
    "gemini-1.5-pro",
    "gemini-1.5-flash",
    "gemini-1.5-flash-8b",
    
    // Latest aliases
    "gemini-pro",
    "gemini-flash",
  ];
}

export async function generateWithGemini(
  model: string,
  prompt: string
): Promise<string> {
  if (!genAI || !GOOGLE_API_KEY) {
    throw new Error("GOOGLE_API_KEY not configured");
  }
  
  try {
    const generativeModel = genAI.getGenerativeModel({
      model: model,
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 2048,
      },
    });
    
    const result = await generativeModel.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    if (!text) {
      console.error("[Gemini] Empty response");
      throw new Error("Empty response from Gemini");
    }
    
    return text;
  } catch (error: any) {
    console.error("[Gemini] Error:", error.message);
    throw new Error(`Gemini API error: ${error.message}`);
  }
}
