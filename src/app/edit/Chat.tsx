import { useEffect, useRef, useState } from 'react';
import { Button, Dialog, DialogBody, DialogFooter, DialogHeader, Input, Textarea, buttonClasses, cn } from 'lightweight-ui';
import {
  ArrowSquareOut,
  ArrowsLeftRight,
  Brain,
  CaretDown,
  Check,
  CheckCircle,
  CircleNotch,
  Plus,
  SignOut,
  Sparkle,
  Warning,
  X,
} from 'lightweight-ui/icons';
import {
  appendMemory,
  askClaude,
  cancelLogin,
  deleteSession,
  loadSession,
  logout,
  readMemory,
  saveSession,
  sendLoginCode,
  startLogin,
  writeMemory,
  type ClaudeEvent,
} from './bridge';
import { moduleClasses } from './inspect';
import type { Editor } from './useEditor';

/* ----------------------------------------------------------------- status */

type Status = 'checking' | 'local-only' | 'not-installed' | 'logged-out' | 'connected';

export function claudeState(editor: Editor): Status {
  const b = editor.bridge;
  if (b === undefined) return 'checking';
  if (b === null) return 'local-only';
  if (!b.claudeInfo?.installed) return 'not-installed';
  if (!b.claudeInfo.loggedIn) return 'logged-out';
  return 'connected';
}

const STATUS: Record<Status, { label: string; short: string; dot: string }> = {
  checking: { label: 'Checking Claude Code…', short: 'Checking', dot: 'bg-ink/30 animate-pulse' },
  'local-only': { label: 'Claude needs the local studio', short: 'Local only', dot: 'bg-ink/30' },
  'not-installed': { label: 'Claude Code isn’t installed', short: 'Not installed', dot: 'bg-[#FF9741]' },
  'logged-out': { label: 'Not signed in to Claude', short: 'Signed out', dot: 'bg-[#FF9741]' },
  connected: { label: 'Claude connected', short: 'Connected', dot: 'bg-[#38AE04]' },
};

/** Always-visible connection state in the panel header; opens Chat. */
export function ClaudePill({ editor, onClick }: { editor: Editor; onClick: () => void }) {
  const s = claudeState(editor);
  const account = editor.bridge?.claudeInfo?.account;
  return (
    <button
      type="button"
      onClick={onClick}
      title={s === 'connected' && account ? `Claude connected as ${account}` : STATUS[s].label}
      aria-label={STATUS[s].label}
      className="u-circle flex flex-none items-center gap-1.5 rounded-full border border-line py-1 ps-2 pe-2.5 text-caption whitespace-nowrap text-muted transition-colors duration-150 hover:border-line-strong hover:text-ink"
    >
      <Sparkle size={11} weight="fill" className="text-[#FEEE00]" aria-hidden />
      <span className={cn('u-circle size-1.5 flex-none rounded-full', STATUS[s].dot)} aria-hidden />
      {STATUS[s].short}
    </button>
  );
}

/* ---------------------------------------------------------------- session */

type Message = { role: 'user'; text: string; context: string[] } | { role: 'claude'; events: ClaudeEvent[]; running: boolean };

interface Session {
  id: string;
  title: string;
  flowId?: string;
  createdAt: string;
  updatedAt: string;
  /** Claude Code's own session, so follow-ups continue the conversation */
  claudeSessionId?: string;
  model: string;
  messages: Message[];
}

export const MODELS = [
  { value: '', label: 'Default' },
  { value: 'fable', label: 'Fable' },
  { value: 'opus', label: 'Opus' },
  { value: 'sonnet', label: 'Sonnet' },
  { value: 'haiku', label: 'Haiku' },
] as const;

