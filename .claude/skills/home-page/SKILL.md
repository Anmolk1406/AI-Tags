---
name: home-page
description: Build or restyle the noon home page and home-style landing pages (campaign, seasonal, category or brand landing feeds) with the noon flow kit, following the Homepage Revamp 2025 Figma — header with experience switcher, address and search, promo ticker, hero banners, category grid, tabbed recommendation rail, offers, product rails, sponsored and launch modules. Use when someone asks for a home page, homepage variant, campaign / Ramadan / White Friday landing page, "a feed like home", or to update the home flow to a new design or reference.
---

# Home page

Builds the noon home feed and any page that speaks its module language. Load `../noon-ui/SKILL.md` first if it isn't loaded: its workflow, house rules and design-system references apply here unchanged. This skill adds the home specification and the checks specific to it.

## Sources

| Source | Where |
|---|---|
| Flow specification | `spec.md` (screens, module catalogue, ordering rules, data, acceptance) |
| Figma analysis | `references/figma-homepage-2025.md` — Homepage Revamp 2025, file `iRE9RwO94eMAyW3j3XKNXW`, screen `1337:5102` (wrapper `1337:7139`): every section with measurements, variables → tokens, components → kit, delta vs code |
| Current implementation | `src/flows/home/` — `HomeScreen.tsx`, `data.ts`, `tokens.ts`, `components/` (bappzaar 1:1 port, route `home/home`, page `/homepage`) |
| Design system | `../noon-ui/references/tokens.md`, `components.md`, `assets.md`, `motion.md`, `screen-recipes.md` |

## Steps

1. **Pick the target** (say it in one line):
   - *Home 2025 variant*: a new screen `home/revamp` beside `home/home`. Default, because `home/home` is the reference port.
   - *Replace the home*: only when the user asks to update the home flow itself. Keep the route `home/home` and the tab bar.
   - *Campaign / landing page*: a pushed screen in a new flow (or `deals`) using the landing variant in `spec.md`.
2. **Read** `spec.md`, then `references/figma-homepage-2025.md` §2 (anatomy) and §6 (delta), then `src/flows/home/HomeScreen.tsx`, `data.ts`, `tokens.ts` and the components you will reuse (`ExperienceSwitcher`, `HeroCarousel`, `CardRail`, `DealTimer`).
3. **Plan the modules** as an ordered array in `data.ts` (`{ type, title?, ... }`) and render them through one `switch`, so order changes stay data-only. Follow the ordering rules in `spec.md`.
4. **Build the header**, then each module, from the module catalogue: reuse the home components, promote `SkuCard` (`src/flows/cart/components/CartCarousel.tsx`) to `src/components` before using it in a second flow, and add the missing modules (`PromoTicker`, `CategoryTile`, `IconTabs`, `OfferTicket`, `RecentCard`, `BrandAdModule`, `LaunchModule`) in `src/flows/home/components/`.
5. **Tokens**: section titles `Text variant="heading"` coloured `var(--nk-palette-new-black)`; feed gap and the other 2025-only values as `home*` keys in `src/flows/home/tokens.ts`; snap every Figma value with the table in the Figma analysis §3. Don't change central tokens or `TabBar` defaults for this page.
6. **Motion**: hero auto-advance and snap as `HeroCarousel` does; tab underline with `layoutId`; rail swap with `AnimatePresence` + `Stagger`; header collapse past 100px (`spec.md` → Motion).
7. **Register**: `ScreenDef` with `title`, `path`, `notes`, and `source: 'Figma iRE9RwO94eMAyW3j3XKNXW · 1337:5102'`. For a full port, write `src/flows/home/FIGMA-MAPPING.md` from the analysis §3–4.
8. **Validate**, below.

## Rules specific to home

- The header is custom, never `<Header>`; the screen is `<Screen header background="bgSurface" withTabBar safeTop={false} onScroll>` for a tab root, or `<Screen header={<Header … />}>` for a pushed landing page.
- Every tile, banner and "see all" navigates: categories and banners to `plp/listing` with a `query`, SKUs to the PDP, search to `search/search`, wishlist to `wishlist/wishlist`.
- Fixed card sizes stay fixed on the 390pt device; the extra width shows as more rail peek. Don't scale them.
- Ads always carry an "Ad" badge, and two dark or two sponsored modules are never adjacent.
- Creatives come from `src/assets/home/` (see `../noon-ui/references/assets.md`). Text that the design shows live (category labels, offer copy) is live `Text`, not baked into images.

## Validate

```bash
npm run typecheck && npm run lint:tokens -- -v src/flows/home
npm run check:routes
node .claude/skills/noon-ui/scripts/snap.mjs home          # top of every home screen
node scripts/shot.mjs home/home /tmp/home-mid.png --scroll 1200
```

Read every PNG against `spec.md` → Acceptance and against the Figma (§2 of the analysis): module order, 28 gap, 12 gutters, 134 SKU cards, 17/22 titles, header gradient and collapse, Ad badges, tab bar. Then run `npm run skill:check` if you changed components, tokens or screens.
