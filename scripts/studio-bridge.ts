/**
 * Studio bridge: a dev-server-only Vite plugin behind the studio's Edit mode.
 *
 *   GET  /__studio/status    → { claude, claudeInfo }   is the local Claude Code installed and logged in?
 *   GET  /__studio/classes   → { [id]: "src/…/x.module.css" }   CSS-module id → file
 *   POST /__studio/apply     → writes pending edits (CSS rules, text, assets) into the repo
 *   POST /__studio/claude    → runs the visitor's own Claude Code (`claude -p`) on this repo,
 *                              streaming its progress back as NDJSON; `sessionId` continues a chat,
 *                              `model` picks the model, and the shared memory rides along
 *   POST /__studio/auth/login   → `claude auth login` (the browser sign-in the terminal uses), streamed
 *   POST /__studio/auth/code    → pastes a code into a running login, if the CLI asks for one
 *   POST /__studio/auth/cancel  → stops a running login
 *   POST /__studio/auth/logout  → `claude auth logout` (signs this machine's Claude Code out)
 *   GET|PUT    /__studio/memory          → .studio/memory.md, shared by every session
 *   GET        /__studio/sessions        → session summaries, newest first
 *   GET|PUT|DELETE /__studio/sessions/:id → one session (.studio/sessions/<id>.json)
 *   GET        /__studio/drafts          → draft summaries, newest first
 *   GET|PUT|DELETE /__studio/drafts/:id   → one draft: flow, screen and pending edits (.studio/drafts/<id>.json)
 *
 * It also gives CSS-module classes a readable, traceable name in dev
 * (`card_ab12cd` = local class `card` in the file whose id is `ab12cd`), so a
 * clicked element in the phone maps straight back to its stylesheet and rule.
 *
 * Safety: requests must come from the studio page itself (same-origin, custom
 * header), and every file path must stay inside src/ or public/studio-assets/.
 */
import { createHash } from 'node:crypto';
import { execFile, spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, extname, join, relative, resolve, sep } from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';
import postcss from 'postcss';
import type { Plugin } from 'vite';

export type StudioChange =
  | { kind: 'css'; file: string; selector: string; prop: string; value: string }
  | { kind: 'text'; scope: string; from: string; to: string }
  | { kind: 'asset'; target: string; name: string; data: string; scope: string };

const ids = new Map<string, string>(); // id → repo-relative css file

/** css.modules.generateScopedName for dev: `<local>_<6-char file id>`. */
export function studioScopedName(root: string) {
  return (local: string, filename: string) => {
    const rel = relative(root, filename.split('?')[0]).split(sep).join('/');
    const id = createHash('md5').update(rel).digest('hex').slice(0, 6);
    ids.set(id, rel);
    return `${local}_${id}`;
  };
}

export function studioBridge(): Plugin {
  let root = process.cwd();
  return {
    name: 'noon-studio-bridge',
    apply: 'serve',
    configResolved(c) {
      root = c.root;
    },
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/__studio/')) return next();
        if (!trusted(req)) return send(res, 403, { error: 'The studio bridge only answers the studio page.' });
        try {
          const path = req.url.split('?')[0];
          if (req.method === 'GET' && path === '/__studio/status') {
            const info = await claudeStatus();
            return send(res, 200, { claude: info.installed && info.loggedIn, claudeInfo: info });
          }
          if (req.method === 'GET' && path === '/__studio/classes') return send(res, 200, Object.fromEntries(ids));
          if (req.method === 'POST' && path === '/__studio/apply') {
            const { changes } = (await body(req)) as { changes: StudioChange[] };
            return send(res, 200, { results: changes.map((c) => applyChange(root, c)) });
          }
          if (req.method === 'POST' && path === '/__studio/claude') {
            const { prompt, sessionId, model } = (await body(req)) as { prompt: string; sessionId?: string; model?: string };
            return runClaude(root, prompt, sessionId, model, res);
          }
          if (req.method === 'POST' && path === '/__studio/auth/login') {
            const { email, console: useConsole } = (await body(req)) as { email?: string; console?: boolean };
            return runLogin(email, useConsole, res);
          }
          if (req.method === 'POST' && path === '/__studio/auth/code') {
            const { code } = (await body(req)) as { code: string };
            if (!login) return send(res, 409, { error: 'No sign-in is running.' });
            login.stdin.write(`${String(code).trim()}\n`);
            return send(res, 200, { ok: true });
          }
          if (req.method === 'POST' && path === '/__studio/auth/cancel') {
            login?.kill();
            return send(res, 200, { ok: true });
          }
          if (req.method === 'POST' && path === '/__studio/auth/logout') {
            await new Promise((done) => execFile('claude', ['auth', 'logout'], { timeout: 20_000 }, done));
            return send(res, 200, await claudeStatus());
          }
          if (path === '/__studio/memory') {
            if (req.method === 'GET') return send(res, 200, { text: readMemory(root) });
            if (req.method === 'PUT') {
              const { text } = (await body(req)) as { text: string };
              writeStudio(root, 'memory.md', String(text));
              return send(res, 200, { ok: true });
            }
          }
          const lm = path.match(/^\/__studio\/(sessions|drafts)$/);
          if (req.method === 'GET' && lm) return send(res, 200, listStore(root, lm[1]));
          const sm = path.match(/^\/__studio\/(sessions|drafts)\/([\w-]+)$/);
          if (sm) {
            const file = `${sm[1]}/${sm[2]}.json`;
            if (req.method === 'GET') {
              const abs = join(root, STUDIO_DIR, file);
              // a draft with no chat yet is normal: answer null rather than 404
              return send(res, 200, existsSync(abs) ? JSON.parse(readFileSync(abs, 'utf8')) : null);
            }
            if (req.method === 'PUT') {
              writeStudio(root, file, JSON.stringify(await body(req), null, 2));
              return send(res, 200, { ok: true });
            }
            if (req.method === 'DELETE') {
              rmSync(join(root, STUDIO_DIR, file), { force: true });
              return send(res, 200, { ok: true });
            }
          }
          send(res, 404, { error: 'Unknown studio endpoint.' });
        } catch (e) {
          send(res, 500, { error: (e as Error).message });
        }
      });
    },
  };
}

