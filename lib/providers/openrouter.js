// OpenRouter adapter via OpenAI-compatible base url. One key, ~100 models.
import { createOpenAICompatProvider } from "./openai-compat.js";
export function createOpenRouterProvider({ apiKey, model }) {
  return createOpenAICompatProvider({
    id: "openrouter",
    baseUrl: "https://openrouter.ai/api/v1",
    apiKey,
    model,
    headers: { "HTTP-Referer": "https://github.com/ShageeshanT/smolbench", "X-Title": "smolbench" },
  });
}
