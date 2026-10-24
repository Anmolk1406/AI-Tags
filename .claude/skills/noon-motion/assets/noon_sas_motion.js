// noon motion helpers — drop-in, no dependencies. See the noon_sas_motion skill for the values' sources.
// MOVE = ProtoPie Spring(300, 28) = stiffness 280.6, damping 27.14, mass 1 (ω 16.75, ζ 0.81).

export const SPRING = {
  noon:   { w: 16.751, z: 0.81 },   // every movement
  soft:   { w: 16.751, z: 0.868 },  // ProtoPie Spring(300, 30)
  ret:    { w: 15.5,   z: 1 },      // return from a held offset
  detail: { w: 20,     z: 0.92 },   // long morphs carrying text
  glide:  { w: 18,     z: 0.96 },
  snap:   { w: 24,     z: 1 },
  pager:  { w: 18.48,  z: 0.74 },   // rails, "slight elastic"
  morph:  { w: 14.28,  z: 0.94 },
  card:   { w: 12.57,  z: 0.92 },
  pop:    { w: 14.96,  z: 0.52 },   // rewards only
};
export const EASE = {
  fadeIn: 'cubic-bezier(0.33, 1, 0.68, 1)',
  fadeOut: 'cubic-bezier(0.65, 0, 0.35, 1)',
  radius: 'cubic-bezier(0.65, 0, 0.35, 1)',
  expand: 'cubic-bezier(0.4, 0.01, 0, 1.01)',
  soft: 'cubic-bezier(0.22, 1, 0.36, 1)',
  ios: 'cubic-bezier(0.32, 0.72, 0, 1)',
};
export const T = { fade: 200, reveal: 300, ground: 400, radius: 200, staggerIn: 60, staggerOut: 40, micro: 20, follow: 100 };

export const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches ||
  document.documentElement.dataset.nkMotion === 'reduce';

// Offset from target at time t (s), starting at x0 with velocity v0. ζ = 1 handled.
export function springAt(t, { w, z }, x0 = 1, v0 = 0) {
  if (z < 1) {
    const wd = w * Math.sqrt(1 - z * z);
    return Math.exp(-z * w * t) * (x0 * Math.cos(wd * t) + ((v0 + z * w * x0) / wd) * Math.sin(wd * t));
  }
  return Math.exp(-w * t) * (x0 + (v0 + w * x0) * t);
}

// Seconds until the motion is visually done for a travel of d px.
export const settleTime = (d, s = SPRING.noon) =>
  Math.max(0.2, Math.log(Math.max(Math.abs(d), 0.02) / 0.02) / (Math.min(s.z, 1) * s.w) + 0.05);

// CSS linear() for a spring from rest.
export function springLinear(s = SPRING.noon, ms = 544, stops = 34) {
  const v = [];
  for (let i = 0; i <= stops; i++) v.push(i === stops ? 1 : +(1 - springAt((i / stops) * ms / 1000, s)).toFixed(4));
  return `linear(${v.join(', ')})`;
}

// Read where an element currently is (opacity + translate), cancel its animations, and pin that inline,
// so the next animation starts from here (interruptible by construction).
export function stop(el) {
  const cs = getComputedStyle(el);
  const m = new DOMMatrix(cs.transform === 'none' ? undefined : cs.transform);
  const now = { opacity: +cs.opacity, x: m.m41, y: m.m42, s: m.a };
  el.getAnimations().forEach(a => a.cancel());
  el.style.opacity = now.opacity;
  el.style.transform = `translate(${now.x}px, ${now.y}px) scale(${now.s})`;
  return now;
}

// Move an element on a spring with WAAPI keyframes. from/to: {x, y, s}. Carries velocity v0 (px/s on the main axis).
export function move(el, from, to, { spring = SPRING.noon, delay = 0, v0 = 0 } = {}) {
  const d = Math.hypot((to.x ?? 0) - (from.x ?? 0), (to.y ?? 0) - (from.y ?? 0)) || 20;
  const dur = reduced() ? 0.001 : settleTime(d, spring);
  const n = Math.max(12, Math.round(dur * 60));
  const lerp = (a = 0, b = 0, k) => b + (a - b) * k;
  const frames = [];
  for (let i = 0; i <= n; i++) {
    const k = i === n ? 0 : springAt((i / n) * dur, spring, 1, -v0 / d);
    const s = lerp(from.s ?? 1, to.s ?? 1, k);
    frames.push({ transform: `translate(${lerp(from.x, to.x, k)}px, ${lerp(from.y, to.y, k)}px) scale(${s})` });
  }
  const a = el.animate(frames, { duration: dur * 1000, delay, fill: 'both', easing: 'linear' });
  a.finished.then(() => { el.style.transform = frames[n].transform; a.cancel(); }, () => {});
  return a;
}

