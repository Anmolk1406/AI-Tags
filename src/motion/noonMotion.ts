import type { Transition } from 'motion/react';
import { haptics, type HapticKind } from './haptics';
import { REDUCED_MOTION_ATTR } from './reducedMotion';

type Bezier = [number, number, number, number];

/**
 * noon Motion & Interaction standard (the `noon-motion` skill, `.claude/skills/noon-motion/`): values measured from
 * the team's ProtoPie files ("noon X supermall", "XMP 26") and the noon prototypes built from them.
 * One spring moves everything; opacity and colour use two fade curves; radius runs on its own 200 ms clock.
 *
 * These sit next to the kit's older presets (`spring`, `easing`, `duration`, the `push` transition, `<Stagger>`),
 * which keep their values so existing flows and the 1:1 ports move exactly as before. New screens use these.
 * CSS: `src/motion/noonMotion.css` (`--nk-motion-*`). Times in seconds, like the rest of `src/motion`.
 */

/** ProtoPie Spring(Tension, Friction) → physical spring (mass 1), fitted from 200 recorded tracks: k ≈ 0.935·T, c ≈ 0.969·F. Exact for 300 / 28. */
export const protoPieSpring = (tension: number, friction: number) =>
  ({ type: 'spring' as const, stiffness: +(tension * 0.93533).toFixed(2), damping: +(friction * 0.96929).toFixed(2), mass: 1 });

const springOf = (stiffness: number, damping: number) => ({ type: 'spring', stiffness, damping, mass: 1 }) as const;

/** Spring library: pick by job. Task UI keeps ζ ≥ 0.8; only rewards use ζ 0.45–0.55. */
export const noonSpring = {
  /** every movement (position, size, scale): ProtoPie 300 / 28 · ζ 0.81 · 1.3 % overshoot · ≈544 ms */
  noon: springOf(280.6, 27.14),
  /** corner radius on page drops, near-no-bounce UI: ProtoPie 300 / 30 · ζ 0.87 · 0.4 % */
  soft: springOf(280.6, 29.08),
  /** coming back from a held offset (top-sheet auto-return): critically damped ω 15.5 */
  return: springOf(240.25, 31),
  /** long morphs carrying text (> 200 px) where 1.3 % would show · ζ 0.92 */
  detail: springOf(400, 36.8),
  /** soft closes, gallery → tile · ζ 0.96 */
  glide: springOf(324, 34.56),
  /** short quick returns (indicator, single → grid) · ζ 1 */
  snap: springOf(576, 48),
  /** scroll-collapse header driver · ζ 0.86 */
  header: springOf(341.5, 31.79),
  /** carousels / rails, slight elastic · ζ 0.74 · 3.2 % */
  pager: springOf(341.5, 27.35),
  /** panel ⇄ bar morphs, no visible bounce · ζ 0.94 */
  morph: springOf(203.9, 26.85),
  /** cards rising into a panel · ζ 0.92 */
  card: springOf(157.9, 23.12),
  /** selection pill / segmented handle travel · ζ 0.78 · 2 % */
  tabPill: springOf(503.6, 35.01),
  /** sizes next to a lively mover (widths must not bounce) · ζ 0.90 */
  firmTwin: springOf(503.6, 40.4),
  /** ruler / slider snapping to a slot · ζ 0.92 */
  sliderSnap: springOf(144, 22.1),
  /** a sheet rising with a character riding it · ζ 0.72 */
  sheetMascot: springOf(171.3, 18.85),
  /** rewards only: in-place elastic pop (coin, check, badge) · ζ 0.52 · 15 % */
  pop: springOf(223.8, 15.56),
  /** rewards only: heart fill, like · ζ 0.45 · 20 % */
  reward: springOf(400, 18),
} satisfies Record<string, Transition>;

