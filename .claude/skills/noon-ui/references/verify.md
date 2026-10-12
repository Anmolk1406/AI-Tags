# Verify

A screen is done when it builds cleanly, renders without errors, uses only kit parts and tokens, and a noon designer looking at the screenshot would not spot a foreign part. You find faults by looking, so look first.

## Commands

Run from the repo root. The dev server must be running for the browser checks (`npm run dev`, port 5180; if Vite picks another port, prefix the scripts with `PORT=<port>`).

| Command | What it proves |
|---|---|
| `npm run typecheck` | App and library typecheck. Token names used through `ref.*` are typed, so typos fail here. |
| `npm run lint:tokens` | Raw hex / rgba / font literals per folder. Must be 0 for `src/components`; keep the folders you touched at 0 (`npm run lint:tokens -- -v src/flows/<id>` lists findings). |
| `npm run check:routes` | Every registered screen renders with no console errors and no placeholders. |
| `npm run test:journeys` | Behaviour, not just rendering: `scripts/journeys.mjs` walks the core journeys (search → PLP hand-off with no empty frame and a still bar · PLP quick-pill filter on / off · Sort sheet reorders · PLP → PDP → Add to cart → Back keeps the results · cart summary open / close → Checkout, through the noon One push) and fails on any console error. Checkpoint screenshots in `test-results/journeys/<journey>/`. Starts its own Vite server unless `PORT` is set; `-- <name>` runs one. Add a journey when you build or change a flow's interactions (tap with `tap()` on animating chrome; match buttons by exact name). |
| `node scripts/shot.mjs <flow>/<screen> /tmp/x.png` | Screenshot of one screen. Add `--scroll <y>` to see below the fold, `--click "<selector>"` to open a sheet or tap through, `--type "<text>"`, `--wait <ms>`. |
| `npm run visual:ref` | **Reference fidelity** against external references in `visual/refs/` (Figma exports, real-app screenshots; `manifest.json` = route, selectors, viewport, crop, masks, threshold). Renders the route at the reference's width, captures the element at its scale, fails on a size mismatch (> `sizeTolerance` px) or a pixel diff above `threshold`, and lists the worst 24px regions; images in `test-results/visual-ref/<name>.{kit,ref,diff}.png`. Add a reference for every screen you map from Figma or bappzaar screenshots: export the frame (Figma `get_screenshot`), find the real top-left (exports carry shadow bleed), mask only data that legitimately differs (prices, counts), start at a 3–8% threshold. Never put a kit screenshot in `visual/refs/`. |
| `npm run visual:snap -- <dir>` / `npm run visual:diff -- <a> <b>` | Pixel regression across every screen; use around any change to a shared component or token. |
| `npm run assets:check` | No duplicate or oversized assets (after `npm run assets:optimize`). |
| `npm run verify` | typecheck + token lint + asset check + library build; run before calling the work done. |
| `npm run skill:check` | The skill's references still match the code (run after adding components, tokens, transitions or flows). |

## Rendered is not approved

A screen that renders without errors is not "done". It is done when (1) `npm run visual:ref -- <name>` passes for its references, or there is no reference and you compared your screenshot with the source side by side and listed every difference; (2) `npm run test:journeys` passes for the flows you touched; (3) its `ScreenDef.verified` date is set. If a reference fails and the cause is outside your change (another edit, a data difference), report it — don't raise the threshold or add a mask to make it pass.

## Screenshot review

Screenshot every screen you built or changed, at the top and scrolled, and every sheet and state (empty, loading, selected, error). Read each PNG. Then check:

**Structure**
- The screen matches the plan (or the reference): same sections, same order, same primary action.
- Header, content and footer sit inside the safe areas; the footer clears the home indicator (`--nk-inset-bottom`).
- Nothing is clipped, overlapping or overflowing horizontally; long copy wraps or truncates cleanly.

**Kit parts**
- Every button, price, pill, tag, row, card, switch and checkbox is the kit component, not a look-alike.
- Prices show the dirham sign, not "AED".
- Icons come from `Icon` / `MaskIcon` at the sizes other flows use.

**Tokens**
- Colours, type, spacing and radii match neighbouring flows. Put your PNG next to the closest existing screen (`node scripts/shot.mjs orders/list`) and compare rhythm: section gaps, card padding, title sizes.
- `lint:tokens` is at 0 for the flow folder.

**Motion**
- Pushed screens transition, sheets slide up, lists stagger in once and settle, presses give feedback.
- Nothing loops forever except intended carousels or Lotties; reduced motion still works.

**Behaviour**
- Every tappable element does something: navigates, opens a sheet, toggles state or shows a toast. No dead buttons.
- Back returns to where the user came from; the page URL updates to the screen's path.
- Shared state is consistent across flows (add to cart here shows in the cart flow).

## Common faults

| Fault | Fix |
|---|---|
| Raw `#hex` or `font: 600 14px` in a CSS module | Look it up in `scripts/token-map.json`, use the token. |
| Footer button sits on the home indicator | Put it in `Screen`'s `footer` with `padding-bottom: calc(var(--nk-inset-bottom) + …)` as other flows do. |
| Content scrolls under a sticky header | Pass the header through `Screen header`, not inside the scroll content. |
| A screen opens but isn't in the URL bar | Add `path` to the `ScreenDef` or an alias in `src/kit/routes.ts`. |
| `check:routes` shows a placeholder | The `ScreenDef.component` is still the scaffold or `Placeholder`; build it or remove the screen. |
| A copied reference colour | Snap it to the semantic token for its role (`tokens.md`). |
| Ad-hoc `@keyframes` | Use a recipe, preset or registered transition (`motion.md`). |
| A new component duplicates a central one | Delete it and use the central component, adding a variant there only if it is a real noon variant. |
