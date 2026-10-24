---
name: noon-motion
description: noon's Animation & Interaction standard — the one spring, the fade curves, timing and stagger values, choreography recipes, gesture physics, haptics and edge cases measured from the team's shared ProtoPie files ("noon X supermall", "XMP 26") and ~30 shipped noon prototypes. Use it whenever you design, build, port, tune, review or document any noon animation, transition or interaction — screen push, bottom sheet, top-sheet drop, list/suggestion stagger, PLP/skeleton load, card reveal, shared-element expand, press state, swipe/drag/paging/dismiss, toast, error shake, success, loader, scroll-collapsing header, like/reward pop, haptics — in web (CSS/WAAPI/motion), SwiftUI, React Native, Compose, ProtoPie or Figma. Also use it to convert ProtoPie Spring(Tension, Friction) or a ProtoPie Cloud link into code values, to answer "what easing/duration/spring should this use", or when a user says an animation feels jerky, glitchy, too bouncy, too slow or not natural — even if they don't say "motion standard".
---

> **Package note** (noon Flow Kit 0.2.0, built from `.claude/skills/noon-motion` by `npm run release:build`). Files under `../noon-ui/` (design-system references, `../noon-ui/resources/` with the brain map, flow briefs and screen index) are part of this package. Paths under `src/`, `scripts/`, `visual/` or `.claude/` and `npm run …` commands refer to the noon Flow Kit repo (https://github.com/arnabdebnath07/noon-app-skill): use them inside a checkout of it; anywhere else treat them as reference, ask for what you need, and never invent their contents. Claude Code-only parts (slash commands, the design-guard hook, Claude-specific tools) are listed in `../noon-ui/resources/DISTRIBUTION.md`.

# noon Motion & Interaction

Every value here was **measured**, not guessed: read out of the team's shared ProtoPie files (authored settings
+ recorded tracks fitted to ≤0.1 % RMS) and the prototypes built from them (noon-home, Brand Widget PLP,
noon X Supermall, noon NANO, PDP photo viewer, Platform Hijack, Filter Highlight, Gifting Registry, Loader Glass,
noon Cart, Reels, Orbi, the noon-app-skill flow kit). When a choice below says "approved" or "rejected", that is
the user's recorded verdict — treat it as a constraint, not a suggestion.

## The standard in one table

| Role | ProtoPie (author it like this) | Code value | Notes |
|---|---|---|---|
| **MOVE** — anything that changes position, size or scale | **Spring · Tension 300 · Friction 28** | spring **stiffness 280.6, damping 27.14, mass 1** (ω 16.75, ζ 0.81) | 1.3 % overshoot at ≈320 ms, within 1 % by ≈370 ms, ProtoPie runs it **544 ms**. One spring for push, sheet, rows, cards, chips, nav, scale |
| **FADE IN** (opacity in, colour to "on") | **Ease Out · Cubic**, 200 ms | `cubic-bezier(0.33, 1, 0.68, 1)` 200 ms | 300 ms for a revealed block, 400 ms for a ground / scrim / overlay |
| **FADE OUT** (opacity out, colour swap, radius) | **Ease In Out · Cubic**, 200 ms | `cubic-bezier(0.65, 0, 0.35, 1)` 200 ms | ⚠ ProtoPie stores `(0.4,0,0.2,1)` in the file but *renders* `(0.65,0,0.35,1)` — always use the rendered one |
| **RADIUS** (corners rounding as a page lifts) | Ease In Out Cubic 200 ms, or **Spring 300 / 30** | in-out cubic 200 ms on its **own clock**; or stiffness 280.6 / damping 29.08 (ζ 0.87, 0.4 %) | never on the move spring's timeline |
| **EXPAND** (card → full page scale) | Custom bezier `(0.4, 0.01, 0, 1.01)`, 400 ms | same | slow start, decisive landing |
| **PRESS** | touch-down → scale 96 %, touch-up → 100 %, Spring 300/28 | scale 0.96 (CTA/wide rows 0.98, icons 0.90–0.94) | press-in fast, release on the spring |
| **STAGGER** | delays | **60 ms in (top→bottom / left→right), 40 ms out (bottom→top)**, 20 ms micro, 10 ms chip re-flow | exits always faster and reversed |
| **FOLLOW-UP beat** | delay | secondary layer **+40–80 ms**, dependent content **+100 ms** (focus, results after a push) | |
| **TRAVEL** | Move | rows/blocks **20 px**, cards **16 px**, headings **10 px**, chip drop **20 px**, nav rise = its height | small travel + fade = "arrive", never a long slide |
| **HAPTIC** | Vibrate | iOS **Impact Medium** for gestures that move a page/sheet, **Impact Light** for auto beats/swaps; Android Normal | one haptic per beat, only with a visible change |

## In the noon flow kit (this repo)

The standard is already in the kit, next to the older presets: never re-type the numbers.

