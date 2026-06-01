# Quickstart

Run smolbench locally with the zero-key mock suite.

```bash
npm install
npm test
node bin/smolbench.js run examples/hello.yaml --provider mock
```

The mock suite is intentionally deterministic so new users can verify the CLI without paid provider keys.
