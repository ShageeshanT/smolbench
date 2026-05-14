const { estimateCost, estimateRunCost, summariseCosts } = require("./cost-estimator");

describe("cost-estimator", () => {
  it("calculates openai pricing", () => {
    const c = estimateCost({ inputTokens: 1000, outputTokens: 500, provider: "openai" });
    expect(c).toBeCloseTo(1000 * 1.5e-6 + 500 * 4.86e-6, 6);
  });
  it("uses openai fallback for unknown", () => {
    expect(estimateCost({ inputTokens: 1000, outputTokens: 500, provider: "unknown" }))
      .toBe(estimateCost({ inputTokens: 1000, outputTokens: 500, provider: "openai" }));
  });
  it("deepseek cheaper than openai", () => {
    expect(estimateCost({ inputTokens: 1000, outputTokens: 500, provider: "deepseek" }))
      .toBeLessThan(estimateCost({ inputTokens: 1000, outputTokens: 500, provider: "openai" }));
  });
  it("ollama free", () => { expect(estimateCost({ inputTokens: 1000, outputTokens: 500, provider: "ollama" })).toBe(0); });
  it("estimateRunCost null when no usage", () => { expect(estimateRunCost({})).toBeNull(); });
  it("estimateRunCost from run result", () => {
    const c = estimateRunCost({ provider: "openai", usage: { prompt_tokens: 1000, completion_tokens: 500 } });
    expect(c).toBeCloseTo(1000 * 1.5e-6 + 500 * 4.86e-6, 6);
  });
  it("summariseCosts totals and by provider", () => {
    const r = [
      { provider: "openai", usage: { prompt_tokens: 1000, completion_tokens: 500 } },
      { provider: "deepseek", usage: { prompt_tokens: 1000, completion_tokens: 500 } },
    ];
    const s = summariseCosts(r);
    expect(s.totalUsd).toBeGreaterThan(0);
    expect(s.byProvider.openai).toBeGreaterThan(0);
    expect(s.byProvider.deepseek).toBeGreaterThan(0);
  });
});