const MODEL_KEY = 'nk-studio-model';
const store = {
  get: (k: string) => {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set: (k: string, v: string) => {
    try {
      localStorage.setItem(k, v);
    } catch {
      /* storage blocked */
    }
  },
};

const newSession = (id: string, flowId?: string): Session => {
  const now = new Date().toISOString();
  return { id, title: 'New chat', flowId, createdAt: now, updatedAt: now, model: store.get(MODEL_KEY) ?? '', messages: [] };
};

/**
 * The chat of the open draft. Each draft has one chat session, saved under
 * .studio/sessions/<draft id> with its own Claude conversation; every session
 * also reads the shared memory (.studio/memory.md), which the bridge sends to
 * Claude with each message. Turns that change files add a line to it, so
 * drafts stay connected.
 */
export function useChat(editor: Editor, flowId: string | undefined, draftId: string, onActivity?: () => void) {
  const [session, setSession] = useState<Session>(() => newSession(draftId, flowId));
  const [withSelection, setWithSelection] = useState(true);
  const [withEdits, setWithEdits] = useState(true);
  const ctl = useRef<AbortController | null>(null);
  const live = !!editor.bridge;
  const last = session.messages.at(-1);
  const running = last?.role === 'claude' && last.running;

  // Follow the open draft: load its chat, or start an empty one under its id.
  useEffect(() => {
    setSession(newSession(draftId, flowId));
    if (!live) return;
    let gone = false;
    loadSession<Session>(draftId).then((s) => {
      if (s && !gone) setSession({ ...s, messages: s.messages.map((m) => (m.role === 'claude' ? { ...m, running: false } : m)) });
    });
    return () => {
      gone = true;
    };
  }, [draftId, live]); // eslint-disable-line react-hooks/exhaustive-deps

  // Save after every change (debounced), once there's something to save.
  useEffect(() => {
    if (!live || !session.messages.length || session.id !== draftId) return;
    const t = setTimeout(() => saveSession(session.id, session), 500);
    return () => clearTimeout(t);
  }, [session, live, draftId]);

  const update = (f: (s: Session) => Session) => setSession((s) => ({ ...f(s), updatedAt: new Date().toISOString() }));
  const push = (e: ClaudeEvent) =>
    update((s) => {
      const m = s.messages.at(-1);
      if (m?.role !== 'claude') return s;
      return { ...s, messages: [...s.messages.slice(0, -1), { ...m, events: [...m.events, e] }] };
    });

  const send = async (request: string) => {
    const sel = withSelection && editor.selected;
    const edits = withEdits && editor.pending.length > 0;
    const context = [sel ? describeSelection(editor) : null, edits ? `${editor.pending.length} visual edit${editor.pending.length === 1 ? '' : 's'}` : null].filter(Boolean) as string[];
    const resume = session.claudeSessionId;
    onActivity?.();
    update((s) => ({
      ...s,
      flowId: s.flowId ?? flowId,
      title: s.messages.length ? s.title : request.slice(0, 60),
      messages: [...s.messages, { role: 'user', text: request, context }, { role: 'claude', events: [], running: true }],
    }));
    ctl.current = new AbortController();
    const files = new Set<string>();
    let ok = false;
    try {
      await askClaude(
        editor.prompt(request, { selection: !!sel, pending: edits, brief: !!resume }),
        (e) => {
          if (e.type === 'session') return update((s) => ({ ...s, claudeSessionId: e.id }));
          if (isEdit(e) && e.type === 'tool') files.add(e.file!);
          if (e.type === 'done') ok = e.ok;
          push(e);
        },
        { signal: ctl.current.signal, sessionId: resume, model: session.model || undefined },
      );
    } catch (err) {
      if ((err as Error).name !== 'AbortError') push({ type: 'error', text: (err as Error).message });
    } finally {
      update((s) => {
        const m = s.messages.at(-1);
        return m?.role === 'claude' ? { ...s, messages: [...s.messages.slice(0, -1), { ...m, running: false }] } : s;
      });
      setTimeout(editor.bump, 400);
    }
    // memory keeps what changed, so later sessions know; turns that changed nothing stay out
    if (ok && live && files.size) {
      const day = new Date().toISOString().slice(0, 10);
      await appendMemory(`- ${day} · ${flowId ?? 'studio'} · “${request.slice(0, 120)}” → changed ${[...files].join(', ')}`);
    }
  };

  return {
    session,
    running,
    send,
    stop: () => ctl.current?.abort(),
    setModel: (model: string) => {
      store.set(MODEL_KEY, model);
      update((s) => ({ ...s, model }));
    },
    /** Clears this draft's conversation and starts Claude fresh (memory still applies). */
    clear: async () => {
      await deleteSession(draftId);
      setSession(newSession(draftId, flowId));
    },
    withSelection,
    setWithSelection,
    withEdits,
    setWithEdits,
  };
}
export type Chat = ReturnType<typeof useChat>;

function describeSelection(editor: Editor) {
  const el = editor.selected!;
  const mc = moduleClasses(el)[editor.classIndex];
  return mc ? `.${mc.local}` : `<${el.tagName.toLowerCase()}>`;
}

/* -------------------------------------------------------------------- tab */

const SUGGESTIONS = ['Tighten the spacing on this screen', 'Make the selected title bolder', 'Use the noon yellow style for the main button'];

export function ChatTab({ editor, chat }: { editor: Editor; chat: Chat }) {
  const [draft, setDraft] = useState('');
  const [memoryOpen, setMemoryOpen] = useState(false);
  const status = claudeState(editor);
  const ready = status === 'connected';
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => {
    end.current?.scrollIntoView({ block: 'end' });
  }, [chat.session.messages]);

  const submit = () => {
    if (!draft.trim() || !ready || chat.running) return;
    chat.send(draft.trim());
    setDraft('');
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <SessionBar chat={chat} live={!!editor.bridge} onMemory={() => setMemoryOpen(true)} />

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4 [scrollbar-width:thin]">
        {chat.session.messages.length === 0 ? (
          <div>
            <p className="text-caption leading-relaxed text-muted">
              Ask for any change to this flow. Claude edits the files in this repo and the phone reloads. Each session remembers its conversation, and every session
              shares the studio memory.
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {SUGGESTIONS.map((s) => (
                <button key={s} type="button" disabled={!ready} onClick={() => setDraft(s)} className="u-circle rounded-full border border-line px-2.5 py-1 text-caption text-muted hover:border-line-strong hover:text-ink disabled:opacity-40">
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          chat.session.messages.map((m, i) => (m.role === 'user' ? <UserMessage key={i} m={m} /> : <ClaudeMessage key={i} m={m} />))
        )}
        <div ref={end} />
      </div>

      <div className="flex-none border-t border-line px-5 pt-3 pb-4">
        {ready ? (
          <>
            {(editor.selected || editor.pending.length > 0) && (
              <div className="mb-2 flex flex-wrap gap-1.5">
                {editor.selected && (
                  <ContextChip on={chat.withSelection} onToggle={() => chat.setWithSelection(!chat.withSelection)}>
                    {describeSelection(editor)}
                  </ContextChip>
                )}
                {editor.pending.length > 0 && (
                  <ContextChip on={chat.withEdits} onToggle={() => chat.setWithEdits(!chat.withEdits)}>
                    {editor.pending.length} visual edit{editor.pending.length === 1 ? '' : 's'}
                  </ContextChip>
                )}
              </div>
            )}
            <Textarea
              aria-label="Message Claude"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit();
              }}
              rows={2}
              autoGrow
              placeholder={editor.selected ? 'Ask Claude to change the selection…' : 'Ask Claude to change this screen…'}
              className="text-label"
            />
            <div className="mt-2 flex items-center gap-1">
              <div className="flex min-w-0 flex-1 items-center gap-1">
                <AccountMenu editor={editor} />
                <ModelSelect value={chat.session.model} onChange={chat.setModel} />
              </div>
              {chat.running ? (
                <button type="button" onClick={chat.stop} className={buttonClasses({ variant: 'secondary', size: 'sm' })}>
                  Stop
                </button>
              ) : (
                <button type="button" disabled={!draft.trim()} onClick={submit} className={cn(buttonClasses({ variant: 'primary', size: 'sm' }), 'flex-none')}>
                  Send <span className="text-on-ink/60">⌘↵</span>
                </button>
              )}
            </div>
          </>
        ) : (
          <SignIn editor={editor} status={status} />
        )}
      </div>

      <MemoryDialog open={memoryOpen} onClose={() => setMemoryOpen(false)} />
    </div>
  );
}

function UserMessage({ m }: { m: Extract<Message, { role: 'user' }> }) {
  return (
    <div className="ms-6 rounded-[10px] bg-ink/[0.07] px-3 py-2">
      <p className="text-label whitespace-pre-wrap">{m.text}</p>
      {m.context.length > 0 && <p className="mt-1 font-mono text-micro text-muted">with {m.context.join(' · ')}</p>}
    </div>
  );
}

function ClaudeMessage({ m }: { m: Extract<Message, { role: 'claude' }> }) {
  return (
    <div className="space-y-1.5">
      <p className="flex items-center gap-1.5 text-micro font-semibold tracking-wide text-muted uppercase">
        <Sparkle size={11} weight="fill" className="text-[#FEEE00]" aria-hidden />
        Claude
      </p>
      {m.events.map((e, j) =>
        e.type === 'text' ? (
          <p key={j} className="text-label leading-relaxed whitespace-pre-wrap text-ink/90">
            {e.text}
          </p>
        ) : e.type === 'tool' ? (
          <p key={j} className="truncate font-mono text-caption text-[#4db3ff]" title={e.file}>
            {toolLabel(e)}
          </p>
        ) : e.type === 'error' ? (
          <p key={j} className="text-caption text-danger">
            {e.text}
          </p>
        ) : e.type === 'done' && e.ok ? (
          <p key={j} className="flex items-center gap-1.5 text-caption text-[#38AE04]">
            <CheckCircle size={13} weight="fill" aria-hidden /> {m.events.some(isEdit) ? 'Done. The phone has reloaded with the change.' : 'Done.'}
          </p>
        ) : null,
      )}
      {m.running && (
        <p className="flex items-center gap-1.5 text-caption text-muted">
          <CircleNotch size={12} className="animate-spin" aria-hidden /> Working…
        </p>
      )}
    </div>
  );
}

const READS = new Set(['Read', 'Glob', 'Grep']);
const isEdit = (e: ClaudeEvent) => e.type === 'tool' && !READS.has(e.name) && e.name !== 'Bash' && !!e.file;
function toolLabel(e: Extract<ClaudeEvent, { type: 'tool' }>) {
  if (e.name === 'Bash') return 'Ran the typecheck';
  return `${READS.has(e.name) ? 'Looked at' : 'Edited'} ${e.file ?? e.name}`;
}

function ContextChip({ on, onToggle, children }: { on: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onToggle}
      title={on ? 'Included in your message. Click to leave it out.' : 'Left out. Click to include it.'}
      className={cn('flex items-center gap-1 rounded-md border px-1.5 py-0.5 font-mono text-caption', on ? 'border-[#0d99ff]/40 bg-[#0d99ff]/10 text-[#4db3ff]' : 'border-line text-muted line-through')}
    >
      {children}
      {on && <X size={10} aria-hidden />}
    </button>
  );
}

