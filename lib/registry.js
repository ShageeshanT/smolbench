// Provider registry. Keep it simple: a map keyed by `${id}:${model}`.

const registry = new Map();

export function register(provider) {
  if (!provider?.id || !provider?.model || typeof provider.call !== "function") {
    throw new Error("invalid provider: needs id, model, call()");
  }
  registry.set(`${provider.id}:${provider.model}`, provider);
}

export function unregister(id, model) {
  registry.delete(`${id}:${model}`);
}

export function list() {
  return [...registry.values()];
}

export function get(id, model) {
  return registry.get(`${id}:${model}`);
}

export function clear() {
  registry.clear();
}
