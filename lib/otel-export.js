// Minimal OpenTelemetry exporter. Emits one span per result row in OTLP/HTTP
// JSON format. Only the metric/span fields smolbench actually populates.
// Full conformance is not the goal; readability for downstream tools is.

const SERVICE_NAME = "smolbench";

export function toOtlpJson(run) {
  const at = Date.parse(run.at) || Date.now();
  const spans = (run.rows || []).map((r, idx) => {
    const startMs = at + idx * 10;
    const endMs = startMs + (r.latencyMs || 0);
    return {
      traceId: hexId(32, run.suite, idx),
      spanId: hexId(16, r.provider, r.model, r.promptId),
      name: `${r.provider}.${r.model}.${r.promptId}`,
      kind: "SPAN_KIND_CLIENT",
      startTimeUnixNano: BigInt(startMs).toString() + "000000",
      endTimeUnixNano: BigInt(endMs).toString() + "000000",
      attributes: [
        { key: "smolbench.suite", value: { stringValue: run.suite || "" } },
        { key: "smolbench.provider", value: { stringValue: r.provider || "" } },
        { key: "smolbench.model", value: { stringValue: r.model || "" } },
        { key: "smolbench.prompt_id", value: { stringValue: r.promptId || "" } },
        { key: "smolbench.cost_usd", value: { doubleValue: Number(r.cost || 0) } },
        { key: "smolbench.quality", value: { doubleValue: Number(r.quality || 0) } },
        { key: "smolbench.prompt_tokens", value: { intValue: Number(r.promptTokens || 0) } },
        { key: "smolbench.completion_tokens", value: { intValue: Number(r.completionTokens || 0) } },
      ],
      status: { code: r.error ? "STATUS_CODE_ERROR" : "STATUS_CODE_OK" },
    };
  });
  return {
    resourceSpans: [{
      resource: { attributes: [{ key: "service.name", value: { stringValue: SERVICE_NAME } }] },
      scopeSpans: [{ scope: { name: SERVICE_NAME }, spans }],
    }],
  };
}

function hexId(len, ...parts) {
  let h = 0;
  const s = parts.join("|");
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return (h.toString(16) + "0".repeat(len)).slice(0, len);
}
