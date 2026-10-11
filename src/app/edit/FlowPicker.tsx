import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Dialog, DialogBody, DialogFooter, DialogHeader, SearchInput, cn, timeAgo } from 'lightweight-ui';
import { Check, PencilSimple, Plus, Trash } from 'lightweight-ui/icons';
import type { FlowDef } from '../../kit/types';
import type { DraftSummary } from './bridge';

/**
 * Asked when entering Edit mode. First: start a new draft, or resume one of
 * your drafts (newest first). A new draft then asks which flow to work on, from
 * a searchable list (flow name, id, journey or any screen title); ↑/↓ moves,
 * Enter starts, double-click starts straight away.
 */
export function FlowPicker({
  open,
  flows,
  current,
  drafts,
  currentDraft,
  onClose,
  onPick,
  onResume,
  onDelete,
}: {
  open: boolean;
  flows: FlowDef[];
  current?: string;
  drafts: DraftSummary[];
  currentDraft?: string;
  onClose: () => void;
  onPick: (flowId: string) => void;
  onResume: (draftId: string) => void;
  onDelete: (draftId: string) => void;
}) {
  const [view, setView] = useState<'drafts' | 'flows'>('drafts');
  useEffect(() => {
    if (open) setView(drafts.length ? 'drafts' : 'flows');
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  if (view === 'drafts' && drafts.length)
    return <Drafts open={open} flows={flows} drafts={drafts} currentDraft={currentDraft} onClose={onClose} onNew={() => setView('flows')} onResume={onResume} onDelete={onDelete} />;
  return <Flows open={open} flows={flows} current={current} onClose={onClose} onPick={onPick} onBack={drafts.length ? () => setView('drafts') : undefined} />;
}

function Flows({
  open,
  flows,
  current,
  onClose,
  onPick,
  onBack,
}: {
  open: boolean;
  flows: FlowDef[];
  current?: string;
  onClose: () => void;
  onPick: (flowId: string) => void;
  onBack?: () => void;
}) {
  const [choice, setChoice] = useState(current);
  const [query, setQuery] = useState('');
  const list = useRef<HTMLDivElement>(null);
  const searchBox = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    setChoice(current);
    setQuery('');
    // the dialog focuses its first control (the close button); search is the useful start
    const t = setTimeout(() => searchBox.current?.querySelector('input')?.focus(), 30);
    return () => clearTimeout(t);
  }, [open, current]);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return flows;
    return flows.filter((f) => [f.title, f.id, f.group ?? '', ...f.screens.map((s) => s.title)].some((t) => t.toLowerCase().includes(q)));
  }, [flows, query]);

  // typing moves the highlight to the best match (title matches before screen-name matches)
  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (!matches.length) return;
    if (!q) return setChoice((c) => (matches.some((f) => f.id === c) ? c : matches[0].id));
    setChoice((matches.find((f) => f.title.toLowerCase().includes(q) || f.id.includes(q)) ?? matches[0]).id);
  }, [matches, query]);
  useEffect(() => {
    list.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [choice]);

  const groups = matches.reduce<[string, FlowDef[]][]>((g, f) => {
    const name = f.group ?? 'Flows';
    const hit = g.find(([n]) => n === name);
    if (hit) hit[1].push(f);
    else g.push([name, [f]]);
    return g;
  }, []);

  const move = (d: 1 | -1) => {
    const i = matches.findIndex((f) => f.id === choice);
    const next = matches[Math.min(matches.length - 1, Math.max(0, i + d))];
    if (next) setChoice(next.id);
  };
  const onKeyDown = (e: React.KeyboardEvent) => {
    // Escape clears the search first; a second Escape closes the dialog
    if (e.key === 'Escape' && query) (e.preventDefault(), e.stopPropagation(), setQuery(''));
    if (e.key === 'ArrowDown') (e.preventDefault(), move(1));
    if (e.key === 'ArrowUp') (e.preventDefault(), move(-1));
    if (e.key === 'Enter' && choice) (e.preventDefault(), onPick(choice));
  };
  const screenHit = (f: FlowDef) => {
    const q = query.trim().toLowerCase();
    return q && !f.title.toLowerCase().includes(q) ? f.screens.find((s) => s.title.toLowerCase().includes(q))?.title : undefined;
  };

  return (
    <Dialog open={open} onClose={onClose} size="xl">
      <DialogHeader title="New draft: which flow?" description="The draft stays on this flow. Your edits and chat save as you go." divided />
      <DialogBody className="!p-0">
        <div ref={searchBox} className="px-5 pt-4 pb-3">
          <SearchInput value={query} onChange={setQuery} onKeyDown={onKeyDown} label="Search flows" placeholder="Search flows or screens…" />
        </div>
        <div ref={list} role="listbox" aria-label="Flows" className="max-h-[56vh] overflow-y-auto px-3 pb-3" onKeyDown={onKeyDown}>
          {groups.length ? (
            groups.map(([group, items]) => (
              <div key={group} role="group" aria-label={group} className="border-line [&+&]:mt-2 [&+&]:border-t">
                <p className="flex items-baseline justify-between px-2 pt-4 pb-2 text-micro font-semibold tracking-[0.08em] text-ink/70 uppercase">
                  {group}
                  <span className="font-normal tracking-normal text-muted normal-case tabular-nums">{items.length}</span>
                </p>
                {items.map((f) => {
                  const on = choice === f.id;
                  const hit = screenHit(f);
                  return (
                    <div
                      key={f.id}
                      role="option"
                      aria-selected={on}
                      onClick={() => setChoice(f.id)}
                      onDoubleClick={() => onPick(f.id)}
                      className={cn('flex h-10 cursor-default items-center gap-3 rounded-lg px-2', on ? 'bg-ink/[0.07]' : 'hover:bg-ink/[0.04]')}
                    >
                      <span className="min-w-0 flex-1 truncate text-ui">
                        {f.title}
                        {hit && <span className="text-muted"> · {hit}</span>}
                      </span>
                      <span className="flex-none text-caption text-muted tabular-nums">
                        {f.screens.length} screen{f.screens.length === 1 ? '' : 's'}
                      </span>
                      <Check size={14} weight="bold" className={cn('flex-none', on ? 'text-ink' : 'invisible')} aria-hidden />
                    </div>
                  );
                })}
              </div>
            ))
          ) : (
            <p className="px-3 py-8 text-center text-label text-muted">No flow or screen matches “{query}”.</p>
          )}
        </div>
      </DialogBody>
      <DialogFooter note="↑↓ to move · Enter to start">
        <Button variant="ghost" size="md" onClick={onBack ?? onClose}>
          {onBack ? 'Back to drafts' : 'Cancel'}
        </Button>
        <Button size="md" disabled={!choice || !matches.length} onClick={() => choice && onPick(choice)}>
          Start draft
        </Button>
      </DialogFooter>
    </Dialog>
  );
}

