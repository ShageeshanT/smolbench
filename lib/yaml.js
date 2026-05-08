// Minimal YAML reader for smolbench suite files. Stdlib only.
//
// Supports the subset suites actually use:
//   - top level mapping with nested mappings and sequences
//   - sequence of mappings (the prompts list)
//   - block scalars `|` and `|-` for multi line user content
//   - quoted strings (double or single)
//   - integers, floats, booleans, null
//   - line comments starting with `#`
//
// Not supported: flow style ({a: 1, b: 2}), anchors, aliases, tags.
// If you need full YAML, swap this for js-yaml. We avoided the dep on purpose.

export function parseYaml(text) {
  const lines = text.split(/\r?\n/);
  const cursor = { i: 0 };

  function indentOf(s) {
    return s.length - s.trimStart().length;
  }
  function isBlank(s) {
    const t = s.trim();
    return t === "" || t.startsWith("#");
  }
  function findKeyEnd(s) {
    let inStr = false, q = "";
    for (let k = 0; k < s.length; k++) {
      const c = s[k];
      if (inStr) {
        if (c === q && s[k - 1] !== "\\") inStr = false;
        continue;
      }
      if (c === '"' || c === "'") { inStr = true; q = c; continue; }
      if (c === ":") return k;
    }
    return -1;
  }
  function parseScalar(s) {
    if (s === "null" || s === "~" || s === "") return null;
    if (s === "true") return true;
    if (s === "false") return false;
    if (/^-?\d+$/.test(s)) return Number(s);
    if (/^-?\d*\.\d+$/.test(s)) return Number(s);
    if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
      return s.slice(1, -1).replace(/\\"/g, '"').replace(/\\'/g, "'");
    }
    return s;
  }
  function readBlockScalar(indent, keepTrailingNewlines) {
    const out = [];
    while (cursor.i < lines.length) {
      const raw = lines[cursor.i];
      if (raw.trim() === "") { out.push(""); cursor.i++; continue; }
      const li = indentOf(raw);
      if (li < indent) break;
      out.push(raw.slice(indent));
      cursor.i++;
    }
    let s = out.join("\n");
    if (!keepTrailingNewlines) s = s.replace(/\n+$/, "");
    return s;
  }
  function peekIndentAt(min) {
    for (let j = cursor.i; j < lines.length; j++) {
      if (isBlank(lines[j])) continue;
      const li = indentOf(lines[j]);
      return li >= min ? li : -1;
    }
    return -1;
  }
  function peekIsListAt(indent) {
    for (let j = cursor.i; j < lines.length; j++) {
      if (isBlank(lines[j])) continue;
      const li = indentOf(lines[j]);
      if (li !== indent) return false;
      const stripped = lines[j].slice(indent);
      return stripped === "-" || stripped.startsWith("- ");
    }
    return false;
  }
  function readMapping(indent) {
    const out = {};
    while (cursor.i < lines.length) {
      const raw = lines[cursor.i];
      if (isBlank(raw)) { cursor.i++; continue; }
      const li = indentOf(raw);
      if (li < indent) return out;
      if (li > indent) return out; // shouldn't happen at well-formed input
      const stripped = raw.slice(indent);
      if (stripped.startsWith("-")) return out;
      const ke = findKeyEnd(stripped);
      if (ke < 0) return out;
      const key = stripped.slice(0, ke).trim();
      const rest = stripped.slice(ke + 1).trim();
      cursor.i++;
      if (rest === "") {
        const childIndent = peekIndentAt(indent + 1);
        if (childIndent < 0) { out[key] = null; continue; }
        if (peekIsListAt(childIndent)) out[key] = readSequence(childIndent);
        else out[key] = readMapping(childIndent);
      } else if (rest === "|" || rest === "|-" || rest === ">" || rest === ">-") {
        const childIndent = peekIndentAt(indent + 1);
        const keep = rest === "|";
        out[key] = childIndent < 0 ? "" : readBlockScalar(childIndent, keep);
      } else {
        out[key] = parseScalar(rest);
      }
    }
    return out;
  }
  function readSequence(indent) {
    const out = [];
    while (cursor.i < lines.length) {
      const raw = lines[cursor.i];
      if (isBlank(raw)) { cursor.i++; continue; }
      const li = indentOf(raw);
      if (li < indent) return out;
      if (li > indent) return out;
      const stripped = raw.slice(indent);
      if (!stripped.startsWith("-")) return out;
      const after = stripped === "-" ? "" : stripped.slice(2);
      cursor.i++;
      if (after === "") {
        const childIndent = peekIndentAt(indent + 1);
        if (childIndent < 0) { out.push(null); continue; }
        out.push(peekIsListAt(childIndent) ? readSequence(childIndent) : readMapping(childIndent));
      } else if (findKeyEnd(after) >= 0) {
        // Inline first key of a mapping. The sub-mapping starts at indent+2.
        const ke = findKeyEnd(after);
        const k = after.slice(0, ke).trim();
        const v = after.slice(ke + 1).trim();
        const obj = {};
        if (v === "") {
          const childIndent = peekIndentAt(indent + 3);
          if (childIndent < 0) obj[k] = null;
          else if (peekIsListAt(childIndent)) obj[k] = readSequence(childIndent);
          else obj[k] = readMapping(childIndent);
        } else if (v === "|" || v === "|-" || v === ">" || v === ">-") {
          const childIndent = peekIndentAt(indent + 3);
          const keep = v === "|";
          obj[k] = childIndent < 0 ? "" : readBlockScalar(childIndent, keep);
        } else {
          obj[k] = parseScalar(v);
        }
        Object.assign(obj, readMapping(indent + 2));
        out.push(obj);
      } else {
        out.push(parseScalar(after));
      }
    }
    return out;
  }

  return readMapping(0);
}
