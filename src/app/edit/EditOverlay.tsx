import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { describe } from './inspect';
import type { Editor } from './useEditor';

const BLUE = '#0d99ff';

type Box = { x: number; y: number; w: number; h: number; pad: [number, number, number, number]; size: [number, number] };

function measure(el: Element): Box {
  const r = el.getBoundingClientRect();
  const k = el instanceof HTMLElement && el.offsetWidth ? r.width / el.offsetWidth : 1; // the phone may be scaled
  const cs = getComputedStyle(el);
  const pad = [cs.paddingTop, cs.paddingRight, cs.paddingBottom, cs.paddingLeft].map((v) => parseFloat(v) * k) as Box['pad'];
  const size: Box['size'] = el instanceof HTMLElement ? [el.offsetWidth, el.offsetHeight] : [r.width / k, r.height / k];
  return { x: r.left, y: r.top, w: r.width, h: r.height, pad, size };
}

/**
 * Figma-style selection on the phone: hover outlines an element, click selects
 * it (the app doesn't see the press), Esc or a click on the empty canvas
 * clears, ⌥-click uses the app. Boxes are drawn in a fixed
 * layer above everything, measured every frame so scrolling and motion follow.
 */
export function EditOverlay({ root, editor }: { root: HTMLElement | null; editor: Editor }) {
  const { enabled, selected, select, hovered: hover, setHovered: setHover } = editor;
  const [boxes, setBoxes] = useState<{ hover?: Box; selected?: Box; clip?: DOMRect }>({});

  useEffect(() => {
    if (!enabled || !root) return;
    const target = (e: Event) => {
      const el = e.target as HTMLElement;
      return root.contains(el) && el !== root ? el : null;
    };
    // hold ⌥ to use the app without leaving Edit mode
    const block = (e: Event) => {
      if (!target(e) || (e as MouseEvent).altKey) return;
      e.preventDefault();
      e.stopPropagation();
    };
    const onMove = (e: PointerEvent) => setHover(target(e));
    const onClick = (e: MouseEvent) => {
      const el = target(e);
      if (!el || e.altKey) return;
      e.preventDefault();
      e.stopPropagation();
      select(el);
    };
    const onLeave = () => setHover(null);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') select(null);
    };
    const opts = { capture: true };
    root.addEventListener('pointermove', onMove, opts);
    root.addEventListener('pointerleave', onLeave, opts);
    for (const t of ['pointerdown', 'pointerup', 'mousedown', 'mouseup', 'touchstart', 'touchend', 'dblclick'] as const) root.addEventListener(t, block, opts);
    root.addEventListener('click', onClick, opts);
    window.addEventListener('keydown', onKey);
    return () => {
      root.removeEventListener('pointermove', onMove, opts);
      root.removeEventListener('pointerleave', onLeave, opts);
      for (const t of ['pointerdown', 'pointerup', 'mousedown', 'mouseup', 'touchstart', 'touchend', 'dblclick'] as const) root.removeEventListener(t, block, opts);
      root.removeEventListener('click', onClick, opts);
      window.removeEventListener('keydown', onKey);
      setHover(null);
    };
  }, [enabled, root, select, setHover]);

  // Clicking the canvas around the phone deselects, like clicking empty canvas in Figma.
  useEffect(() => {
    if (!enabled || !root) return;
    const canvas = root.closest('.pg-canvas');
    if (!canvas) return;
    const onDown = (e: PointerEvent) => {
      if (!root.contains(e.target as Node)) select(null);
    };
    canvas.addEventListener('pointerdown', onDown as EventListener);
    return () => canvas.removeEventListener('pointerdown', onDown as EventListener);
  }, [enabled, root, select]);

  useEffect(() => {
    if (!enabled) return setBoxes({});
    let raf = 0;
    const tick = () => {
      // clip to the phone's screen so boxes for scrolled-away content don't spill over the studio
      const screen = root?.querySelector('[class*="viewport_"]') ?? root;
      setBoxes({
        clip: screen?.getBoundingClientRect(),
        hover: hover && hover !== selected && hover.isConnected ? measure(hover) : undefined,
        selected: selected?.isConnected ? measure(selected) : undefined,
      });
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [enabled, hover, selected, root]);

  if (!enabled) return null;
  return createPortal(
    <div
      aria-hidden
      className="pointer-events-none fixed z-40 overflow-hidden"
      style={boxes.clip ? { left: boxes.clip.left, top: boxes.clip.top, width: boxes.clip.width, height: boxes.clip.height } : { inset: 0 }}
    >
      {boxes.hover && hover && (
        <div className="absolute" style={{ left: boxes.hover.x - (boxes.clip?.left ?? 0), top: boxes.hover.y - (boxes.clip?.top ?? 0), width: boxes.hover.w, height: boxes.hover.h, outline: `1px solid ${BLUE}` }}>
          <span className="absolute -top-5 left-0 rounded-sm px-1 font-mono text-[10px] leading-4 whitespace-nowrap text-white" style={{ background: BLUE }}>
            {describe(hover)}
          </span>
        </div>
      )}
      {boxes.selected && (
        <div className="absolute" style={{ left: boxes.selected.x - (boxes.clip?.left ?? 0), top: boxes.selected.y - (boxes.clip?.top ?? 0), width: boxes.selected.w, height: boxes.selected.h, outline: `2px solid ${BLUE}` }}>
          {/* padding, tinted like Figma's spacing overlay */}
          {(() => {
            const [t, r, b, l] = boxes.selected.pad;
            const tint = 'rgb(13 153 255 / 0.14)';
            return (
              <>
                <span className="absolute inset-x-0 top-0" style={{ height: t, background: tint }} />
                <span className="absolute inset-x-0 bottom-0" style={{ height: b, background: tint }} />
                <span className="absolute left-0" style={{ top: t, bottom: b, width: l, background: tint }} />
                <span className="absolute right-0" style={{ top: t, bottom: b, width: r, background: tint }} />
              </>
            );
          })()}
          {(['-left-1 -top-1', '-right-1 -top-1', '-left-1 -bottom-1', '-right-1 -bottom-1'] as const).map((p) => (
            <span key={p} className={`absolute size-2 border bg-white ${p}`} style={{ borderColor: BLUE }} />
          ))}
          <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 rounded-sm px-1.5 font-mono text-[10px] leading-4 whitespace-nowrap text-white" style={{ background: BLUE }}>
            {Math.round(boxes.selected.size[0])} × {Math.round(boxes.selected.size[1])}
          </span>
        </div>
      )}
    </div>,
    document.body,
  );
}
