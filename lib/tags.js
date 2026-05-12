// Suite tag filtering. Prompts can carry a list of tags via meta.tags.
// CLI passes --tags a,b to keep only prompts with at least one matching tag.

export function filterByTags(prompts, tagList) {
  if (!tagList || !tagList.length) return prompts;
  const wanted = new Set(tagList.map((t) => t.toLowerCase()));
  return prompts.filter((p) => {
    const have = (p.meta?.tags || []).map((t) => String(t).toLowerCase());
    return have.some((t) => wanted.has(t));
  });
}

export function listAllTags(prompts) {
  const set = new Set();
  for (const p of prompts) for (const t of (p.meta?.tags || [])) set.add(String(t).toLowerCase());
  return [...set].sort();
}
