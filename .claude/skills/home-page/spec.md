<!-- planned: home/revamp -->

> **Status (2026-10-12):** built as `home/home`. Deviations from the Figma, by request: the marketplace switcher is the classic `ExperienceSwitcher`; the tab bar keeps the app's own selected / unselected webp icons; "Recommended for you" is replaced by `DepartmentTabs` under the header.
# Home page — flow specification

The contract a home or landing build must meet. Measurements are Figma points on a 375pt frame (the kit device is 390pt; keep fixed sizes, let rails peek). Full measurements and token mappings: `references/figma-homepage-2025.md`.

## Screens

| Route | Path | Presentation | What it is | Status |
|---|---|---|---|---|
| `home/home` | `/homepage` | tab root (`home`) | Homepage Revamp 2025 (`1337:5102`) + department tabs | built (`HomeScreen.tsx`) |
| `home/classic` | `/home-classic` | push | Previous home, bappzaar 1:1 port | kept for reference (`ClassicHomeScreen.tsx`) |
| `<flow>/landing` | `/<campaign>` | push (`push`) | Campaign / seasonal landing page in the same module language | per request |

## Header (top to bottom)

| # | Part | Kit | Spec |
|---|---|---|---|
| 1 | Background | flow token `homeTokens.headerBg` (add a 2025 entry) | light-blue radial gradient, bottom corners `--nk-radius-r12` |
| 2 | Experience switcher | `ExperienceSwitcher` (`src/flows/home/components/ExperienceSwitcher.tsx`) | tiles 73×76, r15, gap 6; selected tile `brand` fill |
| 3 | Address row + wishlist | home header markup | label 16/20 600, line 14/18; 36 white circle wishlist → `wishlist/wishlist` |
| 4 | Search | `SearchBarButton` with camera | height 48, pinned when the header collapses |

Rows 2–3 collapse past 100px of scroll; the search bar stays.

## Feed modules

Default order for the 2025 home. Every module is an optional title row (`Text variant="heading"`, `var(--nk-palette-new-black)`, padding `0 14px`) plus content; modules are 28 apart (`homeModuleGap`).

| # | Module | Kit (reuse → build) | Spec |
|---|---|---|---|
| 1 | Promo ticker | build `PromoTicker` | 351×62 ticket r12, 2–5 rotating messages, "n/N" + dots |
| 2 | Hero banners | `HeroCarousel` (add a landscape variant) | 330×150 r20, gap 9, snap + auto 4s, "Ad" `Badge` on sponsored |
| 3 | Shop by category | build `CategoryTile` (replaces baked tiles) | 2 rows, tiles 92×128, gap 16, live 13/14 600 labels, optional SALE ribbon |
| 4 | Recommended for you | build `IconTabs` + rail of `SkuCard` | sticky icon tabs (For you, Electronics, Beauty, Fashion, Home); 134 cards, gap 12 |
| 5 | Offers for you | build `OfferTicket` | ~137×172 live cards, gap 12 |
| 6 | Bestsellers | rail of `SkuCard` | 134 cards, gap 12, "Best Seller" tag `bestSellerTag` |
| 7 | Keep shopping for | build `RecentCard` | 100–114 wide, "n Viewed" caption |
| 8 | Sponsored brand module | build `BrandAdModule` | full-bleed dark, brand header, video tile, SKU rail, "Ad" badge |
| 9 | Selling out fast | rail of `SkuCard` | as Bestsellers |
| 10 | New launches | build `LaunchModule` + `LaunchCard` | dark inset card r20 (351×420), cards 213×327, black CTA |
| — | Tab bar | Navigator `TabBar` (from `defineFlow({ tabBar })`) | unchanged defaults; the 2025 indicator style is a separate opt-in |

### Ordering rules

1. Navigation first: utility strip → hero → categories.
2. The tabbed personal rail is the first product module; at most one tabbed rail per page.
3. Alternate after offers: rail → personal → sponsored → rail → editorial dark.
4. Never two dark or two sponsored modules next to each other.
5. At most one brand ad and one launch module per page; every ad carries an "Ad" badge.
6. An endless feed may end with a 2-column `ProductCard` grid ("More for you").

## Landing / campaign variant

Pushed screen: `<Screen header={<Header title="…" />}>` with back + search, no switcher or address. Order: campaign hero (one full-width banner) → `PromoTicker` (campaign perks) → category grid → tabbed product rails by category → offer tickets → optional deal rail with `DealTimer` (`src/flows/home/components/DealTimer.tsx`). Campaign colours as flow tokens (`<flow>HeaderBg`, `<flow>Accent`).

## Data (`data.ts`)

- `modules`: ordered array `{ type: 'promoTicker' | 'hero' | 'categories' | 'productRail' | 'offers' | 'keepShopping' | 'brandAd' | 'launches', title?, tabs?, items }`, rendered by one `switch`.
- Products from `src/mocks/products.ts`; prices through `Price` (dirham sign); creatives from `src/assets/home/`.
- Copy: short, sentence case; module titles as in the Figma ("Shop by category", "Recommended for you", "Offers for you", "Bestsellers", "Keep shopping for", "Selling out fast").

## Navigation

| From | Action |
|---|---|
| Category tile, hero, offer ticket | `nav.push('plp/listing', { query })` |
| SKU card | PDP (`pdp/detail` with `productId`, the card's default press) |
| Search bar | `nav.push('search/search')` |
| Wishlist | `nav.push('wishlist/wishlist')` |
| Experience tile | switch the header theme in place (no navigation) |

## Motion

For a top-sheet tease (page drops to reveal a campaign sheet), an icon arriving into the address / ETA label, a pill grown from a dot, or the delivery ticker, use the **Home drop · top sheet** choreography in `../noon-ui/references/motion.md` (`supermall.topSheet`, `supermall.bolt`, `supermall.nudge`, `supermall.ticker`).

| Moment | Kit |
|---|---|
| Header collapse past 100px | `motion.div` height/opacity as `HomeScreen.tsx` does |
| Hero carousel | `HeroCarousel` snap + auto-advance + pause on touch |
| Promo ticker message swap | `AnimatePresence mode="popLayout"`, `tween('fast', 'out')` |
| Tab underline + rail swap | `layoutId` underline (`duration.base`, `easing.out`); `AnimatePresence mode="wait"` + `Stagger` |
| Card press | `Pressable` / `ProductCard` press scale |

## States

| State | Spec |
|---|---|
| Loading | `Skeleton` blocks per module, as other CMS pages do |
| Empty rail | hide the module (never an empty title) |
| Sponsored | "Ad" `Badge` on the creative or SKU image |

## Acceptance

- [ ] Routes registered; page path opens the screen; `check:routes` clean.
- [ ] Module order and ordering rules as above; titles `heading` in `new-black`; 28 gap; rail gutter 12; category gutter 16.
- [ ] SKU rails use `SkuCard` (134), not `ProductCard`.
- [ ] Every tile, banner and card navigates; nothing dead.
- [ ] Tokens only (`lint:tokens` 0 for the flow); 2025-only values are `home*` flow tokens.
- [ ] Ads badged; no adjacent dark or sponsored modules.
- [ ] Screenshots read at top and scrolled, compared with `1337:5102`.
- [ ] `source` = `Figma iRE9RwO94eMAyW3j3XKNXW · 1337:5102`.
