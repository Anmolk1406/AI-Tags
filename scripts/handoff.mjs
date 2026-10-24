#!/usr/bin/env node
// Handoff summary for a flow change: what a developer needs to pick it up, grouped the way the folder contract groups
// the code (scripts/check-structure.mjs). Paste it into the PR description or the chat reply that closes a build.
//
//   npm run handoff -- <flow> [--base <git ref>]     default base HEAD (uncommitted work); use --base main for a branch
//
// Lists the flow's screens (routes), the changed files under Screens / Components / Tokens / Data / Routes / Docs /
// Assets, changes outside the flow that other flows feel (src/components, src/foundations, src/motion, src/data, src/kit),
// the token keys added, every `custom-color` line (explicitly requested colours) and the folder-contract status.
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { CUSTOM_COLOR } from './lib/custom-color.mjs';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const args = process.argv.slice(2);
const bi = args.indexOf('--base');
const base = bi >= 0 ? args.splice(bi, 2)[1] : 'HEAD';
const [flow] = args;
if (!flow || !fs.existsSync(path.join(root, 'src/flows', flow))) {
  console.error('Usage: npm run handoff -- <flow> [--base <git ref>]');
  process.exit(1);
}
const git = (...a) => execFileSync('git', a, { cwd: root, encoding: 'utf8' }).trim();
const lines = (s) => s.split('\n').filter(Boolean);
const dir = `src/flows/${flow}`;

// changed files vs the base: path → A (new) | M | D | R; untracked files count as new
const untracked = new Set(lines(git('ls-files', '--others', '--exclude-standard', '--', 'src')));
const changed = new Map(lines(git('diff', '--name-status', base, '--', 'src')).map((l) => {
  const [status, ...paths] = l.split('\t');
  return [paths.at(-1), status[0]];
}));
for (const p of untracked) changed.set(p, 'A');

const SHARED = 'Shared (other flows feel these)';
const groups = { Screens: [], Components: [], Tokens: [], Data: [], Routes: [], Docs: [], Assets: [], [SHARED]: [] };
const groupOf = (p) => {
  if (p.startsWith(`${dir}/`)) {
    const r = p.slice(dir.length + 1);
    if (r.startsWith('screens/') || /(Screen|Sheet)\.tsx$/.test(r)) return 'Screens';
    if (r.startsWith('components/')) return 'Components';
    if (/^tokens(\.[\w-]+)?\.ts$/.test(r)) return 'Tokens';
    if (/^(data|store|assets)(\.[\w-]+)?\.ts$/.test(r)) return 'Data';
    if (/^(index|screens\.[\w-]+|transitions)\.ts$/.test(r)) return 'Routes';
    if (r.endsWith('.md')) return 'Docs';
    return 'Screens'; // a stray file at the flow root: the Folder contract line reports it
  }
  if (p.startsWith(`src/assets/${flow}/`)) return 'Assets';
  if (p === 'src/flows/index.ts' || p === 'src/kit/routes.ts') return 'Routes';
  if (/^src\/(components|foundations|motion|data|kit)\//.test(p)) return SHARED;
  return null; // another flow's files: not this handoff
};
const label = { A: 'new', M: 'changed', D: 'removed', R: 'moved' };
for (const p of [...changed.keys()].sort()) groups[groupOf(p)]?.push(p);
const item = (p) => `- \`${p}\` (${label[changed.get(p)] ?? changed.get(p)})`;

// routes from index.ts / screens.<area>.ts: { id: 'x', title: 'y', … presentation: 'sheet' }
const screens = [];
for (const f of fs.readdirSync(path.join(root, dir)).filter((n) => /^(index|screens\.[\w-]+)\.ts$/.test(n))) {
  const full = fs.readFileSync(path.join(root, dir, f), 'utf8');
  const src = f === 'index.ts' ? full.slice(Math.max(0, full.indexOf('screens:'))) : full; // skip defineFlow's own { id, title }
  for (const [, id, title, rest] of src.matchAll(/\{\s*id:\s*'([^']+)'\s*,\s*title:\s*'([^']*)'([^\n]*)/g)) {
    const presentation = /presentation:\s*'(sheet|modal)'/.exec(rest)?.[1];
    screens.push(`- \`${flow}/${id}\` ${title}${presentation ? ` (${presentation})` : ''}`);
  }
}

// token keys this change adds (a new file: every key)
const newKeys = [];
for (const p of groups.Tokens.filter((f) => changed.get(f) !== 'D')) {
  const added = untracked.has(p)
    ? fs.readFileSync(path.join(root, p), 'utf8').split('\n')
    : git('diff', base, '--', p).split('\n').filter((l) => l.startsWith('+') && !l.startsWith('+++')).map((l) => l.slice(1));
  for (const l of added) {
    const m = /^\s*([A-Za-z_$][\w$]*)\s*:\s*(.+?),?\s*(\/\/.*)?$/.exec(l);
    if (m) newKeys.push(`- \`${m[1]}\` = ${m[2].slice(0, 70)}`);
  }
}

// explicitly requested colours anywhere in the flow
const custom = [];
const walk = (d) => {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(tsx?|css)$/.test(e.name))
      fs.readFileSync(p, 'utf8').split('\n').forEach((l, i) => {
        if (CUSTOM_COLOR.test(l)) custom.push(`- \`${path.relative(root, p)}:${i + 1}\` ${l.trim().slice(0, 110)}`);
      });
  }
};
walk(path.join(root, dir));

const structure = spawnSync('node', ['scripts/check-structure.mjs', flow], { cwd: root, encoding: 'utf8' });
const issues = lines(structure.stderr).filter((l) => l.startsWith('    ')).length;

const out = [`## Handoff: ${flow} (vs ${base})`, '', `**Screens (routes):**${screens.length ? '' : ' none found'}`, ...screens, ''];
for (const [g, files] of Object.entries(groups)) if (files.length) out.push(`**${g}**`, ...files.map(item), '');
if (!changed.size) out.push('_No changed files vs the base._', '');
out.push(`**New token keys:**${newKeys.length ? '' : ' none'}`, ...newKeys, '');
out.push(`**Custom colours (explicitly requested):**${custom.length ? '' : ' none — tokens only'}`, ...custom, '');
out.push(`**Folder contract:** ${structure.status === 0 ? '✓ screens / components / tokens' : `✗ ${issues} issue(s) — npm run check:structure -- ${flow}`}`);
if (groups[SHARED].length) out.push('', 'Shared files changed: run `npm run brain -- impact <entity>` and re-run what it lists.');
console.log(out.join('\n'));
