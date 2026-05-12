// Schema check for .smolbench.yaml. Returns {ok, errors[]}, never throws.

const VALID_KINDS = new Set(["openai-compat", "anthropic", "google", "nvidia"]);

export function validateConfig(cfg) {
  const errors = [];
  if (!cfg || typeof cfg !== "object") {
    return { ok: false, errors: ["config must be an object"] };
  }
  if (!Array.isArray(cfg.providers)) {
    errors.push("config.providers must be an array");
  } else {
    cfg.providers.forEach((p, i) => {
      if (!p?.id) errors.push(`providers[${i}]: missing id`);
      if (!p?.kind) errors.push(`providers[${i}]: missing kind`);
      else if (!VALID_KINDS.has(p.kind)) errors.push(`providers[${i}]: unknown kind '${p.kind}', expected one of ${[...VALID_KINDS].join(", ")}`);
      if (!p?.model) errors.push(`providers[${i}]: missing model`);
      if (p?.kind === "openai-compat" && !p?.baseUrl) errors.push(`providers[${i}]: openai-compat needs baseUrl`);
    });
    const ids = cfg.providers.map((p) => p?.id).filter(Boolean);
    const dup = ids.find((id, i) => ids.indexOf(id) !== i);
    if (dup) errors.push(`duplicate provider id: ${dup}`);
  }
  if (cfg.weights) {
    const sum = ["q", "c", "l"].reduce((s, k) => s + (cfg.weights[k] || 0), 0);
    if (Math.abs(sum - 1) > 0.01) errors.push(`weights sum to ${sum.toFixed(3)}, expected ~1.0`);
  }
  return { ok: errors.length === 0, errors };
}
