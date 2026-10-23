# Edge cases, platform traps, QA

## iOS Safari / WebKit
- Synthetic `click` is delayed 150–350 ms or dropped after finger drift → act on `pointerup` (≤ 10–12 px, ≤ 700 ms),
  swallow the following click 900 ms, `touch-action: manipulation`; iOS fires click on non-interactive elements only
  if they look clickable (`cursor: pointer`). `document.addEventListener('touchstart', ()=>{}, {passive:true})` enables `:active`.
- WebKit decides touch handling from listeners present at touchstart → register non-passive `touchmove` once at
  startup; on iOS `pointerdown` precedes `touchstart`, split by `pointerType`.
- **Blend modes don't cross compositing layers** (multiply/plus-lighter on a bar over a scroller paints raw colours)
  → use normal-blend equivalents; test with blending forced off. A transformed/isolated parent kills blending.
- Never fade a container that holds a `backdrop-filter` (it becomes the backdrop root → flat glass pops); fade layers.
- Keyboard: focus inside the tap (`focus({preventScroll:true})` in `touchend`/`click`, not pointerdown); iOS scrolls
  the page to the field — force `scrollTo(0,0)`; freeze app height while focused; lift UI via `visualViewport`
  (450 ms `(0.32,0.72,0,1)`); 16 px inputs to avoid zoom; un-`inert` before focusing.
- Haptics: switch-tick trick only inside a real activation; never while a text field is focused (see haptics.md).
- Videos: `muted playsinline`; iOS only buffers a video after it played once → prime (play → pause at 0) inside a tap;
  reveal on `playing`; cue UI with `requestVideoFrameCallback` mediaTime.

## WAAPI / CSS
- A delayed WAAPI animation needs `fill: 'backwards'` (or `'both'`) or it shows the end inline style during the delay.
- The `easing` option eases the **whole** multi-keyframe timeline → put easing per keyframe for wiggles/nudges.
- `var()` in WAAPI keyframes is silently ignored → bake literals.
- `fill: 'both'` leaves `style.transform` stale → commit then cancel; cancel by element, not stored handle.
- Keyframe offsets like 1.0000000002 throw → clamp; `finish()` throws on infinite animations.
- Pseudo-element animations aren't in `el.getAnimations()` → `document.getAnimations()` + `effect.pseudoElement`.
- Individual `scale`/`translate` compose **outside** `transform` — don't mix with a translate on the same element.
- One transform per element: stacked scale animations on a glyph and its parent "mush" → one spring on the parent.
- One CSS transform can't delay only its scale → split into two elements.
- Flushing a primed style needs the read assigned (`const f = getComputedStyle(el).transform`).
- `[hidden]` loses to `display:flex` → `[hidden]{display:none!important}`; inline `visibility:'visible'` on a child
  overrides an ancestor's hidden → use `''`.
- Chrome skips inherited visibility flips on children holding fill-both animations → hide with opacity + `inert`,
  cancel animations before removing classes.
- `filter` on an overflow scroller bleeds a dotted row → blur the inner content.
- SVG goo filters (blur + alpha threshold) and live multi-blur SVG filters freeze compositor painting (70–270 ms).
- Overflow-x rows clip vertically → give chips room inside the row (`top:-8; height:+20; padding-top`) for a drop.
- `python -m http.server` sends no cache headers and ignores Range (videos seek to 0) → use the project serve.py.

## Android
- Animated `blur()`/`backdrop-filter` stall (250 ms re-blur when layers above move) → transform + opacity only.
- Lottie canvas renderer seams along masks; lottie_light first-draws are expensive (98 ms) → warm frames while idle,
  play every 2nd frame; heavy Lotties → MP4 or animated WebP.
- Toggling `overflow` on a long scroller froze ~750 ms; `overscroll-behavior: none`, `contextmenu` preventDefault on
  long-press, tap highlight off.
- Vibrate needs user activation and ≥ 8–10 ms pulses. Resize images ≤ 3.5× drawn size.

## Lottie & video hygiene
- Use `animationData.op`, not `totalFrames`, after `playSegments`; `resetSegments(true)` before `goToAndStop(0)`.
- Check loops for a `tm`/`op` mismatch (trim `op` to the true period, e.g. 58 → 57) or a blank frame flashes per cycle.
- Hand off on `enterFrame` before trailing still frames, not on `complete`. Register placement on the last frame
  against Figma. Inline images. Inline SVG needs `display:block` (else +4 px box).
- Same animated-WebP URL shares one timeline → replay via a fresh blob URL.

## The preview pane / test harness
- The in-app preview pane, when hidden or backgrounded, freezes WAAPI at currentTime 0, delivers rAF every ~0.5–4 s,
  throttles timers and shows stale screenshots → **never judge timing there**.

### Verifying motion
1. Evaluate curves analytically (node/python) — `spring.py`, the `linear()` you shipped.
2. Pause `document.getAnimations()` and step `currentTime` in 16.67 ms increments, or run the page on a virtual clock
   (patch `performance.now`, rAF, setTimeout, `Element.animate`) — the spec-sheet `?spec=` shim.
3. For jank: headless Chrome CDP screencast (every painted frame) + A-B-A frame diffs; judge in a production build.
4. Start recorders **before** the trigger; MutationObserver callbacks must buffer records.
5. Synthetic events don't grant user activation (haptics/vibrate won't fire in tests).
6. iOS Simulator drops the second of two quick taps — double-tap can't be tested there; `localhost` may not load,
   use 127.0.0.1.

## QA checklist (run before calling a motion done)
- [ ] Moves on the noon spring (or a named library spring with a reason); fades on the cubic curves; radius on its own clock.
- [ ] Staggers 60 in ↓ / 40 out ↑; exits shorter than entrances; next beat starts on "visually landed".
- [ ] Interrupt it at 30 %, 60 %, 90 %: no jump, reverses from the current value, velocity carried.
- [ ] Gesture: slop/axis lock, release by distance **or** velocity, one page per flick, rubber band at the ends, stale velocity zeroed.
- [ ] Haptic on the right beat (and none on passive changes); iOS Safari path fires on release.
- [ ] Reduced motion: no travel, fades ≤ 200 ms, loops stopped, flow still completes.
- [ ] Transform/opacity only; no height/top animation over lists; images decoded before they fly.
- [ ] Android: no animated blur/backdrop-filter; Lottie throttled; covered views hidden.
- [ ] No overshoot visible on task UI (≤ 1.3 %), no sheen/halo/ripple/3D that wasn't asked for.
- [ ] Measured, not eyeballed: curve evaluated, frames stepped, one real-device check.
