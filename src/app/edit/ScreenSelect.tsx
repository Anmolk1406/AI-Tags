import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { cn } from 'lightweight-ui';
import { CaretDown, Check } from 'lightweight-ui/icons';
import type { FlowDef } from '../../kit/types';

/**
 * Searchable screen picker for Edit mode: an input showing the current screen;
 * typing filters the menu that opens right under it. ↑/↓ move, Enter picks,
 * Escape or a click outside closes.
 */
export function ScreenSelect({ flow, route, onPick }: { flow: FlowDef; route: string; onPick: (route: string) => void }) {
  const current = flow.screens.find((s) => `${flow.id}/${s.id}` === route);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const box = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const listId = useId();

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? flow.screens.filter((s) => s.title.toLowerCase().includes(q) || s.id.toLowerCase().includes(q)) : flow.screens;
  }, [flow, query]);

  useEffect(() => {
    if (!open) return;
    const i = matches.findIndex((s) => `${flow.id}/${s.id}` === route);
    setActive(i >= 0 && !query ? i : 0);
  }, [open, matches, query, route, flow.id]);

  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => !box.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [open]);

  useEffect(() => {
    box.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active, open]);

  const pick = (id: string) => {
    onPick(`${flow.id}/${id}`);
    setOpen(false);
    setQuery('');
    input.current?.blur();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!open) return setOpen(true);
      setActive((a) => Math.min(matches.length - 1, Math.max(0, a + (e.key === 'ArrowDown' ? 1 : -1))));
    } else if (e.key === 'Enter' && open && matches[active]) {
      e.preventDefault();
      pick(matches[active].id);
    } else if (e.key === 'Escape' && open) {
      e.preventDefault();
      e.stopPropagation();
      setOpen(false);
      setQuery('');
    }
  };

  const kind = (p?: string) => (p && p !== 'screen' ? p : null);

  return (
    <div ref={box} className="relative">
      <div className="flex h-9 items-center rounded-lg bg-ink/[0.05] ps-2.5 pe-1 transition-colors duration-150 focus-within:bg-ink/[0.08] hover:bg-ink/[0.07]">
        <input
          ref={input}
          role="combobox"
          aria-label="Screen"
          aria-expanded={open}
          aria-controls={listId}
          aria-activedescendant={open && matches[active] ? `${listId}-${active}` : undefined}
          value={open ? query : (current?.title ?? 'Pick a screen')}
          placeholder={current?.title ?? 'Search screens…'}
          onFocus={() => {
            setOpen(true);
            setQuery('');
          }}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onKeyDown={onKeyDown}
          className="h-full min-w-0 flex-1 bg-transparent text-label text-ink outline-none placeholder:text-muted"
        />
        <button
          type="button"
          tabIndex={-1}
          aria-label={open ? 'Close screens' : 'Show screens'}
          onPointerDown={(e) => e.preventDefault()}
          onClick={() => (open ? setOpen(false) : input.current?.focus())}
          className="grid size-7 flex-none place-items-center rounded-md text-muted hover:text-ink"
        >
          <CaretDown size={13} weight="bold" className={cn('transition-transform duration-150', open && 'rotate-180')} aria-hidden />
        </button>
      </div>

      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label={`${flow.title} screens`}
          className="u-popover absolute inset-x-0 top-[calc(100%+4px)] z-30 max-h-80 overflow-y-auto rounded-xl border border-line bg-raised p-1 shadow-menu [scrollbar-width:thin]"
        >
          {matches.length ? (
            matches.map((s, i) => {
              const on = `${flow.id}/${s.id}` === route;
              return (
                <li
                  key={s.id}
                  id={`${listId}-${i}`}
                  data-index={i}
                  role="option"
                  aria-selected={on}
                  onPointerDown={(e) => e.preventDefault()}
                  onPointerEnter={() => setActive(i)}
                  onClick={() => pick(s.id)}
                  className={cn('flex h-8 cursor-default items-center gap-2 rounded-lg px-2 text-label', i === active ? 'bg-ink/[0.07] text-ink' : 'text-ink/85')}
                >
                  <Check size={12} weight="bold" className={cn('flex-none', on ? 'text-ink' : 'invisible')} aria-hidden />
                  <span className="min-w-0 flex-1 truncate">{s.title}</span>
                  {kind(s.presentation) && <span className="flex-none text-caption text-muted">{kind(s.presentation)}</span>}
                </li>
              );
            })
          ) : (
            <li className="px-2 py-3 text-caption text-muted">No screen matches “{query}”.</li>
          )}
        </ul>
      )}
    </div>
  );
}
