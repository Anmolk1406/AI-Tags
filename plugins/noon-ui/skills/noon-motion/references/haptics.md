# Haptics

## 1. Vocabulary (use these names everywhere)
| Kind | iOS (UIFeedbackGenerator) | Android `vibrate` | When | ProtoPie Vibrate |
|---|---|---|---|---|
| `tap` | impact light | 12 ms | primary press: buttons, rows, pills, cards, tabs | Impact Light |
| `tick` | selection | 8–10 ms | detents, rows arriving, ruler ticks (≥ 40 ms apart), threshold crossings, page changes | — |
| `snap` | impact medium @0.8 | 18–22 ms | snapping into a slot/detent, a new product taking the slot | Impact Medium |
| `edge` | impact rigid @0.6 | 15–18 ms | hitting a limit (rubber band starts, stepper max) — once | — |
| `soft` | impact soft @0.5 | 10–14 ms | something settling: drop reaching bottom, banner in place, page loader land, panel opens | — |
| `land` | impact soft @0.4 | 10–12 ms | list/cards landing, page returning home | — |
| `pop` | impact medium @0.7 | 18–22 ms | stretch peak, nudge, badge/coin appearing (fire at the overshoot peak) | — |
| `medium` | impact medium | 14–22 ms | gestures that move a whole page or sheet (fling, pull, takeover), like | **Impact Medium** (14× in XMP 26) |
| `success` | notification success | [14, 50–60, 20–28] | order placed, OTP verified, "on the list" | — |
| `error` | notification error | [45, 40, 45, 40, 45] | wrong code, failed payment | — |

ProtoPie "XMP 26" uses **Impact Medium** on every tap/fling that moves the page or a sheet and **Impact Light**
for auto-played beats (e.g. +0.8 s into an intro) and conditional pill swaps; Android `NORMAL`.

## 2. Grammar
- **One haptic per beat, only with a visible change.** Nothing for passive changes (typing results, auto
  carousels, tickers, header collapse, FTUX glides, idle animation).
- **Time it to the visual beat**, not the input: pop at the overshoot peak, land when content arrives (< 0.5 px),
  soft when a panel opens, medium at impact.
- **Release softer than press** (press medium 0.8 / release light 0.42): equal weights read as a double tap.
- Ticks are texture (selection); "armed/committed" is one distinct firm hit.
- Rank when several want to play: tick < tap/soft/land < edge/snap < pop < success/error — the strongest wins.
- **Merge window 40 ms**: a tick inside it is dropped, a stronger kind is deferred to the end of the window (the
  native host dedupes < 35 ms and would swallow it otherwise).
- Unchanged under reduced motion (they are feedback, not motion).

## 3. Web implementation (3 channels, exactly one plays per pulse)
1. **Native host** — `window.webkit.messageHandlers.haptic.postMessage({ type, intensity })` (Vercel Sim apps, any
   WKWebView). Real generators, works from timers.
2. **Android** — `navigator.vibrate(ms|pattern)` only after `navigator.userActivation.hasBeenActive` (otherwise
   "Blocked call" floods the console); pulses ≥ 8–10 ms (shorter is silent on most motors).
3. **iPhone Safari 17.4/18+** (no Vibration API) — `.click()` a hidden `<label><input type="checkbox" switch></label>`:
   plays the system tick, one strength, **only inside a real activation** — `pointerup`/`touchend`/`click`, not
   `pointerdown`/`pointermove`. Strength = a burst of ticks 25–90 ms apart (success 2 clicks 90 ms apart, error 3 at
   80 ms). Use `display:none` on the label, restore focus afterwards, never fire while a text field is focused.
   - Queue gesture haptics and flush on the capture `touchend` (40 ms fallback) so drag results still play.
   - Hold a timer-driven pulse ≤ 700 ms for the next release; beats ≥ 1 s after the tap cannot play on iOS Safari
     (native/Android only).
   - Guard the global "tap haptic" click listener with `e.isTrusted`, or the label click re-enters forever.

`.claude/skills/noon-motion/assets/noon_sas_motion.js` → `haptic(kind)` implements all of this. Map taps declaratively (first match wins), e.g.
OOS variant → error-ish warning, add-to-cart → medium, tabs/chips/segments → tick, cards/photos/links → tap, panels
→ soft; inside horizontal scrollers only on a clean release (< 6 px, < 600 ms).

## 4. Native
- SwiftUI/UIKit: `prepare()` generators ahead of the gesture; pulse trains (pull ramps) need a `Timer` in
  `.common` run-loop mode or they stop during drag tracking. GyroQR pull ramp: a pulse every 60 ms, strength
  0.44 → 0.90 (curve^1.4), light < 0.34 / medium < 0.72 / heavy above. Settle = rigid 1.0 then medium 0.55 85 ms later
  ("bedding in").
- Android: `HapticFeedbackConstants` CLOCK_TICK (tick), VIRTUAL_KEY (tap), CONFIRM/REJECT (success/error) where
  available, else the vibrate patterns above.
