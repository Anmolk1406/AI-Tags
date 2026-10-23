# Tokens — every value, every platform

Conventions: mass 1; k = stiffness, c = damping; ω = √k, ζ = c / (2√k); response = 2π/ω (SwiftUI/UIKit);
overshoot = e^(−ζπ/√(1−ζ²)). Generate any spring with `.claude/skills/noon-motion/scripts/spring.py`.

## 1. The core set (authored in ProtoPie, measured from recordings)

### MOVE — `noon` spring
| Format | Value |
|---|---|
| ProtoPie | Spring · Tension **300** · Friction **28** (pie shows "0.55 s") |
| Physical | stiffness **280.6**, damping **27.14**, mass 1 · ω 16.75 · ζ 0.81 · response 0.375 s |
| Behaviour | 50 % at ≈75 ms, 90 % at ≈165 ms, peak **+1.30 % at 320 ms**, within 1 % at 371 ms, 0.1 % at 510 ms; ProtoPie cuts it at **544 ms** |
| CSS | `544ms linear(0, 0.0311, 0.1073, 0.2084, 0.3197, 0.4312, 0.5364, 0.6314, 0.7143, 0.7845, 0.8425, 0.8891, 0.9258, 0.9538, 0.9747, 0.9896, 0.9999, 1.0066, 1.0105, 1.0125, 1.013, 1.0126, 1.0116, 1.0103, 1.0088, 1.0074, 1.006, 1.0048, 1.0037, 1.0028, 1.002, 1.0014, 1.001, 1.0006, 1)` (`--nm-move`) |
| motion/react | `{ type: 'spring', stiffness: 280.6, damping: 27.14, mass: 1 }` (kit: `TEST01_SPRING`, `handoff.spring`, `spring.sheet`, `spring.gentle`) |
| Reanimated | `withSpring(to, { stiffness: 280.6, damping: 27.14, mass: 1 })` |
| SwiftUI | `.interpolatingSpring(mass: 1, stiffness: 280.6, damping: 27.14)` ≈ `.spring(response: 0.375, dampingFraction: 0.81)` |
| UIKit | `UISpringTimingParameters(mass: 1, stiffness: 280.6, damping: 27.14, initialVelocity: v)` / `CASpringAnimation` same fields |
| Compose | `spring(dampingRatio = 0.81f, stiffness = 280.6f)`; Android View `SpringForce().setStiffness(280.6f).setDampingRatio(0.81f)` |
| Figma | Smart animate → Custom spring: mass 1, stiffness 281, damping 27 |
| Spec sheet | `SPRING(Tension 280.6, Friction 27.14)` (key `pp` / `t01`) — the spec-sheet prints physical k/c, not the authored 300/28 |

Equivalent measurements you will see in older code (all the same spring within 3 %): **289 / 27.5 (ω 17, ζ .81)**
in noon-pdp-v2 / platform-hijack (`--pp-spring`, 64-stop `linear()`), **280 / 27.1** (fit of 200 tracks), the
`--ease-xmp` / `--ease-hijack` / `PP.MOVE` sampled `linear()`s (peak 1.0133 at 55 %, 540–544 ms).

### FADE IN — Ease-Out Cubic
`cubic-bezier(0.33, 1, 0.68, 1)` = `1 − (1 − t)³` · **200 ms** (300 ms reveal, 400 ms grounds/scrims/overlays).
ProtoPie "Ease Out · Cubic". SwiftUI `.timingCurve(0.33, 1, 0.68, 1, duration: 0.2)`; Reanimated
`Easing.out(Easing.cubic)`; Compose `CubicBezierEasing(0.33f, 1f, 0.68f, 1f)`.
Kit alias: `easing.out` `[0, 0.204, 0.316, 1.066]` at `duration.fast` **0.183 s** (long 0.276) and the PP `EASE_OUT`
21-sample `linear()` — a recording fit of the same fade; equivalent, keep them where they already are.

### FADE OUT / colour / radius — Ease-In-Out Cubic
`cubic-bezier(0.65, 0, 0.35, 1)` · **200 ms** (long 300–400). ProtoPie "Ease In Out · Cubic" — **the pie file stores
`(0.4, 0, 0.2, 1)` in `easingCubicBezier*`, but the player renders `(0.65, 0, 0.35, 1)` (recordings match it
exactly; `(0.4,0,0.2,1)` is off by ~10 %).** Reanimated `Easing.inOut(Easing.cubic)`.
Kit alias: `easing.inOut` `[0.615, 0.06, 0.34, 0.993]` at `duration.base` **0.189 s** (long 0.388) and PP `EASE_IO`.

