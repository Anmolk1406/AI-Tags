import { useCallback, useEffect, useState } from 'react';
import { applyChanges, bridgeStatus, loadClassMap, type BridgeStatus, type StudioChange } from './bridge';
import { ensureRule, findRule, moduleClasses, type ModuleClass } from './inspect';

export type Pending =
  | { kind: 'css'; key: string; file: string | null; scoped: string; local: string; prop: string; from: string; to: string }
  | { kind: 'text'; key: string; scope: string; from: string; to: string; el: HTMLElement }
  | { kind: 'asset'; key: string; target: string; name: string; data: string; scope: string; el: HTMLImageElement; original: string };

export type ApplyResult = { label: string; ok: boolean; message: string };

/** A pending edit as stored in a draft (no DOM references). */
export type SavedChange =
  | { kind: 'css'; file: string | null; scoped: string; local: string; prop: string; to: string }
  | { kind: 'text'; from: string; to: string }
  | { kind: 'asset'; target: string; name: string; data: string };

/**
 * State behind Edit mode. Edits are live straight away (on the CSS rule, so
 * every element sharing the class follows), collected as pending changes, and
 * then either written to the repo through the local bridge or copied as a
 * prompt for Claude / VS Code.
 */
export function useEditor(flowId: string | undefined, route: string) {
  const [enabled, setEnabled] = useState(false);
  const [selected, setSelected] = useState<HTMLElement | null>(null);
  const [hovered, setHovered] = useState<HTMLElement | null>(null);
  const [classIndex, setClassIndex] = useState(0);
  const [pending, setPending] = useState<Pending[]>([]);
  const [deferred, setDeferred] = useState<SavedChange[]>([]);
  const [bridge, setBridge] = useState<BridgeStatus | null | undefined>(undefined);
  const [version, setVersion] = useState(0);
  const bump = useCallback(() => setVersion((v) => v + 1), []);
  const scope = `src/flows/${flowId ?? ''}`;

  /** Re-asks the local bridge whether Claude Code is installed and logged in. */
  const refreshBridge = useCallback(async () => {
    setBridge(undefined);
    setBridge(await bridgeStatus());
  }, []);

  useEffect(() => {
    if (!enabled) return;
    refreshBridge();
    loadClassMap().then(bump);
  }, [enabled, bump, refreshBridge]);

  const select = useCallback((el: HTMLElement | null) => {
    setSelected(el);
    setClassIndex(0);
  }, []);

  // A selection made before the class map arrived (or after HMR) needs a re-read.
  useEffect(() => {
    if (selected && !selected.isConnected) setSelected(null);
  }, [selected, version]);

  const setCss = useCallback(
    (mc: ModuleClass, prop: string, value: string) => {
      const rule = ensureRule(mc.scoped);
      if (!rule) return;
      const key = `css:${mc.scoped}:${prop}`;
      setPending((list) => {
        const prev = list.find((x) => x.key === key);
        const from = prev?.kind === 'css' ? prev.from : rule.style.getPropertyValue(prop);
        const rest = list.filter((x) => x.key !== key);
        return from === value ? rest : [...rest, { kind: 'css', key, file: mc.file, scoped: mc.scoped, local: mc.local, prop, from, to: value }];
      });
      rule.style.setProperty(prop, value);
      bump();
    },
    [bump],
  );

  const setText = useCallback(
    (el: HTMLElement, to: string) => {
      const key = `text:${el.dataset.nkTextKey ?? (el.dataset.nkTextKey = Math.random().toString(36).slice(2))}`;
      setPending((list) => {
        const prev = list.find((x) => x.key === key);
        const from = prev?.kind === 'text' ? prev.from : (el.textContent ?? '');
        const rest = list.filter((x) => x.key !== key);
        return from === to ? rest : [...rest, { kind: 'text', key, scope, from, to, el }];
      });
      el.textContent = to;
      bump();
    },
    [scope, bump],
  );

  const putAsset = useCallback(
    (img: HTMLImageElement, name: string, data: string) => {
        const url = new URL(img.currentSrc || img.src, location.href);
        const target = url.origin === location.origin ? url.pathname : url.href;
        const key = `asset:${target}`;
        setPending((list) => {
          const prev = list.find((x) => x.key === key);
          const original = prev?.kind === 'asset' ? prev.original : img.src;
          return [...list.filter((x) => x.key !== key), { kind: 'asset', key, target, name, data, scope, el: img, original }];
        });
        img.src = data;
        img.srcset = '';
        bump();
    },
    [scope, bump],
  );
  const setAsset = useCallback(
    (img: HTMLImageElement, file: File) => {
      const reader = new FileReader();
      reader.onload = () => putAsset(img, file.name, String(reader.result));
      reader.readAsDataURL(file);
    },
    [putAsset],
  );

  /** Pending edits without DOM references, for saving in a draft. Text/images not yet re-found on screen ride along. */
  const serialize = useCallback(
    (): SavedChange[] => [
      ...pending.map((p): SavedChange =>
        p.kind === 'css'
          ? { kind: 'css', file: p.file, scoped: p.scoped, local: p.local, prop: p.prop, to: p.to }
          : p.kind === 'text'
            ? { kind: 'text', from: p.from, to: p.to }
            : { kind: 'asset', target: p.target, name: p.name, data: p.data },
      ),
      ...deferred,
    ],
    [pending, deferred],
  );

  /**
   * Re-applies a draft's edits live. CSS goes straight onto its rule; text and
   * images are matched on the current screen, and anything not visible yet is
   * kept (deferred) and retried when the screen changes.
   */
  const restore = useCallback(
    (changes: SavedChange[], screen: Element | null) => {
      const left: SavedChange[] = [];
      for (const c of changes) {
        if (c.kind === 'css') setCss({ scoped: c.scoped, local: c.local, file: c.file }, c.prop, c.to);
        else if (c.kind === 'text') {
          const el = screen && [...screen.querySelectorAll<HTMLElement>('*')].find((e) => !e.children.length && e.textContent?.trim() === c.from.trim());
          if (el) setText(el, c.to);
          else left.push(c);
        } else {
          const img = screen && [...screen.querySelectorAll('img')].find((i) => new URL(i.currentSrc || i.src, location.href).pathname === c.target || i.src === c.target);
          if (img) putAsset(img, c.name, c.data);
          else left.push(c);
        }
      }
      setDeferred(left);
    },
    [setCss, setText, putAsset],
  );
  const reset = useCallback(() => {
    setPending([]);
    setDeferred([]);
  }, []);

  /** Puts every live edit back the way the source has it. */
  const discard = useCallback(() => {
    for (const p of [...pending].reverse()) {
      if (p.kind === 'css') {
        const rule = findRule(p.scoped);
        if (rule) p.from ? rule.style.setProperty(p.prop, p.from) : rule.style.removeProperty(p.prop);
      } else if (p.kind === 'text') p.el.textContent = p.from;
      else p.el.src = p.original;
    }
    setPending([]);
    setDeferred([]);
    bump();
  }, [pending, bump]);

  /** Writes pending edits into the repo; Vite's hot reload then serves them from source. */
  const apply = useCallback(async (): Promise<ApplyResult[]> => {
    const sendable = pending.filter((p) => p.kind !== 'css' || p.file);
    const changes: StudioChange[] = sendable.map((p) =>
      p.kind === 'css'
        ? { kind: 'css', file: p.file!, selector: `.${p.local}`, prop: p.prop, value: p.to }
        : p.kind === 'text'
          ? { kind: 'text', scope: p.scope, from: p.from, to: p.to }
          : { kind: 'asset', target: p.target, name: p.name, data: p.data, scope: p.scope },
    );
    const results = await applyChanges(changes);
    const done = new Set(sendable.filter((_, i) => results[i]?.ok).map((p) => p.key));
    setPending((list) => list.filter((p) => !done.has(p.key)));
    setTimeout(bump, 400); // after HMR swaps the stylesheet
    return sendable.map((p, i) => ({ label: label(p), ...results[i] }));
  }, [pending, bump]);

  /** A ready brief for Claude Code / VS Code: the pending edits, plus an optional request about the selection. */
  const prompt = useCallback(
    (request?: string, opts: { selection?: boolean; pending?: boolean; brief?: boolean } = {}) => {
      const { selection = true, pending: withPending = true, brief = false } = opts;
      // a follow-up in an ongoing chat already has the repo context
      const lines = brief
        ? []
        : ['In the noon Flow Kit repo (follow CLAUDE.md: tokens first, CSS modules per flow), make these UI changes.', `Flow: ${flowId} (${scope}), screen route: ${route}.`, ''];
      if (selected && selection) {
        const mc = moduleClasses(selected)[classIndex];
        lines.push('Selected element:', `  <${selected.tagName.toLowerCase()}>${mc ? ` styled by ${mc.file ?? 'an unknown module'} → .${mc.local}` : ' (no module class)'}`);
        const rule = mc && findRule(mc.scoped);
        if (rule) lines.push(`  current rule: ${rule.cssText.replaceAll(mc.scoped, mc.local)}`);
        const inline = selected.getAttribute('style');
        if (inline) lines.push(`  inline style in the component: ${inline}`);
        const text = selected.children.length ? null : selected.textContent?.trim();
        if (text) lines.push(`  text: "${text}"`);
        lines.push('');
      }
      if (pending.length && withPending) {
        lines.push('Edits made visually in the studio (apply exactly):');
        pending.forEach((p, i) => lines.push(`  ${i + 1}. ${describeChange(p)}`));
        lines.push('');
      }
      if (request?.trim()) lines.push(`Request: ${request.trim()}`, '');
      if (!brief) lines.push("Use the noon tokens (var(--nk-*)) shown; don't hardcode a hex or px that exists as a token. Then run: npx tsc -p tsconfig.json");
      return lines.join('\n');
    },
    [flowId, scope, route, selected, classIndex, pending],
  );

  return { enabled, setEnabled, selected, select, hovered, setHovered, classIndex, setClassIndex, pending, setCss, setText, setAsset, discard, apply, prompt, bridge, refreshBridge, version, bump, serialize, restore, reset, deferred };
}

export type Editor = ReturnType<typeof useEditor>;

function label(p: Pending) {
  return p.kind === 'css' ? `.${p.local} ${p.prop}` : p.kind === 'text' ? `Text “${p.to}”` : `Image ${p.name}`;
}

export function describeChange(p: Pending) {
  if (p.kind === 'css') return `${p.file ?? '(unknown file)'} → .${p.local} { ${p.prop}: ${p.from || '(not set)'} → ${p.to} }`;
  if (p.kind === 'text') return `Text in ${p.scope}: “${p.from}” → “${p.to}”`;
  return `Replace image ${p.target} with “${p.name}” (picked in the studio)`;
}
