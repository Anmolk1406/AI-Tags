/**
 * Edit mode's view of the phone's DOM: which CSS-module rule styles an element,
 * what that rule declares (tokens, not just computed px), and live edits made
 * straight on that rule so every element sharing the class updates at once.
 */
import { colors, fontSize, fontWeight, kebab, radius, spacing, type as typeScale } from '../../foundations/tokens';
import { fileForId } from './bridge';

export interface ModuleClass {
  scoped: string;
  local: string;
  file: string | null;
}

/** `card_ab12cd` → local `card`, file from the bridge's id map. Non-module classes are skipped. */
export function moduleClasses(el: Element): ModuleClass[] {
  return [...el.classList].flatMap((scoped) => {
    const m = scoped.match(/^(.+)_([0-9a-f]{6})$/);
    return m ? [{ scoped, local: m[1], file: fileForId(m[2]) }] : [];
  });
}

/** The rule whose selector is exactly `.scoped`, i.e. the class's own block in its module. */
export function findRule(scoped: string): CSSStyleRule | null {
  const sel = `.${CSS.escape(scoped)}`;
  for (const sheet of document.styleSheets) {
    let rules: CSSRuleList;
    try {
      rules = sheet.cssRules;
    } catch {
      continue;
    }
    for (const r of rules) if (r instanceof CSSStyleRule && r.selectorText === sel) return r;
  }
  return null;
}

/** Same, creating an empty rule next to the class's other rules when it has none of its own. */
export function ensureRule(scoped: string): CSSStyleRule | null {
  const found = findRule(scoped);
  if (found) return found;
  const needle = `.${CSS.escape(scoped)}`;
  for (const sheet of document.styleSheets) {
    try {
      if ([...sheet.cssRules].some((r) => r instanceof CSSStyleRule && r.selectorText.includes(needle))) {
        const i = sheet.insertRule(`${needle} {}`, sheet.cssRules.length);
        return sheet.cssRules[i] as CSSStyleRule;
      }
    } catch {
      /* cross-origin sheet */
    }
  }
  return null;
}

/* ----------------------------------------------------------------- values */

/** Splits a CSS value on top-level spaces, keeping var(...) / calc(...) whole. */
export function splitValue(v: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let cur = '';
  for (const ch of v.trim()) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (ch === ' ' && depth === 0) {
      if (cur) out.push(cur);
      cur = '';
    } else cur += ch;
  }
  if (cur) out.push(cur);
  return out;
}

/** 1–4 box values → [top, right, bottom, left]. */
export function boxSides(v: string): [string, string, string, string] {
  const p = splitValue(v);
  const [t, r = t, b = t, l = r] = p;
  return [t, r, b, l];
}

/** [t, r, b, l] → the shortest shorthand. */
export function joinBox([t, r, b, l]: string[]): string {
  if (t === r && r === b && b === l) return t;
  if (t === b && r === l) return `${t} ${r}`;
  if (r === l) return `${t} ${r} ${b}`;
  return `${t} ${r} ${b} ${l}`;
}

/** `var(--nk-space-s12)` → `space-s12`; anything else → null. */
export function tokenName(v: string): string | null {
  const m = v.trim().match(/^var\(--nk-([\w-]+)\)$/);
  return m ? m[1] : null;
}

/** "12", "12px", "s12", "var(--nk-…)", "#fff" → a CSS value, resolving bare token names against `tokens`. */
export function parseInput(raw: string, tokens: TokenOption[] = []): string {
  const s = raw.trim();
  if (/^-?\d*\.?\d+$/.test(s)) return `${s}px`;
  const tok = tokens.find((t) => t.label === s || tokenName(t.value) === s);
  return tok ? tok.value : s;
}

/** The px number of a resolved value, for display. */
export const pxNumber = (v: string) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? String(Math.round(n * 100) / 100) : v;
};

/* ----------------------------------------------------------------- tokens */

export interface TokenOption {
  label: string;
  value: string;
  hint?: string;
}

const opts = (group: Record<string, unknown>, prefix: string, hint: (v: unknown) => string) =>
  Object.entries(group).map(([k, v]) => ({ label: k, value: `var(--nk-${prefix}-${kebab(k)})`, hint: hint(v) }));

export const spaceTokens = opts(spacing, 'space', (v) => `${v}`);
export const radiusTokens = opts(radius, 'radius', (v) => `${v}`);
export const colorTokens = opts(colors, 'color', (v) => String(v));
export const fontSizeTokens = opts(fontSize, 'font-size', (v) => `${v}`);
export const fontWeightTokens = opts(fontWeight, 'font-weight', (v) => `${v}`);
export const typeTokens = Object.entries(typeScale).map(([k, v]) => ({ label: k, value: `var(--nk-type-${kebab(k)})`, hint: `${v.size}/${v.line} · ${v.weight}` }));

/* ------------------------------------------------------------------- misc */

/** Leaf elements with their own text are editable copy. */
export function ownText(el: Element): string | null {
  if (el.children.length) return null;
  const t = el.textContent?.trim();
  return t ? t : null;
}

/** Label for the element in overlays and the panel header. */
export function describe(el: Element) {
  const mc = moduleClasses(el)[0];
  return mc ? mc.local : el.tagName.toLowerCase();
}

export const isShared = (file: string | null) => !!file && !file.startsWith('src/flows/');
