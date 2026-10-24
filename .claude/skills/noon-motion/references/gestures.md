# Gestures — physics, thresholds, release rules

Every finger-driven motion follows the same skeleton: **slop → axis lock → 1:1 follow → resist at the ends →
release by distance OR velocity (projected) → settle on a spring that carries the finger's velocity →
interruptible by the next touch.**

## 1. Recognising the gesture
| Decision | Value | Notes |
|---|---|---|
| tap slop | **10 px** finger (6 px desktop/mouse); ≤ 400–700 ms | 2 px classified every finger tap as a drag |
| drag start / axis lock | **6 px** (8 px for 3D objects and sheets in SwiftUI) | lock once on the dominant axis; vertical wins in scrollers → let the page scroll |
| long press | **280 ms** still | use input timestamps, not timers, on slow phones |
| double tap | ≤ **300 ms**, ≤ 24–40 px apart | a single tap must wait ≈ 250 ms if double-tap exists; already-liked double-tap re-plays, never un-likes |
| swipe vs tap on media | move > 12 px = swipe | |
| pointer capture | only **after** the drag threshold | capturing on pointerdown kills nested buttons |
| click after a drag | swallow once (capture phase), reset the flag on **every** pointerdown | touch drags send no click, so a stale flag eats the next real tap |
| tap on iOS | act on `pointerup` (≤ 10–12 px, ≤ 700 ms) and swallow the synthetic click for 900 ms | WebKit delays/drops clicks after drift; add `touch-action: manipulation` |

## 2. Velocity
- Measure over the **last 80–90 ms** of samples (≤ 6 kept), px/s; clamp ±4000 px/s.
- **Zero it if the finger was still > 50–80 ms before lifting** (drag-hold-release must not read as a flick).
- Never use the last two events (2 ms apart → 2 px/ms nonsense).
- EMA alternative for rotations: `v += (inst − v)·0.35`.
- First event after a > 100 ms pause: treat as step / 16 ms.

## 3. Release: distance OR projected velocity
| Surface | Commit when | Settle |
|---|---|---|
| screen edge-swipe back | `p + v·0.18 s < 0.5` (UIKit projection) — or dx > 32 % W / v > 550 px/s | noon spring with velocity |
| photo / card pager | pull > **30 %** of a card **or** flick > **140 px/s**; fling-back > 60 px/s against the pull cancels; **one page per gesture** | noon spring integrated in JS with velocity |
| full-page pager (reels) | `|dy + v·110 ms| > 22 %` of height, or |v| > 450 px/s | spring/settle(v), 220–470 ms |
| detail page swipe | flick > 380 px/s or > 30 % | noon spring |
| brand rail | flick ≥ **220 px/s** → one page from the drag-start page, else nearest | **pager** spring (resp .34 ζ .74) |
| slider / ruler | at most ONE product from the nearest slot toward `x + v·0.2 s` | **slider snap** ω 12 ζ .92; carried velocity ≤ 1.2·ω·distance toward, ≤ 600 px/s away |
| bottom sheet dismiss | dy > **100–120 px** or v > **600–700 px/s** (SwiftUI: > 28 % height or predicted > 55 %) | noon spring (v > 900 → settle with velocity) |
| photo swipe-down dismiss | dy > **100 px** or v > **650 px/s** | fly home with normalised velocity |
| pull-to-fold / takeover | past 90 px / 650 px/s; takeover commit at 65–70 % of the screen (no release needed) | |
| scroll-collapse snap | passed **20 %** of the range in the travel direction AND `y + v·150 ms` short of the end | critically damped resp .5 driving scrollTop, `overflow:hidden` while settling |
| page curl | progress > 0.32 or flick > 1.1 progress/s | header spring (.34/.86), v clamp ±6 |
| wallet swipe up | −dy ≥ 70 px or v < −0.45 px/ms; detent haptic at −70 | spring back elastic |
| drag-down confirm | **80 %** of travel commits *without* a release (user moved it 40 → 60 → 80 %) | one continuous motion, no pause |
| notification card throw | |dx| > 110 or > 0.55 px/ms with |dx| > 24 | 260–520 ms `(0.25,0.6,0.35,1)` minus speed |