/** Named curves for when a spring is wrong. */
export const noonEase = {
  /** opacity in: ProtoPie Ease Out · Cubic */
  fadeIn: [0.33, 1, 0.68, 1] as Bezier,
  /** opacity out, colour swaps: ProtoPie Ease In Out · Cubic as rendered (the pie stores 0.4, 0, 0.2, 1; ignore it) */
  fadeOut: [0.65, 0, 0.35, 1] as Bezier,
  /** corner radius, on its own clock */
  radius: [0.65, 0, 0.35, 1] as Bezier,
  /** card → full page scale, 400 ms */
  expand: [0.4, 0.01, 0, 1.01] as Bezier,
  /** content reveal after a push, FLIP glides, one-curve multi-layer settles (420–820 ms) */
  soft: [0.22, 1, 0.36, 1] as Bezier,
  /** keyboard lift (450 ms), sheet close (280 ms) */
  ios: [0.32, 0.72, 0, 1] as Bezier,
  /** "clear the stage" beat before a reveal, 220 ms */
  exitSoft: [0.4, 0, 0.7, 0.4] as Bezier,
  /** toast pill shooting off the top, 440 ms */
  toastExit: [0.4, 0, 0.7, 0.2] as Bezier,
  /** error shake, 340 ms */
  shake: [0.36, 0.07, 0.19, 0.97] as Bezier,
  /** slight-overshoot tab underline, 280 ms */
  tabUnderline: [0.3, 1.25, 0.5, 1] as Bezier,
};

/** Durations (s). */
export const noonDuration = {
  /** pre-state set */
  instant: 0.01,
  /** press colour, key release, tick */
  micro: 0.1,
  /** standard fade */
  fade: 0.2,
  /** a revealed block */
  reveal: 0.3,
  /** grounds, scrims, overlays */
  ground: 0.4,
  /** radius clock */
  radius: 0.2,
  /** card → page */
  expand: 0.4,
  /** the noon spring run to rest (visually done ≈ 0.37) */
  move: 0.544,
  /** fast exit before the next page */
  exit: 0.14,
  /** error shake */
  shake: 0.34,
  /** shimmer band pass */
  shimmer: 1.867,
};

/** Rhythm (s): stagger in top → bottom, out bottom → top and faster; follow-up beats after a lead layer. */
export const noonStagger = { in: 0.06, out: 0.04, micro: 0.02, reflow: 0.01 };
export const noonFollow = { heading: 0.04, secondary: 0.08, dependent: 0.1 };

/** Travel (px) while fading in: small travel + fade = "arrive", never a long slide. */
export const noonTravel = { row: 20, card: 16, heading: 10, chip: 20, replace: 5 };

/** Press scales on touch-down; release on `noonSpring.noon`. */
export const noonPress = { default: 0.96, wide: 0.98, icon: 0.92 };

/** Push: the page underneath drifts 200 / 382 of the width, with no dim (registered as the `slide-left` transition). */
export const noonPush = { underX: '-52.36%' };
/** Modal sheet dismiss: past this drag (px) or release velocity (px/s). Midpoints of the measured 100–120 px / 600–700 px/s. */
export const noonSheet = { dismissDistance: 110, dismissVelocity: 650 };

/** Ready-made motion/react transitions, split by property class (moves on the spring, fades on curves). */
export const noonTransition = {
  move: noonSpring.noon,
  fadeIn: { duration: noonDuration.fade, ease: noonEase.fadeIn },
  fadeOut: { duration: noonDuration.fade, ease: noonEase.fadeOut },
  reveal: { duration: noonDuration.reveal, ease: noonEase.fadeIn },
  ground: { duration: noonDuration.ground, ease: noonEase.fadeIn },
  radius: { duration: noonDuration.radius, ease: noonEase.radius },
  expand: { duration: noonDuration.expand, ease: noonEase.expand },
} satisfies Record<string, Transition>;

// ── DOM helpers (WAAPI): for imperative motion outside motion/react, interruptible by construction ──────────

type SpringShape = { w: number; z: number };
type Spring = { stiffness: number; damping: number; mass?: number };
const shape = ({ stiffness, damping, mass = 1 }: Spring): SpringShape => {
  const w = Math.sqrt(stiffness / mass);
  return { w, z: damping / (2 * Math.sqrt(stiffness * mass)) };
};

/** Offset from target at time t (s), starting at x0 with velocity v0 (ζ ≥ 1 handled). */
export function springAt(t: number, spring: Spring = noonSpring.noon, x0 = 1, v0 = 0) {
  const { w, z } = shape(spring);
  if (z < 1) {
    const wd = w * Math.sqrt(1 - z * z);
    return Math.exp(-z * w * t) * (x0 * Math.cos(wd * t) + ((v0 + z * w * x0) / wd) * Math.sin(wd * t));
  }
  return Math.exp(-w * t) * (x0 + (v0 + w * x0) * t);
}