| Need | Use | File |
|---|---|---|
| a spring (motion/react `transition`) | `noonSpring.noon` (default), `noonSpring.soft` / `.return` / `.pager` / `.pop` … (§2 of tokens.md) | `src/motion/noonMotion.ts` |
| a fade, radius or expand | `noonTransition.fadeIn` / `.fadeOut` / `.reveal` / `.ground` / `.radius` / `.expand`, or `noonEase.*` + `noonDuration.*` | same |
| stagger, follow-up, travel, press, push | `noonStagger` (in .06 / out .04 s), `noonFollow`, `noonTravel`, `noonPress`, `noonPush.underX`, `noonSheet` | same |
| a ProtoPie Spring(T, F) | `protoPieSpring(300, 28)` → `{ stiffness: 280.6, damping: 27.14 }` | same |
| CSS | `var(--nk-motion-move)` + `var(--nk-motion-move-ms)`, `--nk-motion-fade-in` / `-fade-out` / `-fade-ms`, `--nk-motion-radius`, `--nk-motion-stagger-in` …; classes `.nk-motion-transition`, `.nk-motion-press`, `.nk-motion-shake` | `src/motion/noonMotion.css` |
| imperative / WAAPI motion | `springMove`, `fadeTo`, `staggerIn`, `staggerOut`, `stopMotion`, `springAt`, `settleTime`, `springLinear` | `src/motion/noonMotion.ts` |
| haptics with iOS Safari + native bridge | `nativeHaptic(kind)` (same kinds as the kit's `haptics`; the kit's `haptic()` stays vibrate-only) | same |

Rules in the kit:

- **New screens use the standard**; the old presets (`spring.sheet` 260/30, `spring.gentle` 170/26, the `push` transition 0.42 s with a −28 % under-page, `<Stagger>` 35 ms) stay as they are so existing flows and the 1:1 bappzaar ports don't change. Retune an existing screen only when asked, and then re-run its journeys and `npm run perf`.
- Everything else about kit motion (registered transitions, recipes, `useReduceMotion`, `<Pressable>`) is in `../noon-ui/references/motion.md`; the mapping from every older kit value to the standard is in [tokens.md §5](references/tokens.md).
- Outside the kit (a standalone prototype, another repo), copy `.claude/skills/noon-motion/assets/noon_sas_motion.css` / `.claude/skills/noon-motion/assets/noon_sas_motion.js`: the same values as `--nm-*` tokens and plain-JS helpers.

## How to use this skill

1. **Classify the moment** with the table below, then take values from it — not from memory and not from a
   generic "ease-in-out 300 ms". If nothing fits, use MOVE + FADE IN/OUT and the stagger rules.
2. **Split by property class**: moves/sizes/scales → MOVE spring; opacity/colour/filter → FADE curve; radius →
   its own 200 ms clock. One element never gets one easing for everything.
3. **Choreograph by completion, not wall-clock**: the next beat starts when the previous one *visually lands*
   (< 0.5 px, < 15 px/s) or exits, not at a fixed "after 600 ms". See [choreography](references/choreography.md).
4. **Make it interruptible**: every animation starts from the element's *current* computed value and gestures
   carry velocity into the spring. See [implementation](references/implementation.md).
