// Small text formatting helpers used by the CLI output layer.

/** Truncate a string to n chars, append … if truncated. */
export function truncate(s, n) {
  s = String(s ?? "").replace(/\s+/g, " ").trim();
  return s.length <= n ? s : s.slice(0, n - 1) + "…";
}

/** Pad a string with spaces to a fixed visible width. Right-pad by default. */
export function pad(s, n, side = "right") {
  s = String(s ?? "");
  if (s.length >= n) return s;
  const fill = " ".repeat(n - s.length);
  return side === "left" ? fill + s : s + fill;
}

/** Render a 2D array as a fixed-width plain-text table. Header row optional. */
export function table(rows, { header } = {}) {
  const all = header ? [header, ...rows] : rows;
  const widths = (all[0] || []).map((_, c) => Math.max(...all.map((r) => String(r[c] ?? "").length)));
  const lines = all.map((r) => widths.map((w, c) => pad(r[c], w)).join("  ").trimEnd());
  if (header) lines.splice(1, 0, widths.map((w) => "-".repeat(w)).join("  "));
  return lines.join("\n");
}
