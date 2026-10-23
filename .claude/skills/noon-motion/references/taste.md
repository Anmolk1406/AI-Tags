# Taste log — what the user approved and rejected

Recorded verdicts from the projects. ✓ = approved / kept, ✗ = rejected (don't reintroduce for the same job).

## Cross-project themes
1. **"Smooth, natural, Apple-style"** beats "snappy": no visible bounce on task UI, critically damped returns, one
   curve per transition. Requests to go faster are usually satisfied by **earlier triggers and shorter waits**, not
   by stiffer springs (PLP shimmer 0.83 → 0.2 s, widget wait 400 → 50 ms, FTUX 950 → 700 ms).
2. **Glitch = clocks fighting.** Every "glitchy/jerky" report was fixed by collapsing staggered fades and separately
   timed moves into one start frame and one curve (NANO back, Home reveal, notification stack, header collapse).
3. **Elastic only where it rewards** (like, coin, toast drop, pill grow) — and even there ζ ≥ 0.45; jelly/wobble is out.
4. **No ornament**: sheens, halos, ripples, goo necks, 3D tilts, drag cues, crowns, "1 of N" counters were removed.
5. **Content rides its container**: icons don't animate on their own during a reveal; nothing inside a notification
   card animates; text doesn't scrub with the finger.

## By project
**noon-home / Brand Widget PLP**
- ✓ widget always revealed *from behind* the grid (grid edge = reveal line); ✓ scale + rise on one spring.
- ✓ PLP load made faster by retiming off the rows' exit; ✗ warm/golden shimmer tail (white only).
- ✓ "smooth > snappy, avoid visible bounce" on the brand widget; ✓ rail "snappy with slight elastic, paging" (.34/.74).
- ✗ 3D rail (rotateY either direction, then Z-depth) — "don't reintroduce 3D on these cards".
- ✓ coin "pop up with elastic, not animate position"; ✗ FLIP coin flight.
- ✗ suggestion fill as a shared-element flight and ✗ whole-field fade ("jerk") → ✓ remainder fades in 320 ms.
- ✓ selection circle −6 % (✗ −15 % "too much"); ✗ infinite slider loop → ✓ bounded with rubber band.

**Filter Highlight**
- ✗ sheen and outside halo/ripple — never re-add. ✗ ζ .34 jelly ("jittery"). ✗ icon knob animation.
- ✓ analytic `follow()` springs (one-hump velocity), ✓ lift 110 %, ✓ colour starts as the reveal settles,
  ✓ light-blue highlight (#A6C4FF / #F9FBFF / #2E75FF), ✓ 15 % faster overall.
- ✗ fly-up hand-off first version "very fast"; ✗ liquid neck/fuse.

**noon NANO (login → home)**
- ✓ validate on submit only; ✗ live red, ✗ 700 ms pause trigger, ✗ live success tick.
- ✓ elastic drop toast, ✓ 0.8 s hold, ✗ morph back into a dot on exit.
- ✓ intro "subtle" (ζ .66), ✗ the bouncier first version.
- ✓ one-frame OTP back transition, ✗ staggered version ("jerky").
- ✓ OTP collapse 495 ms, ✗ 710 ms; ✗ Toss merged-pill; tick as video (Lottie lagged).
- Wallet: ✗ pause at "sheet rising", ✓ commit at 80 % without release, ✗ off-screen throw, ✗ same-slot crossfade,
  ✗ drag cue, ✗ edit-state background scale-down, ✗ fake caret.
- Avatar change: ✗ 480/1000 ms "very slow" → ✓ 380/760; glow by opacity only (✗ clip-path wipe).
- Home reveal: ✗ "glitchy/abrupt/too much" → ✓ 3 beats + one soft curve; ✗ mask growing from the card.
- Header: ✗ scroll-scrubbed collapse (three clocks) → ✓ one spring .34/.86 + sticky.
- Notifications: ✓ cards start with the header, ✓ opaque motion-only, ✗ fading white cards over the scrim.

**noon X Supermall**
- ✓ return "smoother and natural" = critically damped 540 ms; ✗ `(0.32,0.72,0,1)` 460 ms, ✗ `(0.25,0.8,0.3,1)` 480 ms.
- ✓ dip 181 px (✗ 201); ✓ search reveal 400 ms / 30 ms stagger (✗ "a bit slow" 680/60).
- ✓ chip grows like the "190m away" pill, 1.2× speed, half overshoot; ✗ crossfade, ✗ pop + ring, ✗ CSS width
  transition, ✗ settle nudge on the chip; ✓ FANudge nudge without tilt.

**Loader Glass (page loader)**
- ✓ "zoom, no sliding"; ✗ zoom to 90 % ("too much") → ✓ 96 %; ✓ hold per iteration 0.5 / 1 / 1.2 / 1.8 s.

**PDP photo viewer**
- ✓ parallax deepened twice (25/10 → 50/32 %); ✗ leading parallax; ✓ container morph keeps the selected size.
- ✗ text scrubbing with the finger ("jerky") → ✓ dim + own-clock swap.
- ✓ detail spring after "spring too pronounced" (ω 20 ζ .92); ✓ mask sweep 300/60 ("smoother").
- Like flight: ✗ "too mechanical", ✗ "spring too abrupt/rigid", ✗ stretch/wobble/breathe ("vibration"), ✗ blue,
  ✗ red Like.mov copy → ✓ white elastic flight. ✗ double-tap like in the final iterations.
- ✓ indicator return faster (1200 → 900 ms, ω 24 ζ 1); ✗ instant cut on customer change ("glitchy").
- ✓ FTUX "smoother + earlier" (during the open flight); ✗ finger-following dissolve.

**Gifting Registry**: ✓ Apple-style smoothness, 20 % snap both ways, bg drift 0.4 (on in every iteration), props
never fade (clip instead), date sinks + fades from the first pixel, card moves down and hides (✗ fade), "+" on one
smoothstep (✗ "too sudden").

**noon Cart**: ✓ more scroll resistance, stiffer ends, snappier return; tab-bar morph made snappier twice
(→ .28/.78 with a firm .9 twin); expand only at top.

**Orbi**: ✗ jelly/soft body ("solid toy ball"), ✗ cursor follow, ✗ four elaborate intros → ✓ scale-from-zero +
360° turn; ✓ visor "snappy with a very subtle elastic"; ✗ shrinking/red on remove.

**noon Reels**: ✓ spring tails trimmed at ±0.5 % (untrimmed = "mushy"); ✗ spring on `:active` press (lag).
**Riveo**: ✗ grey dim/desaturate on the revealed card; ✗ iridescence.
