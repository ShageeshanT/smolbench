# Prompt suite authoring guide

Suites are YAML files with a `suite` name, an optional `task` (used to pick a judge rubric), and a list of `prompts`.

## Minimum viable suite

\`\`\`yaml
suite: my-app
prompts:
  - id: greet
    user: Say hello in one short sentence.
\`\`\`

Run: `smolbench run my-app.yaml`.

## Full prompt fields

\`\`\`yaml
- id: unique-within-suite      # required
  system: |                    # optional
    Multi line system prompt.
  user: |                      # required
    Multi line user content.
  meta:                        # optional, free form
    expected: "the answer"     # used by judge rubrics for format match
    target_word_count: 25
    lang: javascript
\`\`\`

## Picking a task

Set `task` at the top level of the suite to pick a judge rubric:

| task | What the rubric checks |
|---|---|
| general | correctness, specificity, format match |
| code | bug identified, fix correct, length constraint |
| classification | label is allowed, label correct, no extra text |
| extraction | valid JSON, required fields present, field values correct |
| summarisation | word count, info preservation, no fabrication |

\`\`\`yaml
suite: bug-reports
task: code
prompts:
  - id: off-by-one
    user: |
      function lastN(arr, n) { return arr.slice(arr.length - n - 1); }
    meta:
      expected: off-by-one in the slice end index
\`\`\`

## Tips

- Keep each prompt under 1000 tokens. Long prompts skew latency comparisons.
- Use `meta.expected` for short answers. The judge LLM compares its grading to the expected value.
- Aim for 5 to 25 prompts per suite. Smaller suites have noisy results, larger suites get expensive.
- Suites are committed to git. Treat them like tests, name them by what they validate, not by the model du jour.
