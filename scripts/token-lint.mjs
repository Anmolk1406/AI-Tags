#!/usr/bin/env node
// Token guard: reports raw colour (hex / rgb[a] / hsl[a]) and font-shorthand literals that should be design tokens.
//
//   node scripts/token-lint.mjs                 summary per folder (src/components, src/flows/<flow>, src/kit, src/app …)
//   node scripts/token-lint.mjs -v [path…]      also list every finding (optionally only under the given paths)
//   node scripts/token-lint.mjs --strict <path>  exit 1 if <path> has findings (default strict scope: src/components)
//
// Exit code is non-zero when the strict scope (src/components unless --strict is given) has any finding.
// Ignored: comments, src/foundations/** (where tokens are defined), and lines carrying `token-lint-ignore`.
// Literals inside a flow's own tokens.ts are reported separately ("in tokens.ts") and never fail the run —
// that file is where flow-scoped tokens live. Replacement lookup: scripts/token-map.json (colors + type).
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const verbose = args.includes('-v') || args.includes('--verbose');
const strictIdx = args.indexOf('--strict');
const strict = strictIdx >= 0 ? args[strictIdx + 1] : 'src/components';
const only = args.filter((a, i) => !a.startsWith('-') && (strictIdx < 0 || i !== strictIdx + 1));
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');

const files = [];
const walk = (d) => {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(tsx?|css)$/.test(e.name) && !e.name.endsWith('.d.ts')) files.push(p);
  }
};
walk(path.join(root, 'src'));

/** blank out comments (keeping newlines + columns) so docs that quote a hex don't count */
function stripComments(src, css) {
  let out = '';
  let i = 0;
  let quote = null;
  while (i < src.length) {
    const c = src[i];
    const n = src[i + 1];
    if (quote) {
      out += c;
      if (c === '\\') { out += n ?? ''; i += 2; continue; }
      if (c === quote) quote = null;
      i++;
      continue;
    }
    if (c === '/' && n === '*') {
      const end = src.indexOf('*/', i + 2);
      const stop = end < 0 ? src.length : end + 2;
      out += src.slice(i, stop).replace(/[^\n]/g, ' ');
      i = stop;
      continue;
    }
    if (!css && c === '/' && n === '/') {
      const end = src.indexOf('\n', i);
      const stop = end < 0 ? src.length : end;
      out += ' '.repeat(stop - i);
      i = stop;
      continue;
    }
    if (c === "'" || c === '"' || c === '`') quote = c;
    out += c;
    i++;
  }
  return out;
}

const HEX = /(?<![\w&#/])#([0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})(?![\w-])/g;
const FUNC = /\b(?:rgba?|hsla?)\(\s*[\d.]/g;
const FONT = /\bfont\s*:\s*['"`]?\s*(?:italic\s+)?[1-9]00\s+[\d.]+px/g;

function scan(file) {
  const raw = fs.readFileSync(file, 'utf8');
  const css = file.endsWith('.css');
  const code = stripComments(raw, css).split('\n');
  const rawLines = raw.split('\n');
  const found = [];
  code.forEach((line, i) => {
    if (rawLines[i].includes('token-lint-ignore')) return;
    for (const m of line.matchAll(HEX)) {
      const h = m[1];
      // "#123" in copy (order numbers) is not a colour; keep #000 / #111 … style greys
      if (/^\d+$/.test(h) && h.length < 6 && !/^(\d)\1+$/.test(h)) continue;
      found.push({ kind: 'hex', line: i + 1, text: m[0] });
    }
    for (const m of line.matchAll(FUNC)) found.push({ kind: 'rgba', line: i + 1, text: line.slice(m.index, line.indexOf(')', m.index) + 1) });
    for (const m of line.matchAll(FONT)) found.push({ kind: 'font', line: i + 1, text: m[0].replace(/^font\s*:\s*['"`]?\s*/, '') });
  });
  return found;
}

const groupOf = (rel) => {
  const p = rel.split('/');
  if (p[1] === 'flows' && p.length > 3) return `src/flows/${p[2]}`;
  return p.slice(0, 2).join('/');
};

const groups = new Map();
let strictCount = 0;
const details = [];
for (const f of files) {
  const rel = path.relative(root, f).split(path.sep).join('/');
  if (rel.startsWith('src/foundations/')) continue;
  const found = scan(f);
  if (!found.length) continue;
  const inTokens = /^src\/flows\/[^/]+\/tokens\.ts$/.test(rel);
  const g = groupOf(rel);
  const row = groups.get(g) ?? { hex: 0, rgba: 0, font: 0, tokensFile: 0 };
  for (const x of found) {
    if (inTokens) row.tokensFile++;
    else row[x.kind]++;
  }
  groups.set(g, row);
  if (!inTokens && (rel === strict || rel.startsWith(strict.replace(/\/?$/, '/')))) strictCount += found.length;
  if (verbose && (!only.length || only.some((o) => rel.startsWith(o.replace(/^\.\//, ''))))) for (const x of found) details.push(`${rel}:${x.line}  ${x.kind.padEnd(4)}  ${x.text}${inTokens ? '  (tokens.ts)' : ''}`);
}

if (details.length) console.log(details.join('\n') + '\n');
const rows = [...groups].sort(([a], [b]) => a.localeCompare(b));
const pad = (s, n) => String(s).padStart(n);
console.log(`${'folder'.padEnd(28)}${pad('hex', 6)}${pad('rgba', 6)}${pad('font', 6)}${pad('total', 7)}   in tokens.ts`);
let total = 0;
for (const [g, r] of rows) {
  const t = r.hex + r.rgba + r.font;
  total += t;
  console.log(`${g.padEnd(28)}${pad(r.hex, 6)}${pad(r.rgba, 6)}${pad(r.font, 6)}${pad(t, 7)}   ${r.tokensFile || ''}`);
}
console.log(`${'TOTAL'.padEnd(28)}${pad('', 18)}${pad(total, 7)}`);
if (strictCount) {
  console.error(`\n✗ ${strict}: ${strictCount} raw literal(s) — use tokens (scripts/token-map.json), or mark true geometry with token-lint-ignore.`);
  process.exit(1);
}
console.log(`\n✓ ${strict}: no raw colour / font literals`);
