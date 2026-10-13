#!/usr/bin/env node
// Validates every skill in .claude/skills against the code:  npm run skill:check   (-v lists what passed)
//
//  1. Structure   each skill folder has SKILL.md with frontmatter `name` = folder name and a `description`;
//                 every screen skill is listed in noon-ui's skill table.
//  2. Paths       every backticked file path in the skill files exists (resolved from the repo root, the skill
//                 folder or the file's own folder).
//  3. Tokens      every `--nk-*` CSS variable mentioned exists (central tokens, flow tokens, vars set in src).
//  4. Routes      every `flow/screen` route mentioned is registered.
//                 Paths, variables and routes that a file proposes (not built yet) go in a `<!-- planned: a, b -->` comment;
//                 files outside this repo (bappzaar, Figma exports) in `<!-- external: a, b -->`.
//  5. Coverage    noon-ui's references mention every component, token, transition, recipe, preset, asset folder,
//                 Origin icon (also in the generated originIcons.ts), flow and screen.
// Exits 1 on any problem, so it can run in CI.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const skillsRoot = join(dirname(fileURLToPath(import.meta.url)), '../..');
const noonUi = join(skillsRoot, 'noon-ui');
const root = join(skillsRoot, '../..');
const verbose = process.argv.includes('-v');
const read = (p) => readFileSync(join(root, p), 'utf8');
const rel = (p) => relative(root, p);
const problems = [];
const ok = (msg) => verbose && console.log(`✓ ${msg}`);
const mentions = (doc, word) => new RegExp(`(^|[^\\w-])${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}($|[^\\w-])`).test(doc);

// ── Load the real registry and tokens through Vite (screens and tokens live in TS modules).
const { createServer } = await import(join(root, 'node_modules/vite/dist/node/index.js'));
const vite = await createServer({ root, configFile: false, logLevel: 'error', server: { middlewareMode: true }, appType: 'custom', assetsInclude: ['**/*.lottie'], resolve: { alias: { '@assets': join(root, 'src/assets') } } });
let allFlows, tokens, tokensToCssVars, screenTruth;
try {
  ({ allFlows } = await vite.ssrLoadModule('/src/flows/index.ts'));
  ({ screenTruth } = await vite.ssrLoadModule('/src/kit/registry.ts'));
  ({ tokens } = await vite.ssrLoadModule('/src/foundations/tokens.ts'));
  ({ tokensToCssVars } = await vite.ssrLoadModule('/src/foundations/ThemeProvider.tsx'));
} finally {
  await vite.close();
}
const routes = new Set(allFlows.flatMap((f) => f.screens.map((s) => `${f.id}/${s.id}`)));
const flowIds = new Set(allFlows.map((f) => f.id));

const cssVars = new Set(Object.keys(tokensToCssVars(tokens)));
for (const f of allFlows) if (f.tokens) for (const v of Object.keys(tokensToCssVars(f.tokens))) cssVars.add(v);
(function scan(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) scan(p);
    else if (/\.(tsx?|css)$/.test(e.name)) for (const m of readFileSync(p, 'utf8').matchAll(/['"`](--nk-[a-z0-9-]+)['"`]|(--nk-[a-z0-9-]+)\s*:/g)) cssVars.add(m[1] ?? m[2]);
  }
})(join(root, 'src'));

// ── Collect skill files.
const skills = readdirSync(skillsRoot, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name);
const mdFiles = [];
(function walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.md')) mdFiles.push(p);
  }
})(skillsRoot);
// Shared resources the skills load on demand (.claude/resources): checked like skill files, never a skill themselves.
const resourcesRoot = join(root, '.claude/resources');
if (existsSync(resourcesRoot)) for (const f of readdirSync(resourcesRoot, { recursive: true })) if (f.endsWith('.md')) mdFiles.push(join(resourcesRoot, f));
const planned = new Set(mdFiles.flatMap((f) => [...readFileSync(f, 'utf8').matchAll(/<!--\s*(?:planned|external):([^>]*)-->/g)].flatMap((m) => m[1].split(',').map((s) => s.trim()).filter(Boolean))));

