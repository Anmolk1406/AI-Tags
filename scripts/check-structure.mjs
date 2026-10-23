#!/usr/bin/env node
// Folder contract for flows: every flow is grouped strictly into screens, components and tokens, so any developer can
// tell at a glance what a change touched (.claude/skills/noon-ui/SKILL.md → "Folder contract").
//
//   src/flows/<flow>/
//     index.ts                         defineFlow: ids, routes, presentation, notes, source — no JSX
//     screens/<Name>Screen.tsx         one file per routed screen / sheet (<Name>Sheet.tsx) + its <name>.module.css;
//                                      big flows may group them one level deep: screens/<area>/
//     components/                      flow-only parts (any depth); used by two flows → move to src/components
//     tokens.ts · tokens.<area>.ts     flow tokens: var(--nk-*) aliases and measurements; raw colour only with
//                                      `custom-color — <who asked, why>` (scripts/token-lint.mjs enforces it)
//     data.ts · data.<area>.ts         copy and mock content (products come from src/data)
//     store.ts · transitions.ts · screens.<area>.ts (screen-list splits) · *.md (DESIGN.md, MAPPING.md …)
//
// Imports run one way: screens → components → tokens / data / store. components/ never imports screens/, and no file
// imports another flow's folder (shared parts live in src/components, shared data in src/data) except its public
// entry points in components/entry/ (e.g. noonone's cart / checkout nudges).
//
//   node scripts/check-structure.mjs              check every flow not listed in scripts/flow-baseline.json → legacyLayout
//   node scripts/check-structure.mjs <flow>…      check only these flows (legacy ones too)
//   node scripts/check-structure.mjs --baseline   rewrite legacyLayout to the flows that fail today (only after a migration)
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const flowsDir = path.join(root, 'src/flows');
const baselineFile = path.join(root, 'scripts/flow-baseline.json');
const args = process.argv.slice(2);
const writeBaseline = args.includes('--baseline');
const only = args.filter((a) => !a.startsWith('-'));

const baseline = fs.existsSync(baselineFile) ? JSON.parse(fs.readFileSync(baselineFile, 'utf8')) : {};
const legacy = new Set(baseline.legacyLayout ?? []);

const ROOT_FILE = /^(index\.ts|(tokens|data|store|screens|assets)(\.[\w-]+)?\.ts|transitions\.ts|[\w-]+\.md)$/;
const ROOT_DIR = new Set(['screens', 'components']);
const SCREEN_FILE = /^([A-Z]\w*(Screen|Sheet)\.tsx|[\w-]+\.module\.css)$/;

const walk = (d, out = []) => {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
};
const importsOf = (file) => [...fs.readFileSync(file, 'utf8').matchAll(/(?:from\s+|import\s*\(\s*)['"](\.[^'"]+)['"]/g)].map((m) => m[1]);

function check(flow) {
  const dir = path.join(flowsDir, flow);
  const problems = [];
  /** where a stray root entry belongs */
  const home = (e) => {
    if (e.isDirectory()) return 'only screens/ and components/ are folders (assets go in src/assets/<flow>/)';
    if (/(Screen|Sheet)\.tsx$/.test(e.name)) return 'screens/';
    if (/\.module\.css$/.test(e.name)) return 'screens/ (next to its screen) or components/';
    if (/\.tsx$/.test(e.name)) return 'components/';
    return 'tokens.ts / data.ts / store.ts, or components/';
  };
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory() ? !ROOT_DIR.has(e.name) : !ROOT_FILE.test(e.name)) problems.push(`${e.name}${e.isDirectory() ? '/' : ''} at the flow root → ${home(e)}`);
  }
  const screensDir = path.join(dir, 'screens');
  // screens/ and screens/<area>/ (big flows) hold only screens, sheets and their CSS modules
  if (fs.existsSync(screensDir))
    for (const f of walk(screensDir)) {
      const r = path.relative(screensDir, f).split(path.sep).join('/');
      if (r.split('/').length > 2 || !SCREEN_FILE.test(path.basename(f)))
        problems.push(`screens/${r} → screens/ (or screens/<area>/) holds only <Name>Screen.tsx / <Name>Sheet.tsx and their .module.css; parts go in components/`);
    }

  for (const file of walk(dir).filter((f) => /\.(tsx?)$/.test(f))) {
    const rel = path.relative(dir, file).split(path.sep).join('/');
    for (const spec of importsOf(file)) {
      const target = path.relative(dir, path.resolve(path.dirname(file), spec)).split(path.sep).join('/');
      if (target.startsWith('../') && !target.startsWith('../../') && !/^\.\.\/[^/]+\/components\/entry\//.test(target)) {
        const other = target.split('/')[1];
        problems.push(`${rel} imports ${spec} (flow "${other}") → shared parts live in src/components, shared data in src/data`);
      } else if (rel.startsWith('components/') && target.startsWith('screens/')) {
        problems.push(`${rel} imports ${spec} → components never import screens (screens → components → tokens / data)`);
      } else if (rel === 'index.ts' && /^[A-Z]\w*(Screen|Sheet)$/.test(path.basename(target)) && !target.startsWith('screens/')) {
        problems.push(`index.ts loads ${spec} → screens live in screens/`);
      }
    }
  }
  return problems;
}

const flows = fs.readdirSync(flowsDir, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name).sort();

if (writeBaseline) {
  baseline.legacyLayout = flows.filter((f) => check(f).length);
  fs.writeFileSync(baselineFile, JSON.stringify(baseline, null, 2) + '\n');
  console.log(`✔ scripts/flow-baseline.json → legacyLayout: ${baseline.legacyLayout.join(', ') || '(none)'}`);
  process.exit(0);
}

const targets = only.length ? only : flows.filter((f) => !legacy.has(f));
let failed = 0;
for (const f of targets) {
  if (!flows.includes(f)) { console.error(`✗ no flow src/flows/${f}`); failed++; continue; }
  const problems = check(f);
  if (!problems.length) continue;
  failed++;
  console.error(`✗ src/flows/${f}${legacy.has(f) ? ' (legacy layout)' : ''}`);
  for (const p of problems) console.error(`    ${p}`);
}
const skipped = only.length ? 0 : flows.filter((f) => legacy.has(f)).length;
if (failed) {
  console.error(`\n${failed} flow(s) break the folder contract (scripts/check-structure.mjs header). Move the files, update the imports in index.ts, re-run.`);
  process.exit(1);
}
console.log(`✓ folder contract: ${targets.length} flow(s) grouped into screens / components / tokens${skipped ? ` · ${skipped} legacy layout(s) in scripts/flow-baseline.json (migrate when you next touch them)` : ''}`);
