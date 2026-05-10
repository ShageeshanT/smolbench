// Judge rubric variants per task type. Picked by suite.task or auto from prompt shape.
const BASE = "You are a strict, calibrated grader. Reply with STRICT JSON, no other text:\n{\"score\": <0-10>, \"rationale\": \"<one short sentence>\"}";

const RUBRICS = {
  general: `${BASE}\n\nCriteria, each 0 to 10, average to a single integer:\n1. Correctness 2. Specificity 3. Format match.`,
  code: `${BASE}\n\nCriteria for code review answers:\n1. Did it identify the actual bug.\n2. Is the proposed fix correct.\n3. Is the explanation in 2 sentences as asked.`,
  classification: `${BASE}\n\nCriteria for classification answers:\n1. Is the label exactly one of the allowed values.\n2. Is the label correct given the input.\n3. Is the output free of extra text.`,
  extraction: `${BASE}\n\nCriteria for JSON extraction answers:\n1. Is the output valid JSON.\n2. Are required fields present.\n3. Are field values correct vs the source text.`,
  summarisation: `${BASE}\n\nCriteria for summarisation answers:\n1. Does it match the requested word count.\n2. Does it preserve key information.\n3. No invented facts not in the source.`,
};

export function rubricFor(taskOrSuite) {
  return RUBRICS[taskOrSuite] || RUBRICS.general;
}
export const TASKS = Object.keys(RUBRICS);