/* --------------------------------------------------------------- menus */

/** A small menu that opens above or below its trigger and closes on outside click / Escape. */
function Menu({ trigger, children, up, className }: { trigger: (open: boolean, toggle: () => void) => React.ReactNode; children: (close: () => void) => React.ReactNode; up?: boolean; className?: string }) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => !box.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);
  return (
    <div ref={box} className={cn('relative', className)}>
      {trigger(open, () => setOpen((o) => !o))}
      {open && (
        <div role="menu" className={cn('u-popover absolute z-30 min-w-56 rounded-xl border border-line bg-raised p-1 shadow-menu', up ? 'bottom-[calc(100%+4px)] start-0' : 'top-[calc(100%+4px)] end-0')}>
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}

const itemCls = 'flex h-8 w-full items-center gap-2 rounded-lg px-2 text-start text-label text-ink/85 hover:bg-ink/[0.07] hover:text-ink disabled:opacity-40';
const chipCls = 'flex h-7 max-w-[11rem] items-center gap-1.5 rounded-md px-1.5 text-caption text-muted transition-colors duration-150 hover:bg-ink/[0.06] hover:text-ink';

function ModelSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const current = MODELS.find((m) => m.value === value) ?? MODELS[0];
  return (
    <Menu
      up
      trigger={(open, toggle) => (
        <button type="button" aria-haspopup="menu" aria-expanded={open} onClick={toggle} className={chipCls} title="Model for this session">
          <span className="truncate">{current.label}</span>
          <CaretDown size={10} weight="bold" aria-hidden />
        </button>
      )}
    >
      {(close) =>
        MODELS.map((m) => (
          <button
            key={m.value}
            type="button"
            role="menuitemradio"
            aria-checked={m.value === value}
            onClick={() => {
              onChange(m.value);
              close();
            }}
            className={itemCls}
          >
            <Check size={12} weight="bold" className={m.value === value ? '' : 'invisible'} aria-hidden />
            {m.label}
          </button>
        ))
      }
    </Menu>
  );
}

function AccountMenu({ editor }: { editor: Editor }) {
  const info = editor.bridge?.claudeInfo;
  const [switching, setSwitching] = useState(false);
  return (
    <>
      <Menu
        up
        className="min-w-0"
        trigger={(open, toggle) => (
          <button type="button" aria-haspopup="menu" aria-expanded={open} onClick={toggle} className={cn(chipCls, 'max-w-full')} title={info?.account ? `Signed in as ${info.account}` : undefined}>
            <span className="u-circle size-1.5 flex-none rounded-full bg-[#38AE04]" aria-hidden />
            <span className="truncate">{info?.account?.split('@')[0] ?? 'Connected'}</span>
            <CaretDown size={10} weight="bold" aria-hidden />
          </button>
        )}
      >
        {(close) => (
          <>
            <div className="px-2 pt-1.5 pb-2">
              <p className="truncate text-label font-medium">{info?.account}</p>
              <p className="text-caption text-muted">{[info?.plan && `${info.plan} plan`, info?.method && `${info.method} login`].filter(Boolean).join(' · ')}</p>
            </div>
            <div className="my-1 h-px bg-line" />
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                close();
                setSwitching(true);
              }}
              className={itemCls}
            >
              <ArrowsLeftRight size={14} aria-hidden /> Switch account
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={async () => {
                close();
                await logout();
                editor.refreshBridge();
              }}
              className={itemCls}
            >
              <SignOut size={14} aria-hidden /> Sign out
            </button>
          </>
        )}
      </Menu>
      <Dialog open={switching} onClose={() => setSwitching(false)} size="md">
        <DialogHeader title="Switch Claude account" description="Your edits, sessions and memory stay as they are. This changes the account Claude Code uses on this machine, including in your terminal." divided />
        <DialogBody>
          <LoginFlow editor={editor} switching onDone={() => setSwitching(false)} />
        </DialogBody>
      </Dialog>
    </>
  );
}

