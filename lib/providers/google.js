// Google Gemini adapter via the OpenAI-compatible endpoint. Saves us writing
// the native generateContent shape for now.

import { createOpenAICompatProvider } from "./openai-compat.js";

export function createGoogleProvider({ apiKey, model }) {
  return createOpenAICompatProvider({
    id: "google",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
    apiKey,
    model,
  });
}