/** Step one: + New draft first, then your drafts from newest to oldest. */
function Drafts({
  open,
  flows,
  drafts,
  currentDraft,
  onClose,
  onNew,
  onResume,
  onDelete,
}: {
  open: boolean;
  flows: FlowDef[];
  drafts: DraftSummary[];
  currentDraft?: string;
  onClose: () => void;
  onNew: () => void;
  onResume: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const flowTitle = (id?: string) => flows.find((f) => f.id === id)?.title ?? id ?? '';
  const sorted = [...drafts].sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
  const shown = q ? sorted.filter((d) => [d.title, flowTitle(d.flowId)].some((t) => t.toLowerCase().includes(q))) : sorted;
  const row = 'flex min-h-12 w-full cursor-default items-center gap-3 rounded-lg px-2 py-1.5 text-start';

  return (
    <Dialog open={open} onClose={onClose} size="xl">
      <DialogHeader title="Your drafts" description="Pick up where you left off, or start something new." divided />
      <DialogBody className="!p-0">
        <div className="px-5 pt-4 pb-3">
          <SearchInput value={query} onChange={setQuery} label="Search drafts" placeholder="Search drafts…" />
        </div>
        <div className="max-h-[56vh] overflow-y-auto px-3 pb-3">
          <button type="button" onClick={onNew} className={cn(row, 'hover:bg-ink/[0.04]')}>
            <span className="grid size-8 flex-none place-items-center rounded-lg border border-dashed border-line-strong text-muted">
              <Plus size={14} aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-ui font-medium">New draft</span>
              <span className="block text-caption text-muted">Start on any flow</span>
            </span>
          </button>
          <p className="flex items-baseline justify-between px-2 pt-4 pb-2 text-micro font-semibold tracking-[0.08em] text-ink/70 uppercase">
            Drafts
            <span className="font-normal tracking-normal text-muted normal-case tabular-nums">{shown.length}</span>
          </p>
          {shown.length ? (
            shown.map((d) => (
              <div key={d.id} className={cn('group', row, d.id === currentDraft ? 'bg-ink/[0.07]' : 'hover:bg-ink/[0.04]')}>
                <button type="button" onClick={() => onResume(d.id)} className="flex min-w-0 flex-1 items-center gap-3 text-start">
                  <span className="grid size-8 flex-none place-items-center rounded-lg bg-ink/[0.05] text-muted">
                    <PencilSimple size={14} aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-ui">{d.title}</span>
                    <span className="block truncate text-caption text-muted">
                      {[flowTitle(d.flowId), d.changes && `${d.changes} edit${d.changes === 1 ? '' : 's'}`, d.messages && `${Math.ceil(d.messages / 2)} chat`, timeAgo(d.updatedAt)]
                        .filter(Boolean)
                        .join(' · ')}
                    </span>
                  </span>
                  {d.id === currentDraft && <Check size={14} weight="bold" className="flex-none" aria-hidden />}
                </button>
                <button
                  type="button"
                  aria-label={`Delete ${d.title}`}
                  onClick={() => onDelete(d.id)}
                  className="grid size-7 flex-none place-items-center rounded-md text-muted opacity-0 group-hover:opacity-100 hover:bg-ink/[0.07] hover:text-ink focus-visible:opacity-100"
                >
                  <Trash size={13} aria-hidden />
                </button>
              </div>
            ))
          ) : (
            <p className="px-2 py-6 text-center text-label text-muted">No draft matches “{query}”.</p>
          )}
        </div>
      </DialogBody>
      <DialogFooter note="Drafts save on this machine as you edit.">
        <Button variant="ghost" size="md" onClick={onClose}>
          Cancel
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
