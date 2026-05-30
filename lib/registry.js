// Provider registry. Keep it simple: a map keyed by `${id}:${model}`.

const registry = new Map();

function register(provider) {
  if (!provider?.id || !provider?.model || typeof provider.call !== "function") {
    throw new Error("invalid provider: needs id, model, call()");
  }
  registry.set(`${provider.id}:${provider.model}`, provider);
}

function unregister(id, model) {
  registry.delete(`${id}:${model}`);
}

function list() {
  return [...registry.values()];
}

function get(id, model) {
  return registry.get(`${id}:${model}`);
}

function clear() {
  registry.clear();
}

module.exports = { register, unregister, list, get, clear };
