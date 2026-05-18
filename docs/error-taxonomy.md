<!-- docs/error-taxonomy.md -->
# Error Taxonomy

| Category         | Severity   | Retryable | When it fires                                          |
| ---------------- | ---------- | --------- | ------------------------------------------------------ |
| timeout          | transient  | yes       | Provider call exceeded its budget                      |
| rate_limit       | transient  | yes       | HTTP 429 or provider-specific quota signal             |
| network_error    | transient  | yes       | ECONN*, DNS, socket reset                              |
| auth_error       | config     | no        | 401/403, missing or revoked credential                 |
| parse_error      | output     | no        | Output cannot be parsed into the declared format       |
| schema_mismatch  | output     | no        | Parsed output fails JSON Schema validation             |
| refusal          | model      | no        | Model declined ("I cannot help", "Sorry, I can't")   |
| hallucination    | model      | no        | Output contradicts ground truth (judge-detected)       |
| empty_output     | model      | yes       | Provider returned no text                              |
| format_violation | output     | no        | Output ignored the explicit format directive           |
| context_overflow | input      | no        | Prompt exceeded the model context window               |
| budget_exceeded  | config     | no        | --max-cost cap reached mid-run                         |
| unknown          | unknown    | no        | None of the above patterns matched                    |

## Severity

* `transient`: external state, retry-and-recover.
* `config`: caller misconfiguration, must be fixed before continuing.
* `output`: model returned something but it did not satisfy contracts.
* `input`: the prompt itself is the problem.
* `model`: model behaved within spec but the result is unusable.

## Adding a category

1. Add the entry to `CATEGORIES` in `lib/failure-categorizer.js`.
2. Add a detection branch in `fromError` or `fromOutput`.
3. Add a test case in `test/failure-categorizer.test.js`.
4. Document it in this table.
