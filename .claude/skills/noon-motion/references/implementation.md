# Implementation

## 1. Pick the engine by what drives the motion
| Driver | Use | Why |
|---|---|---|
| fixed transition, nothing can interrupt it mid-way | CSS transition / WAAPI with the spring as `linear()` (`--nm-move`) | runs on the compositor |
| fixed transition that may be interrupted or retargeted | WAAPI keyframes sampled from the analytic spring, starting from the **current** value | interruptible, still compositor |
| finger-driven, must carry velocity | rAF-integrated spring (sub-steps 1/240 s, dt cap), writing `transform` | velocity in, retargetable |
| React flow kit | motion/react `transition={TEST01_SPRING}` / `tween('fast','out')` from presets | one token source |
| SwiftUI | `.interpolatingSpring(mass:1, stiffness:280.6, damping:27.14)`; `.timingCurve(0.33,1,0.68,1, duration:0.2)` | |
| RN Reanimated | `withSpring(to, {stiffness:280.6, damping:27.14, mass:1})`, `withTiming(v, {duration:200, easing: Easing.out(Easing.cubic)})` | |

### Central re-timing (NANO pattern)
One wrapper can enforce the standard for a whole prototype: patch `Element.prototype.animate` so any call whose
keyframes touch a move property (transform, translate, scale, width, height, top/left, clip-path, border-radius…)
runs 540 ms on the spring `linear()`, and fade-only calls (opacity, filter, colour) run 200 ms ease-out; keep
delays; strip per-keyframe easing; allow `pp:false` to opt out (hero moments, loops, per-frame keyframe tracks).
Document both the declared and the effective values when you do this.

## 2. Spring as keyframes (interruptible)
```js
// analytic damped spring from x0 (offset from target) with initial velocity v0 (units/s)
function springAt(t, w, z, x0, v0) {
  if (z < 1) { const wd = w * Math.sqrt(1 - z*z);
    return Math.exp(-z*w*t) * (x0*Math.cos(wd*t) + ((v0 + z*w*x0)/wd) * Math.sin(wd*t)); }
  return Math.exp(-w*t) * (x0 + (v0 + w*x0) * t);               // critically damped (ζ = 1)
}
// settle length for a travel d (px): ≈ 0.52 s @12 px, 0.56 s @20 px, 0.67 s @94 px
const settleTime = (d, w = 16.75, z = 0.81) => Math.max(0.2, Math.log(Math.max(Math.abs(d), 0.02) / 0.02) / (z*w) + 0.05);
```
Bake `N = max(12, round(dur·60))` keyframes (120/s for ProMotion), **pin the last frame to the exact target**,
`fill: 'both'`, then on `finished` write the end style and `cancel()` (no fill-forward stacking). To interrupt:
read the computed value (opacity, `DOMMatrix(getComputedStyle(el).transform).m42`), cancel, write it back inline,
start the next animation from it (`stop()` / `commit()` in `assets/noon_sas_motion.js`).

`linear()` from a spring: sample `1 − springAt(t, w, z, 1, 0)` at 34–48 evenly spaced stops (≤ 0.7 % interpolation
error), last stop 1. `scripts/spring.py` prints it.

## 3. Gesture springs (rAF)
- Semi-implicit Euler with sub-steps: `v += (−k·(x−target) − c·v)·h; x += v·h`, h = 1/240 s (4 ms for ω ≥ 40).
- Wall-clock dt, capped (0.05 s normal, 0.5 s if you must survive the preview pane's ~2 fps rAF).
- Seed with the release velocity (normalised to the travel for progress springs, e.g. `v0 = min(8, vy/dist)`).
- Rest test: |Δ| < 0.0004 (normalised) or < 0.3–0.5 px and |v| < 0.004 / 4–15 px/s.
- Cap carried velocity toward a target (≤ 1.2·ω·distance) so a hard flick into a near slot doesn't overshoot 14–28 px.
- A spring chasing an eased target (`follow()`): simulate per 1 ms toward a smoothstep-eased target, sample at 120/s
  → starts and ends with zero velocity *and* acceleration; compose lift-and-return as `p = up − down`. Blur a
  progress curve with a Gaussian (σ 80–100 ms) and divide by its peak to remove kinks in colour fades.

## 4. Sequencing
- Chain on completion: `await Promise.all(anims.map(a => a.finished))` — but cap every wait
  `Promise.race([a.finished, wait(dur + 150)])` (hidden documents never fire `finished`).
- Emit beats as events (`plp:landed`, `plp:still`, `roster:reveal`) and trigger follow-ups on "visually landed"
  (< 0.5 px), not on spring rest.
- Async loops (loaders, demos) carry a `run` token; a new run invalidates stale `wait()`s.
- Queue taps that land mid-morph (FIFO ≤ 6) instead of dropping them; only a real drag ≥ 6 px cuts an animation.
- State lives in classes/data attributes, **never** in an animation's end state (cancel, reduced motion and
  re-entry must never strand the UI).

## 5. Performance (all measured on real Android/iOS)
- Animate `transform`/`opacity` only; radius → corner masks or clip-path; height → `scaleY` or FLIP; width of a slot →
  follower transforms. Grid pushes: jump the box height, slide an **opaque** `position:relative; z-index:1` grid with
  `translate3d` on the same spring (paints 5.4k → ~420, worst frame 233 → 33 ms).
- Lay out once, then FLIP. Build keyframe lists in `requestIdleCallback`; put state classes on the animated element,
  not on a big subtree root.
- `img.decode()` everything that will appear mid-animation (100–250 ms hitches otherwise); hand a shared element over
  only after decode; hide the landing tile whole.
- `will-change: transform` only while travelling (clear on settle), never on every tile, never on a layer you scale up
  (pins raster scale → blur/pixelation). Lay out flying bitmaps at max size and scale *down*.
- Android: drop animated `filter: blur()` and `backdrop-filter` (same timing, transform + opacity only); Lottie every
  2nd frame; warm Lottie frames while idle in ≤ 8 ms slices; pause covered videos; pre-raster overlays at opacity 0.001.
- Hide covered views from rendering (`visibility: hidden` after settle, or `inert` + opacity 0 when they must stay
  painted to avoid a first-raster hitch).
- Scroll-coupled chrome: CSS `position: sticky`, not scroll listeners (main-thread paint lags the compositor a frame).

## Reduced motion
Switch on `prefers-reduced-motion: reduce` (and the kit's `data-nk-motion="reduce"`):

| Kind | Under reduce |
|---|---|
| screen push / slides | cross-fade ≤ 200 ms (kit 0.189 s), no travel |
| springs, flights, morphs | jump to the end (1 ms) — fades keep their timing |
| sheets | fade in place with the scrim; drag unchanged |
| staggers | 0 |
| CSS keyframes/transitions | `animation/transition-duration: 0.01ms !important`, 1 iteration, delay 0 (opt-out class for essential ones) |
| skeleton shimmer | none, flat base colour |
| spinners | no rotation, gentle opacity pulse 1 ↔ 0.45 0.9 s |
| Lottie | no autoplay; show the resting / last frame; one-shots still call `onComplete` |
| carousels, tickers, marquees, idle loops, confetti | stop; first item stays; swipe/tap still work |
| scroll-linked | unchanged (it follows the user) |
| toasts | fade 200 in / 160 out |
| timed flows (OTP check, page loader) | shorter (≤ 300 ms) but complete |
| haptics, countdown text | unchanged |
Verify both ways (`emulateMedia({ reducedMotion: 'reduce' })` and `'no-preference'`): nothing loops, content visible,
timed flows still finish.
