// Judge ensemble: run multiple judge providers, return the mean quality.
// Reduces single-judge bias. Pass an array of providers; if any throws,
// it is excluded from the average rather than failing the whole run.

import { judge } from "./judge.js";

/**
 * @param {Object} args
 * @param {Array<{call: Function}>} args.judgeProviders
 * @param {{id:string, system?:string, user:string, meta?:Object}} args.prompt
 * @param {string} args.candidate
 * @returns {Promise<{score:number, votes:Array}>}
 */
export async function ensembleJudge({ judgeProviders, prompt, candidate }) {
  const votes = [];
  for (const p of judgeProviders) {
    try {
      const v = await judge({ judgeProvider: p, prompt, candidate });
      votes.push({ provider: p.id, model: p.model, ...v });
    } catch (e) {
      votes.push({ provider: p.id, model: p.model, error: String(e?.message || e) });
    }
  }
  const valid = votes.filter((v) => typeof v.score === "number");
  if (!valid.length) return { score: 0, votes };
  const score = valid.reduce((s, v) => s + v.score, 0) / valid.length;
  return { score, votes };
}
