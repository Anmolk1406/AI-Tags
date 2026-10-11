/**
 * Client for the local studio bridge (scripts/studio-bridge.ts). The bridge only
 * exists under `npm run dev`; on a static deploy every call resolves to null /
 * a "local only" error, and Edit mode falls back to live preview + copy.
 */

import type { ClaudeStatus, StudioChange } from '../../../scripts/studio-bridge';

export type { ClaudeStatus, StudioChange };
export type BridgeStatus = { claude: boolean; claudeInfo: ClaudeStatus };

export type ClaudeEvent =
  | { type: 'session'; id: string }
  | { type: 'text'; text: string }
  | { type: 'tool'; name: string; file?: string }
  | { type: 'done'; ok: boolean; text?: string }
  | { type: 'error'; text: string };

const headers = { 'x-noon-studio': '1', 'Content-Type': 'application/json' };

export async function bridgeStatus(): Promise<BridgeStatus | null> {
  try {
    const res = await fetch('/__studio/status', { headers });
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

let classMap: Record<string, string> = {};
/** CSS-module file id → repo-relative file. Refreshed when an unknown id shows up. */
export async function loadClassMap(): Promise<Record<string, string>> {
  try {
    const res = await fetch('/__studio/classes', { headers });
    if (res.ok) classMap = await res.json();
  } catch {
    /* static deploy: no map, edits stay preview-only */
  }
  return classMap;
}
export const fileForId = (id: string) => classMap[id] ?? null;

export async function applyChanges(changes: StudioChange[]): Promise<{ ok: boolean; message: string }[]> {
  const res = await fetch('/__studio/apply', { method: 'POST', headers, body: JSON.stringify({ changes }) });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? `Apply failed (${res.status})`);
  return (await res.json()).results;
}

/** Runs the visitor's local Claude Code on the repo and streams its progress. Pass `sessionId` to continue a chat. */
export async function askClaude(prompt: string, onEvent: (e: ClaudeEvent) => void, opts: { signal?: AbortSignal; sessionId?: string; model?: string } = {}) {
  const res = await fetch('/__studio/claude', { method: 'POST', headers, body: JSON.stringify({ prompt, sessionId: opts.sessionId, model: opts.model }), signal: opts.signal });
  if (!res.ok || !res.body) {
    onEvent({ type: 'error', text: (await res.json().catch(() => ({}))).error ?? `Claude request failed (${res.status})` });
    return;
  }
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = '';
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const lines = buf.split('\n');
    buf = lines.pop() ?? '';
    for (const l of lines) if (l.trim()) onEvent(JSON.parse(l));
  }
}

/** Streams NDJSON lines from a bridge endpoint into `onEvent`. */
async function stream<E>(path: string, payload: unknown, onEvent: (e: E) => void, signal?: AbortSignal) {
  const res = await fetch(path, { method: 'POST', headers, body: JSON.stringify(payload), signal });
  if (!res.ok || !res.body) throw new Error((await res.json().catch(() => ({}))).error ?? `Request failed (${res.status})`);
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = '';
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const lines = buf.split('\n');
    buf = lines.pop() ?? '';
    for (const l of lines) if (l.trim()) onEvent(JSON.parse(l));
  }
}

/* ------------------------------------------------------------------ auth */

export type LoginEvent =
  | { type: 'url'; url: string }
  | { type: 'line'; text: string }
  | { type: 'code' }
  | { type: 'done'; ok: boolean; status: ClaudeStatus };

/** Starts the same browser sign-in as `claude auth login` in a terminal. */
export const startLogin = (opts: { email?: string; console?: boolean }, onEvent: (e: LoginEvent) => void, signal?: AbortSignal) =>
  stream<LoginEvent>('/__studio/auth/login', opts, onEvent, signal);

const post = (path: string, payload: unknown = {}) => fetch(path, { method: 'POST', headers, body: JSON.stringify(payload) });
export const sendLoginCode = (code: string) => post('/__studio/auth/code', { code });
export const cancelLogin = () => post('/__studio/auth/cancel');
export async function logout(): Promise<ClaudeStatus> {
  return (await post('/__studio/auth/logout')).json();
}

/* ------------------------------------------------------ sessions, memory */

export interface SessionSummary {
  id: string;
  title: string;
  flowId?: string;
  route?: string;
  updatedAt: string;
  messages: number;
  changes: number;
}
export type DraftSummary = SessionSummary;

export async function listSessions(): Promise<SessionSummary[]> {
  try {
    const res = await fetch('/__studio/sessions', { headers });
    return res.ok ? await res.json() : [];
  } catch {
    return [];
  }
}
export async function loadSession<T>(id: string): Promise<T | null> {
  const res = await fetch(`/__studio/sessions/${id}`, { headers });
  return res.ok ? ((await res.json()) as T | null) : null;
}
export const saveSession = (id: string, data: unknown) => fetch(`/__studio/sessions/${id}`, { method: 'PUT', headers, body: JSON.stringify(data) });
export const deleteSession = (id: string) => fetch(`/__studio/sessions/${id}`, { method: 'DELETE', headers });

export async function readMemory(): Promise<string> {
  try {
    const res = await fetch('/__studio/memory', { headers });
    return res.ok ? (await res.json()).text : '';
  } catch {
    return '';
  }
}
export const writeMemory = (text: string) => fetch('/__studio/memory', { method: 'PUT', headers, body: JSON.stringify({ text }) });

/** Adds one line to the shared memory, so every later session (and Claude) sees it. */
export async function appendMemory(line: string) {
  const text = await readMemory();
  await writeMemory(`${text.trimEnd()}${text.trim() ? '\n' : '# Studio memory\n\n'}${line}\n`);
}

/* ----------------------------------------------------------------- drafts */

export async function listDrafts(): Promise<DraftSummary[]> {
  try {
    const res = await fetch('/__studio/drafts', { headers });
    return res.ok ? await res.json() : [];
  } catch {
    return [];
  }
}
export async function loadDraft<T>(id: string): Promise<T | null> {
  const res = await fetch(`/__studio/drafts/${id}`, { headers });
  return res.ok ? ((await res.json()) as T | null) : null;
}
/** `keepalive` lets the save finish while the tab is closing. */
export const saveDraft = (id: string, data: unknown, keepalive = false) => fetch(`/__studio/drafts/${id}`, { method: 'PUT', headers, body: JSON.stringify(data), keepalive });
export const deleteDraft = (id: string) => fetch(`/__studio/drafts/${id}`, { method: 'DELETE', headers });