// ── 1. Structure.
const noonUiSkill = readFileSync(join(noonUi, 'SKILL.md'), 'utf8');
for (const name of skills) {
  const file = join(skillsRoot, name, 'SKILL.md');
  if (!existsSync(file)) {
    problems.push(`${name}/ has no SKILL.md`);
    continue;
  }
  const fm = readFileSync(file, 'utf8').match(/^---\n([\s\S]*?)\n---/);
  const field = (k) => fm?.[1].match(new RegExp(`^${k}:\\s*(.+)$`, 'm'))?.[1].trim();
  if (!fm) problems.push(`${name}/SKILL.md has no frontmatter`);
  else if (field('name') !== name) problems.push(`${name}/SKILL.md: frontmatter name "${field('name')}" must equal the folder name`);
  else if (!field('description')) problems.push(`${name}/SKILL.md: missing description`);
  else if (field('description').length > 1024) problems.push(`${name}/SKILL.md: description is ${field('description').length} chars (max 1024)`);
  else if (/[<>]/.test(field('description'))) problems.push(`${name}/SKILL.md: description contains < or > (the Claude app rejects XML-like tags; write e.g. "src/flows" instead of "src/flows/<flow>")`);
  else ok(`${name}: frontmatter`);
  if (name !== 'noon-ui') {
    if (!noonUiSkill.includes(`\`/${name}\``)) problems.push(`noon-ui/SKILL.md: screen skill /${name} is not in the skill table`);
    if (!existsSync(join(skillsRoot, name, 'spec.md'))) problems.push(`${name}/ has no spec.md (flow specification)`);
  }
}

// ── 2–4. Paths, CSS variables and routes in every skill file.
const pathLike = /^(src\/|scripts\/|\.claude\/|references\/|evals\/)[\w./@-]*$|^\.\.?\/[\w./@-]*\.(md|mjs|json)$|^[\w-]+\.(md|mjs|json)$/;
// Bare file names (`MAPPING.md`, `token-map.json`) are fine when a file with that name exists anywhere in the repo.
const basenames = new Set();
(function names(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === '.git' || e.name.startsWith('dist')) continue;
    if (e.isDirectory()) names(join(dir, e.name));
    else basenames.add(e.name);
  }
})(root);
const exists = (bases, p) => (!p.includes('/') && basenames.has(p)) || bases.some((b) => ['', '.ts', '.tsx', '/index.ts'].some((x) => existsSync(join(b, p + x))));
for (const file of mdFiles) {
  const text = readFileSync(file, 'utf8');
  const where = rel(file);
  const badPaths = new Set();
  const badVars = new Set();
  const badRoutes = new Set();
  for (const [, code] of text.matchAll(/`([^`\n]+)`/g)) {
    // Paths: a whole backtick span that looks like a path, or a path at the start of a command.
    for (const candidate of [code, ...code.split(/\s+/)]) {
      const p = candidate.replace(/[),.;:]+$/, '').replace(/#.*$/, '').replace(/:\d+$/, '');
      if (!pathLike.test(p) || /[*<>{}]/.test(p)) continue;
      // Relative links resolve from their own file only; other paths from the repo root, the skill or the file.
      const home = file.startsWith(resourcesRoot) ? resourcesRoot : join(skillsRoot, where.split('/')[2]);
      const bases = /^\.\.?\//.test(p) ? [dirname(file)] : [root, home, dirname(file)];
      if (!planned.has(p) && !exists(bases, p)) badPaths.add(p);
    }
  }
  for (const [, v] of text.matchAll(/(--nk-[a-z0-9-]*[a-z0-9])(?![\w*-])/g)) if (!cssVars.has(v) && !planned.has(v)) badVars.add(v);
  for (const [, r] of text.matchAll(/[`'"]([a-z][a-zA-Z0-9]*\/[a-z][a-zA-Z0-9-]*)[`'"]/g)) {
    const [flow] = r.split('/');
    if (flowIds.has(flow) && !routes.has(r) && !planned.has(r) && !existsSync(join(root, 'src/flows', r)) && !existsSync(join(root, 'src/flows', `${r}.ts`))) badRoutes.add(r);
  }
  if (badPaths.size) problems.push(`${where}: paths that don't exist: ${[...badPaths].join(', ')}`);
  if (badVars.size) problems.push(`${where}: CSS variables that don't exist: ${[...badVars].join(', ')}`);
  if (badRoutes.size) problems.push(`${where}: routes that aren't registered (add to <!-- planned: … --> if new): ${[...badRoutes].join(', ')}`);
  if (!badPaths.size && !badVars.size && !badRoutes.size) ok(`${where}: paths, tokens, routes`);
}

