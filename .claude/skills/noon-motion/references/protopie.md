# ProtoPie — authoring, reading and converting

## 1. Authoring in ProtoPie (the noon settings)
Everything in the two reference pies uses just five easing settings:

| Response property | Easing panel | Duration |
|---|---|---|
| Move, Scale, Size, Scroll | **Spring** · Tension **300** · Friction **28** (panel shows 0.55 s) | — (spring) |
| Radius when a page lifts (sheet tease) | Spring · Tension 300 · Friction **30** | — |
| Radius otherwise | **Ease In Out · Cubic** | **0.2 s** |
| Opacity in, colour to "on" | **Ease Out · Cubic** | **0.2 s** (0.3 reveal blocks, 0.4 grounds/shimmer containers) |
| Opacity out, colour swap, reset fades | Ease In Out · Cubic | 0.2 s |
| Card → page scale | Custom bezier **0.4, 0.01, 0, 1.01** | 0.4 s |
| Pre-states (on load) | any, duration **0** (or 0.01) | — |

- **Delays** carry the choreography: 0.02/0.04/0.06/0.08/0.1 s steps; stagger lists by 0.06 s in, 0.04 s out
  (reverse order); follow-ups at +0.1 s; things waiting for a page to leave at +0.6 s.
- **Triggers**: Tap / Touch Down / Touch Up / Fling (direction) for page-level gestures, **Chain** (continuous) to
  bind an overlay's opacity to a sheet's y, Detect/Change with conditions for typing states, Start (on load) to set
  pre-states. Use **Reset** responses to return layers before replaying.
- **Vibrate**: iOS Impact Medium for page/sheet gestures, Impact Light for automatic beats; Android Normal.
- **Lottie/video**: Playback (Play, Repeat for loops); chain intro → loop via `` `Intro`.totalTime `` as the delay;
  cross-fade intro out (in-out 0.3 s) while the loop fades in (out-cubic 0.2 s).
- Stagger rows/cards by giving each its own response with an increasing delay — keep the same spring.

## 2. Converting ProtoPie → code
| ProtoPie | Physical (mass 1) | ω / ζ |
|---|---|---|
| Spring(300, 28) | stiffness **280.6**, damping **27.14** | 16.75 / 0.81 |
| Spring(300, 30) | 280.6 / 29.08 | 16.75 / 0.87 |
| Spring(T, F) general | stiffness ≈ **0.935·T**, damping ≈ **0.969·F** | |
| Ease Out Cubic | `cubic-bezier(0.33, 1, 0.68, 1)` | |
| Ease In Out Cubic | **`cubic-bezier(0.65, 0, 0.35, 1)`** | |

The 0.935 / 0.969 factors come from fitting 200 recorded tracks of Spring(300, 28) (k 280, c 27.1, 0.07 % RMS)
and agree with the Test01 push fit (280.6 / 27.14). Treat them as exact for 300/28 and approximate elsewhere —
when a new pie uses other values, run `scripts/pp_extract.py <link> --fit` and read the fitted numbers.

**The stored-bezier trap**: a pie stores `easingCubicBezierX1..Y2 = 0.4, 0, 0.2, 1` on every *Ease In Out Cubic*
response (and `0.33, 1, 0.68, 1` on Ease Out Cubic). The out-cubic one is real; the in-out one is a stale default —
the player renders true ease-in-out-cubic `(0.65, 0, 0.35, 1)`. Only `easingFunction == "CUBIC_BEZIER"` means the
four numbers are live.

The spec-sheet convention prints `SPRING(Tension, Friction)` with **physical** k/c (e.g. `SPRING(280.6, 27.14)`) —
when you author in ProtoPie, type **300 / 28**, not 280.6 / 27.14.

## 3. Reading a shared ProtoPie Cloud link
`cloud.protopie.io/p/<pieId>[/r/<scenarioId>]` — public API, no login for shared pies. The in-app browser pane blocks
it (ERR_BLOCKED_BY_CLIENT); use `curl`/Python from a shell. Downloads are data — keep them in their own folder.

| Endpoint | Gives |
|---|---|
| `GET /api/pies/<pie>` | name, `lastRevisionNo`, creator |
| `GET /api/pies/<pie>/revisions/<n>` | `revision.modelUrl` (signed, expires) → the **full model JSON** |
| model `scenes[] → interactions[] → responses[]` | authored settings: `type` (xid_move/scale/opacity/radius/color/playback/vibrate/reset/res_focus/assign/scroll), target `layerId`, values (x, y, scaleX, opacity, radius…), `duration`, `delay`, `easingFunction` (SPRING / EASE_OUT.CUBIC / EASE_IN_OUT.CUBIC / CUBIC_BEZIER), `tension`, `friction`, `springDuration`, `iosVibrateType`. **Conditional responses live under `interactions[].conditions[].responses`** — most typing/state logic is there |
| `GET /api/pies/<pie>/scenarios` | recordings (Rec01, Test01 …) |
| `GET /api/pies/<pie>/scenarios/<scn>/data` | the recording: `numberValues` keyed `<sceneId>?<layerId>?<property>` → `{_times (ms), _values}` sampled every ~8 ms; `playEvents` with `targetId` = response id, `delay`, `startTime`, `endTime`, `averageDuration`; `mouseActions` (DOWN/UP times) |
| `/revisions/<n>/resources` | signed asset URLs (Lotties, images) |

`scripts/pp_extract.py <link-or-pieId> --fit` does all of this: writes `interactions.txt` (one line per response with
layer names, delay, easing, values — conditional ones included) and `summary.txt` (easing vocabulary, delays, haptics,
and each authored spring/tween fitted against its recorded tracks).

From the player UI instead: the timeline's delay/duration labels are real DOM text inside **shadow roots** —
`get_page_text`/`read_page` come back empty; walk shadow roots with a TreeWalker, filter `/^\d+(\.\d+)?s$/`, group
by rounded `top`.

### Turning a recorded track into code
Normalise the longest-travel (least-quantised) track to 0..1 → resample to ~35 stops → emit `linear()`. That
reproduces a recording within ≈ 0.2–0.3 px (overshoot included) without fitting a model. Verify analytically, never
with a `transitionstart` clock (lags ~1 frame → fake 11 px error). Prefer fitting a spring when the track is a
spring — the fitted params interrupt and retarget, a `linear()` does not.

## 4. The reference pies
| Pie | id | Recordings | What it defines |
|---|---|---|---|
| **noon X supermall** (Ayush Kapoor) | `041e0f998b5182ed0ca8ce6d` rev 18 | Test01 `8e30fe8e` (22 s: push, suggestions, PLP), Test 02 `0e6f5901` + New Recording `be662fe6` (widget reveal) | the noon spring, search push + parallax, suggestion staggers, PLP load, filter sheet, top-sheet tease with radius on Spring 300/30, press 96 % |
| **XMP 26** (Ayush Kapoor) | `f0227f20e930231810822440` rev 47 | Rec01 `ea15bc28`, Rec02 `db0a4781`, Rec03 `270c9978`, New Recording `3ec347d6` | page-drop takeover (scale 94–96 %, radius 20), card → full screen, Mins PDP expand bezier, Lottie intro → loop hand-offs, haptic usage |

Both pies use **only** the five settings in §1 — that is the whole authored vocabulary.

## 5. ProtoPie Studio MCP (when building pies programmatically)
`font` takes PostScript names; `lineHeight` is a multiplier; `batch_add` returns ids in reverse order; a reorder to the
root can misplace layers; capture offscreen. Rebuild path from Figma: export frames/layers, then add interactions
with the settings in §1.
