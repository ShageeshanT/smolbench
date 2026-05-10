// Self diagnostic for smolbench config and provider keys.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parseYaml } from "./yaml.js";

export function doctor() {
  const findings = [];
  const cfgPath = process.env.SMOLBENCH_CONFIG || join(process.cwd(), ".smolbench.yaml");
  if (!existsSync(cfgPath)) {
    findings.push({ level: "warn", msg: `no .smolbench.yaml at ${cfgPath}, run 'smolbench init'` });
  } else {
    let cfg;
    try { cfg = parseYaml(readFileSync(cfgPath, "utf8")); } catch (e) { findings.push({ level: "error", msg: `config parse: ${e.message}` }); return findings; }
    if (!Array.isArray(cfg?.providers) || !cfg.providers.length) {
      findings.push({ level: "error", msg: "config has no providers" });
    } else {
      for (const p of cfg.providers) {
        if (!p.id) findings.push({ level: "error", msg: "provider missing id" });
        if (!p.kind) findings.push({ level: "error", msg: `provider ${p.id}: missing kind` });
        if (!p.model) findings.push({ level: "error", msg: `provider ${p.id}: missing model` });
        const envKey = `${(p.id || "").toUpperCase()}_API_KEY`;
        if (!p.apiKey && !process.env[envKey] && !process.env.ANTHROPIC_API_KEY && !process.env.GOOGLE_API_KEY && !process.env.NVIDIA_API_KEY) {
          findings.push({ level: "warn", msg: `provider ${p.id}: no inline apiKey, set env ${envKey}` });
        }
      }
    }
  }
  if (!process.env.ANTHROPIC_API_KEY && !process.env.NVIDIA_API_KEY && !process.env.GOOGLE_API_KEY) {
    findings.push({ level: "warn", msg: "no provider env keys detected; the run command will fail without keys" });
  }
  if (!findings.length) findings.push({ level: "ok", msg: "all good, ready to run" });
  return findings;
}