Catching a settling page past halfway counts as arrived. Keys (←/→) step from the current *target*, so presses queue.

## 4. Resistance at the ends
- **iOS rubber band** (default): `resist(d) = d·dim·c / (dim + c·d)`, **c = 0.55**, dim = viewport (375) — or the
  limit form `(1 − 1/(d·0.55/L + 1))·L` (L = 150 slider, 343 rail). Loosen to c 0.8 / dim 1600–2200 when a target
  must stay reachable (pull-down takeovers).
- Up-drag on a sheet: ×0.05–0.25. Past-open edge swipe: ×0.12. Exponential cap: `A·(1 − e^(−d/k))`, A 120–160,
  k 190–200 (wallet). Ends of a curl: `0.075·(1 − e^(−2.4·raw))`.
- Overscroll transform goes on the **scroller itself**, never on its content (scrollHeight runaway).
- Haptic **edge** (rigid) once when the band starts; never past the end again until released.

## 5. Settling
- Gesture settles are **JS-integrated springs** (semi-implicit Euler or analytic), fixed sub-steps (1/240 s; 4 ms
  for stiff ω ≥ 40), wall-clock dt capped (0.05–0.5 s) — the preview pane may deliver a frame every 500 ms.
- Rest when |x − target| < 0.0004 (normalised) / < 0.3–0.5 px and |v| < 0.004 / 4–15 px/s.
- "Visually landed" (trigger the next beat): < 0.5 px & < 15 px/s; "arriving" (start the follow-up): < 4 px & < 80 px/s.
- Re-grab during a settle: stop at the current value, keep velocity for the next release.
- Momentum glide (mouse rails): friction 0.94/frame (or decay 0.9965/ms), stop < 0.02; stretch decay 0.82/frame.
- 3D objects: coast with friction `clamp(v/dist, 1, 8)` toward the nearest detent, then a gentle spring (k 45 c 9.5)
  — a plain glide overshot and reversed.

## 6. Parallax & depth while dragging
- Push under-page −52.36 % (handoff) / −28 % (Field DS stack); edge-swipe: under-page tracks `−0.28W + d·0.28`.
- Inside a pager: arriving photo lags its card 50 %, leaving 32 %, image zoom +6–9 % to cover uncovered edges; the
  gap between cards breathes 28 → 8 → 28 px. Leading (faster-than-card) parallax was rejected.
- Swipe-down dismiss: photo scale `max(0.55, 1 − dy/900)`, ground `1 − dy/420`, chrome `1 − dy/120`, dx × 0.9.
- Takeover plates trail at 0.22 × pull. Widgets behind grids at 0.25.
- Text and labels never follow the finger; they dim (to 65 %) and swap after commit.

## 7. Wheel / trackpad / keyboard parity
- Horizontal two-finger swipe: `passive:false` wheel listener, `preventDefault` horizontal (blocks browser history
  nav), accumulate −deltaX 1:1, release after **90 ms** idle with the last-90 ms velocity (×0.6), swallow momentum for
  160 ms after a page. Outward past the end damped `0.35/(1 + over/30)`.
- Vertical wheel paging: accumulate until |Σ| ≥ 42, reset after 180 ms idle, lock 340 ms per page.
- Keyboard activation plays exactly the same motion as touch.

## 8. Device motion
- Shake to change: 3 jolts > 14 m/s² within 700 ms (80 ms debounce), 1.1 s cooldown; request permission inside a tap.
- Tilt: dead zone 2°, range 25–30°, smoothing `1 − (1 − 0.14)^(dt·60)`, auto-recentre after 0.3 s still (half-life
  0.45 s). No haptics on continuous tilt.
