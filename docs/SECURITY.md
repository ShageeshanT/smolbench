# Security

If you discover a security vulnerability in smolbench, please report it privately first.

## Reporting

- Open a private security advisory on GitHub: `https://github.com/ShageeshanT/smolbench/security/advisories/new`
- Or email the maintainer (address listed in the GitHub profile).

Please include: a clear description, a minimal reproduction if possible, and the version or commit you tested against.

## Scope

In scope:

- Code execution from a malicious suite YAML
- Credential leakage from cache, logs, or run output
- Path traversal via cache or runs paths
- ReDoS or unbounded resource use in the YAML reader, SSE parser, or report renderers

Out of scope:

- Vulnerabilities in third-party LLM providers themselves
- Issues that require pre-existing access to the user's filesystem or environment
- Quality of LLM outputs (a model saying something offensive is not a smolbench bug)

## Response

I will respond within 7 days and aim to ship a fix within 30 days for confirmed reports. Critical issues get faster turnaround.

## Hardening notes

- Suite YAML is parsed with a stdlib reader that does not support anchors, aliases, tags, or arbitrary type coercions, reducing the deserialisation attack surface.
- The result cache writes only to `~/.smolbench/cache` (overridable via `SMOLBENCH_CACHE_DIR`).
- Provider keys are read from env or the inline config, never logged. Review `docs/providers.md` for env variable names.
- The web UI is fully static and ships no inline scripts beyond `./app.js`.