/** Seconds until a spring is visually done for a travel of d px (< 0.02 px left). */
export function settleTime(d: number, spring: Spring = noonSpring.noon) {
  const { w, z } = shape(spring);
  return Math.max(0.2, Math.log(Math.max(Math.abs(d), 0.02) / 0.02) / (Math.min(z, 1) * w) + 0.05);
}

/** A spring from rest as a CSS `linear()` easing (use with `duration` ms; the noon spring is 544 ms, 34 stops). */
export function springLinear(spring: Spring = noonSpring.noon, ms = 544, stops = 34) {
  const v: number[] = [];
  for (let i = 0; i <= stops; i++) v.push(i === stops ? 1 : +(1 - springAt(((i / stops) * ms) / 1000, spring)).toFixed(4));
  return `linear(${v.join(', ')})`;
}

const reducedFor = (el: Element) =>
  !!el.closest(`[${REDUCED_MOTION_ATTR}="reduce"]`) || matchMedia('(prefers-reduced-motion: reduce)').matches;
const cssBezier = (b: Bezier) => `cubic-bezier(${b.join(', ')})`;
type Pose = { x?: number; y?: number; s?: number };

/** Cancel an element's animations and pin where it is now (opacity + translate + scale), so the next one starts there. */
export function stopMotion(el: HTMLElement) {
  const cs = getComputedStyle(el);
  const m = new DOMMatrix(cs.transform === 'none' ? undefined : cs.transform);
  const now = { opacity: +cs.opacity, x: m.m41, y: m.m42, s: m.a };
  el.getAnimations().forEach((a) => a.cancel());
  el.style.opacity = String(now.opacity);
  el.style.transform = `translate(${now.x}px, ${now.y}px) scale(${now.s})`;
  return now;
}

/** Move on a spring with sampled WAAPI keyframes; v0 = release velocity (px/s on the main axis). Reduced motion: jumps. */
export function springMove(el: HTMLElement, from: Pose, to: Pose, { spring = noonSpring.noon, delay = 0, v0 = 0 }: { spring?: Spring; delay?: number; v0?: number } = {}) {
  const d = Math.hypot((to.x ?? 0) - (from.x ?? 0), (to.y ?? 0) - (from.y ?? 0)) || 20;
  const dur = reducedFor(el) ? 0.001 : settleTime(d, spring);
  const n = Math.max(12, Math.round(dur * 60));
  const lerp = (a = 0, b = 0, k: number) => b + (a - b) * k;
  const frames: Keyframe[] = [];
  for (let i = 0; i <= n; i++) {
    const k = i === n ? 0 : springAt((i / n) * dur, spring, 1, -v0 / d);
    frames.push({ transform: `translate(${lerp(from.x, to.x, k)}px, ${lerp(from.y, to.y, k)}px) scale(${lerp(from.s ?? 1, to.s ?? 1, k)})` });
  }
  const a = el.animate(frames, { duration: dur * 1000, delay, fill: 'both', easing: 'linear' });
  a.finished.then(() => { el.style.transform = String(frames[n].transform); a.cancel(); }, () => {});
  return a;
}

/** Fade from the current opacity: 'in' on ease-out cubic, 'out' on ease-in-out cubic. Reduced motion keeps fades ≤ 200 ms. */
export function fadeTo(el: HTMLElement, to: number, { dir = to > 0 ? 'in' : 'out', ms = noonDuration.fade * 1000, delay = 0 }: { dir?: 'in' | 'out'; ms?: number; delay?: number } = {}) {
  const reduce = reducedFor(el);
  const a = el.animate([{ opacity: +getComputedStyle(el).opacity }, { opacity: to }], {
    duration: reduce ? Math.min(ms, 200) : ms,
    delay: reduce ? 0 : delay,
    fill: 'both',
    easing: cssBezier(dir === 'in' ? noonEase.fadeIn : noonEase.fadeOut),
  });
  a.finished.then(() => { el.style.opacity = String(to); a.cancel(); }, () => {});
  return a;
}

