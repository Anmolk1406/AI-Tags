# Sources

Values were extracted on 2026-10-18 from the shared ProtoPie files and the author's local prototype workspace
(the project folders below; not part of this repo). Re-run `scripts/pp_extract.py` on a pie when it changes.

## ProtoPie (ground truth)
| Pie | Link | Used for |
|---|---|---|
| noon X supermall | cloud.protopie.io/p/041e0f998b5182ed0ca8ce6d — Test01 `r/8e30fe8e`, Test 02 `r/0e6f5901`, `r/be662fe6` | noon spring, push parallax, suggestion/PLP choreography, widget reveal, press, sheet, top-sheet tease |
| XMP 26 | cloud.protopie.io/p/f0227f20e930231810822440 — `r/3ec347d6`, Rec01 `ea15bc28`, Rec02 `db0a4781`, Rec03 `270c9978` | page-drop takeover, card expand, Mins PDP bezier, Lottie hand-offs, haptics |

## Projects (folder → what it contributed)
| Project | Contributed |
|---|---|
| this repo: `src/motion/` (presets, transitions, recipes, haptics, reducedMotion) + `.claude/skills/noon-ui/references/motion*.md` | kit tokens, screen transitions, which-motion table, reduced-motion matrix, bappzaar 1:1 values |
| `noon-home/`, `product-upscale/`, `noon-Interaction-handoff-tool/` | Test01 port: push, edge swipe, suggestions, PLP load, shimmer, widget reveals, roster slider, brand rail, haptics engine |
| `filter-highlight/` | dot → pill reveal, `follow()` springs, highlight lift |
| `noon-x-supermall/` | top-sheet drop + critically damped return, bolt curve, FANudge pill, banner FLIP, search skeleton |
| `login-email-video/` (noon NANO) | central PP re-timing, toasts, error/shake, OTP wave/success, wallet gestures, header spring, notifications |
| `noon-homepage/` (Loader Glass) | tab-switch page loader, tab pill spring |
| `noon-pdp-v2/`, `noon-pdp-lg/`, `noon-pdp/` | photo viewer flights, paging physics, dismiss, detail morph, like flight, Liquid Glass bar, tactile key |
| `platform-hijack/`, `xmp-inter-op/` | XMP 26 port, pull-down rubber band, takeover commit, carousel |
| `gifting-registry/` | scroll-bound collapse, parallax rates, 20 % velocity-aware snap |
| `noon-cart/` | scroll physics, two-spring (lively + firm) morphs |
| `noon-reels-web/`, `NoonReels/`, `shop-reels/`, `reels-product/` | Field DS springs, pager, sheets, like bursts, tail trimming |
| `noon-loaders/` | skeleton sweep, messaging loader, inline loaders |
| `riveo-whats-new/`, `health-flow/`, `orbi-soft-body/`, `noon-home-page/`, `nano-old/` | page curl, sampled-spring app, 3D object physics, sheet + mascot, native haptic grammar |

Each project's spec sheet (`<project>/spec/`) shows its timelines live; `noon-home/spec` and `filter-highlight/spec`
are current, `product-upscale/spec` describes a removed widget.