/* ---------------------------------------------------------------- sign in */

function SignIn({ editor, status }: { editor: Editor; status: Status }) {
  if (status === 'checking')
    return (
      <p className="flex items-center gap-2 text-caption text-muted">
        <CircleNotch size={13} className="animate-spin" aria-hidden /> Checking Claude…
      </p>
    );
  if (status === 'local-only')
    return (
      <Notice title="Chat needs the local studio" text="Claude runs on your machine, so start the studio there.">
        <code className="block rounded-md bg-ink/[0.06] px-2 py-1.5 font-mono text-caption text-ink/85">npm run dev</code>
      </Notice>
    );
  if (status === 'not-installed')
    return (
      <Notice title="Install Claude Code" text="Chat uses Claude Code on this machine. Install it, then sign in here.">
        <code className="block rounded-md bg-ink/[0.06] px-2 py-1.5 font-mono text-caption text-ink/85">npm install -g @anthropic-ai/claude-code</code>
        <button type="button" onClick={editor.refreshBridge} className="mt-2 text-caption text-muted underline decoration-line-control underline-offset-4 hover:text-ink">
          Check again
        </button>
      </Notice>
    );
  return <LoginFlow editor={editor} />;
}

function Notice({ title, text, children }: { title: string; text: string; children?: React.ReactNode }) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-label font-medium">
        <Warning size={14} className="text-[#FF9741]" aria-hidden /> {title}
      </p>
      <p className="mt-1 mb-2 text-caption leading-relaxed text-muted">{text}</p>
      {children}
    </div>
  );
}