/** Stagger a list in: top → bottom, 60 ms apart, falling in from −20 px. */
export function staggerIn(els: HTMLElement[], { y = -noonTravel.row, step = noonStagger.in * 1000, start = 0 } = {}) {
  return els.map((el, i) => {
    const delay = reducedFor(el) ? 0 : start + i * step;
    fadeTo(el, 1, { delay });
    return springMove(el, { y }, { y: 0 }, { delay });
  });
}

/** Stagger a list out: bottom → top, 40 ms apart (exits are faster than entrances). */
export function staggerOut(els: HTMLElement[], { y = -noonTravel.row, step = noonStagger.out * 1000 } = {}) {
  return [...els].reverse().map((el, i) => {
    const delay = reducedFor(el) ? 0 : i * step;
    fadeTo(el, 0, { delay });
    return springMove(el, { y: 0 }, { y }, { delay });
  });
}

// ── Haptics engine: native bridge → Android vibrate → iOS Safari switch tick ─────────────────────────────────

const NATIVE: Record<HapticKind, { type: string; intensity?: number }> = {
  tap: { type: 'light' }, tick: { type: 'selection' }, snap: { type: 'medium', intensity: 0.8 }, edge: { type: 'rigid', intensity: 0.6 },
  soft: { type: 'soft', intensity: 0.5 }, land: { type: 'soft', intensity: 0.4 }, pop: { type: 'medium', intensity: 0.7 },
  success: { type: 'success' }, error: { type: 'error' },
};
const RANK: Record<HapticKind, number> = { tick: 0, tap: 1, soft: 1, land: 1, edge: 2, snap: 2, pop: 3, success: 4, error: 4 };
const IOS_TICKS: Partial<Record<HapticKind, number[]>> = { success: [0, 90], error: [0, 80, 160], pop: [0, 45], snap: [0, 45] };
type HapticWindow = Window & { webkit?: { messageHandlers?: { haptic?: { postMessage: (m: unknown) => void } } } };
let lastAt = 0;
let lastRank = -1;
let pending: HapticKind | null = null;
let fingersDown = 0;
let listening = false;

const isIOS = () => /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const bridge = () => (window as HapticWindow).webkit?.messageHandlers?.haptic;

function iosTick() {
  if (document.activeElement && /^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName)) return;
  const label = document.createElement('label');
  label.style.display = 'none';
  label.innerHTML = '<input type="checkbox" switch>';
  document.body.appendChild(label);
  label.click();
  label.remove();
}

function play(kind: HapticKind) {
  const native = bridge();
  const activation = (navigator as Navigator & { userActivation?: { hasBeenActive: boolean } }).userActivation;
  if (native) native.postMessage(NATIVE[kind]);
  else if (navigator.vibrate && activation?.hasBeenActive) navigator.vibrate([...haptics[kind].vibrate]);
  else if (isIOS()) (IOS_TICKS[kind] ?? [0]).forEach((ms) => (ms ? setTimeout(iosTick, ms) : iosTick()));
}

function listen() {
  if (listening) return;
  listening = true;
  addEventListener('touchstart', (e) => { fingersDown = e.touches.length; }, { capture: true, passive: true });
  addEventListener('touchend', (e) => {
    fingersDown = e.touches.length;
    if (!fingersDown && pending && e.isTrusted) { const k = pending; pending = null; play(k); }
  }, { capture: true, passive: true });
}

/**
 * The noon haptics engine (opt-in; the kit's `haptic()` stays vibrate-only). One haptic per beat: a 40 ms window keeps
 * the stronger kind; on iOS Safari a gesture's haptic waits for the finger to lift. Same kinds as `haptics`.
 */
export function nativeHaptic(kind: HapticKind) {
  try {
    listen();
    const now = performance.now();
    const r = RANK[kind];
    if (now - lastAt < 40) {
      if (r <= lastRank) return;
      setTimeout(() => nativeHaptic(kind), 41 - (now - lastAt));
      return;
    }
    lastAt = now;
    lastRank = r;
    if (isIOS() && !bridge() && fingersDown > 0) {
      if (!pending || r > RANK[pending]) pending = kind;
      return;
    }
    play(kind);
  } catch {
    // unsupported — haptics are an enhancement only
  }
}