### Secondary core values
| Token | Value | Source |
|---|---|---|
| `soft` spring (radius on page drops) | ProtoPie Spring 300 / **30** → k 280.6, c 29.08, ζ 0.87, 0.4 % overshoot, 1 % at 279 ms; `400ms linear(0, 0.0332, 0.1129, 0.2165, 0.3284, 0.4385, 0.5408, 0.6319, 0.7107, 0.777, 0.8315, 0.8754, 0.9101, 0.9369, 0.9574, 0.9726, 0.9836, 0.9914, 0.9968, 1.0002, 1.0024, 1.0035, 1.004, 1.0041, 1)` | supermall "Nav Bar" radius |
| radius clock | in-out cubic **200 ms**, starts with the move | XMP 26, every radius response |
| expand | `cubic-bezier(0.4, 0.01, 0, 1.01)` **400 ms** (scale 80 → 100 %) | XMP 01/02 Mins PDP |
| instant set | 0–10 ms (ProtoPie 0 / 0.01 s) for pre-states | |
| press | scale **0.96** on the move spring (touch-down → up) | supermall Scene 1 |
| push parallax | under-page x = **−200/382 · W = −52.36 %** (375 → −196.3 px); **no dim** | Test01 |
| stagger | in **60**, out **40**, micro **20**, re-flow **10** ms | Test01 conditions |
| follow-up | +40 (heading after card), +80 (secondary), +100 (focus/results after push), +0.6 s (after a page is gone) | pies |

## 2. Spring library (choose by job, not by taste)

| Name | k / c | ω | ζ | response | overshoot | 1 % / 0.1 % settle | Use it for | From |
|---|---|---|---|---|---|---|---|---|
| **noon** | 280.6 / 27.14 | 16.75 | .81 | .375 | 1.3 % | 371 / 510 ms | **every movement** (default) | ProtoPie 300/28 |
| soft | 280.6 / 29.08 | 16.75 | .87 | .375 | 0.4 % | 279 / 522 | corner radius on drops, near-no-bounce UI | ProtoPie 300/30 |
| return | 240.25 / 31 | 15.5 | 1 | .405 | 0 | 428 / 595 | coming back from a held offset (top sheet auto-return) — "smoother, natural" | supermall `--ease-back` |
| detail | 400 / 36.8 | 20 | .92 | .314 | 0.06 % | 271 / 328 | long morphs carrying text (> 200 px) where 1.3 % is visible | PDP review detail |
| glide | 324 / 34.56 | 18 | .96 | .349 | 0 | 335 / 442 | soft closes, gallery → tile | PDP gallery close |
| snap | 576 / 48 | 24 | 1 | .262 | 0 | 276 / 384 | short quick returns (indicator, single → grid) | PDP / Airbnb ref |
| header | 341.5 / 31.79 | 18.48 | .86 | .34 | 0.5 % | 248 / 474 | scroll-collapse header driver, page curl | NANO home, Riveo |
| pager | 341.5 / 27.35 | 18.48 | .74 | .34 | 3.2 % | 357 / 427 | carousels/rails "snappy with slight elastic" | Brand Widget |
| morph | 203.9 / 26.85 | 14.28 | .94 | .44 | 0 | 401 / 508 | panel ⇄ bar morphs, no visible bounce | Brand Widget |
| card | 157.9 / 23.12 | 12.57 | .92 | .50 | 0.06 % | 431 / 522 | cards rising into a panel (+ blur 4 → 0) | Brand Widget |
| tab pill | 503.6 / 35.01 | 22.44 | .78 | .28 | 2 % | 289 / 369 | selection pill / segmented handle travel | Loader Glass, noon Cart |
| firm twin | 503.6 / 40.4 | 22.44 | .90 | .28 | 0.15 % | — | sizes/shapes next to a lively mover (widths must not bounce) | noon Cart |
| slider snap | 144 / 22.1 | 12 | .92 | .52 | 0.06 % | 451 / 547 | ruler/slider snapping to a slot | noon-home roster |
| sheet + mascot | 171.3 / 18.85 | 13.09 | .72 | .48 | 3.8 % | 504 / 771 | a sheet rising with a character riding it | Orbi |
| pop | 223.8 / 15.56 | 14.96 | .52 | .42 | 15 % | 584 / 849 | in-place elastic pop (coin, check, badge) | Brand Widget |
| reward | 400 / 18 | 20 | .45 | .314 | 20 % | 438 / 761 | heart fill, like | PDP like |
| bouncy (kit) | 400 / 14 | 20 | .35 | .314 | 31 % | 576 / 910 | counters, badges (kit `spring.bouncy`) — use sparingly | kit |
| press (kit) | 500 / 30, m 0.6 | 28.9 | .87 | .218 | 0.4 % | 161 / 303 | `<Pressable>` whileTap | kit |

