import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from 'lightweight-ui';
import { Check, MagnifyingGlass, X } from 'lightweight-ui/icons';
import type { TokenOption } from './inspect';

/** Colour tokens grouped the way src/foundations/tokens.ts groups them. */
const COLOR_GROUPS: [string, (k: string) => boolean][] = [
  ['Brand', (k) => k.startsWith('brand') && k !== 'brandBlue'],
  ['Text', (k) => /^text/.test(k) && !['textInk', 'textProduct'].includes(k)],
  ['Surface', (k) => /^bg/.test(k) && !['bgPdp', 'bgPill', 'bgStoreStrip'].includes(k)],
  ['Border', (k) => /^border/.test(k)],
  ['Interactive', (k) => ['primary', 'primaryBright', 'link', 'tabActive', 'tabInactive', 'badge'].includes(k)],
  ['Status', (k) => /^(success|danger|warning|discount|rating)/.test(k) && k !== 'discountBright'],
  ['noon One', (k) => /^noonOne/.test(k)],
  ['Commerce', () => true],
];

export function groupOf(kind: Kind, label: string) {
  if (kind === 'color') return COLOR_GROUPS.find(([, test]) => test(label))![0];
  return { space: 'Spacing', radius: 'Radius', fontSize: 'Font size', fontWeight: 'Weight', type: 'Text styles' }[kind];
}

export type Kind = 'color' | 'space' | 'radius' | 'fontSize' | 'fontWeight' | 'type';

/** What a row shows besides the name: nothing when the name already says it (s12, r16). */
function detail(kind: Kind, t: TokenOption) {
  if (kind === 'space' || kind === 'radius') return /\d/.test(t.label) && t.label.replace(/\D/g, '') === String(t.hint) ? null : `${t.hint}px`;
  if (kind === 'fontSize') return `${t.hint}px`;
  if (kind === 'type' || kind === 'fontWeight') return t.hint;
  return null; // colours show a swatch; the hex is in the tooltip
}

/**
 * Figma-style variable picker: opens under (or above) its trigger, search on
 * top, tokens grouped under headings, one row per token. Colours get a Custom
 * tab with a picker and hex field. ↑/↓ + Enter, Esc or click outside closes.
 */
