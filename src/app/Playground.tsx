import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Badge,
  Breadcrumb,
  Button,
  CommandMenu,
  HoverHighlight,
  IconButton,
  Kbd,
  modKey,
  ResizeHandle,
  SegmentedControl,
  ThemeSwitch,
  cn,
  useHotkey,
  type CommandItem,
} from 'lightweight-ui';
import {
  ArrowCounterClockwise,
  ArrowLeft,
  ArrowUUpLeft,
  CaretDown,
  CreditCard,
  Cursor,
  Crown,
  DeviceMobile,
  Eye,
  Gift,
  GridFour,
  Heart,
  House,
  IdentificationCard,
  ListBullets,
  MapPin,
  MagnifyingGlass,
  Package,
  Receipt,
  ShoppingCart,
  SquaresFour,
  TextAlignRight,
  UserCircle,
  type Icon,
} from 'lightweight-ui/icons';
import { allFlows } from '../flows';
import { layout } from '../foundations/tokens';
import { NoonPrototype } from '../kit/NoonPrototype';
import { AgentPanel } from './AgentPanel';
import { DesignPanel } from './edit/DesignPanel';
import { FlowPicker } from './edit/FlowPicker';
import { LayersPanel } from './edit/LayersPanel';
import { ScreenSelect } from './edit/ScreenSelect';
import { useDrafts, type SaveState } from './edit/useDrafts';
import { EditOverlay } from './edit/EditOverlay';
import { useEditor } from './edit/useEditor';
import { createRegistry } from '../kit/registry';
import { parsePageUrl } from '../kit/routes';
import type { Route, StackEntry } from '../kit/types';

const registry = createRegistry(allFlows);
// used by scripts/check-routes.mjs
(window as unknown as { __NK_ROUTES__: string[] }).__NK_ROUTES__ = registry.all().map((r) => r.route);

/** The page in the URL: `/homepage`, `/plp?query=x`, `/pdp/detail` or legacy `#/plp/listing` (see kit/routes.ts). */
const readUrl = (): { route?: Route; params: Record<string, string> } => {
  const { route, params } = parsePageUrl(window.location);
  const resolved = route ? registry.resolve(route) : undefined;
  return { route: resolved?.route, params };
};


const flowIcons: Record<string, Icon> = {
  home: House,
  categories: SquaresFour,
  deals: Gift,
  search: MagnifyingGlass,
  plp: ListBullets,
  pdp: Package,
  cart: ShoppingCart,
  checkout: CreditCard,
  orders: Receipt,
  returns: ArrowUUpLeft,
  wishlist: Heart,
  account: UserCircle,
  address: MapPin,
  cards: CreditCard,
  noonone: Crown,
  membership: IdentificationCard,
};

type View = 'prototype' | 'overview';
type Mode = 'view' | 'edit';
const modes = [
  { value: 'view', label: 'View', icon: <Eye size={14} /> },
  { value: 'edit', label: 'Edit', icon: <Cursor size={14} /> },
] as const;

/**
 * The studio: browse flows, jump to any screen, inspect notes, toggle RTL/frame,
 * copy a ready-made brief for Claude or any agent, and see all screens of a flow side-by-side.
 * Chrome is Lightweight UI (see lui.css); the phone inside `.pg-phone` is the noon app, untouched.
 */
