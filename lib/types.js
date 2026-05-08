// JSDoc typedefs used across smolbench. No runtime exports yet, just shapes.

/**
 * @typedef {Object} Prompt
 * @property {string} id           Stable identifier within a suite
 * @property {string} system       Optional system prompt
 * @property {string} user         User-side content
 * @property {Object<string,any>} [meta] Suite-defined metadata
 */

/**
 * @typedef {Object} ProviderCallResult
 * @property {string} text         The model's response text
 * @property {number} latencyMs    Wall-clock latency for the call
 * @property {number} promptTokens Input tokens (when available)
 * @property {number} completionTokens Output tokens (when available)
 * @property {string} [error]      Provider-side error string (if call failed)
 * @property {Object<string,any>} [raw] Provider-specific extras
 */

/**
 * @typedef {Object} Provider
 * @property {string} id           Stable identifier (e.g. "openai", "anthropic")
 * @property {string} model        Specific model variant
 * @property {(p: Prompt) => Promise<ProviderCallResult>} call
 */

export {};
