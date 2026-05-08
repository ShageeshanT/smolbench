// LLM judge harness. Scores a candidate response against a rubric,
// returns a normalised quality value in [0, 1].
//
// Pass any registered Provider as judgeProvider. Strongest model in your
// stack is the right pick (Opus, GPT-4o, Gemini Pro, etc.) so the judge is
// not the weakest link.

const RUBRIC = `You are a strict, calibrated grader. Score the candidate from 0 to 10 against the prompt.

Criteria, each 0 to 10:
1. Correctness: does it actually answer the prompt's intent?
2. Specificity: concrete and on topic vs generic.
3. Format: matches any format hint in the prompt's meta.expected, if present.

Average the three to a single integer 0 to 10.

Reply with STRICT JSON, no other text:
{"score": <0-10>, "rationale": "<one short sentence>"}`;

/**
 * @param {Object} args
 * @param {{call: Function}} args.judgeProvider - registered Provider
 * @param {{id:string, system?:string, user:string, meta?:Object}} args.prompt
 * @param {string} args.candidate - the response being graded
 * @returns {Promise<{score:number, rationale:string}>} score in [0,1]
 */
export async function judge({ judgeProvider, prompt, candidate }) {
  const judgePrompt = {
    id: `judge:${prompt.id}`,
    system: RUBRIC,
    user: `PROMPT:\n${prompt.user}\n\nMETA: ${JSON.stringify(prompt.meta || {})}\n\nCANDIDATE:\n${candidate}`,
  };
  let r;
  try {
    r = await judgeProvider.call(judgePrompt);
  } catch (e) {
    return { score: 0, rationale: `judge call threw: ${e.message || e}` };
  }
  if (r.error) return { score: 0, rationale: `judge error: ${r.error}` };
  const m = (r.text || "").match(/\{[\s\S]*\}/);
  if (!m) return { score: 0, rationale: "judge returned no json object" };
  try {
    const parsed = JSON.parse(m[0]);
    const raw = Number(parsed.score);
    const score = Number.isFinite(raw) ? Math.max(0, Math.min(1, raw / 10)) : 0;
    return { score, rationale: String(parsed.rationale || "").slice(0, 240) };
  } catch (e) {
    return { score: 0, rationale: `judge parse error: ${e.message}` };
  }
}
