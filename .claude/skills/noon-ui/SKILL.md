---
name: noon-ui
description: Build noon app screens and whole clickable flows with the @noon/flow-kit UI kit — noon design tokens, central components, assets, motion and 17 ready-made flows ported from the real noon app. Use this whenever someone asks to build, design, prototype, mock or restyle any noon page, screen or flow ("build a loyalty page", "make a referral screen", "new checkout step", "update orders to match this screenshot"), or shares a reference (Figma, screenshot, competitor app, sketch) to rebuild in noon's design language, even if they never say "flow kit". It routes to a screen skill (/home-page, /search, /cart, /checkout, /pdp) when one exists. Works inside the flow-kit repo (src/flows/<flow>).
---

<!-- planned: pdp/oos, home/campaign -->

# noon UI

This skill turns "I want to build a <flow> page" into a finished, clickable noon flow in this repo: every screen wrapped in `Screen`, styled only with `--nk-*` tokens, built from the central components and real assets, moving with the kit's transitions and recipes, registered at a URL in the dev preview, and checked visually. When the user shares a reference, you take its **structure and intent** and rebuild it in noon's language; you never copy its colours, fonts or spacing.

The kit ships 17 flows and 145 screens ported 1:1 from bappzaar (the noon React Native app) and the noon Figma files. They are the quality bar and your first source: open the closest flow before you write anything.

## How the skills fit together

```
USER REQUEST
     │
     ▼
noon-ui  (this skill: classify, route, house rules)
     │
     ├───────────────► DESIGN SYSTEM  references/tokens.md · components.md · icons.md · assets.md · motion.md
     │                       │
     ▼                       │
SCREEN SKILL  /home-page /search /cart /checkout /pdp   (or the blueprints in references/flows.md)
     │                       │
     ▼                       │
FLOW SPECIFICATION  <skill>/spec.md — screens, sections, data, routes, design source, acceptance
     │                       │
     └──────────┬────────────┘
                ▼
EXISTING CODEBASE  src/flows/<flow> · src/components · src/foundations · src/motion · src/assets
                ▼
GENERATED INTERFACE  new / changed screens, registered in src/flows/index.ts + src/kit/routes.ts
                ▼
VISUAL VALIDATION  references/verify.md · scripts/snap.mjs · read every PNG against the spec
```

### Screen skills

| Invoke | Builds | Flow in code | Spec |
|---|---|---|---|
| `/home-page` | The home feed and campaign landing pages (Homepage Revamp 2025) | `src/flows/home` | `../home-page/spec.md` |
| `/search` | Search entry, recent / trending, suggestions, hand-off to results | `src/flows/search` (+ `plp`) | `../search/spec.md` |
| `/cart` | Cart with shipment groups, carousels, coupon, payment offers, states | `src/flows/cart` | `../cart/spec.md` |
| `/checkout` | Checkout sections, payment methods, slide to pay, confirmation | `src/flows/checkout` | `../checkout/spec.md` |
| `/pdp` | Product detail page, its sheets and out-of-stock / newer-model states | `src/flows/pdp` | `../pdp/spec.md` |

Invoke one by typing it (`/home-page build a Ramadan campaign home`), or just describe the page: Claude loads the matching screen skill by its description. Each screen skill follows this skill's workflow and house rules and adds its own spec, sources and checks. For any other page (orders, returns, account, loyalty, membership, wishlist, deals, onboarding), use the blueprints in `references/flows.md`; when one of those grows a spec, give it a screen skill (see "Adding a screen skill").

## The one idea that matters

**Compose, don't invent.** A noon screen is the same few parts arranged for a purpose: `Screen` + a header + sections of cards, rows, rails and grids + a sticky footer `Button`, all on tokens. A screen looks off-brand for three reasons, all seen in practice:

- **New primitives.** A hand-rolled button, price, pill or row instead of `Button`, `Price`, `Pill`, `ListRow`, or a flow-local component another flow already has.
- **Raw values.** A hex colour, a `font:` shorthand or a 13px radius instead of `var(--nk-color-*)`, `var(--nk-type-*)`, `var(--nk-radius-*)`.
- **Ad-hoc motion.** A CSS keyframe or a one-off spring instead of a registered transition, a recipe or a motion preset.

The fix is the same each time: find the kit piece that already does it, and only when none exists, add a flow-local one built on tokens.

## Workflow

Work in this order. Write the plan before any code; most of the quality is decided there.