// Fade from the current opacity. dir 'in' uses ease-out cubic, 'out' uses ease-in-out cubic.
export function fade(el, to, { dir = to > 0 ? 'in' : 'out', ms = T.fade, delay = 0 } = {}) {
  const from = +getComputedStyle(el).opacity;
  const a = el.animate([{ opacity: from }, { opacity: to }],
    { duration: reduced() ? Math.min(ms, 200) : ms, delay: reduced() ? 0 : delay, fill: 'both',
      easing: dir === 'in' ? EASE.fadeIn : EASE.fadeOut });
  a.finished.then(() => { el.style.opacity = to; a.cancel(); }, () => {});
  return a;
}

// Stagger a list in (top -> bottom, 60 ms, falls from -20 px) or out (bottom -> top, 40 ms).
export function staggerIn(els, { y = -20, step = T.staggerIn, start = 0 } = {}) {
  return els.map((el, i) => {
    const d = reduced() ? 0 : start + i * step;
    fade(el, 1, { delay: d });
    return move(el, { y }, { y: 0 }, { delay: d });
  });
}
export function staggerOut(els, { y = -20, step = T.staggerOut } = {}) {
  return [...els].reverse().map((el, i) => {
    const d = reduced() ? 0 : i * step;
    fade(el, 0, { delay: d });
    return move(el, { y: 0 }, { y }, { delay: d });
  });
}

// ---------- haptics: native bridge -> Android vibrate -> iOS Safari switch tick ----------
const NATIVE = { tap: { type: 'light' }, tick: { type: 'selection' }, snap: { type: 'medium', intensity: 0.8 },
  edge: { type: 'rigid', intensity: 0.6 }, soft: { type: 'soft', intensity: 0.5 }, land: { type: 'soft', intensity: 0.4 },
  pop: { type: 'medium', intensity: 0.7 }, medium: { type: 'medium' }, success: { type: 'success' }, error: { type: 'error' } };
const VIBE = { tap: 12, tick: 8, snap: 20, edge: 15, soft: 10, land: 10, pop: 18, medium: 18, success: [14, 50, 22], error: [45, 40, 45, 40, 45] };
const RANK = { tick: 0, tap: 1, soft: 1, land: 1, edge: 2, snap: 2, medium: 2, pop: 3, success: 4, error: 4 };
const IOS_TICKS = { success: [0, 90], error: [0, 80, 160], pop: [0, 45], snap: [0, 45], medium: [0, 45] };
const isIOS = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
let lastAt = 0, lastRank = -1, pending = null, fingersDown = 0;

function iosTick() {
  if (document.activeElement && /^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName)) return;
  const label = document.createElement('label');
  label.style.display = 'none';
  label.innerHTML = '<input type="checkbox" switch>';
  document.body.appendChild(label);
  label.click();
  label.remove();
}
function play(kind) {
  const bridge = window.webkit?.messageHandlers?.haptic;
  if (bridge) return bridge.postMessage(NATIVE[kind] || NATIVE.tap);
  if (navigator.vibrate && navigator.userActivation?.hasBeenActive) return navigator.vibrate(VIBE[kind] ?? 12);
  if (isIOS) (IOS_TICKS[kind] || [0]).forEach(ms => (ms ? setTimeout(iosTick, ms) : iosTick()));
}
// haptic(kind): one per beat; 40 ms merge window; on iOS Safari a gesture's haptic waits for the finger to lift.
export function haptic(kind) {
  const now = performance.now(), r = RANK[kind] ?? 1;
  if (now - lastAt < 40) {
    if (r <= lastRank) return;
    setTimeout(() => haptic(kind), 41 - (now - lastAt));
    return;
  }
  lastAt = now; lastRank = r;
  if (isIOS && !window.webkit?.messageHandlers?.haptic && fingersDown > 0) {
    if (!pending || r > (RANK[pending] ?? 0)) pending = kind;
    return;
  }
  play(kind);
}
addEventListener('touchstart', e => { fingersDown = e.touches.length; }, { capture: true, passive: true });
addEventListener('touchend', e => {
  fingersDown = e.touches.length;
  if (!fingersDown && pending && e.isTrusted) { const k = pending; pending = null; play(k); }
}, { capture: true, passive: true });
