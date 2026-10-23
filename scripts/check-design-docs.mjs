#!/usr/bin/env node
// Design-record gate (design-workflow.md → stage E):  node scripts/check-design-docs.mjs [--json]
// (also run by `npm run skill:check`).
//
// Every flow folder in src/flows needs a written basis:
//   · a port      → MAPPING.md / FIGMA-MAPPING.md (anywhere in the flow folder), or
//   · a new design → DESIGN.md, from .claude/skills/noon-ui/templates/DESIGN.md.
// A DESIGN.md fails when it still has the TEMPLATE marker or `<…>` placeholders, lacks a required section, doesn't say
// how research was done (Mobbin links, or "Mobbin: not available" / "not needed: <why>"), cites Mobbin without
// mobbin.com links, or names components in its Design direction table that exist neither in src/components nor in the
// flow.
// Flows that pre-date the rule are listed in BASELINE: reported as warnings until they get a MAPPING.md or DESIGN.md.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const flowsDir = join(root, 'src/flows');
const asJson = process.argv.includes('--json');
/** pre-date the design-record rule (2026-10-13); provenance lives in each screen's `source` */
const BASELINE = new Set(['address', 'cards', 'deals', 'search', 'wishlist']);
const REQUIRED = ['Request', 'Research', 'Design direction', 'States', 'Validation'];
/** written before the intake gates (Mobbin mandatory when connected, clarifying questions always; 2026-10-22) */
const PRE_INTAKE = new Set(['fieldds', 'yellowFriday']);

const filesUnder = (dir, out = []) => {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) filesUnder(p, out);
    else out.push(p);
  }
  return out;
};

let shared = new Set();
const apiPath = join(root, '.claude/skills/noon-ui/references/component-api.generated.json');
if (existsSync(apiPath)) shared = new Set(JSON.parse(readFileSync(apiPath, 'utf8')).shared.map((c) => c.name));
// the motion recipes (FadeIn, Stagger, Pop, CountUp, Float …) are kit components too
for (const [, name] of readFileSync(join(root, 'src/motion/recipes.tsx'), 'utf8').matchAll(/^export function ([A-Z]\w*)/gm)) shared.add(name);

const problems = [];
const warnings = [];
const summary = [];
for (const flow of readdirSync(flowsDir).filter((f) => statSync(join(flowsDir, f)).isDirectory())) {
  const dir = join(flowsDir, flow);
  const files = filesUnder(dir);
  const mapping = files.filter((f) => /(^|\/)(FIGMA-)?MAPPING\.md$/.test(f));
  const designPath = join(dir, 'DESIGN.md');
  const hasDesign = existsSync(designPath);
  summary.push({ flow, mapping: mapping.map((f) => relative(root, f)), design: hasDesign });
  if (!mapping.length && !hasDesign) {
    const msg = `src/flows/${flow}: no MAPPING.md / FIGMA-MAPPING.md (port) or DESIGN.md (new design) — start one from .claude/skills/noon-ui/templates/DESIGN.md`;
    (BASELINE.has(flow) ? warnings : problems).push(BASELINE.has(flow) ? `${msg} (baseline: pre-dates the rule)` : msg);
  }
  if (!hasDesign) continue;

  const md = readFileSync(designPath, 'utf8');
  const rel = relative(root, designPath);
  const issues = [];
  if (md.includes('<!-- TEMPLATE -->')) issues.push('still marked TEMPLATE');
  const placeholders = [...md.replace(/<!--[\s\S]*?-->/g, '').matchAll(/<(?![a-z]+[\s>/]|\/|!|https?:)[^<>\n]{1,80}>/g)].map((m) => m[0]);
  if (placeholders.length) issues.push(`unfilled placeholders: ${[...new Set(placeholders)].slice(0, 5).join(', ')}`);
  const headings = [...md.matchAll(/^##\s+(.+)$/gm)].map((m) => m[1].trim());
  const missing = REQUIRED.filter((h) => !headings.some((x) => x.toLowerCase().startsWith(h.toLowerCase())));
  if (missing.length) issues.push(`missing sections: ${missing.join(', ')}`);

  const research = md.split(/^##\s+Research\b.*$/m)[1]?.split(/^##\s/m)[0] ?? '';
  const mobbinLinks = research.match(/https:\/\/mobbin\.com\/[^\s)]+/g) ?? [];
  const mobbinLine = research.match(/Mobbin:\s*(.+)/i)?.[1] ?? '';
  if (PRE_INTAKE.has(flow)) {
    if (!mobbinLinks.length && !/not available|not needed/i.test(mobbinLine)) issues.push('Research must cite Mobbin references (mobbin.com links) or say "Mobbin: not available" / "Mobbin: not needed: <why>"');
  } else {
    // Mobbin is mandatory when connected: links, or why it couldn't run. "not needed" is no longer an answer.
    if (!mobbinLinks.length && !/not available:\s*\S/i.test(mobbinLine)) issues.push('Research must cite Mobbin references (mobbin.com links); only "Mobbin: not available: <not connected | call failed: why>" excuses it');
    const clar = md.split(/^##\s+Clarifications\b.*$/m)[1]?.split(/^##\s/m)[0];
    // table rows after the header and separator whose third cell (Answer) is filled
    const answered = (clar ?? '').split('\n').filter((l) => /^\|/.test(l) && !/^\|\s*(Question|-)/.test(l) && l.split('|')[3]?.trim());
    if (clar === undefined) issues.push('missing section: Clarifications (the questions asked before building and the answers; design-workflow.md → D)');
    else if (!answered.length && !/skip questions/i.test(clar)) issues.push('Clarifications has no answered question (or "User asked to skip questions" + assumptions)');
  }

  const direction = md.split(/^##\s+Design direction\b.*$/m)[1]?.split(/^##\s/m)[0] ?? '';
  const flowSrc = files.filter((f) => /\.(tsx?)$/.test(f)).map((f) => readFileSync(f, 'utf8')).join('\n');
  const named = [...direction.matchAll(/^\|[^|]*\|\s*([^|]*)\|/gm)].flatMap((m) => [...m[1].matchAll(/`<?([A-Z][A-Za-z0-9]+)/g)].map((x) => x[1]));
  const unknown = [...new Set(named)].filter((n) => n !== 'Component' && !shared.has(n) && !new RegExp(`(function|const|class)\\s+${n}\\b`).test(flowSrc));
  if (unknown.length) issues.push(`Design direction names components that don't exist yet in src/components, src/motion/recipes.tsx or the flow: ${unknown.join(', ')} (build them, or list them under "New pieces")`);
  for (const i of issues) problems.push(`${rel}: ${i}`);
}

if (asJson) {
  console.log(JSON.stringify({ problems, warnings, flows: summary }, null, 2));
  process.exit(problems.length ? 1 : 0);
}
for (const w of warnings) console.log(`⚠ ${w}`);
if (problems.length) {
  console.log(`✗ design records: ${problems.length} problem(s)`);
  for (const p of problems) console.log(`  - ${p}`);
  process.exit(1);
}
console.log(`✓ design records: every flow has a MAPPING.md / FIGMA-MAPPING.md or DESIGN.md (${summary.length} flows, ${summary.filter((s) => s.design).length} DESIGN.md, ${warnings.length} baseline warnings)`);