export function Playground() {
  const [{ route: urlRoute, params: initialParams }] = useState(readUrl);
  const initial = urlRoute ?? 'home/home';
  const [route, setRoute] = useState<Route>(initial);
  const [reset, setReset] = useState<{ route: Route; params?: Record<string, unknown>; nonce: number }>();
  const [rtl, setRtl] = useState(false);
  const [frame, setFrame] = useState(true);
  const [view, setView] = useState<View>('prototype');
  const [openFlow, setOpenFlow] = useState(initial.split('/')[0]);
  const [searching, setSearching] = useState(false);
  const [scale, setScale] = useState(1);
  const [inspectorW, setInspectorW] = useState(() => {
    try {
      return Math.min(640, Math.max(280, Number(localStorage.getItem('nk-studio-inspector-w')) || 320));
    } catch {
      return 320;
    }
  });

  useEffect(() => {
    const fit = () => setScale(Math.min(1, (window.innerHeight - 104) / layout.deviceHeight));
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);

  useHotkey('mod+k', () => setSearching((s) => !s));
  useHotkey('/', () => setSearching(true));

  const go = useCallback((r: Route, params?: Record<string, unknown>) => {
    setView('prototype');
    setReset({ route: r, params, nonce: Date.now() });
    setOpenFlow(r.split('/')[0]);
  }, []);

  // Typing a new page URL / hash (or browser back) jumps the prototype there.
  useEffect(() => {
    const onUrl = () => {
      const { route: r, params } = readUrl();
      if (r) go(r, params);
    };
    window.addEventListener('popstate', onUrl);
    window.addEventListener('hashchange', onUrl);
    return () => {
      window.removeEventListener('popstate', onUrl);
      window.removeEventListener('hashchange', onUrl);
    };
  }, [go]);

  const onRouteChange = useCallback((r: Route, s: StackEntry[]) => {
    setRoute(r);
    // Keep the address bar on the page's clean URL, e.g. /homepage, /plp, /checkout/cards-select.
    const p = s.at(-1)?.params ?? {};
    const query = new URLSearchParams(Object.entries(p).flatMap(([k, v]) => (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean' ? [[k, String(v)]] : []))).toString();
    window.history.replaceState(null, '', `/${registry.pathFor(r)}${query ? `?${query}` : ''}`);
  }, []);

  const current = registry.resolve(route);
  // Edit mode works against one flow, picked when entering it.
  const [editFlowId, setEditFlowId] = useState<string>();
  const [picking, setPicking] = useState(false);
  const editFlow = allFlows.find((f) => f.id === editFlowId);
  const editor = useEditor(editFlowId ?? current?.flow.id, route);
  const [stage, setStage] = useState<HTMLDivElement | null>(null);
  const { select, setEnabled } = editor;
  const mode: Mode = editor.enabled ? 'edit' : 'view';
  const titleFor = useCallback((r: string) => registry.resolve(r)?.screen.title ?? r, []);

  const screenEl = useCallback(() => stage?.querySelector('[class*="viewport_"]') ?? stage, [stage]);
  const draftFlow = allFlows.find((f) => f.id === (editFlowId ?? current?.flow.id));
  const drafts = useDrafts(editor, screenEl, route, go, draftFlow && { id: draftFlow.id, title: draftFlow.title });

  // New draft on a flow.
  const startEditing = useCallback(
    (flowId: string) => {
      const f = allFlows.find((x) => x.id === flowId)!;
      const startRoute = route.startsWith(`${flowId}/`) ? route : `${flowId}/${f.initial}`;
      setPicking(false);
      setEditFlowId(flowId);
      setEnabled(true);
      setView('prototype');
      drafts.start(flowId, f.title, startRoute);
      if (startRoute !== route) go(startRoute);
    },
    [route, go, setEnabled, drafts],
  );
  // Back to a saved draft.
  const resumeDraft = useCallback(
    async (id: string) => {
      setPicking(false);
      setEnabled(true);
      setView('prototype');
      const d = await drafts.resume(id);
      if (d) setEditFlowId(d.flowId);
    },
    [setEnabled, drafts],
  );
  const setMode = useCallback(
    (m: Mode) => {
      if (m === 'edit') {
        drafts.refresh();
        setPicking(true);
      } else setEnabled(false);
    },
    [setEnabled, drafts],
  );

  // A new screen means the old selection is gone.
  useEffect(() => select(null), [route, select]);

  // E switches mode, like a design tool's tool shortcut (ignored while typing).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key.toLowerCase() !== 'e' || e.metaKey || e.ctrlKey || e.altKey || t.closest('input, textarea, select, [contenteditable], [role="dialog"]')) return;
      setMode(editor.enabled ? 'view' : 'edit');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setMode, editor.enabled]);
  const groups = useMemo(() => {
    const g = new Map<string, typeof allFlows>();
    for (const f of allFlows) g.set(f.group ?? 'Flows', [...(g.get(f.group ?? 'Flows') ?? []), f]);
    return [...g.entries()];
  }, []);
  const overviewFlow = allFlows.find((f) => f.id === openFlow) ?? allFlows[0];

  const commands = useMemo<CommandItem[]>(
    () =>
      allFlows.flatMap((f) => {
        const Glyph = flowIcons[f.id] ?? DeviceMobile;
        return f.screens.map((s) => ({
          id: `${f.id}/${s.id}`,
          label: s.title,
          group: f.title,
          hint: <code className="font-mono text-caption">{`${f.id}/${s.id}`}</code>,
          icon: <Glyph size={16} />,
          keywords: [f.id, s.id, f.title, s.presentation ?? ''],
          onSelect: () => go(`${f.id}/${s.id}`),
        }));
      }),
    [go],
  );

  return (
    <div
      className="relative grid h-dvh grid-cols-[272px_minmax(0,1fr)] bg-bg text-ink min-[1180px]:grid-cols-[272px_minmax(0,1fr)_var(--nk-inspector-w)]"
      style={{ '--nk-inspector-w': `${inspectorW}px` } as React.CSSProperties}
    >
      {/* Sidebar — set apart by a faint ink wash, not a rule. */}
      <aside className="flex min-h-0 flex-col bg-ink/[0.02]">
        <div className="flex h-14 flex-none items-center px-3">
          <a
            href="/"
            onClick={(e) => {
              // Stay in the app: main.tsx swaps to the landing page on popstate.
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
              e.preventDefault();
              window.history.pushState(null, '', '/');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
            className="u-press flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-ui font-medium text-muted transition-colors duration-150 hover:bg-ink/[0.05] hover:text-ink focus-visible:outline-offset-2"
          >
            <ArrowLeft size={16} aria-hidden />
            Home
          </a>
        </div>
        {editor.enabled ? (
          <LayersPanel
            editor={editor}
            root={stage}
            titleFor={titleFor}
            header={
              <div className="px-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5 text-micro font-semibold tracking-[0.08em] text-muted uppercase">
                      <span className="truncate">Draft · {editFlow?.title ?? current?.flow.title}</span>
                      <SaveBadge state={drafts.saveState} at={drafts.savedAt} />
                    </p>
                    <input
                      aria-label="Draft name"
                      value={drafts.draft?.title ?? ''}
                      onChange={(e) => drafts.rename(e.target.value)}
                      onBlur={drafts.touch}
                      onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                      className="-mx-1 w-full truncate rounded-md bg-transparent px-1 text-ui font-semibold outline-none hover:bg-ink/[0.05] focus:bg-ink/[0.07]"
                    />
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      drafts.refresh();
                      setPicking(true);
                    }}
                  >
                    Drafts
                  </Button>
                </div>
                {editFlow && (
                  <div className="mt-3">
                    <span className="mb-1 block text-micro text-muted">Screen</span>
                    <ScreenSelect flow={editFlow} route={route} onPick={(r) => go(r)} />
                  </div>
                )}
              </div>
            }
          />
        ) : (
          <>
        <div className="flex-none px-3 pb-2">
          <SearchTrigger onClick={() => setSearching(true)} />
        </div>

        <nav aria-label="Flows" className="min-h-0 flex-1">
          <HoverHighlight
            radius={10}
            className="h-full overflow-y-auto overscroll-contain px-3 pb-10 [mask-image:linear-gradient(to_bottom,black_calc(100%-40px),transparent)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {groups.map(([group, flows]) => (
              <div key={group} className="mt-5 first:mt-1">
                <p className="px-2.5 pb-1 text-micro font-semibold uppercase tracking-[0.08em] text-muted">{group}</p>
                <ul>
                  {flows.map((f) => {
                    const Glyph = flowIcons[f.id] ?? DeviceMobile;
                    const open = openFlow === f.id;
                    const inFlow = route.startsWith(`${f.id}/`);
                    return (
                      <li key={f.id}>
                        <button
                          type="button"
                          data-hl
                          data-static
                          aria-expanded={open}
                          onClick={() => (open ? go(`${f.id}/${f.initial}`) : setOpenFlow(f.id))}
                          className={cn(
                            'group/flow flex w-full items-center gap-2.5 rounded-chip px-2.5 py-[7px] text-start text-ui transition-colors focus-visible:-outline-offset-2',
                            inFlow || open ? 'font-medium text-ink' : 'text-muted hover:text-ink',
                          )}
                        >
                          <Glyph size={16} weight={inFlow ? 'duotone' : 'regular'} aria-hidden="true" className="flex-none" />
                          <span className="min-w-0 flex-1 truncate">{f.title}</span>
                          <span className="text-caption tabular-nums text-muted">{f.screens.length}</span>
                          <CaretDown size={11} weight="bold" aria-hidden="true" className={cn('text-muted transition-[rotate] duration-200 ease-out', !open && '-rotate-90 rtl:rotate-90')} />
                        </button>
                        {open && (
                          <ul className="u-rise mb-1 ms-[18px] border-s border-line ps-2">
                            {f.screens.map((s) => {
                              const r = `${f.id}/${s.id}`;
                              const active = route === r;
                              return (
                                <li key={s.id}>
                                  <button
                                    type="button"
                                    data-hl
                                    data-static
                                    aria-current={active ? 'page' : undefined}
                                    onClick={() => go(r)}
                                    className={cn(
                                      'relative flex w-full items-center gap-2 rounded-chip px-2.5 py-1.5 text-start text-label transition-colors focus-visible:-outline-offset-2',
                                      active ? 'font-medium text-ink' : 'text-muted hover:text-ink',
                                    )}
                                  >
                                    {active && <span aria-hidden="true" className="absolute inset-0 -z-10 rounded-chip bg-ink/[0.06]" />}
                                    <span className="min-w-0 flex-1 truncate">{s.title}</span>
                                    {s.presentation === 'sheet' && <Badge size="sm" tone="outline">sheet</Badge>}
                                  </button>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </HoverHighlight>
        </nav>
          </>
        )}

        <div className="flex flex-none items-center justify-between gap-2 px-4 py-3">
          <span className="text-caption text-muted">Studio theme</span>
          <ThemeSwitch label="Studio theme" />
        </div>
      </aside>

      {/* Stage */}
      <main className="flex min-h-0 min-w-0 flex-col">
        <div className="flex h-14 flex-none items-center gap-3 px-5">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            {current && (
              <Breadcrumb
                label="Current screen"
                items={[{ label: current.flow.title, onClick: () => go(`${current.flow.id}/${current.flow.initial}`) }, { label: current.screen.title }]}
              />
            )}
            <Badge size="sm" tone="outline" className="hidden font-mono 2xl:inline-flex">
              {route}
            </Badge>
          </div>
          <SegmentedControl label="Mode" items={modes} value={mode} onChange={setMode} />
          <div className="flex flex-1 items-center justify-end gap-1">
            {!editor.enabled && (
              <IconButton label="All screens in this flow" tooltip="bottom" pressed={view === 'overview'} onClick={() => setView((v) => (v === 'overview' ? 'prototype' : 'overview'))}>
                <GridFour size={18} />
              </IconButton>
            )}
            <IconButton label="Restart screen" tooltip="bottom" onClick={() => go(route)}>
              <ArrowCounterClockwise size={18} />
            </IconButton>
            <IconButton label="Right-to-left (Arabic)" tooltip="bottom" pressed={rtl} onClick={() => setRtl((v) => !v)}>
              <TextAlignRight size={18} />
            </IconButton>
            <IconButton label="Device frame" tooltip="bottom" pressed={frame} onClick={() => setFrame((v) => !v)}>
              <DeviceMobile size={18} />
            </IconButton>
          </div>
        </div>

        {view === 'overview' ? (
          <div className="u-view min-h-0 flex-1 overflow-auto px-5 pb-10 pt-2">
            <div className="mb-5 flex items-baseline gap-3">
              <h2 className="text-display-sm">{overviewFlow.title}</h2>
              <span className="text-label text-muted">{overviewFlow.screens.length} screens</span>
            </div>
            <div className="u-stagger flex flex-wrap content-start gap-6">
              {overviewFlow.screens.map((s) => (
                <div key={s.id} onClick={() => go(`${overviewFlow.id}/${s.id}`)} className="group flex cursor-pointer flex-col items-center gap-2.5">
                  {/* A live preview, not an interactive phone: inert, so the whole card is one target. */}
                  <div inert className="pg-phone pg-thumb-device rounded-tile shadow-card ring-1 ring-line transition-[translate,box-shadow] duration-200 ease-out group-hover:-translate-y-1 group-hover:shadow-lift">
                    <NoonPrototype flows={allFlows} initialRoute={`${overviewFlow.id}/${s.id}`} frame={false} scale={0.42} rtl={rtl} />
                  </div>
                  <button type="button" data-static className="rounded-chip px-1.5 text-label font-medium text-muted transition-colors group-hover:text-ink focus-visible:outline-offset-2">
                    {s.title}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="pg-canvas flex min-h-0 flex-1 justify-center overflow-hidden">
            <div ref={setStage} className={cn('pg-stage pg-phone', editor.enabled && 'cursor-crosshair')} style={{ height: layout.deviceHeight * scale }}>
              <NoonPrototype flows={allFlows} initialRoute={initial} initialParams={initialParams} frame={frame} scale={scale} rtl={rtl} onRouteChange={onRouteChange} resetSignal={reset} />
            </div>
          </div>
        )}
      </main>

      {/* Inspector */}
      <aside className="hidden min-h-0 flex-col bg-ink/[0.02] min-[1180px]:flex">
        {editor.enabled ? (
          <DesignPanel editor={editor} root={stage} flowId={editFlowId ?? current?.flow.id} draftId={drafts.draft?.id ?? 'scratch'} onActivity={drafts.touch} />
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 [scrollbar-width:thin]">
            <AgentPanel flow={current?.flow} screen={current?.screen} />
          </div>
        )}
      </aside>
      <ResizeHandle
        side="right"
        width={inspectorW}
        min={280}
        max={640}
        defaultWidth={320}
        label="Resize the inspector"
        onResize={setInspectorW}
        onCommit={(w) => {
          try {
            localStorage.setItem('nk-studio-inspector-w', String(w));
          } catch {
            /* storage blocked: width resets next visit */
          }
        }}
        className="hidden min-[1180px]:block"
      />
      <EditOverlay root={stage} editor={editor} />

      <FlowPicker
        open={picking}
        flows={allFlows}
        current={editFlowId ?? current?.flow.id}
        drafts={drafts.drafts}
        currentDraft={editor.enabled ? drafts.draft?.id : undefined}
        onClose={() => setPicking(false)}
        onPick={startEditing}
        onResume={resumeDraft}
        onDelete={drafts.remove}
      />
      <CommandMenu open={searching} onOpenChange={setSearching} items={commands} label="Jump to a screen" placeholder="Search flows and screens…" footer />
    </div>
  );
}

function SearchTrigger({ onClick }: { onClick: () => void }) {
  const [mod, setMod] = useState<string>('⌘');
  useEffect(() => setMod(modKey()), []);
  return (
    <button
      type="button"
      onClick={onClick}
      aria-keyshortcuts="Meta+K Control+K"
      data-static
      className="group flex h-9 w-full items-center gap-2 rounded-xl border border-line bg-ink/[0.025] ps-3 pe-1.5 text-label text-muted transition-colors hover:border-line-control hover:bg-ink/[0.04] hover:text-ink focus-visible:outline-offset-2"
    >
      <MagnifyingGlass size={14} aria-hidden="true" className="transition-[scale] duration-200 ease-out group-hover:scale-110" />
      <span className="flex-1 text-start">Jump to screen…</span>
      <span className="flex items-center gap-0.5" aria-hidden="true">
        <Kbd>{mod}</Kbd>
        <Kbd>K</Kbd>
      </span>
    </button>
  );
}

/** Draft save state next to its name. */
function SaveBadge({ state, at }: { state: SaveState; at?: string }) {
  if (state === 'idle') return null;
  const text = state === 'saving' ? 'Saving…' : state === 'error' ? 'Not saved' : 'Saved';
  return (
    <span title={state === 'saved' && at ? `Saved ${new Date(at).toLocaleTimeString()}` : state === 'error' ? 'Couldn’t save: is npm run dev still running?' : undefined} className={cn('flex-none font-normal tracking-normal normal-case', state === 'error' ? 'text-danger' : 'text-muted/80')}>
      · {text}
    </span>
  );
}
