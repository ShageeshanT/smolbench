// SSE parser for OpenAI-compatible streaming completions.
// Yields incremental delta strings as the response arrives.
//
// Usage:
//   for await (const delta of parseSse(response.body)) acc += delta;

export async function* parseSse(stream) {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    let idx;
    while ((idx = buf.indexOf("\n")) >= 0) {
      const line = buf.slice(0, idx).trim();
      buf = buf.slice(idx + 1);
      if (!line.startsWith("data:")) continue;
      const payload = line.slice(5).trim();
      if (payload === "[DONE]") return;
      try {
        const obj = JSON.parse(payload);
        const delta = obj.choices?.[0]?.delta?.content || "";
        if (delta) yield delta;
      } catch { /* skip malformed chunk */ }
    }
  }
}
