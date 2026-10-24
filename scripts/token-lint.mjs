#!/usr/bin/env node
// Token guard: reports raw colour (hex / rgb[a] / hsl[a]) and font-shorthand literals that should be design tokens,
// plus raw font sizes and corner radii ("px" column) and `token-lint-ignore` lines that give no reason.
//
//   node scripts/token-lint.mjs                 summary per folder (src/components, src/flows/<flow>, src/kit, src/app …)
//   node scripts/token-lint.mjs -v [path…]      also list every finding as file:line (optionally only under the given paths)
//   node scripts/token-lint.mjs --strict <path>  exit 1 if <path> has colour / font findings (default strict scope: src/components)
//
// Exit code is non-zero when the strict scope (src/components unless --strict is given) has any hex / rgba / font finding.
// The "px" findings (`font-size: 13px`, `border-radius: 10px`, `fontSize: 13`, `borderRadius: 10` with a number that has a
// token) and "no reason" (a `token-lint-ignore` without `— <reason>`) are reported but never fail the run (yet).
// Ignored: comments, src/foundations/** (where tokens are defined), and lines carrying `token-lint-ignore`.
// Literals inside a flow's own tokens.ts (or tokens.<area>.ts) are reported separately ("in tokens.ts").
// Replacement lookup: scripts/token-map.json (colors, type, fontSize, radius).
//
// No custom colours unless someone asked for one. Per flow (src/flows/<flow>, tokens files included):
//   · a flow without a budget in scripts/flow-baseline.json → colourBudget (every flow made after the folder contract)
//     fails on any hex / rgba / font literal;
//   · a legacy flow fails when its count rises above its budget (it may only go down; lower it with --baseline);
//   · a line marked `custom-color — <who asked, why>` is an explicitly requested colour: allowed, counted in the
//     "custom" column and listed by -v, so a developer can find every one (a port's source value counts: cite the path).
//   node scripts/token-lint.mjs --baseline       rewrite colourBudget to today's counts (after you removed literals)
import fs from 'node:fs';
import path from 'node:path';
import { CUSTOM_COLOR } from './lib/custom-color.mjs';

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
// raw sizes that have a token: CSS `font-size: 13px` / `border-radius: 10px` (every value of a shorthand), TS `fontSize: 13` / `borderRadius: 10`
const CSS_SIZE = /\b(font-size|border(?:-(?:top|bottom|start|end)-(?:left|right|start|end))?-radius)\s*:\s*([^;}]+)/g;
const TS_SIZE = /\b(fontSize|borderRadius|border(?:Top|Bottom|Start|End)(?:Left|Right|Start|End)Radius)\s*:\s*(\d+(?:\.\d+)?)(?![\w.%])/g;
const map = JSON.parse(fs.readFileSync(path.join(root, 'scripts/token-map.json'), 'utf8'));
const tokenFor = (prop, n) => (/font/i.test(prop) ? map.fontSize : map.radius)?.[`${n}px`];
const IGNORE_REASON = /token-lint-ignore\s*(?:[—–:-]+|\()\s*\S/;
const baselineFile = path.join(root, 'scripts/flow-baseline.json');
const baseline = fs.existsSync(baselineFile) ? JSON.parse(fs.readFileSync(baselineFile, 'utf8')) : {};
let budget = baseline.colourBudget ?? {};

function scan(file) {
  const raw = fs.readFileSync(file, 'utf8');
  const css = file.endsWith('.css');
  const code = stripComments(raw, css).split('\n');
  const rawLines = raw.split('\n');
  const found = [];
  code.forEach((line, i) => {
    if (CUSTOM_COLOR.test(rawLines[i])) {
      found.push({ kind: 'custom', line: i + 1, text: rawLines[i].trim().slice(0, 100) });
      return;
    }
    if (rawLines[i].includes('token-lint-ignore')) {
      if (!IGNORE_REASON.test(rawLines[i]) && !/token-lint-ignore-file/.test(rawLines[i])) found.push({ kind: 'noReason', line: i + 1, text: rawLines[i].trim().slice(0, 80) });
      return;
    }
    for (const m of line.matchAll(HEX)) {
      const h = m[1];
      // "#123" in copy (order numbers) is not a colour; keep #000 / #111 … style greys
      if (/^\d+$/.test(h) && h.length < 6 && !/^(\d)\1+$/.test(h)) continue;
      found.push({ kind: 'hex', line: i + 1, text: m[0] });
    }
    for (const m of line.matchAll(FUNC)) found.push({ kind: 'rgba', line: i + 1, text: line.slice(m.index, line.indexOf(')', m.index) + 1) });
    for (const m of line.matchAll(FONT)) found.push({ kind: 'font', line: i + 1, text: m[0].replace(/^font\s*:\s*['"`]?\s*/, '') });
    if (css) {
      for (const m of line.matchAll(CSS_SIZE)) {
        if (/var\(|calc\(/.test(m[2])) continue;
        for (const [, n] of m[2].matchAll(/(?<![\w.])(\d+(?:\.\d+)?)px\b/g)) {
          const tok = tokenFor(m[1], n);
          if (tok) found.push({ kind: 'px', line: i + 1, text: `${m[1]}: ${n}px → ${tok}` });
        }
      }
    } else {
      for (const m of line.matchAll(TS_SIZE)) {
        const tok = tokenFor(m[1], m[2]);
        if (tok) found.push({ kind: 'px', line: i + 1, text: `${m[1]}: ${m[2]} → ${tok}` });
      }
    }
  });
  return found;
}

const groupOf = (rel) => {
  const p = rel.split('/');
  if (p[1] === 'flows' && p.length > 3) return `src/flows/${p[2]}`;
  return p.slice(0, 2).join('/');
};

const FAILS = new Set(['hex', 'rgba', 'font']); // the pass/fail contract; px / noReason are advisory
const groups = new Map();
let strictCount = 0;
const details = [];
for (const f of files) {
  const rel = path.relative(root, f).split(path.sep).join('/');
  if (rel.startsWith('src/foundations/')) continue;
  const found = scan(f);
  if (!found.length) continue;
  const inTokens = /^src\/flows\/[^/]+\/tokens(\.[\w-]+)?\.ts$/.test(rel); // tokens.ts or tokens.<area>.ts
  const g = groupOf(rel);
  const row = groups.get(g) ?? { hex: 0, rgba: 0, font: 0, px: 0, noReason: 0, tokensFile: 0, custom: 0, colour: 0 };
  for (const x of found) {
    if (FAILS.has(x.kind)) row.colour++;
    if (x.kind === 'custom') row.custom++;
    else if (inTokens && x.kind !== 'noReason') row.tokensFile++;
    else row[x.kind]++;
  }
  groups.set(g, row);
  if (!inTokens && (rel === strict || rel.startsWith(strict.replace(/\/?$/, '/')))) strictCount += found.filter((x) => FAILS.has(x.kind)).length;
  if (verbose && (!only.length || only.some((o) => rel.startsWith(o.replace(/^\.\//, ''))))) for (const x of found) details.push(`${rel}:${x.line}  ${x.kind.padEnd(4)}  ${x.text}${inTokens && x.kind !== 'noReason' ? '  (tokens.ts)' : ''}`);
}

if (details.length) console.log(details.join('\n') + '\n');
const rows = [...groups].sort(([a], [b]) => a.localeCompare(b));
const pad = (s, n) => String(s).padStart(n);
console.log(`${'folder'.padEnd(28)}${pad('hex', 6)}${pad('rgba', 6)}${pad('font', 6)}${pad('total', 7)}   in tokens.ts${pad('px', 8)}${pad('no reason', 11)}${pad('custom', 8)}`);
let total = 0;
let totalPx = 0;
let totalNoReason = 0;
for (const [g, r] of rows) {
  const t = r.hex + r.rgba + r.font;
  total += t;
  totalPx += r.px;
  totalNoReason += r.noReason;
  console.log(`${g.padEnd(28)}${pad(r.hex, 6)}${pad(r.rgba, 6)}${pad(r.font, 6)}${pad(t, 7)}   ${String(r.tokensFile || '').padEnd(12)}${pad(r.px || '', 8)}${pad(r.noReason || '', 11)}${pad(r.custom || '', 8)}`);
}
console.log(`${'TOTAL'.padEnd(28)}${pad('', 18)}${pad(total, 7)}   ${''.padEnd(12)}${pad(totalPx, 8)}${pad(totalNoReason, 11)}`);
if (totalPx || totalNoReason) console.log(`\npx = raw font-size / radius with a matching token (advisory) · no reason = token-lint-ignore without "— <reason>" (advisory). -v <path> lists them.`);

// per-flow colour budget (scripts/flow-baseline.json → colourBudget): new flows 0, legacy flows may only go down
const flowRows = rows.filter(([g]) => g.startsWith('src/flows/')).map(([g, r]) => [g.slice('src/flows/'.length), r]);
if (args.includes('--baseline')) {
  const flowNames = fs.readdirSync(path.join(root, 'src/flows'), { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name);
  baseline.colourBudget = Object.fromEntries(flowNames.sort().map((f) => [f, flowRows.find(([g]) => g === f)?.[1].colour ?? 0]).filter(([, n]) => n > 0));
  fs.writeFileSync(baselineFile, JSON.stringify(baseline, null, 2) + '\n');
  budget = baseline.colourBudget; // judge this run against what was just written
  console.log(`\n✔ scripts/flow-baseline.json → colourBudget rewritten (${Object.keys(baseline.colourBudget).length} legacy flows)`);
}
const over = flowRows.filter(([f, r]) => r.colour > (budget[f] ?? 0));
const under = flowRows.filter(([f, r]) => budget[f] !== undefined && r.colour < budget[f]);
for (const [f, r] of over)
  console.error(
    budget[f] === undefined
      ? `\n✗ src/flows/${f}: ${r.colour} raw colour / font literal(s) — new flows use tokens only. Use the nearest var(--nk-*) (scripts/token-map.json); if none fits, ask. Only a colour the user explicitly asked for stays, marked \`custom-color — <who asked, why>\`. -v src/flows/${f} lists them.`
      : `\n✗ src/flows/${f}: ${r.colour} raw colour / font literal(s), budget ${budget[f]} (scripts/flow-baseline.json) — don't add custom colours; use a token, or mark a requested one \`custom-color — <who asked, why>\`.`,
  );
if (under.length) console.log(`\n↓ under budget: ${under.map(([f, r]) => `${f} ${r.colour}/${budget[f]}`).join(', ')} — lock it in with node scripts/token-lint.mjs --baseline`);
if (strictCount) {
  console.error(`\n✗ ${strict}: ${strictCount} raw literal(s) — use tokens (scripts/token-map.json), or mark true geometry with token-lint-ignore.`);
  process.exit(1);
}
if (over.length) process.exit(1);
console.log(`\n✓ ${strict}: no raw colour / font literals · flows within their colour budget`);