export function TokenPicker({
  anchor,
  kind,
  tokens,
  value,
  onPick,
  onClose,
  custom,
}: {
  anchor: HTMLElement;
  kind: Kind;
  tokens: TokenOption[];
  value: string;
  onPick: (value: string) => void;
  onClose: () => void;
  /** colours: current hex, shown in the Custom tab */
  custom?: string;
}) {
  const [tab, setTab] = useState<'tokens' | 'custom'>('tokens');
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [pos, setPos] = useState<{ left: number; top?: number; bottom?: number; width: number; maxHeight: number }>();
  const box = useRef<HTMLDivElement>(null);
  const search = useRef<HTMLInputElement>(null);

  useLayoutEffect(() => {
    const r = anchor.getBoundingClientRect();
    const width = Math.max(260, r.width);
    // line up with the field's left edge, but stay inside the inspector panel / window
    const panel = anchor.closest('aside')?.getBoundingClientRect();
    const maxRight = Math.min(window.innerWidth - 8, panel ? panel.right - 8 : Infinity);
    const left = Math.max(panel ? panel.left + 8 : 8, Math.min(r.left, maxRight - width));
    const below = window.innerHeight - r.bottom - 12;
    const above = r.top - 12;
    setPos(below >= 320 || below >= above ? { left, top: r.bottom + 4, width, maxHeight: Math.min(440, below) } : { left, bottom: window.innerHeight - r.top + 4, width, maxHeight: Math.min(440, above) });
  }, [anchor]);

  // focus search once the popover has a position (and so is rendered)
  useEffect(() => {
    if (pos && tab === 'tokens') search.current?.focus();
  }, [pos, tab]);

  useEffect(() => {
    const onDown = (e: PointerEvent) => !box.current?.contains(e.target as Node) && !anchor.contains(e.target as Node) && onClose();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && (e.stopPropagation(), onClose());
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey, true);
    };
  }, [anchor, onClose]);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const hits = q ? tokens.filter((t) => t.label.toLowerCase().includes(q) || String(t.hint).toLowerCase().includes(q)) : tokens;
    const map = new Map<string, TokenOption[]>();
    for (const t of hits) {
      const g = groupOf(kind, t.label);
      map.set(g, [...(map.get(g) ?? []), t]);
    }
    return [...map.entries()];
  }, [tokens, query, kind]);
  const flat = groups.flatMap(([, ts]) => ts);

  useEffect(() => {
    const i = flat.findIndex((t) => t.value === value);
    setActive(query || i < 0 ? 0 : i);
  }, [query]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    box.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const pick = (v: string) => {
    onPick(v);
    onClose();
  };

  if (!pos) return null;
  let n = -1;
  return createPortal(
    <div
      ref={box}
      role="dialog"
      aria-label="Pick a token"
      className="u-popover fixed z-50 flex flex-col overflow-hidden rounded-xl border border-line bg-raised text-ink shadow-menu"
      style={{ left: pos.left, top: pos.top, bottom: pos.bottom, width: pos.width, maxHeight: pos.maxHeight }}
    >
      <div className="flex flex-none items-center gap-1 border-b border-line px-2 py-1.5">
        {kind === 'color' ? (
          (['custom', 'tokens'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn('rounded-md px-2 py-1 text-label', tab === t ? 'bg-ink/[0.08] font-medium text-ink' : 'text-muted hover:text-ink')}
            >
              {t === 'custom' ? 'Custom' : 'Tokens'}
            </button>
          ))
        ) : (
          <span className="px-1 text-label font-medium">{groupOf(kind, '')}</span>
        )}
        <span className="flex-1" />
        <button type="button" aria-label="Close" onClick={onClose} className="grid size-7 place-items-center rounded-md text-muted hover:bg-ink/[0.06] hover:text-ink">
          <X size={13} aria-hidden />
        </button>
      </div>

      {tab === 'custom' ? (
        <CustomColor value={custom ?? '#000000'} onPick={pick} />
      ) : (
        <>
          <label className="flex flex-none items-center gap-2 border-b border-line px-3">
            <MagnifyingGlass size={14} className="text-muted" aria-hidden />
            <input
              ref={search}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                  e.preventDefault();
                  setActive((a) => Math.min(flat.length - 1, Math.max(0, a + (e.key === 'ArrowDown' ? 1 : -1))));
                }
                if (e.key === 'Enter' && flat[active]) pick(flat[active].value);
              }}
              placeholder="Search"
              aria-label="Search tokens"
              className="h-10 min-w-0 flex-1 bg-transparent text-label outline-none placeholder:text-muted"
            />
          </label>
          <div role="listbox" aria-label="Tokens" className="min-h-0 flex-1 overflow-y-auto py-1 [scrollbar-width:thin]">
            {groups.length ? (
              groups.map(([group, ts], gi) => (
                <div key={group} className={cn(gi > 0 && 'mt-1 border-t border-line pt-1')}>
                  {(groups.length > 1 || kind === 'color') && <p className="px-3 pt-2 pb-1 text-caption text-muted">{group}</p>}
                  {ts.map((t) => {
                    n++;
                    const i = n;
                    const on = t.value === value;
                    const d = detail(kind, t);
                    return (
                      <div
                        key={t.value}
                        role="option"
                        aria-selected={on}
                        data-active={i === active}
                        title={kind === 'color' ? `${t.label} · ${t.hint}` : undefined}
                        onPointerEnter={() => setActive(i)}
                        onClick={() => pick(t.value)}
                        className={cn('mx-1 flex h-8 cursor-default items-center gap-2.5 rounded-lg px-2 text-label', i === active ? 'bg-[#0d99ff]/20' : '')}
                      >
                        {kind === 'color' && <span className="size-4 flex-none rounded ring-1 ring-white/15" style={{ background: String(t.hint) }} />}
                        <span className="min-w-0 flex-1 truncate">{t.label}</span>
                        {d && <span className="flex-none text-caption text-muted tabular-nums">{d}</span>}
                        <Check size={12} weight="bold" className={cn('flex-none', on ? '' : 'invisible')} aria-hidden />
                      </div>
                    );
                  })}
                </div>
              ))
            ) : (
              <p className="px-3 py-6 text-center text-caption text-muted">No token matches “{query}”.</p>
            )}
          </div>
        </>
      )}
    </div>,
    document.body,
  );
}

function CustomColor({ value, onPick }: { value: string; onPick: (v: string) => void }) {
  const [hex, setHex] = useState(value.toUpperCase());
  const valid = /^#[0-9a-f]{6}$/i.test(hex);
  return (
    <div className="space-y-3 p-3">
      <input type="color" aria-label="Colour" value={valid ? hex : '#000000'} onChange={(e) => setHex(e.target.value.toUpperCase())} className="h-32 w-full cursor-pointer rounded-lg border-0 bg-transparent p-0" />
      <div className="flex gap-2">
        <span className="flex h-8 min-w-0 flex-1 items-center gap-2 rounded-md bg-ink/[0.05] px-2">
          <span className="size-4 flex-none rounded ring-1 ring-white/15" style={{ background: valid ? hex : 'transparent' }} />
          <input
            aria-label="Hex"
            value={hex}
            onChange={(e) => setHex(e.target.value.startsWith('#') ? e.target.value : `#${e.target.value}`)}
            onKeyDown={(e) => e.key === 'Enter' && valid && onPick(hex)}
            className="min-w-0 flex-1 bg-transparent font-mono text-caption outline-none"
          />
        </span>
        <button type="button" disabled={!valid} onClick={() => onPick(hex)} className="rounded-md bg-ink px-3 text-label font-medium text-on-ink disabled:opacity-40">
          Use
        </button>
      </div>
      <p className="text-caption leading-relaxed text-muted">A raw hex isn’t a token. If noon has one for this, use Tokens instead.</p>
    </div>
  );
}