// ── 5. Coverage of noon-ui's references.
const ref = (name) => {
  const p = join(noonUi, 'references', name);
  return existsSync(p) ? readFileSync(p, 'utf8') : '';
};
function expect(label, names, doc, file) {
  const missing = [...new Set(names)].filter((n) => !mentions(doc, n));
  if (missing.length) problems.push(`noon-ui/references/${file} is missing ${label}: ${missing.join(', ')}`);
  else ok(`${file}: all ${new Set(names).size} ${label}`);
}
/** Top-level keys of `export const <name> = { … }` in a TS source (two-space indented keys). */
function keysOf(src, name) {
  const start = src.indexOf(`export const ${name} = {`);
  if (start < 0) return [];
  const rest = src.slice(start);
  return [...rest.slice(0, rest.search(/\n\}/)).matchAll(/^ {2}'?([\w-]+)'?\s*:/gm)].map((m) => m[1]);
}

const components = [];
for (const dir of readdirSync(join(root, 'src/components'), { withFileTypes: true })) {
  if (!dir.isDirectory()) continue;
  for (const f of readdirSync(join(root, 'src/components', dir.name))) {
    if (!/\.tsx?$/.test(f)) continue;
    for (const m of read(`src/components/${dir.name}/${f}`).matchAll(/^export (?:function|const) ([A-Z]\w*)/gm)) components.push(m[1]);
  }
}
const componentsDoc = ref('components.md');
expect('components', components, componentsDoc, 'components.md');
const stale = [...componentsDoc.matchAll(/^#{2,4} `?([A-Z]\w*)`?\s*$/gm)].map((m) => m[1]).filter((h) => !components.includes(h));
if (stale.length) problems.push(`noon-ui/references/components.md documents components that no longer exist: ${stale.join(', ')}`);

const tokensSrc = read('src/foundations/tokens.ts');
for (const group of ['colors', 'spacing', 'radius', 'fontSize', 'type', 'shadow', 'layout']) expect(`${group} tokens`, keysOf(tokensSrc, group), ref('tokens.md'), 'tokens.md');
expect('component token groups', ['button', 'iconButton', 'badge', 'pill', 'stepper', 'searchBar', 'tabBar', 'quickAdd'].filter((g) => tokensSrc.includes(`export const ${g} = {`)), ref('tokens.md'), 'tokens.md');

const transitionsSrc = read('src/motion/transitions.ts');
const builtIn = keysOf(transitionsSrc.replace(/const builtIn[^=]*= \{/, 'export const builtIn = {'), 'builtIn');
const custom = [...read('src/motion/custom/index.ts').matchAll(/registerTransition\('([\w-]+)'/g)].map((m) => m[1]);
expect('transitions', [...builtIn, ...custom], ref('motion.md'), 'motion.md');
expect('recipes', [...read('src/motion/recipes.tsx').matchAll(/^export function (\w+)/gm)].map((m) => m[1]), ref('motion.md'), 'motion.md');
for (const group of ['easing', 'duration', 'spring']) expect(`${group} presets`, keysOf(read('src/motion/presets.ts'), group), ref('motion.md'), 'motion.md');
expect('supermall presets', keysOf(read('src/motion/presets.ts'), 'supermall'), ref('motion.md'), 'motion.md');
expect('haptic kinds', keysOf(read('src/motion/haptics.ts'), 'haptics'), ref('motion.md'), 'motion.md');

const assetDirs = readdirSync(join(root, 'src/assets')).filter((d) => statSync(join(root, 'src/assets', d)).isDirectory());
expect('asset folders', assetDirs, ref('assets.md'), 'assets.md');

const originIcons = readdirSync(join(root, 'src/assets/icons/origin')).filter((f) => f.endsWith('.svg')).map((f) => f.slice(0, -4));
expect('Origin icons (run `npm run icons:import`)', originIcons, ref('icons.md'), 'icons.md');
expect('Origin icons (run `npm run icons:import`)', originIcons, read('src/components/Icon/originIcons.ts'), '../../../src/components/Icon/originIcons.ts');

const flowsDoc = ref('flows.md');
for (const flow of allFlows) {
  expect(`flow "${flow.id}"`, [flow.id], flowsDoc, 'flows.md');
  const missing = flow.screens.map((s) => s.id).filter((s) => !flowsDoc.includes(`${flow.id}/${s}`) && !flowsDoc.includes(`\`${s}\``));
  if (missing.length) problems.push(`noon-ui/references/flows.md is missing screens of "${flow.id}": ${missing.join(', ')}`);
  else ok(`flows.md: ${flow.id} (${flow.screens.length} screens)`);
}

// ── 5b. Source of truth per screen: every screen names its reference; `figma` / `mixed` screens need the flow's
//        FIGMA-MAPPING.md (or MAPPING.md) to say which area follows which; `verified` is a YYYY-MM-DD date.
const truthCount = {};
let verifiedCount = 0;
for (const f of allFlows) {
  for (const sc of f.screens) {
    const r = `${f.id}/${sc.id}`;
    if (!sc.source) problems.push(`${r}: no \`source\` (bappzaar path, Figma <fileKey> · <node>, or reference: …)`);
    const t = screenTruth(sc);
    truthCount[t] = (truthCount[t] ?? 0) + 1;
    if (sc.verified !== undefined) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(sc.verified)) problems.push(`${r}: \`verified\` must be YYYY-MM-DD (got "${sc.verified}")`);
      else verifiedCount++;
    }
    if ((t === 'figma' || t === 'mixed') && sc.truth && !['FIGMA-MAPPING.md', 'MAPPING.md'].some((m) => existsSync(join(root, 'src/flows', f.id, m)))) {
      problems.push(`${r}: truth "${t}" but src/flows/${f.id} has no FIGMA-MAPPING.md / MAPPING.md saying which area follows which reference`);
    }
  }
}
ok(`source of truth: ${Object.entries(truthCount).map(([k, v]) => `${v} ${k}`).join(' · ')}; ${verifiedCount} verified`);
const truthSummary = `${Object.entries(truthCount).map(([k, v]) => `${v} ${k}`).join(' / ')} · ${verifiedCount} verified`;

// ── 6. Flow / screen counts quoted in prose ("17 flows", "147 screens") must match the registry.
const nFlows = allFlows.length;
const nScreens = routes.size;
// a flow's own screen count ("noonone … 22 screens") is not a total: only numbers above the largest flow are checked
const maxFlow = Math.max(...allFlows.map((f) => f.screens.length));
for (const [file, text] of [['README.md', read('README.md')], ...mdFiles.map((f) => [rel(f), readFileSync(f, 'utf8')])]) {
  const bad = [];
  for (const m of text.matchAll(/\b(\d+) (?:ready-made )?flows\b/g)) if (+m[1] !== nFlows && +m[1] > 5) bad.push(`"${m[0]}" (registry: ${nFlows})`);
  for (const m of text.matchAll(/\b(\d+) screens\b/g)) if (+m[1] !== nScreens && +m[1] > maxFlow) bad.push(`"${m[0]}" (registry: ${nScreens})`);
  if (bad.length) problems.push(`${file}: counts out of date: ${[...new Set(bad)].join(', ')}`);
}
ok(`counts: ${nFlows} flows, ${nScreens} screens`);

// ── 7. The generated screen index in .claude/resources is current.
if (existsSync(join(resourcesRoot, 'scripts/build.mjs'))) {
  const { spawnSync } = await import('node:child_process');
  const r = spawnSync(process.execPath, [join(resourcesRoot, 'scripts/build.mjs'), '--check'], { encoding: 'utf8' });
  if (r.status !== 0) problems.push('.claude/resources generated files are out of date: run npm run resources:build');
  else ok('resources: screens.md current');
}

const summary = `${skills.length} skills · ${mdFiles.length} files · ${routes.size} routes · ${cssVars.size} CSS variables · truth ${truthSummary}`;
if (problems.length) {
  console.log(`✗ skills are out of date (${problems.length} problems; ${summary}):\n`);
  for (const p of problems) console.log(`  - ${p}`);
  console.log('\nFix the skill files in .claude/skills/ and add a line to noon-ui/CHANGELOG.md.');
  process.exit(1);
}
console.log(`✓ skills match the code (${summary})`);
