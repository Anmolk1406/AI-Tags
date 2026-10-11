import { useEffect, useMemo, useRef, useState } from 'react';
import { Overline, cn } from 'lightweight-ui';
import { CaretRight, Diamond, Hash, Image as ImageIcon, Square, TextT, Textbox } from 'lightweight-ui/icons';
import { isShared, moduleClasses, ownText } from './inspect';
import type { Editor } from './useEditor';

type Kind = 'frame' | 'text' | 'image' | 'icon' | 'button' | 'input';
interface Layer {
  el: HTMLElement;
  name: string;
  kind: Kind;
  shared: boolean;
  children: Layer[];
}

const visible = (el: Element) => el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden';
const human = (s: string) => s.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/^./, (c) => c.toUpperCase());

/**
 * Turns the phone's DOM into Figma-like layers: elements with a stylesheet
 * class, text, images and controls become layers; anonymous wrappers fold away
 * so their children sit one level up. SVGs are one icon layer.
 */
function layersOf(el: Element): Layer[] {
  if (!(el instanceof HTMLElement || el instanceof SVGElement)) return [];
  if (!visible(el)) {
    // `display: contents` wrappers have no box of their own but their children do
    return getComputedStyle(el).display === 'contents' ? [...el.children].flatMap(layersOf) : [];
  }
  const tag = el.tagName.toLowerCase();
  const mc = moduleClasses(el)[0];
  const host = el as HTMLElement;
  if (tag === 'svg') return [{ el: host, name: mc ? human(mc.local) : 'Icon', kind: 'icon', shared: isShared(mc?.file ?? null), children: [] }];
  if (tag === 'img') {
    const src = (el as HTMLImageElement).currentSrc || (el as HTMLImageElement).src;
    const file = decodeURIComponent(src.split('?')[0].split('/').pop() ?? '');
    return [{ el: host, name: (el as HTMLImageElement).alt || file || 'Image', kind: 'image', shared: false, children: [] }];
  }
  const children = [...el.children].flatMap(layersOf);
  const text = ownText(el);
  const kind: Kind = tag === 'button' ? 'button' : tag === 'input' || tag === 'textarea' ? 'input' : text ? 'text' : 'frame';
  // fold anonymous wrappers and the prototype runtime's own chrome (src/kit)
  if (kind === 'frame' && (!mc || mc.file?.startsWith('src/kit/'))) return children;
  const name = text ? text.slice(0, 40) : mc ? human(mc.local) : tag;
  return [{ el: host, name, kind, shared: isShared(mc?.file ?? null), children }];
}

const ICON: Record<Kind, typeof Hash> = { frame: Hash, text: TextT, image: ImageIcon, icon: Diamond, button: Square, input: Textbox };

/** One top-level frame per visible screen surface: the top screen in the stack, plus any open sheet. */
function frames(screen: Element, titleFor: (route: string) => string): Layer[] {
  const frame = (el: HTMLElement, name: string, body: Element = el): Layer => ({ el, name, kind: 'frame', shared: false, children: [...body.children].flatMap(layersOf) });
  const top = [...screen.querySelectorAll<HTMLElement>('[data-route]')].filter(visible).at(-1);
  const sheets = [...screen.querySelectorAll<HTMLElement>('[class]')].filter((e) => [...e.classList].some((c) => /^sheet_[0-9a-f]{6}$/.test(c)) && visible(e));
  const out: Layer[] = [];
  if (top) out.push(frame(top, titleFor(top.dataset.route ?? ''), top.querySelector(':scope > [class*="screenBody_"]') ?? top));
  sheets.forEach((s, i) => out.push(frame(s, sheets.length > 1 ? `Sheet ${i + 1}` : 'Sheet')));
  return out.length ? out : [...screen.children].flatMap(layersOf);
}

