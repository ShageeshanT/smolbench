// Together AI adapter via OpenAI-compatible base url.
import { createOpenAICompatProvider } from "./openai-compat.js";
export function createTogetherProvider({ apiKey, model }) {
  return createOpenAICompatProvider({ id: "together", baseUrl: "https://api.together.xyz/v1", apiKey, model });
}