1. **Classify and route.** Tell the user in one line what you'll build:
   - **Screen**: one new or changed screen in an existing flow.
   - **Flow**: a new flow of 2–8 screens (e.g. loyalty: hub → tiers → rewards → reward sheet → history).
   - **Restyle from reference**: an existing flow updated to match a shared reference (`references/from-reference.md`).
   If a screen skill covers the page, load it and follow its spec. Build without asking unless the request is ambiguous about *which* flow or *what the user does* on it; make reasonable assumptions and list them at the end.
2. **Read the existing code.** `references/flows.md` has the catalogue and blueprints. Open the closest flow's `index.ts`, main `*Screen.tsx`, `data.ts`, `tokens.ts`, `components/` and any `MAPPING.md` / `FIGMA-MAPPING.md`. Reuse its sections, flow-local components and patterns.
3. **Write the flow specification.** For each screen: id, title, URL path, presentation (push / sheet / modal / tab), header, sections top to bottom with the component for each, footer, data, states (empty, loading, error), and how the user moves on (`nav.*` call + transition). Write the copy now: short, sentence case, verbs on buttons. A screen skill's `spec.md` is this, already written; adapt it to the request.
4. **Scaffold.** New flow: `npm run new-flow -- <id> "Title" "Group"` (creates `src/flows/<id>/` and registers it in `src/flows/index.ts`). Add a page URL alias in `src/kit/routes.ts` (or `ScreenDef.path`), e.g. `/loyalty`.
5. **Build from the design system.** Skeletons from `references/screen-recipes.md`; components from `references/components.md` (real props); system icons from `references/icons.md` (`<OriginIcon name>`); images, logos and Lotties from `references/assets.md`. Copy and mock content in `data.ts` (products from `src/mocks/products.ts`, prices with the dirham sign `currency`, never "AED"). Shared state: `useDemoStore()`, `useMembership()`; flow state with `createStore` in `store.ts`.
6. **Style with tokens only.** `references/tokens.md`. CSS modules with `var(--nk-*)`; in TS, `ref.color(...)` / `ref.type(...)`. A value with no token goes in the flow's `tokens.ts`. Never rename or remove an existing token.
7. **Add motion.** `references/motion.md`. Pushed screens get a transition, sheets present as sheets, lists stagger in once, presses give feedback through `Pressable` / `Button`, success moments use the existing Lotties.
8. **Register and document.** Every `ScreenDef` gets `title`, `notes` (what to try) and `source` (bappzaar path, `Figma <fileKey> · <node>`, or `reference: <what the user shared>`). For a Figma port or a reference restyle, write the flow's `FIGMA-MAPPING.md` / `MAPPING.md` table first.
9. **Validate visually.** `references/verify.md`. Typecheck, token lint at 0 for the folders you touched, `check:routes` clean, then `node .claude/skills/noon-ui/scripts/snap.mjs <flow>` screenshots every screen of the flow; **read every PNG** next to the spec, the reference or the closest existing screen, and fix what differs. Iterate until a noon designer would not spot a foreign part.

## House rules (short form)

