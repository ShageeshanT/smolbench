// Groq adapter via OpenAI-compatible base url. Fast inference, llama / mixtral.
import { createOpenAICompatProvider } from "./openai-compat.js";
export function createGroqProvider({ apiKey, model }) {
  return createOpenAICompatProvider({ id: "groq", baseUrl: "https://api.groq.com/openai/v1", apiKey, model });
}
