# Choreography — recipes with every delay

Times are ms from the trigger (touch-up unless noted). MOVE = noon spring (280.6/27.14, ≈544 ms), IN = fade-in
cubic 200, OUT = fade-out in-out cubic 200. "Stagger 60↓" = 60 ms apart top→bottom; "40↑" = bottom→top.

Contents: [Press](#press) · [Screen push](#screen-push) · [Bottom sheet](#bottom-sheet) ·
[Top-sheet page drop](#top-sheet-page-drop) · [Search → suggestions → PLP](#search--suggestions--plp) ·
[PLP banner / chip reveal](#plp-banner--chip-reveal) · [Widget reveal behind a grid](#widget-reveal-behind-a-grid) ·
[Card → full screen](#card--full-screen) · [Photo viewer](#photo-viewer-shared-element) ·
[Selection & filter swap](#selection--filter-swap) · [Toast, error, success](#toast-error-success) ·
[Loading](#loading) · [Tab-switch page loader](#tab-switch-page-loader) · [Header collapse](#scroll-linked-header) ·
[Rewards: like / pop](#rewards) · [Onboarding reveal](#onboarding--hero-reveal) · [Ambient](#ambient-loops)

---

## Press
- **ProtoPie**: Touch Down → Scale 96 % (Spring 300/28); Touch Up → 100 %.
- **Code**: scale 0.96 controls / 0.98 wide rows, cards, CTAs / 0.90–0.94 icons / 1 where the reference has none
  (search bar, classic tab bar). Press-in fast (70–100 ms, or the kit press spring 500/30/0.6), release on a spring.
- Selection press dip: scale `[1, 0.96, 1]` at times `[0, 0.3, 1]` over 340 ms, release on `(0.4,0,0.2,1)`.
- Glass/Liquid controls swell instead: `1 + min(0.12, 7/width)`, release on response .32 ζ .55 (the "wobble").
- Never put a spring on CSS `:active` alone (reads as lag) — the press-in must be immediate.
- Haptic: light on tap (iOS Safari: fires on release).

## Screen push
| t | Layer | Motion |
|---|---|---|
| 0 | incoming page | x 100 % → 0, MOVE (one progress p drives both pages) |
| 0 | page under | x 0 → −52.36 % W (200/382), same p; **no dim** (handoff); kit `push` adds brightness 0.92 |
| +100 | input / first content | focus input (inside the tap on iOS so the keyboard rises with the push), results y 20 → 0 MOVE + IN |
| +124 | trending / presearch art | y 20 → 0 MOVE + IN 183–200 |
- **Back**: reverse on MOVE; dependent content leaves at +0.6 s with y → 20 + OUT (after the page is gone).
- **Edge swipe back**: 24 px strip, 1:1, past open rubber ×0.12, release `p + v·0.18 < 0.5` → pop, else spring back
  carrying velocity; selection tick crossing p = 0.5.
- **Arming**: hold the initial pose until the new screen has painted twice (2 rAFs), then start the screen AND the
  under-page parallax together — a clock started at mount showed the first frame 30–45 % into the slide.
- Reduced motion: cross-fade on p, no travel.
- Alternatives: modal = y 100 % → 0 with the page under scale 0.94, radius 24, brightness 0.85; fade = 0.189 s
  S-curve for swapping states of the same place; `results-fade` 300 ms for search → results.

## Bottom sheet
| t | Layer | Motion |
|---|---|---|
| 0 | scrim | opacity 0 → 1, 276–400 ms in-out (dark scrim 480 ms `(0.3,0,0.2,1)`) |
| 0 (+50) | sheet | y 100 % → 0 on MOVE (arm once content > 90 px tall + 2 rAFs) |
| +80 | rows | y 18 → 0, 34 ms stagger (optional) |
- Content height changes inside an open sheet: FLIP a plain wrapper div over 560 ms on the spring `linear()`.
- Dismiss: drag 1:1 (up rubber ×0.05–0.25), close if dy > 100–120 px or v > 600–700 px/s; overlay opacity
  **chained** to sheet y (ProtoPie Chain); tap scrim → y 830 on MOVE. Fast flick close (> 900 px/s) settles with
  the release velocity; otherwise 220 ms accelerate.
- Origin/Field geometry: 12 px inset, r16, max-height 680, grabber 36×4 above; classic r24, max 88 %.

## Top-sheet page drop
"noon X supermall" Nav Bar tap / "XMP 26" noon-container tap.
| t | Layer | Motion |
|---|---|---|
| 0 | whole page (`All Content`) | y 0 → **181–200** px on MOVE (XMP: y → 970/986 + scale 0.96) |
| 0 | page corners | radius 0 → 20 on **Spring 300/30** (or in-out 200 ms) |
| 0 | inner content | y −30…−48 (counter-parallax, stays put on screen) |
| 0 | top-sheet Lottie | play from 0 (750×480 @60 fps, ground matches page bg) |
| 0 | status bar | invert, 300 ms soft |
| +80 | swipe handle / hint | y on MOVE |
| +170 | — | haptic soft (bottom of the drop) |
| +3333 | everything | back to rest on **return** (critically damped ω 15.5, 540 ms); corners flatten +110 ms over 280 ms |
| return +233 | label / bolt | label slides 23.5 px + bolt scales in on the bolt curve (667 ms, 8.5 % overshoot), icon +100 ms |
| return +280 | — | haptic land |
- Fling up on the page or tap = close immediately with the same springs.

## Search → suggestions → PLP
**Suggestions** (typing):
| Trigger | Motion |
|---|---|
| first keystroke | presearch art y 0 → 20 on MOVE + OUT 189–200 |
| match | +110: rows y −20 → 0 on MOVE + IN 183–200, **stagger 60↓** (ProtoPie: 0.10/0.16/0.22/0.28/0.34/0.40 s), optional tick |
| letter changes the list | changed row: old ghost y → −5, blur 2, OUT 160; new y +5 → 0, blur 2 → 0, IN 260 at +40; rows 28 ms apart; wait ≤ 250 ms for photo decode; coalesce keystrokes within 60 ms |
| no match / clear | rows y → −20 + OUT, **stagger 40↑**; presearch returns 40 ms after the last row is gone |
| pick a suggestion | only the untyped remainder fades in (320 ms in-out) — no flight, no whole-field fade |

**PLP load** (tap a suggestion; t from touch-up):
| t | Layer | Motion |
|---|---|---|
| 0 | suggestion rows | FAST exit: y 0 → −12 in 150 ms + OUT 130 ms, **25 ms stagger ↑** (≈250 ms for 5) |
| 260 | PLP layer | opacity 0 → 1, 300 ms in-out; search bar lifts 5 px with it |
| 380 | shimmer | first sweep |
| 484 | bottom nav | y 88–94 → 0 on MOVE |
| 740 | chips | y −20 → 0 on MOVE + OUT-curve fade, **60 ms left→right**; chip skeletons fade in step |
| 940 | cards | y 16 → 0 on MOVE + IN 183, **60 ms** in grid order (first 8 only); each skeleton fades 353 ms after its card |
| ≈1660 | — | `landed` when the first row has risen → haptic land; follow-ups trigger on "still" (< 0.5 px) not on rest |
- Never wait for the invisible 0.5 → 0.02 px tail (≈340 ms) before the next beat.
- ProtoPie demo version used the same structure with 60 ms chip/card staggers and a shimmer slide of 154 px.

## PLP banner / chip reveal
- **Inline banner**: lay out the 78 px space once, FLIP the grid −78 → 0 over 560 ms soft; banner from y −8 /
  scale 0.96, fade 300 at +40; haptic soft at +340. Leave: fade 220 (front-loaded), y −8 / 0.96, grid up 520.
- **Pill that grows from a dot** (FANudge "90 mins" / "190m away"): dot → disc → stretch right with ≈7 %
  overshoot (halve it for chips), rest ≈1.15–1.45 s; text fades in at ≈0.7 s over 200 ms `(0.333,0,0.833,1)`;
  settle nudge x `0 −1.5 +1.3 −0.8 +0.4 0` px over 560 ms with **per-keyframe** ease-in-out; followers translate
  with the pill's right edge + 8 px gap; haptic pop at the stretch peak. Lands unselected.
- **Filter highlight** (final, approved): dot → pill on springs chasing smoothstep targets (height resp .42 ζ .72,
  stretch .52 ζ .70 at +90, fill .45 ζ .8 at +60, label +200), then lift scale **1.10** (resp .6 ζ .92) with
  colours fill #F9FBFF / stroke #A6C4FF / ink #2E75FF blurred by σ 100 ms, hold, back on resp .68 ζ .97;
  whole thing ÷1.15 speed. No sheen, no halo, no icon animation.

## Widget reveal behind a grid
ProtoPie "Intro" / recordings 0e6f5901, be662fe6 — the grid is the reveal line, the widget sits *behind* it.
| t | Layer | Motion |
|---|---|---|
| 0 | box / grid | box height jumps to final; the opaque grid slides `translate3d(0, −H → 0)` on MOVE |
| 0 | panel | one MOVE progress p: `translateY(20·(1−p)) scale(0.9 + 0.1p)` (iteration 3: drops from −30) |
| +17 | panel | fade 300 ms ease-out |
| +33…41 | heading | y 10 (or 6) → 0 on MOVE |
| +50…58 | heading | fade 300 |
| +80, 40 ms apart | first 3 cards | y 16 → 0 + scale 0.97 → 1 on **card** spring; opacity + blur 4 → 0, 340 ms `(0.32,0.72,0,1)` |
| +200 | — | haptic soft |
- Scale and translate on ONE progress so they overshoot together. Never animate the box height.

## Card → full screen
XMP 26 "Carousal" tap / "Mins PDP".
| t | Layer | Motion |
|---|---|---|
| 0 | card container | size → 375 × 812 on MOVE; radius → 0 in-out 200 |
| 0 | outgoing view | scale 1 → 1.30 on MOVE + fade out (IN-curve) 200 |
| +10 | incoming view | scale 0.80 → 1 on MOVE + fade in 200 |
| (alt) | page | scale 80 → 100 % on `cubic-bezier(0.4,0.01,0,1.01)` 400 ms starting ~390 ms into the slide, radius → 0 200 ms |
- Haptic medium on the gesture. Split translate and scale onto two elements when only one needs a delay.

## Photo viewer (shared element)
- **Open**: tile → card rect (left/top/width/height) on MOVE, radius 8 → 22 on its 200 ms clock, ground 0 → 1 in
  400 ms; header from −8 px fade 400 at +80; info strip from +12 px at +100. Tile left hidden whole. Hand over only
  after `img.decode()`. Haptic light.
- **Close**: fly back on MOVE carrying dismiss velocity; chrome out 200 ms (half the in-offset); ground 400 at +20;
  no tile → fly into the "View all" tile with a 0.8 black veil fading in 400 at +80.
- **Gallery ⇄ single** (Airbnb reference): to single = exponential ease-out τ 68 ms over 360 ms, grid fades + blur
  0 → 16 px τ 88 / 400 ms in one piece; back to grid = **snap** spring (ω 24 ζ 1), grid 400 ms fade.
- **Paging inside the viewer**: see [gestures §3](references/gestures.md#3-release-distance-or-projected-velocity); arriving photo parallax lag 50 %, leaving 32 %,
  depth zoom +6–9 %; text strip dims to 65 % mid-drag and swaps on commit (out 200 ms drift 14 px blur 2; in 400 ms
  at +80 from 18 px blur 3).
- **Detail expand**: one continuous FLIP morph (not a new panel) on **detail** spring (584 ms); extra lines revealed
  by a feathered mask sweep 300 ms ease-out at +60; extras at +170/+190/+210 (20 ms steps).

## Selection & filter swap
- Select (pill, chip, payment row): no movement, press dip 340 ms, fill + stroke cross-fade 200–260 ms soft. Haptic tap.
- Re-skin a list: cards fade out 180 ms in-out while skeletons fade in 183 → one re-layout → skeletons FLIP 420 ms
  soft → new cards at +820 (16 px rise, 60 ms stagger) → haptic land.
- Filter sheet "Show": sheet y → off on MOVE; chips re-flow x with **10 ms stagger**; count badge scale 0 → 1 on MOVE
  at +260; icon scale → 40 % + fade 200.

## Toast, error, success
**Error (field)** — validate on submit only (live red, pause-triggers and "live success ticks" were all rejected):
red border 200 ms + `@keyframes shake` 340 ms `(0.36,0.07,0.19,0.97)`: 0 → −4 (18 %) → +3 (40 %) → −2 (62 %) →
+1 (82 %) → 0 px + haptic error; OTP keeps the digits red; everything auto-resets as the pill leaves (≈1.7 s).

**Drop pill toast** (elastic): falls from −100 on spring(ζ .52, resp .45, 600 ms) with squash 1.22/0.8 at impact
(≈150 ms) settling via 0.94/1.07 → 1.03/0.98 → 1; at +260 grows dot → W×H (width ζ .6 resp .5, ≈+20 px overshoot),
radius → R 300 ms ease-out; content at +430 fade 200 + scale 0.8 → 1. **Hold 0.8 s.** Exit 440 ms: +7 px dip at 27 %
then shoot to −140 on `(0.4,0,0.7,0.2)` with a 1.05/0.9 → 0.93/1.12 stretch; never morph back into a dot.
Reduced motion: fade 200 in / 160 out. Kit toast: y 40 / scale 0.96 → rest on MOVE, exit y 20, 2.6 s.

**Success sequence** (OTP): boxes turn green 40 ms apart with a 1 → 1.06 → 1 pop (420 ms back-out) + success pill +
haptic success → +1700 pill leaves, everything else fades → boxes glide into a coin centre (fan ±2 px) → collapse to
a disc → tick plays (pre-rendered video if the Lottie is heavy, `mix-blend-mode: multiply` on white) → next screen
dissolves over the tail. Total collapse ≈ 500 ms ("faster/snappier" than 710).

**Shared CTA hand-off**: the same button glides between pages (translate + scaleX on spring ζ .86 resp .6, labels
cross-fade 260 ms out at +120 / in at +220); the destination's own button takes over after `Promise.all`.

## Loading
- **Skeleton shimmer**: ONE band for the whole screen — 195 px, `skewX(−17°)`, white core (no warm tint),
  `translateX(−200 → 640 px)` linear 1.867 s infinite, per-element coordinates so all cards are in phase; base
  #F6F5FA (#EEEBF6 on lilac sheets). Restart per open. Reduced motion: none, opacity 0 (flat grey).
- **Content over skeleton**: content rises 12–17.5 px + fast fade; the skeleton fades 160–353 ms *after* its part
  starts (never before).
- **Search page skeleton**: content at 400 ms, 30 ms stagger, rise 12 px / 480 ms soft, fade 260; skeleton groups
  fade 160 ms after their part.
- **Input wave** (OTP checking, Toss style): each box overlay opacity 0 → 1 at 0.72 → 0, 1000 ms, **100 ms stagger**,
  infinite. Field check shimmer: gradient sweep 1000 ms in-out infinite, minimum 1.3 s.
- **Messaging loader**: letters in 16 ms apart (0.62 s loft from y 14 + blur 4), out 8 ms apart (0.32 s), hold 1.9 s.
- Spinner only inside a control or overlay; button loading = label ⇄ spinner cross-fade 160 ms.

## Tab-switch page loader
Zoom language — no sliding.
| t | Layer | Motion |
|---|---|---|
| 0 | leaving page | fade 300 → 0 `(0.4,0,0.6,1)`, scale 1 → **0.96** over 420 SOFT |
| 0 | loader layer #F2F3F7 | fade in 240 |
| 60 | loader art (Lottie loop) | fade 300 + scale 0.96 → 1 over 520 RISE |
| 60 + hold | art | fade 280 + → 0.96 over 420 SOFT (hold 500–1800, kit 800) |
| +60 | layer / arriving page | layer fades 300; page fade 320 + scale **0.97 → 1** over 520 RISE; haptic soft |
- Every fade starts from current opacity; another tab tapped mid-load retargets and holds again. The tab bar never
  leaves. Reduced motion: no transforms, fades ≤ 200 ms, no delays.

## Scroll-linked header
- Scroll picks a **target** (collapse at scrollTop > 12, expand at < 4 — hysteresis); ONE spring (resp .34, ζ .86)
  animates `--p`, keeps velocity on reversal; derived layers via smoothstep windows (big art 1 − smoothstep(.2,.6,p),
  mini pills smoothstep(.25,.7,p)). Pinned bars/backdrops are CSS `position: sticky`, never scroll listeners.
  Haptic selection on each target flip. Rejected: 1:1 scroll-scrubbed collapse with auto-snap ("three clocks
  fighting" = glitchy).
- Kit Home: binary threshold scrollY ≥ 100 → tiles 78 → 35.45 h, radius 20 → 12, address row fades/collapses, 276 ms.
- **Scroll-bound hero** (gifting): every layer drawn from scrollTop (no follower); clip-path cut on an over-tall box;
  background drifts −0.4 px/px, near props +0.28, far +0.12; title chained linearly to the edge; secondaries fade on
  smoothstep over 35–60 % of the range; snap at 20 % with velocity projection (see gestures).
- Bottom bar hide: after 100 px continuous down travel (and y > 110), show after 38 px up or at top; translateY bar
  height on MOVE. Liquid tab bar minimise: > 24 px down; expand only near top (≤ 8 px).
- Status bar solid layer at scrollTop > 2: 200 ms.

## Rewards
- **Heart / like**: fill scale 0.2 → 1 on **reward** spring (ζ .45, 620 ms); ring scale .3 → 1.35 fade out 420 ms;
  6–9 dots fly 3 → 22–28 px over ~460 ms (5–7 ms apart); count bump 1.14–1.18 → 1 on MOVE, rolls ±7 px in the
  change direction; haptic medium (light on unlike); unlike is quieter (fill → 0.6 + fade 180).
- **Thumbs-up flight** (PDP final): lay out at max size and scale down (never upscale a bitmap); bloom 20 % →
  113.6 % → 98.4 % → 100 % (elastic ω16 ζ.5) 0.57 s; glide on 3rd-order critically damped curves with a small arc;
  white burst (disc + 7 dot pairs); haptics light at bloom, medium at impact, soft on settle. Stretch/wobble/breathe
  were rejected as "vibration".
- **Coin / badge pop**: in-place scale 0 → 1 on **pop** spring (resp .42 ζ .52) at +150; haptic pop at the
  overshoot peak (+150 ms). "Pop up with elastic, not animate position."

## Onboarding / hero reveal
- One-shot intros: card y 56 → 0 + scale 0.96 → 1 (subtle: ζ .66, ≈3.5 px overshoot), logo letters track in out of
  blur 6 → 0 (letter-spacing shrinks while the word stays centred), follow-ups +40/+80/+100; haptic medium when the
  card lands (+380). Cue UI to a video frame with `requestVideoFrameCallback` mediaTime, never a wall-clock timer.
- Multi-beat page build: (1) clear 0–220 ms soft ease-in, (2) present the hero at +220 on a spring (ζ .74), (3) settle
  everything at +840 on ONE soft curve `(0.22,1,0.36,1)` 820 ms with followers +10–40 px at 260–400 ms. Hold
  incoming layers at opacity 0 (not visibility) until their beat.
- Stacked cards: reveal the front alone (y 64 + scale .9 → rest on spring ζ .8), fan the others out from under it
  260–320 ms later; never fade the whole stack.

## Ambient loops
- Ticker: 3-row window, step −34 px every 2.4 s over 500 ms `(0.32,0.72,0,1)`, reset silently.
- Marquee: 7.2 s in-out loop, holds at 0–40 % / 48–88 % / 96–100 %, 140 ms per item, starts 1.2 s.
- Carousel autoplay 3 s, 450 ms ease-out, pause on touch (4 s) and while covered.
- Idle drift on still media: scale 1 → 1.022 over 16 s ease-in-out alternate.
- All ambient loops: no haptics, stop under reduced motion, only animate while in view.