/* ------------------------------------------------------------------ guard */

function trusted(req: IncomingMessage) {
  if (req.headers['x-noon-studio'] !== '1') return false; // forces a CORS preflight for other sites, which we never answer
  const origin = req.headers.origin;
  return !origin || origin === `http://${req.headers.host}`;
}

function inside(root: string, file: string, ...allowed: string[]) {
  const abs = resolve(root, file.replace(/^\/+/, ''));
  if (!allowed.some((dir) => abs.startsWith(resolve(root, dir) + sep))) throw new Error(`Refusing to touch ${file}: outside ${allowed.join(', ')}.`);
  return abs;
}

/* ---------------------------------------------------------------- changes */

function applyChange(root: string, c: StudioChange): { ok: boolean; message: string } {
  try {
    if (c.kind === 'css') return applyCss(root, c);
    if (c.kind === 'text') return applyText(root, c.scope, c.from, c.to);
    if (c.kind === 'asset') return applyAsset(root, c);
    return { ok: false, message: 'Unknown change.' };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}

/** Sets `prop: value` on the rule whose selector is exactly `selector`, adding the rule if it isn't there. */
function applyCss(root: string, c: Extract<StudioChange, { kind: 'css' }>) {
  const abs = inside(root, c.file, 'src');
  const ast = postcss.parse(readFileSync(abs, 'utf8'));
  let rule: postcss.Rule | undefined;
  ast.walkRules((r) => {
    if (!rule && r.parent?.type === 'root' && r.selectors.includes(c.selector)) rule = r;
  });
  if (!rule) {
    rule = postcss.rule({ selector: c.selector });
    ast.append(rule);
  }
  const shorthand = { padding: /^padding-/, margin: /^margin-/, 'border-radius': /^border-.*-radius$/ }[c.prop];
  // writing a shorthand replaces its longhands, so the rule keeps one source of truth
  if (shorthand) rule.walkDecls((d) => void (shorthand.test(d.prop) && d.remove()));
  const existing = rule.nodes.find((n): n is postcss.Declaration => n.type === 'decl' && n.prop === c.prop);
  if (existing) existing.value = c.value;
  else rule.append({ prop: c.prop, value: c.value });
  writeFileSync(abs, ast.toString());
  return { ok: true, message: `${c.file} ${c.selector} { ${c.prop}: ${c.value} }` };
}

const SOURCE_EXT = new Set(['.ts', '.tsx', '.json']);
function files(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? files(p) : SOURCE_EXT.has(extname(p)) ? [p] : [];
  });
}

/**
 * Swaps `from` for `to` only where it's copy: inside string literals ('…', "…",
 * `…`) or JSX text (>…<). Comments, identifiers and code stay untouched.
 */