5. **Add the haptic and reduced-motion behaviour** for the moment ([haptics](references/haptics.md),
   [implementation §reduced motion](references/implementation.md#reduced-motion)).
6. **Verify by measuring**, never by eyeballing the preview pane (it throttles rAF and freezes WAAPI) — see
   [edge-cases](references/edge-cases.md#verifying-motion).

### Which motion for which moment

| The element… | Move | Fade | Typical values | Haptic |
|---|---|---|---|---|
| **pushes in as a page** | MOVE, incoming x 100 % → 0; page under drifts **−52.36 % (200/382)**, no dim | — | ≈544 ms, interruptible, edge-swipe back from a 24 px strip | light on tap |
| **arrives as page content** after a push | y 12–20 → 0 on MOVE (or soft ease `(0.22,1,0.36,1)` 480 ms) | FADE IN 200–260 ms | starts +100–400 ms after the push, 30–60 ms stagger | — |
| **enters as a list** (suggestions, rows, chips) | y −20 → 0 on MOVE ("falls in") | FADE IN 200 | 60 ms stagger top→bottom, first row +100–110 ms | selection tick per row (optional) |
| **leaves** (user moved on / no longer applies) | y → −12…−20 on MOVE or in-out 150 ms | FADE OUT 130–200 | 25–40 ms stagger **bottom→top**, always shorter than the entrance | — |
| **is replaced in place** (label/photo while typing) | 5 px lift | cross-fade out 160 / in 260 (+40 lag), blur 2 px | 28 ms cascade | — |
| **fades in over another page** (results over search) | search bar lifts 5 px | FADE OUT-curve 300 ms | 10 ms after the last row is gone | — |
| **rises from an edge** (bottom nav, sticky footer, sheet) | y = height → 0 on MOVE | — | nav +224 ms after the page | — |
| **is a product card loading** | y 16 → 0 on MOVE | FADE IN 183–200; its skeleton fades **353 ms after** the card starts | 60 ms stagger, animate first 8 only | land when first row lands |
| **is loading** | one shimmer band 195 px at −17°, **1.867 s linear**, first pass 0.12–0.2 s | — | base #F6F5FA (on lilac: #EEEBF6) | — |
| **drops the whole page** (top sheet tease) | page y +181…200, corners 0→20 (Spring 300/30), content −30 counter-parallax | status bar inverts 300 ms | auto-return after 3.3 s on a **critically damped ω 15.5** (540 ms) | soft at bottom, land on return |
| **expands card → full screen** | size → 375×812 on MOVE, radius → 0 (200 ms) | outgoing view ×1.3 + fade out 200; incoming ×0.8→1 on MOVE + fade in 200, +10 ms | or scale 80→100 % custom bezier 400 ms | medium |
| **is a modal bottom sheet** | y 100 % → 0 on MOVE | scrim 0.276–0.4 s | dismiss > 100–120 px or > 600–700 px/s | light on close |
| **is selected** (chip, pill, row) | no movement; press dip 1 → 0.96 → 1 in 340 ms | fill + stroke cross-fade 200–260 ms | — | tap |
| **pops / celebrates** (badge, coin, like) | in-place scale on a livelier spring (ζ 0.45–0.55) | — | reward only — never on task UI | pop at the overshoot peak, success on completion |
| **errors** | 340 ms decaying shake 4/3/2/1 px | red 200 ms | drop-pill toast holds 0.8 s, field auto-resets | error |
| **is scroll-linked** (collapsing header) | scroll picks a *target* with hysteresis; ONE spring (response 0.34, ζ 0.86) animates; pinned layers are CSS `sticky` | — | collapse > 12 px, expand < 4 px | selection on flip |

Full recipes with every delay: [choreography.md](references/choreography.md).

## Rules that came from real feedback

- **One curve, one start frame.** Multi-layer transitions that start together on one curve read smooth;
  staggered fades plus differently-timed moves read "jerky" (NANO OTP back, Home reveal, header collapse —
  each rejected until unified). Stagger only independent items.
- **Smooth > snappy, no visible bounce on task UI.** Overshoot ≤ 1.3 % (ζ ≥ 0.8) for anything the user is
  working with; ζ < 0.5 wobble was called "jittery"/"vibration". Rewards (like, coin) may use ζ 0.45–0.55.
- **Exits are faster and quieter than entrances**, ordered bottom→top, and the next content waits for the exit.
- **Motion over fade for opaque things.** Never fade a white card over a dark scrim, never cross-fade two cards
  in the same slot, never fade three stacked cards at once — reveal the front, fan the others out from under it.
- **Text never scrubs with the finger** and never scales/stretches in a transition: dim during the drag, swap on
  its own clock after commit.
- **No decorative extras that weren't asked for**: sheens, outside glows/halos, ripples, 3D tilts on rails,
  liquid "goo" necks and drag cues were each added once and removed on request.
- **Animate transform/opacity only** (plus clip-path, colour). Never animate height/top above a product grid —
  jump the box, slide an opaque grid with `translate3d` on the same spring.
- **Respect reduced motion**: movement → instant, fades kept (≤ 200 ms), loops stopped, haptics unchanged.

More verdicts by project: [taste.md](references/taste.md).

## References

| File | Read it when |
|---|---|
| [tokens.md](references/tokens.md) | you need any value in a specific platform format (CSS, WAAPI, motion/react, Reanimated, SwiftUI, UIKit, Compose, Figma), the secondary spring library, durations, or legacy/kit aliases |
| [choreography.md](references/choreography.md) | building a specific pattern: push, sheet, top-sheet drop, search→suggestions→PLP, widget reveal, expand, photo viewer, toast/error/success, loaders, page loader, header collapse, ticker, like |
| [gestures.md](references/gestures.md) | anything driven by a finger: tap vs drag, axis lock, velocity, projection, paging, rubber band, dismiss, edge-swipe, scroll snap |
| [haptics.md](references/haptics.md) | choosing or implementing haptics (vocabulary, iOS/Android mapping, the web 3-channel engine, iOS Safari rules) |
| [protopie.md](references/protopie.md) | reading a ProtoPie Cloud link, converting Tension/Friction, authoring in ProtoPie, or the stored-vs-rendered bezier trap (`.claude/skills/noon-motion/scripts/pp_extract.py`) |
| [implementation.md](references/implementation.md) | writing the code: sampled springs, `linear()`, WAAPI interruptibility, rAF-integrated gesture springs, sequencing, performance, reduced motion |
| [edge-cases.md](references/edge-cases.md) | platform traps (iOS Safari, WebKit, Android, preview pane, Lottie, video) and the QA checklist |
| [taste.md](references/taste.md) | the user's approved/rejected log per project — check before proposing a style |
| [sources.md](references/sources.md) | where each value came from (ProtoPie ids, recordings, Figma nodes, project files) |

`.claude/skills/noon-motion/scripts/spring.py` prints a spring in every format (and its `linear()`); `.claude/skills/noon-motion/scripts/pp_extract.py <link> --fit`
pulls a shared pie's authored settings and fits its recordings.
