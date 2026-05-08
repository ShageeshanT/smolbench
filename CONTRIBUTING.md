# Contributing to smolbench

Thanks for considering a patch. Read this first.

## Commit shape

- One logical change per commit. The repo is built incrementally on purpose.
- Subject line in present tense, lower case after the prefix, no trailing period.
- Prefix with one of: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`.

## Code style

- Stdlib first. No deps without an open issue describing the need.
- ESM only. Two-space indent. JSDoc over TS until the surface settles.
- Errors return a row with `error` set, never throw across the runner.

## Pull requests

- Squash before merging.
- Update PLAN.md to tick the box your PR closes.
- Bump version in package.json on user-facing change.

## License

By submitting a PR you agree to release your contribution under MIT.
