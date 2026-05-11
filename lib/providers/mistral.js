// Mistral La Plateforme adapter, OpenAI-compat with retries.
import { createOpenAICompatProvider } from "./openai-compat.js";
export function createMistralProvider({ apiKey, model = "mistral-large-latest" }) {
  return createOpenAICompatProvider({
    id: "mistral",
    baseUrl: "https://api.mistral.ai/v1",
    apiKey,
    model,
  });
}