type LoginState = { step: 'idle' } | { step: 'waiting'; url?: string; needsCode: boolean; log: string[] } | { step: 'error'; message: string };

/**
 * Browser sign-in, the same one `claude auth login` runs in a terminal: the
 * bridge starts it and the CLI opens the browser itself, finishing on its own
 * when you approve. As a fallback the CLI also prints a link that ends with a
 * code to paste back, so both are offered.
 */
function LoginFlow({ editor, switching, onDone }: { editor: Editor; switching?: boolean; onDone?: () => void }) {
  const [state, setState] = useState<LoginState>({ step: 'idle' });
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const ctl = useRef<AbortController | null>(null);

  const start = async (useConsole = false) => {
    setState({ step: 'waiting', needsCode: false, log: [] });
    ctl.current = new AbortController();
    try {
      if (switching) await logout();
      await startLogin(
        { email: email.trim() || undefined, console: useConsole },
        (e) => {
          if (e.type === 'url') setState((s) => (s.step === 'waiting' ? { ...s, url: e.url } : s));
          else if (e.type === 'code') setState((s) => (s.step === 'waiting' ? { ...s, needsCode: true } : s));
          else if (e.type === 'line') setState((s) => (s.step === 'waiting' ? { ...s, log: [...s.log.slice(-3), e.text] } : s));
          else if (e.type === 'done') {
            if (e.ok) {
              setState({ step: 'idle' });
              editor.refreshBridge();
              onDone?.();
            } else setState({ step: 'error', message: 'Sign-in didn’t finish. Try again.' });
          }
        },
        ctl.current.signal,
      );
    } catch (err) {
      if ((err as Error).name !== 'AbortError') setState({ step: 'error', message: (err as Error).message });
    }
  };

  const cancel = async () => {
    ctl.current?.abort();
    await cancelLogin();
    setState({ step: 'idle' });
    editor.refreshBridge();
  };

  if (state.step === 'waiting') {
    return (
      <div className="space-y-3">
        <p className="flex items-center gap-2 text-label font-medium">
          <CircleNotch size={14} className="animate-spin" aria-hidden /> Finish signing in in your browser
        </p>
        <p className="text-caption leading-relaxed text-muted">Claude opened a sign-in page in your browser. Approve it there and come back; this updates on its own.</p>
        {state.needsCode && state.url && (
          <p className="text-caption leading-relaxed text-muted">
            Browser didn’t open?{' '}
            <a href={state.url} target="_blank" rel="noreferrer" className="text-ink/85 underline decoration-line-control underline-offset-4 hover:text-ink">
              Open the sign-in page
            </a>
            , then paste the code it shows:
          </p>
        )}
        {state.needsCode && (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (code.trim()) await sendLoginCode(code.trim());
              setCode('');
            }}
            className="flex gap-2"
          >
            <Input aria-label="Sign-in code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Paste code" className="font-mono" />
            <Button type="submit" size="md" disabled={!code.trim()}>
              Continue
            </Button>
          </form>
        )}
        <div className="flex flex-wrap items-center gap-2">
          {state.url && !state.needsCode && (
            <a href={state.url} target="_blank" rel="noreferrer" className={buttonClasses({ variant: 'secondary', size: 'sm' })}>
              Open sign-in page <ArrowSquareOut size={12} aria-hidden />
            </a>
          )}
          <button type="button" onClick={cancel} className={buttonClasses({ variant: 'ghost', size: 'sm' })}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {!switching && (
        <div>
          <p className="text-label font-medium">Sign in to Claude</p>
          <p className="mt-1 text-caption leading-relaxed text-muted">Same as signing in to Claude Code in a terminal: it opens your browser. Your edits and sessions stay as they are.</p>
        </div>
      )}
      <Input aria-label="Email (optional)" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@noon.com (optional)" />
      {state.step === 'error' && <p className="text-caption text-danger">{state.message}</p>}
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => start(false)} className={buttonClasses({ variant: 'primary', size: 'sm' })}>
          <Sparkle size={12} weight="fill" className="text-[#FEEE00]" aria-hidden />
          {switching ? 'Sign in with another account' : 'Sign in with Claude'}
        </button>
        <button type="button" onClick={() => start(true)} className={buttonClasses({ variant: 'ghost', size: 'sm' })}>
          Use an API account instead
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- chat bar */

