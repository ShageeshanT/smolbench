// Anthropic Messages API adapter. Distinct from OpenAI shape.

export function createAnthropicProvider({ apiKey, model, baseUrl = "https://api.anthropic.com", headers = {} }) {
  return {
    id: "anthropic",
    model,
    async call(prompt) {
      const start = Date.now();
      const body = {
        model,
        max_tokens: 512,
        messages: [{ role: "user", content: prompt.user }],
      };
      if (prompt.system) body.system = prompt.system;
      const res = await fetch(`${baseUrl.replace(/\/$/, "")}/v1/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          ...headers,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        return { text: "", latencyMs: Date.now() - start, error: data?.error?.message || res.statusText, promptTokens: 0, completionTokens: 0 };
      }
      const text = (data?.content || []).map((b) => b.text || "").join("");
      const usage = data?.usage || {};
      return {
        text,
        latencyMs: Date.now() - start,
        promptTokens: usage.input_tokens || 0,
        completionTokens: usage.output_tokens || 0,
        raw: { id: data.id, model: data.model },
      };
    },
  };
}
