# Retry Policy

Retries should be conservative. Retry transient provider failures and rate limits with backoff. Do not retry deterministic schema or validation failures unless the input changes.