function SessionBar({ chat, live, onMemory }: { chat: Chat; live: boolean; onMemory: () => void }) {
  const n = chat.session.messages.filter((m) => m.role === 'user').length;
  return (
    <div className="flex flex-none items-center gap-1 border-b border-line px-5 py-1.5">
      <p className="min-w-0 flex-1 truncate text-caption text-muted">{n ? `${n} message${n === 1 ? '' : 's'} in this draft` : 'This draft’s chat'}</p>
      <button type="button" onClick={chat.clear} disabled={!live || chat.running || !n} title="Clear this draft’s chat" className={cn(chipCls, 'disabled:opacity-40')}>
        <Plus size={12} aria-hidden /> New chat
      </button>
      <button type="button" onClick={onMemory} disabled={!live} aria-label="Studio memory" title="Studio memory, shared by every draft" className="grid size-7 flex-none place-items-center rounded-md text-muted hover:bg-ink/[0.06] hover:text-ink disabled:opacity-40">
        <Brain size={14} aria-hidden />
      </button>
    </div>
  );
}

/* ----------------------------------------------------------------- memory */

function MemoryDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [text, setText] = useState('');
  const [saved, setSaved] = useState('');
  useEffect(() => {
    if (open) readMemory().then((t) => (setText(t), setSaved(t)));
  }, [open]);
  const dirty = text !== saved;
  return (
    <Dialog open={open} onClose={onClose} size="xl">
      <DialogHeader
        title="Studio memory"
        description="Shared by every session and sent to Claude with each message. Finished chats and applied edits add a line here; add your own notes and decisions too."
        divided
      />
      <DialogBody>
        <Textarea aria-label="Memory" value={text} onChange={(e) => setText(e.target.value)} rows={14} placeholder={'# Studio memory\n\n- Cards on PDP use r16 corners\n- Keep CTA labels in title case'} className="font-mono text-caption" />
        <p className="mt-2 text-caption text-muted">Saved on this machine in .studio/memory.md.</p>
      </DialogBody>
      <DialogFooter>
        <Button variant="ghost" size="md" onClick={onClose}>
          Close
        </Button>
        <Button
          size="md"
          disabled={!dirty}
          onClick={async () => {
            await writeMemory(text);
            setSaved(text);
          }}
        >
          {dirty ? 'Save' : 'Saved'}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
