// Perplexity Sonar adapter, OpenAI-compat with retries.
import { createOpenAICompatProvider } from "./openai-compat.js";
export function createPerplexityProvider({ apiKey, model = "sonar" }) {
  return createOpenAICompatProvider({
    id: "perplexity",
    baseUrl: "https://api.perplexity.ai",
    apiKey,
    model,
  });
}
