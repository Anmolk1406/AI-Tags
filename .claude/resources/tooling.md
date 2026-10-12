# Kit infrastructure and tooling

What the kit gives a flow beyond components and tokens, and the checks that prove a change works. The details come from the branch as of 2026-10-13. When this file and the code disagree, the code wins: fix this file.

## Lazy screens: `src/kit/lazyScreen.ts`

- `lazyScreen(() => import('./XScreen'), 'XScreen')` returns a `React.lazy` screen with `.preload()`. The preload and the first render share one download.
  - Use it for every screen in a flow's `index.ts`. `npm run new-flow` generates screens this way.
  - Keep the screen a page opens on eager only when it must paint first. `home/home` is the one example; only `ClassicHomeScreen` is lazy.
- `preloadRoutes(...loads)` fetches the screens a page is about to open, so a hand-off never shows an empty `<Suspense>` frame.
  - Example: `src/flows/search/SearchScreen.tsx` preloads `plp/listing` and `pdp/detail` on mount.
  - Add this whenever a screen pushes another screen straight away (search → results, CTA → sheet).
- `preloadScreens()` is called once by `src/kit/Navigator.tsx`. 1.5 s after first paint it fetches every lazy screen, one per idle slot.
- The Navigator wraps each stacked screen in `<Suspense fallback={null}>`. A screen that suspends renders nothing, never a spinner.

## Tab bar hide on scroll: `src/kit/tabBarScroll.ts`

- This is a port of bappzaar `ScrollVisibilityProvider`. The defaults live in `tabBarScroll`: top 10, activation 150, dead zone 4, hide after 64, show after 24, flick velocity 2.
- Call `useTabBarScrollHide(scrollRef, active, cfg?)`. It returns `{ tabHide, onScroll, reveal, rebase }`.
  - `tabHide` is a MotionValue from 0 to 1 that drives the bar's transform.
  - Pass `onScroll` to `<Screen onScroll>`.
  - Call `rebase(y)` after a programmatic scroll correction. Without it, a variant switch makes the page jump.
- In use: `src/flows/pdp/DetailScreen.tsx` (`useTabBarScrollHide(scrollRef, isTop)`). It came out of the PLP.
- `TabBar` (`src/components/TabBar/TabBar.tsx`) is now bappzaar's native bar 1:1, with no animation.
  - Icons swap selected/unselected instantly, and the label is semibold 14.
  - `layout.tabBar` is 49.
  - Don't add an indicator animation back. The older CHANGELOG line that describes one is stale.

## Source of truth per screen: `screenTruth()` in `src/kit/registry.ts`

- `ScreenDef.truth` takes one of: `bappzaar`, `figma`, `mixed`, `reference`.
- When `truth` isn't set, it is inferred from `source`:
  - a Figma frame plus bappzaar paths → `mixed`
  - a Figma frame only → `figma`
  - a link or `reference:` → `reference`
  - anything else → `bappzaar`
- `verified: 'YYYY-MM-DD'` records the last side-by-side check.
- `npm run skill:check` enforces two rules:
  - every screen has a `source`;
  - an explicit `figma` or `mixed` truth needs the flow's `MAPPING.md` or `FIGMA-MAPPING.md`.
- See `screens.md` for the current value of every screen.

## Smaller kit changes to know

- `haptic(kind)` (`src/motion/haptics.ts`) does nothing before the user's first interaction, so there's no console noise from `vibrate()`.
- Transition `results-fade` (`src/motion/custom/index.ts`) does not fade the incoming layer in. Only the content below the search bar fades. That keeps the search bar steady during search → results.
- `vite.config.ts` sets `assetsInlineLimit: 0`, so images ship as files. Don't import large images expecting base64.
- The dev preview exposes `window.__NK_NAV__ = { route, stack, params }` (`src/app/main.tsx`). The journey tests read it.
- `ProductCard` has a `carousel` prop for home rails. It is compact, uses an image ratio of 1.361 and shows no coupon.
  - Its QuickAdd on a Fashion product with sizes opens `pdp/variants` instead of adding to cart.
- `ProductBoxVertical` (`src/components/ProductBoxVertical`) is the bappzaar PLP grid box. Use it for any listing grid.
- `SearchInput` back / clear / camera are bappzaar artwork in `src/assets/shared/search-bar/`.

## Checks: which one proves what

| Command | Proves | Notes |
|---|---|---|
| `npm run verify` | typecheck (app + lib), token lint, asset budget, lib build | run before you hand over |
| `npm run check:routes` | every registered route renders with no console errors | needs `npm run dev` on 5180 |
| `npm run test:journeys` | core journeys behave, with no console or page errors | starts its own Vite on 5199; `-- <name>` runs one journey; screenshots in `test-results/journeys/` |
| `npm run visual:ref` | fidelity against external references | Vite on 5198; `-- <name>`; outputs in `test-results/visual-ref/<name>.{kit,ref,diff}.png` |
| `npm run skill:check` | skills and resources match the code; `screens.md` is current | run after changing flows, screens, components, tokens |
| `npm run resources:build` | regenerates `screens.md` | after adding or renaming a screen, or changing `source` / `truth` / `verified` |
| `node scripts/shot.mjs <route> <out.png>` | one screenshot to read | `--scroll y`, `--click sel`, `--type`, `--wait` |

### Adding a journey

Append `{ name, title, async run(page, shot) }` to the `journeys` array in `scripts/journeys.mjs`.

- Helpers:
  - `nav(page)` reads `__NK_NAV__`
  - `waitRoute(page, route | predicate)`
  - `expect(cond, msg)`
  - `tap(page, locator)`
  - `cartBadge(page)`
  - `shot(label)`
- Pages open at `#/<route>`.
- The existing journeys: `search-to-plp`, `plp-filter`, `plp-sort-sheet`, `pdp-add-to-cart`, `cart-checkout`.
- Add a journey for any new flow that changes cross-flow state (cart, wishlist, coupon) or hands off between flows.

### Adding a visual reference

1. Put a PNG **exported from Figma or captured from the real app** in `visual/refs/`. Never use a kit screenshot.
2. Add an entry to `visual/refs/manifest.json`:
   - `name`, `file`, `source` (origin + date), `route` (with query)
   - `select`: CSS selectors; the capture is the union of their boxes
   - `viewport`, `scale`
   - optional `refCrop` and `masks` (prices, counts)
   - `threshold`, `sizeTolerance`
3. Run `npm run visual:ref -- <name>` and read the `diff.png`.

The seeded references are `account-action-cards-empty` (Figma 8886:66691, threshold 0.08) and `cart-sticky-footer` (Figma 127:40209, threshold 0.03).
