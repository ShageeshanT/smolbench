# CommonJS Migration Notes

The current runtime should stay CommonJS until all tests and consumers are ready for ESM. Avoid package-wide `type: module` changes that break existing tests.