- **Every screen** is `<Screen header footer>`; it owns the safe areas and the scroll (`.nk-scroll`). Pushed screens use `<Header>`; tab roots use the flow's own top bar. Sheets (`presentation: 'sheet'`) render bare content; the navigator supplies the sheet chrome.
- **Navigation** only through `useNav()`: `push / sheet / back / replace / reset / popToRoot / switchTab / toast`. Routes are `flow/screen`. Page URLs live in `src/kit/routes.ts`.
- **One folder per flow**: `index.ts` (defineFlow), `tokens.ts`, `data.ts`, `*Screen.tsx`, `*.module.css`, `components/` for flow-only parts, optional `store.ts`, `MAPPING.md`.
- **Reuse central components** from `src/components`. A component used by two flows moves there (one folder, tokens only, doc comment naming its source). Flow-specific compositions stay in the flow.
- **Tokens only** in components and flow CSS/TSX. `npm run lint:tokens` stays at 0 for `src/components` and the folders you touch; `scripts/token-map.json` maps literals to tokens. Geometry (SVG paths, aspect ratios, 1px hairlines) may stay literal with `// token-lint-ignore — <reason>`.
- **Assets** in `src/assets/<flow>/` (shared ones in `src/assets/shared/`) at about 3× display size, then `npm run assets:optimize`; never hotlink temporary Figma URLs.
- **Preserve 1:1 ports.** Flows ported from bappzaar are the reference implementation. Change one to a new design only when asked; otherwise add new screens (`pdp/oos`, `home/campaign`) next to it. Keep routes and screen ids stable.
- **Source of truth per screen.** Every `ScreenDef` has `source`, and `truth` says which reference wins: `bappzaar` (master is the spec), `figma` (the frame in `source`), `mixed` (Figma look, bappzaar behaviour; the flow's FIGMA-MAPPING.md says which area follows which) or `reference`. Omitted, it's inferred from `source` (`screenTruth` in `src/kit/registry.ts`). Before changing a screen, read its `truth`. When the request, Figma and bappzaar disagree (a footer that is bappzaar in the code but Figma in the frame you were given), **say so and ask** which wins — don't silently pick. After a side-by-side check, set `verified: 'YYYY-MM-DD'` and, if precedence changed, update `truth`, `source` and the mapping file. `npm run skill:check` enforces the fields.
- **Never touch the app shell** for a flow: `src/app/` is only the dev preview and is not part of the package.
- **Keep the package stable**: exports in `src/index.ts` stay backward compatible; add a CHANGELOG line under Unreleased for anything a package user would notice.

## Running it

```bash
npm install
npm run dev                                           # phone preview → http://localhost:5180/<page>, e.g. /homepage, /cart
node scripts/shot.mjs cart/cart /tmp/cart.png         # one screen (--scroll y, --click "<selector>", --type, --wait)
node .claude/skills/noon-ui/scripts/snap.mjs cart     # every screen of a flow → /tmp/noon-ui-snap/cart/*.png
npm run check:routes                                  # every registered screen renders, no console errors
npm run test:journeys                                 # core user journeys in a browser: routes, state, results, no console errors
npm run visual:ref                                    # fidelity vs external references (visual/refs: Figma exports, app screenshots)
npm run verify                                        # typecheck · token lint · assets · library build
npm run skill:check                                   # the skills still match the code (paths, tokens, routes, coverage)
```

If port 5180 is busy, Vite picks the next one; pass `PORT=<port>` to the scripts.

## References

Design system (read as you need them):

- `references/tokens.md`: the token model, every semantic token with its CSS variable, type scale, spacing, radius, shadows, layout, component tokens, Figma variable mappings, and how to snap a reference value to a token.
- `references/components.md`: every central component with real props, variants, usage and gotchas; which flow-local components exist for what; the checklist for a new component.
- `references/icons.md`: the Origin Design System icon library (399 system icons, outline / filled pairs) and how to use `OriginIcon`; pick icons here first.
- `references/assets.md`: asset folders, logos and badges, Lotties, fonts, and the workflow for adding an asset.
- `references/motion.md`: presets, screen transitions, recipes, and motion patterns taken from real flows.

Flows and screens:

- `references/flows.md`: anatomy of a flow (`defineFlow`, `ScreenDef`, routes, stores, mocks), the navigation API, the catalogue of all 17 flows with every screen, and blueprints for common requests.
- `references/screen-recipes.md`: canonical screen skeletons copied from real screens.
- `references/from-reference.md`: turning a screenshot, Figma frame or competitor app into a noon flow, or restyling an existing one.
- `references/verify.md`: the commands, the screenshot review checklist and the common faults.

Branch resources (`.claude/resources/`, shared by every skill; read before opening a flow's code):

- `.claude/resources/screens.md`: generated index of every route (URL, presentation, truth, verified, source) and each flow's docs, data / token files and local components.
- `.claude/resources/patterns.md`: the shopping hand-off graph, where state goes, area token files vs param variants, scroll and tab bar, motion reuse.
- `.claude/resources/tooling.md`: lazy screens, tab bar scroll, `screenTruth`, which check proves what, adding a journey or visual reference.
- `.claude/resources/flows/`: one brief per flow (what it is now, pieces, state, recipes, gotchas, known drift). `.claude/resources/README.md` says which skill reads which.

## Adding a screen skill

When a page gets its own design spec, give it a skill so it can be invoked by name:

1. Create `.claude/skills/<name>/SKILL.md` with `name: <name>` (same as the folder) and a description that says when to use it. Copy the structure of `../home-page/SKILL.md`: sources, steps that point back to this skill's workflow, page-specific rules, validation.
2. Write `.claude/skills/<name>/spec.md`: screens with routes, sections in order with components and tokens, data, states, motion, acceptance checklist.
3. Put Figma analyses in `.claude/skills/<name>/references/`.
4. Add it to the table above and run `npm run skill:check`.

## Keeping the skills current

The kit changes; the skills must follow it. After adding or renaming a component, token, transition, recipe, flow or screen, run `npm run skill:check`. It validates every skill: frontmatter, that every file path, `--nk-*` variable and `flow/screen` route mentioned in the skill files exists, and that the references cover everything in the code. Fix what it lists, keep entries in the same format, and add a line to `CHANGELOG.md`.