function replaceCopy(src: string, from: string, to: string): [string, number] {
  let count = 0;
  const swap = (s: string) => {
    const n = s.split(from).length - 1;
    count += n;
    return n ? s.split(from).join(to) : s;
  };
  const out = src
    .replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*|(['"`])((?:\\.|(?!\1)[^\\])*)\1|>([^<>{}]+)</g, (m, q, str, jsx) => {
      if (q) return q + swap(str) + q;
      if (jsx !== undefined) return `>${swap(jsx)}<`;
      return m; // a comment
    });
  return [out, count];
}

/** Replaces copy in the flow's own files first, then the shared mocks. */
function applyText(root: string, scope: string, from: string, to: string) {
  if (!from.trim()) return { ok: false, message: 'Nothing to replace.' };
  for (const dir of [scope, 'src/mocks']) {
    const abs = inside(root, `${dir}/x`, 'src').replace(/[/\\]x$/, '');
    let count = 0;
    for (const f of files(abs)) {
      const src = readFileSync(f, 'utf8');
      if (!src.includes(from)) continue;
      const [next, n] = replaceCopy(src, from, to);
      if (!n) continue;
      count += n;
      writeFileSync(f, next);
    }
    if (count) return { ok: true, message: `Replaced “${from}” ${count}× in ${dir}` };
  }
  return { ok: false, message: `Couldn’t find “${from}” in ${scope} or src/mocks. It may be built from parts — ask Claude instead.` };
}

/** Local asset → overwritten in place. Remote URL → saved under public/studio-assets and the URL swapped in the flow. */
function applyAsset(root: string, c: Extract<StudioChange, { kind: 'asset' }>) {
  const bytes = Buffer.from(c.data.replace(/^data:[^;]+;base64,/, ''), 'base64');
  if (c.target.startsWith('/src/')) {
    const abs = inside(root, c.target.split('?')[0], 'src');
    if (!existsSync(abs)) throw new Error(`${c.target} doesn’t exist.`);
    writeFileSync(abs, bytes);
    return { ok: true, message: `Replaced ${c.target.split('?')[0]}` };
  }
  const name = basename(c.name).replace(/[^\w.-]+/g, '-');
  const abs = inside(root, `public/studio-assets/${name}`, 'public/studio-assets');
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, bytes);
  const swapped = applyText(root, c.scope, c.target, `/studio-assets/${name}`);
  return swapped.ok ? { ok: true, message: `Saved /studio-assets/${name} and pointed the flow at it` } : swapped;
}

/* ----------------------------------------------------------------- claude */

export interface ClaudeStatus {
  installed: boolean;
  loggedIn: boolean;
  account?: string;
  method?: string;
  plan?: string;
}

/** Asks the CLI itself (`claude auth status`), so the answer matches what a run would use. */
function claudeStatus(): Promise<ClaudeStatus> {
  return new Promise((done) =>
    execFile('claude', ['auth', 'status', '--json'], { timeout: 10_000 }, (err, stdout) => {
      if ((err as NodeJS.ErrnoException | null)?.code === 'ENOENT') return done({ installed: false, loggedIn: false });
      try {
        const j = JSON.parse(stdout);
        done({ installed: true, loggedIn: Boolean(j.loggedIn), account: j.email, method: j.authMethod, plan: j.subscriptionType });
      } catch {
        done({ installed: true, loggedIn: false });
      }
    }),
  );
}

/** Streams NDJSON: {type:'session'|'text'|'tool'|'done'|'error', …}. Uses the CLI's own login on this machine. */
async function runClaude(root: string, prompt: string, sessionId: string | undefined, model: string | undefined, res: ServerResponse) {
  const status = await claudeStatus();
  if (!status.installed) return send(res, 400, { error: 'Claude Code isn’t installed on this machine.' });
  if (!status.loggedIn) return send(res, 400, { error: 'Claude Code isn’t logged in. Run `claude auth login` in a terminal, then check again.' });
  res.writeHead(200, { 'Content-Type': 'application/x-ndjson', 'Cache-Control': 'no-cache' });
  const args = ['-p', prompt, '--output-format', 'stream-json', '--verbose', '--permission-mode', 'acceptEdits', '--allowedTools', 'Read', 'Edit', 'MultiEdit', 'Write', 'Glob', 'Grep', 'Bash(npx tsc -p tsconfig.json)'];
  if (sessionId && /^[\w-]+$/.test(sessionId)) args.push('--resume', sessionId);
  if (model && /^[\w.-]+$/.test(model)) args.push('--model', model);
  const memory = readMemory(root).trim();
  args.push(
    '--append-system-prompt',
    [
      'You are working inside the noon Flow Kit studio, editing a flow for a designer or PM. Keep replies short and say which files you changed.',
      memory && `Shared studio memory (notes and decisions from every studio session; follow them):\n${memory}`,
    ]
      .filter(Boolean)
      .join('\n\n'),
  );
  const child = spawn('claude', args, { cwd: root, env: process.env });
  const out = (o: object) => res.write(`${JSON.stringify(o)}\n`);
  let buf = '';
  child.stdout.on('data', (chunk: Buffer) => {
    buf += chunk.toString();
    const lines = buf.split('\n');
    buf = lines.pop() ?? '';
    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const ev = JSON.parse(line);
        if (ev.type === 'system' && ev.subtype === 'init' && ev.session_id) out({ type: 'session', id: ev.session_id });
        if (ev.type === 'assistant') {
          for (const part of ev.message?.content ?? []) {
            if (part.type === 'text' && part.text.trim()) out({ type: 'text', text: part.text });
            if (part.type === 'tool_use') out({ type: 'tool', name: part.name, file: part.input?.file_path ? relative(root, part.input.file_path) : undefined });
          }
        } else if (ev.type === 'result') {
          out({ type: 'done', ok: !ev.is_error, text: ev.result });
        }
      } catch {
        /* partial or non-JSON line */
      }
    }
  });
  let err = '';
  child.stderr.on('data', (c: Buffer) => (err += c.toString()));
  child.on('close', (code) => {
    if (code !== 0) out({ type: 'error', text: err.trim() || `Claude exited with code ${code}` });
    res.end();
  });
  res.on('close', () => child.kill());
}