Rules: task UI ζ ≥ 0.8; rewards ζ 0.45–0.55 only; ζ < 0.45 reads as "jittery/vibration" — rejected. Use ζ ≤ 0.97
or the critically-damped formula in samplers (the underdamped helper divides by zero at ζ = 1).
Velocity-aware release (Field DS): k 300, c = 30 − 8·min(|v|, 3000)/3000 (ζ .87 → .64) — faster flicks get a
little more life.

### Field DS (Origin, coded) — use inside Field/Origin components
Springs: interaction 220/18 (ζ .61) · snappy 280/22 (ζ .66) · light 300/28 (ζ .81) · heavy 320/32 (ζ .89) ·
bouncy 280/18 (ζ .54). Durations: instant 40 · xs 100 · sm 160 · base 200 · recede 180 · emphasized 220 · lg 260 ·
xl 320 ms. Delays: stagger 25 · beat 120. Easings: standard `(0.32, 0.72, 0, 1)` · loft `(0.22, 1, 0.36, 1)` ·
accelerate `(0.4, 0, 1, 1)` · decelerate `(0, 0, 0.2, 1)` · easeInOut `(0.6, 0, 0.4, 1)`. Press: scale 0.98 in
100 ms, out on snappy; press colour 120 ms; pressed opacity 0.85; loading cross-fade 160 ms. Trim spring tails at
±0.5 % (280/18: 875 → 542 ms) or they feel "mushy".

## 3. Named easings (when a spring is wrong)

| Name | cubic-bezier | Typical | Use |
|---|---|---|---|
| fade in | (0.33, 1, 0.68, 1) | 200 / 300 / 400 ms | opacity in |
| fade out / S | (0.65, 0, 0.35, 1) | 200 ms | opacity out, colour, radius, symmetric loops (ticker 7.2 s) |
| soft / loft | (0.22, 1, 0.36, 1) | 420–820 ms | content reveal after a push, FLIP glides, selection fills, banner open, one-curve multi-layer settles |
| iOS sheet / standard | (0.32, 0.72, 0, 1) | 280–450 ms | keyboard lift (450), sheet close "snappyOut" (280), ticker step (500), CTA press colour |
| expand | (0.4, 0.01, 0, 1.01) | 400 ms | card → page scale |
| exit soft ease-in | (0.4, 0, 0.7, 0.4) | 220 ms | "clear the stage" beat before a reveal |
| toast exit | (0.4, 0, 0.7, 0.2) | 440 ms | pill shoots off the top after a +7 px dip |
| shake | (0.36, 0.07, 0.19, 0.97) | 340 ms | error shake |
| back-out pop | (0.34, 1.4, 0.64, 1) / (0.34, 1.56, 0.64, 1) | 260–420 ms | digit in, ring arm, playful pop (kit `backOut`) |
| tab underline | (0.3, 1.25, 0.5, 1) | 280 ms | slight-overshoot underline |
| linear | — | 1.867 s | shimmer band, progress |
| page-loader SOFT / RISE | critically damped resp .36 / ζ .86 resp .34 | 420 / 520 ms | zoom-out / zoom-in of the tab-switch page loader |

