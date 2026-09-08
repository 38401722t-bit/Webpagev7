import { GoogleGenAI } from "@google/genai";
import { CONFIG } from "../../config/env";

let aiClient: GoogleGenAI | null = null;

export function getGemini(): GoogleGenAI | null {
  const apiKey = CONFIG.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      fetch: (url, init) => {
        const headers = new Headers(init?.headers);
        headers.set("User-Agent", "aistudio-build");
        return fetch(url, { ...init, headers });
      },
    });
  }
  return aiClient;
}
