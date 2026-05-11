// Cohere chat adapter. Distinct request shape from OpenAI: 'message' field.
import { withRetries } from "../retries.js";
export function createCohereProvider({ apiKey, model = "command-r-plus", retries = 3 }) {
  return {
    id: "cohere", model,
    async call(prompt) {
      const start = Date.now();
      const body = { model, message: prompt.user, preamble: prompt.system || undefined };
      const res = await withRetries(
        () => fetch("https://api.cohere.com/v1/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify(body),
        }),
        { max: retries },
      );
      const data = await res.json();
      if (!res.ok) return { text: "", latencyMs: Date.now() - start, error: data?.message || res.statusText, promptTokens: 0, completionTokens: 0 };
      const usage = data?.meta?.tokens || {};
      return {
        text: data?.text || "",
        latencyMs: Date.now() - start,
        promptTokens: usage.input_tokens || 0,
        completionTokens: usage.output_tokens || 0,
        raw: { id: data.generation_id, model: data.model },
      };
    },
  };
}