Rejected curves (don't reuse for the same job): `(0.32,0.72,0,1)` 460 ms for a return ("jumps off then crawls");
`(0.25,0.8,0.3,1)` 480 ms return; strong ease-in `(0.5,0,0.75,0)` sinks ("hold then drop").

## 4. Durations & timing standards

| Thing | Value |
|---|---|
| instant state set | 0–10 ms |
| micro (press colour, key release, tick) | 90–120 ms |
| fade | 200 (std) · 300 (block reveal) · 400 (ground / scrim / overlay) · 480–520 (dark scrim in) |
| movement | noon spring ≈ 544 ms total, visually done ≈ 370 ms |
| fast exit before the next page | 130–150 ms, 25 ms stagger, 12 px |
| full screen push | ≈ 544 ms (kit `push`, `slide-left`) |
| search → PLP | rows out 0–260 · page fade 300 · nav +224 · chips +480 · cards +680 · landed ≈ 1.6–1.9 s |
| top-sheet tease dwell | 3.333 s (frame 200 of the sheet Lottie) |
| toast / error pill | 0.8 s fully on screen (≈ 1.7 s total) for errors; kit toast 2.6 s |
| page loader hold | 500–1800 ms (iterations 0.5 / 1 / 1.2 / 1.8 s; kit 800) |
| shimmer | 195 px band, −17° skew, 1.867 s linear (450 px/s), first pass 0.12–0.2 s |
| ticker | step every 2.4 s over 500 ms; marquee 7.2 s, 140 ms between tabs, starts 1.2 s |
| carousel autoplay | 3 s, 450 ms ease-out; pause on touch and while covered |
| long-press | 280 ms (pick up), double-tap ≤ 300 ms / ≤ 24–40 px |

## 5. Kit (`@noon/flow-kit`, this repo) mapping

The standard lives in `src/motion/noonMotion.ts` (TS) and `src/motion/noonMotion.css` (`--nk-motion-*`), exported from
the package root. The older presets in `src/motion/presets.ts` and `src/motion/transitions.ts` keep their values so existing
flows and the 1:1 bappzaar ports don't change; **new screens use the standard**.

| Standard | Kit name (new code) | Older kit value it replaces for new screens | Already equal in the kit |
|---|---|---|---|
| MOVE spring 280.6 / 27.14 | `noonSpring.noon`, `noonTransition.move`, `var(--nk-motion-move)` 544 ms | `spring.gentle` 170/26, `spring.sheet` 260/30 | `handoff.spring`, `supermall.springs.move` |
| soft 280.6 / 29.08 | `noonSpring.soft`, `var(--nk-motion-soft)` | — | — |
| return ω 15.5, ζ 1 | `noonSpring.return`, `var(--nk-motion-return)` | — | `supermall.springs.return` |
| pager · morph · pop · card | `noonSpring.pager` / `.morph` / `.pop` / `.card` | — | `handoff.springs.*` (same via `appleSpring`) |
| reward 400 / 18, bouncy | `noonSpring.reward` (rewards only) | `spring.bouncy` 400/14 (keep for existing counters) | — |
| press scale 0.96 on the spring | `noonPress.default` + `noonSpring.noon`, `.nk-motion-press` | `spring.press` 500/30/0.6 in `<Pressable>` | `pressScale`, `supermall.press` |
| FADE IN `(0.33, 1, 0.68, 1)` 200 ms | `noonTransition.fadeIn`, `noonEase.fadeIn`, `var(--nk-motion-fade-in)` | `easing.out` `[0.215, 0.61, 0.355, 1]` at `duration.base` 0.25 s | `handoff.easeOut` (sampled recording, 0.183 s) |
| FADE OUT `(0.65, 0, 0.35, 1)` 200 ms | `noonTransition.fadeOut`, `noonEase.fadeOut`, `var(--nk-motion-fade-out)` | `easing.inOut` `[0.645, 0.045, 0.355, 1]` | `handoff.easeInOut` (sampled, 0.189 s) |
| reveal 300 · ground 400 | `noonTransition.reveal` / `.ground` | `duration.medium` 0.3 / `duration.slow` 0.45 | `handoff.fade.reveal` |
| radius 200 ms own clock | `noonTransition.radius`, `var(--nk-motion-radius)` | — | — |
| expand `(0.4, 0.01, 0, 1.01)` 400 ms | `noonTransition.expand` | `scale-up` transition | — |
| push, under-page −52.36 %, no dim | `transition: 'slide-left'` (registered), `noonPush.underX` | `push`: 0.42 s `easing.ios`, under −28 %, dim 0.08 | `slide-left` (−52 %, `handoff.spring`), `supermall.push` |
| stagger 60 in / 40 out | `noonStagger.in` / `.out`, `staggerIn` / `staggerOut`, `var(--nk-motion-stagger-in)` | `<Stagger>` 35 ms + 380/39 | `handoff.stagger`, `supermall.rows` |
| travel 20 / 16 / 10 | `noonTravel.row` / `.card` / `.heading` | `fade-up` 24 px | `handoff.travel`, `supermall.cards.y` |
| shimmer 195 px · −17° · 1.867 s | kit `<Skeleton>` | — | `supermall.shimmer` |
| haptics vocabulary | kit `haptics` + `haptic()` (vibrate only) or `nativeHaptic()` (native bridge → vibrate → iOS Safari tick, 40 ms merge, waits for finger lift) | — | same kinds and vibrate patterns |
| reduced motion | kit `useReduceMotion()`, `data-nk-motion="reduce"` (the WAAPI helpers read it) | — | — |

Rules: inside the kit always use these names, never a literal equal to one. Keep loops, tickers, keyframe `times`,
Lottie and business delays as they are. Retune an existing screen from the older column to the standard only when
asked, then re-run its journeys and `npm run perf`. Converting a raw literal: ζ ≥ 0.6 → `noonSpring.noon` (or the
library spring for its job), ζ < 0.6 → `noonSpring.pop` / `.reward` (rewards only), fades → `noonTransition.*`.
