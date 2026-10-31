import "server-only";
import { GoogleGenAI } from "@google/genai";

let geminiClient: GoogleGenAI | undefined;

export function isGeminiConfigured() {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}

export function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) throw new Error("Gemini API is not configured");

  geminiClient ??= new GoogleGenAI({ apiKey });
  return geminiClient;
}