/** Edit mode's left panel: the flow being worked on, its screens, and the current screen's layers. */
export function LayersPanel({
  editor,
  root,
  header,
  titleFor,
}: {
  editor: Editor;
  root: HTMLElement | null;
  /** flow name, screen switcher, "change flow" */
  header: React.ReactNode;
  /** screen title for a route, to name the top frame like Figma does */
  titleFor: (route: string) => string;
}) {
  const [tree, setTree] = useState<Layer[]>([]);
  const [open, setOpen] = useState<Set<HTMLElement>>(new Set());

  // Rebuild as the screen renders, navigates or hot-reloads.
  useEffect(() => {
    if (!root) return;
    const screen = root.querySelector('[class*="viewport_"]') ?? root;
    let t = 0;
    const rebuild = () => {
      window.clearTimeout(t);
      t = window.setTimeout(() => setTree(frames(screen, titleFor)), 200);
    };
    rebuild();
    const mo = new MutationObserver(rebuild);
    mo.observe(screen, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style', 'hidden'] });
    return () => {
      mo.disconnect();
      window.clearTimeout(t);
    };
  }, [root, editor.version, titleFor]);

  // Selecting on the phone opens the path down to that layer.
  const { selected } = editor;
  useEffect(() => {
    if (!selected) return;
    setOpen((prev) => {
      const next = new Set(prev);
      for (let p = selected.parentElement; p && p !== root; p = p.parentElement) next.add(p);
      return next;
    });
  }, [selected, root]);

  const count = useMemo(() => {
    const n = (ls: Layer[]): number => ls.reduce((a, l) => a + 1 + n(l.children), 0);
    return n(tree);
  }, [tree]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex-none px-3 pb-3">{header}</div>
      <div className="flex flex-none items-center justify-between border-t border-line px-4 pt-3 pb-1.5">
        <Overline>Layers</Overline>
        <div className="flex items-center gap-2">
          <span className="text-caption tabular-nums text-muted">{count}</span>
          <button type="button" onClick={() => setOpen(new Set())} className="text-caption text-muted hover:text-ink">
            Collapse
          </button>
        </div>
      </div>
      <div role="tree" aria-label="Layers" className="min-h-0 flex-1 overflow-y-auto px-2 pb-6 [scrollbar-width:thin]" onPointerLeave={() => editor.setHovered(null)}>
        {tree.length ? (
          tree.map((l, i) => <Row key={i} layer={l} depth={0} editor={editor} open={open} setOpen={setOpen} />)
        ) : (
          <p className="px-2 py-3 text-caption text-muted">Waiting for the screen…</p>
        )}
      </div>
    </div>
  );
}

function Row({ layer, depth, editor, open, setOpen }: { layer: Layer; depth: number; editor: Editor; open: Set<HTMLElement>; setOpen: (f: (s: Set<HTMLElement>) => Set<HTMLElement>) => void }) {
  const isOpen = open.has(layer.el) || depth < 3;
  const sel = editor.selected === layer.el;
  const hov = editor.hovered === layer.el;
  const ref = useRef<HTMLDivElement>(null);
  const Icon = layer.shared ? Diamond : ICON[layer.kind];
  useEffect(() => {
    if (sel) ref.current?.scrollIntoView({ block: 'nearest' });
  }, [sel]);

  const toggle = () =>
    setOpen((s) => {
      const n = new Set(s);
      if (isOpen) n.delete(layer.el);
      else n.add(layer.el);
      return n;
    });

  return (
    <div role="treeitem" aria-selected={sel} aria-expanded={layer.children.length ? isOpen : undefined}>
      <div
        ref={ref}
        onPointerEnter={() => editor.setHovered(layer.el)}
        onClick={() => editor.select(layer.el)}
        style={{ paddingInlineStart: 6 + depth * 14 }}
        className={cn(
          'flex h-7 cursor-default items-center gap-1.5 rounded-md pe-2 text-label select-none',
          sel ? 'bg-[#0d99ff]/20 text-ink' : hov ? 'bg-ink/[0.05]' : '',
          layer.shared ? 'text-[#b79cff]' : sel ? '' : 'text-ink/85',
        )}
        title={layer.el.className && typeof layer.el.className === 'string' ? layer.el.className.split(' ').map((c) => `.${c.replace(/_[0-9a-f]{6}$/, '')}`).join(' ') : undefined}
      >
        <button
          type="button"
          tabIndex={-1}
          aria-label={isOpen ? 'Collapse' : 'Expand'}
          onClick={(e) => {
            e.stopPropagation();
            toggle();
          }}
          className={cn('grid size-4 flex-none place-items-center text-muted', !layer.children.length && 'invisible')}
        >
          <CaretRight size={10} weight="bold" className={cn('transition-transform duration-150', isOpen && 'rotate-90')} aria-hidden />
        </button>
        <Icon size={13} className={cn('flex-none', layer.shared ? 'text-[#b79cff]' : 'text-muted')} aria-hidden />
        <span className="truncate">{layer.name}</span>
      </div>
      {isOpen && layer.children.map((c, i) => <Row key={i} layer={c} depth={depth + 1} editor={editor} open={open} setOpen={setOpen} />)}
    </div>
  );
}