/* ---------------------------------------------------------------- helpers */

function send(res: ServerResponse, status: number, data: unknown) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function body(req: IncomingMessage): Promise<unknown> {
  return new Promise((ok, fail) => {
    let s = '';
    req.on('data', (c) => (s += c));
    req.on('end', () => {
      try {
        ok(JSON.parse(s || '{}'));
      } catch (e) {
        fail(e);
      }
    });
  });
}

/* ------------------------------------------------------------------ login */

let login: ChildProcessWithoutNullStreams | null = null;

/**
 * Runs `claude auth login`, the same browser sign-in the terminal uses. Streams
 * NDJSON: {type:'url', url} (open it), {type:'line', text}, {type:'code'} when
 * the CLI wants a code pasted back, then {type:'done', ok, status}.
 */
async function runLogin(email: string | undefined, useConsole: boolean | undefined, res: ServerResponse) {
  login?.kill();
  res.writeHead(200, { 'Content-Type': 'application/x-ndjson', 'Cache-Control': 'no-cache' });
  const out = (o: object) => res.write(`${JSON.stringify(o)}\n`);
  const args = ['auth', 'login', useConsole ? '--console' : '--claudeai'];
  if (email && /^[^\s@]+@[^\s@]+$/.test(email)) args.push('--email', email);
  const child = spawn('claude', args, { env: process.env });
  login = child;
  const seen = new Set<string>();
  const onText = (chunk: Buffer) => {
    const text = chunk.toString().replace(/\x1b\[[0-9;?]*[A-Za-z]/g, '');
    for (const url of text.match(/https:\/\/\S+/g) ?? []) {
      if (seen.has(url)) continue;
      seen.add(url);
      out({ type: 'url', url });
    }
    for (const line of text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)) {
      out({ type: 'line', text: line });
      if (/paste|enter.*code|code here/i.test(line)) out({ type: 'code' });
    }
  };
  child.stdout.on('data', onText);
  child.stderr.on('data', onText);
  child.on('close', async (code) => {
    if (login === child) login = null;
    const status = await claudeStatus();
    out({ type: 'done', ok: code === 0 && status.loggedIn, status });
    res.end();
  });
  res.on('close', () => {
    if (login === child && child.exitCode === null) child.kill();
  });
}

/* ------------------------------------------------------- sessions, memory */

const STUDIO_DIR = '.studio';

function writeStudio(root: string, file: string, text: string) {
  const abs = join(root, STUDIO_DIR, file);
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, text);
}

function readMemory(root: string) {
  const abs = join(root, STUDIO_DIR, 'memory.md');
  return existsSync(abs) ? readFileSync(abs, 'utf8') : '';
}

/** Summaries of a store (sessions or drafts), newest first; bulky fields (messages, change data) stay on disk. */
function listStore(root: string, kind: string) {
  const dir = join(root, STUDIO_DIR, kind);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .flatMap((f) => {
      try {
        const j = JSON.parse(readFileSync(join(dir, f), 'utf8'));
        return [{ id: j.id, title: j.title, flowId: j.flowId, route: j.route, updatedAt: j.updatedAt, messages: j.messages?.length ?? 0, changes: j.changes?.length ?? 0 }];
      } catch {
        return [];
      }
    })
    .sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
}
