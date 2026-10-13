# Skill resources

Shared material the noon skills load **on demand**. It describes what is on the branch now, so a skill can start from the real state of a flow instead of re-reading the whole folder. The skills themselves (`.claude/skills/*`) hold the rules and specs. These files hold the analysis.

| File | What it gives you | Kept current by |
|---|---|---|
| `screens.md` | every route: URL, presentation, truth, verified date, source; each flow's docs, data/token files and local components | **generated**: `npm run resources:build` (`skill:check` fails when it's stale) |
| `patterns.md` | the shopping hand-off graph, where state goes, area token files vs param variants, scroll/tab bar, motion reuse | hand-written |
| `tooling.md` | lazy screens, tab bar scroll, `screenTruth`, which check proves what, how to add a journey or visual reference | hand-written |
| `flows/<flow>.md` | per-flow brief: what the screen is now, pieces, state, recipes, gotchas, known drift | hand-written |
| `flows/categories-views.md` | every view the Categories tab links to: 29 tiles, each sub banner's link, where the app opens it, page type and sections | **generated** from `data.live.ts` + `linkRouting.ts` (+ `cms-pages.json` after `npm run categories:fetch`) |

## Which skill reads what

| Skill | Read first | Then, as needed |
|---|---|---|
| `/noon-ui` | `screens.md`, `patterns.md` | the brief of the closest flow; `tooling.md` before validating |
| `/home-page` | `flows/home.md` | `patterns.md` → tokens, data-driven screens |
| `/search` | `flows/search.md`, `flows/plp.md` | `patterns.md` → scroll |
| `/pdp` | `flows/pdp.md` | `patterns.md` → tokens, scroll |
| `/cart` | `flows/cart.md` | `flows/checkout.md` (hand-off), `patterns.md` → state |
| `/checkout` | `flows/checkout.md` | `flows/cart.md`, `flows/orders.md` (confirmation → orders) |
| categories / category landing pages via `/noon-ui` | `flows/categories.md`, `flows/categories-views.md` | `flows/home.md` (module renderers), `flows/plp.md` (catalog pages) |
| orders / reviews / account / other pages via `/noon-ui` | `flows/orders.md`, `flows/reviews.md`, `flows/account.md`, `flows/other-flows.md` | `patterns.md` |

## Rules

- **The code wins.** These files are a map, not the spec. When a brief disagrees with the code, trust the code and fix the brief in the same change.
- Never edit `screens.md` or `flows/categories-views.md` by hand.
- After changing a flow, update its brief: screens, pieces, gotchas. Run `npm run resources:build` and `npm run skill:check`. Both check this folder: every path, `--nk-*` var and route mentioned must exist.
- A new flow gets a brief in `flows/` (or a section in `flows/other-flows.md` while it's small) and a row in the table above.
