// Generic OpenAI-compatible chat completion adapter. Works for OpenAI itself,
// NVIDIA NIM (https://integrate.api.nvidia.com/v1), OpenRouter, Together,
// Groq, and most local servers (vLLM, LM Studio, Ollama OpenAI mode).

export function createOpenAICompatProvider({ id, baseUrl, apiKey, model, headers = {} }) {
  return {
    id,
    model,
    async call(prompt) {
      const start = Date.now();
      const messages = [];
      if (prompt.system) messages.push({ role: "system", content: prompt.system });
      messages.push({ role: "user", content: prompt.user });
      const res = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          ...headers,
        },
        body: JSON.stringify({ model, messages, max_tokens: 512 }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { text: "", latencyMs: Date.now() - start, error: data?.error?.message || res.statusText, promptTokens: 0, completionTokens: 0 };
      }
      const text = data?.choices?.[0]?.message?.content || "";
      const usage = data?.usage || {};
      return {
        text,
        latencyMs: Date.now() - start,
        promptTokens: usage.prompt_tokens || 0,
        completionTokens: usage.completion_tokens || 0,
        raw: { id: data.id, model: data.model },
      };
    },
  };
}
