<!-- planned: pdp/oos -->

# Product detail page — flow specification

The contract a PDP build must meet. Measurements are Figma points on a 375pt frame (the kit device is 390pt; widths stretch, gutters and fixed sizes stay). Full measurements and token mappings: `references/figma-storefront-pdp.md`; bappzaar values: `src/flows/pdp/MAPPING.md`.

## Screens

| Route | Path | Presentation | What it is | Status |
|---|---|---|---|---|
| `pdp/detail` | `/pdp` (also `/product`, `/pdp/detail`) | push (`push`); variant switch `replace` (`fade`) | Current PDP, bappzaar master 1:1 port, default `{ productId: IPHONE_17_PRO_ID }` | exists — don't restyle unless asked |
| `pdp/variants` | `/pdp/variants` | sheet | Size picker from a product card +: SIZE chips (none preselected), QTY + ADD TO CART; ATC without a size warns and shakes; success → back + toast | exists |
| `pdp/added` | `/pdp/added` | sheet | Quick cart after ATC: check Lottie, CONTINUE SHOPPING / VIEW CART; `recsVariant` adds recommendations | exists |
| `pdp/oos` | `/pdp/oos` | push (`push`) | Storefront 2025 PDP (`930:259766`): `{ productId, state?: 'oos' \| 'unavailable' \| 'inStock' }`, default `oos` (Case 3); `unavailable` = Case 2, `inStock` = Case 1 | to build |

## Sections (top to bottom)

Every section is a white card: `Card` (`src/flows/pdp/components/Sections.tsx`) — `--nk-color-bg-surface`, `--nk-radius-r16`, padding `--nk-space-s12`, margin `0 12px 12px`, so cards sit inset 12 and 12 apart on `--nk-color-bg-page`. Card titles `--nk-color-text-strong`; the port uses `--nk-type-pdp-text16-bold`, the Storefront design 15/700/17 (add `pdpSectionTitle` to `pdpFlowTokens.type`).

### Current port (`pdp/detail`, bappzaar master order)

| # | Section | Kit |
|---|---|---|
| 1 | Header: back · expanding search pill · heart · share; turns white after 100px | `SfHeader` (`.iconBtn`, 40px `--nk-palette-white-alpha90`) |
| 2 | Pinned, shrinking gallery (ratio `pdpTokens.galleryRatio` 1.2), catalog tag, dots | `SfGallery` (`.galleryTag`, local `PageController`) |
| 3 | Brand strip + info card (overlap `--nk-layout-pdp-info-overlap`): title toggle, rating → reviews, price, nudges, coupons | `SfMainInfo`, `PdpPrice` |
| 4 | Delivery information | `DeliveryCard` |
| 5 | Payments for you | `PaymentsCard` |
| 6 | Variants (first in-stock size preselected; option tap → loader, in-place switch) | `VariantsCard` (`components/Variants.tsx`) |
| 7 | Reinforcement badges | `ReinforcementCard` |
| 8 | Product Overview: Description · Highlights · Specifications | `OverviewCard` (local `Accordion`) |
| 9 | Additional Information | `AdditionalInfoCard` |
| 10 | Category bestseller CTA | `CategoryBestSellerCta` |
| 11 | Seller + other offers | `SellerCard` |
| 12 | Frequently Bought Together | `FbtCard` |
| 13 | Ratings & Reviews (AI summary) | `ReviewsCard` (`components/Reviews.tsx`) |
| 14 | "More from {brand}" · "Customers Also Viewed" | `Recommendations` + `RecoCard` |

### Storefront 2025 (`pdp/oos`, `930:259766`)

| # | Section | Kit (reuse → build) | Spec |
|---|---|---|---|
| 1 | Header | `SfHeader` with icon buttons (`IconButton` or `.iconBtn`) | 40px buttons: back; search · wishlist · share (gap 8); white → transparent gradient, solid on scroll |
| 2 | Gallery | `SfGallery` + build the 360 button | 512 tall at 375; "noon's exclusive" tag start, 40px 360 button end, footer row 12 from the sides, dots 20 from the bottom |
| 3 | Main info | `SfMainInfo` | strip `--nk-palette-lavender`, brand `--nk-type-body-bold` `--nk-color-brand-blue`, 24px verified badge, "Visit Store" + chevron; title `--nk-type-pdp-title`; 26h rating pill "4.6 (34244 reviews)"; no overlap. **OOS: no price, deal tags or coupons** |
| 4 | Sponsored product row | build `SponsoredProductRow` (`ProductImage`, `Money`, `ExpressBadge`, `Badge` "Ad") | 351×35 white r8, one line, opens that PDP |
| 5 | Newer model available | build `NewerModelCard` (`Pressable`, `Icon name="zap"`) | header strip gradient `--nk-palette-lavender-mist` → white, label `--nk-type-caption-bold` `--nk-palette-deep-purple`; 55×68 image, 2-line title, price `--nk-type-text13-semibold-lh18`, 34px round chevron. Shown in all three cases |
| 6 | Delivery · variants · reinforcement · payments | `DeliveryCard`, `VariantsCard`, `ReinforcementCard`, `PaymentsCard` | `inStock` and `unavailable` only, in this order (payments move after variants) |
| 7 | Product Details | `OverviewCard` | title "Product Details"; Overview · Highlights · Specifications; card padding 16·12; rows 44h `--nk-color-bg-subtle` `--nk-radius-r12`, `--nk-type-body-semibold`, 20px chevron; all collapsed |
| 8 | Bestseller | `CategoryBestSellerCta` | 119° white → `--nk-palette-mint-cyan-light`, 40px rosette, "Bestseller #1 in {category}", sub "Explore other bestsellers" |
| 9 | Seller | `SellerCard` | 48 logo box (`Icon name="store"`), "Sold by" + name, rating and positive pills, trust chips r18 (`--nk-radius-pdp-r18`), brand subtitle row, dashed divider, offers row `--nk-palette-alice-blue` r10 "{n} offers from other sellers from {price}" |
| 10 | Product Features (A+) | build `ProductFeaturesCard` (`Button variant="noonGhost"` "View More") | collapsed 610 tall, 229 white fade, View More expands |
| 11 | Sponsored brand carousel | build `SponsoredBrandCard` (closest `CartCarousel`, `src/flows/cart/components/CartCarousel.tsx`) | outer `--nk-color-bg-subtle` r16, logo tile, "Shop {brand}", `Badge` "Ad", 216-wide cards, h-scroll |
| 12 | Frequently bought together | `FbtCard` | sentence-case title, three equal tiles, "Buy all for {total}" |
| 13 | Ratings & Reviews | `ReviewsCard` | score 22/800, AI summary, Photo Reviews strip, each review its own bordered r16 card (`--nk-color-border`), "Verified Buy" |
| 14 | Similar Products · Top products in {category} | `Recommendations` in a white card, 134-wide `SkuCard` | "Ad" tag on sponsored cards; h-scroll |
| — | Footer | see Footer per state | |

`AdditionalInfoCard` has no counterpart in the design: leave it out of `pdp/oos`.

## Footer per state

| State | Footer | Spec |
|---|---|---|
| In stock (port, `pdp/detail`) | `SfAtcBar` | QTY · Buy Now · Add to cart (loading Lottie) → `pdp/added`; "Back to top" past one screen; yellow "added in your cart" strip when in cart |
| In stock (Storefront Case 1 `2316:17084`) | `SfAtcBar` without Buy Now | QTY + full-width Add to cart, then the tab bar |
| Out of stock (Case 3 `930:259766`) | build `OosBanner` + `SuccessorChin` — **no `SfAtcBar`** | banner 40h white, top radius 16, "This item is currently out of stock" `--nk-type-text12-semibold-lh14` `--nk-palette-danger-red`; chin 100h: label `--nk-palette-deep-purple`, title and price `--nk-type-text13-medium-lh18`, 55×70 image, 34px chevron; slides in once the in-page newer-model card leaves the viewport |
| Not available at location (Case 2 `908:251666`) | same as out of stock | banner copy "This item is not available at your current location"; the in-stock sections stay |
| Alt OOS (`1644:39023`) | one compact row | red OOS icon tile + "OUT OF STOCK" / "View Newer model"; build only when asked |

The tab bar under the footer is a design-mock detail: the Navigator shows `TabBar` only on tab roots. If wanted, render `<TabBar active="home" />` in a wrapper `position: relative; height: calc(var(--nk-layout-tab-bar) + var(--nk-inset-bottom))` beneath the stack (Figma analysis §7).

## Data (`data.ts`)

- `pdpContent(product)` returns `PdpContent` (live products via `liveContent` in `src/flows/pdp/data.live.ts`, mock ones via `mockContent`); `productById(id)` from `src/mocks/products.ts` (falls back to the first product). Default product `IPHONE_17_PRO_ID`; `p3` is the fashion product that needs a size.
- Add to `PdpContent` for the Storefront design: `outOfStock?`, `unavailableAtLocation?`, `successor?: { productId, title, price }`, `sponsoredRow?`, `aplusImages?`, `sponsoredBrand?`, `seller.subtitle?`, `seller.offerCount` / `seller.offerFrom` (Figma analysis §6 → `data.ts`). The successor is a real product id in `src/mocks/products.ts`.
- Copy lives in `copy` (`data.ts`): reuse the existing keys; add the Storefront strings ("Product Details", "Overview", "Visit Store", "Newer model available", "This item is currently out of stock", "Product Features", "View More", "Ad", "Similar Products", "Top products in {category}"). Prices through `Price`, `Money` or `money()`; counts not abbreviated in "(34244 reviews)".

## Navigation

| From | Action |
|---|---|
| Back · search | `nav.back` · `nav.push('search/search')` |
| Brand strip / Visit Store | `nav.push('plp/listing', { query: content.brand })` |
| Variant option of another SKU | options loader, then `setProductId` in place (no navigation, scroll kept) |
| Other delivery option | `nav.replace('pdp/detail', { productId })` (`fade`) |
| Add to cart | `addToCart` (`useDemoStore()`) → `nav.sheet('pdp/added', { productId, qty })` (a size is always preselected on the PDP) |
| Buy Now · View cart (added sheet) | `nav.push('checkout/checkout')` · `nav.push('cart/cart')` |
| Newer model card, successor chin | `nav.push('pdp/detail', { productId: successor.productId })` (`push`, so back returns to the old model) |
| Sponsored row, recommendation card | `nav.push('pdp/detail', { productId })` |
| Bestseller CTA / tag | `nav.push('plp/listing', { query: leafName(categoryId) })` |
| Share, seller name, offers row, 360, size guide | `nav.toast(...)` until a target screen exists |

## Motion

| Moment | Kit |
|---|---|
| Header turns solid | `useScroll({ container: scrollRef })` + `useMotionValueEvent`, threshold `pdpTokens.headerChangeAfter − headerInnerHeight`, fade `pdpTokens.headerFadeMs` |
| Scroll (bappzaar 1:1, `src/flows/pdp/MAPPING.md` → PDP scroll) | gallery pinned by CSS sticky for one image height + shrink `pdpTokens.parallax`; tab bar hides on scroll (`useTabBarScrollHide`, `src/kit/tabBarScroll.ts`) and the sticky ATC bar (`Screen overlay`, `.stickyBar`) follows it; Back to top after one screen height, no transition; overview accordion open → +120 / 150ms |
| Gallery pager | `SfGallery` drag + spring 300/34, `PageController` dots (`pdpTokens.dots.ms`); port parallax `pdpTokens.parallax` |
| Accordions | local `Accordion` in `components/Sections.tsx`: height auto + chevron 180°, `pdpTokens.accordionMs` |
| Successor chin | `useInView` (motion/react) on the in-page newer-model card; `AnimatePresence` `y: '100%'` → 0 on `spring.sheet`; the OOS banner stays put |
| A+ View More | height 610 → auto with `tween('medium', 'out')`, fade the gradient out |
| ATC | loading Lottie for `pdpTokens.atcLoadingMs`, then the sheet (`spring.sheet` from the Navigator's `SheetLayer`) |
| Back to top / in-cart strip | `spring.press` / `spring.gentle` in `SfAtcBar` |
| Presses | `Pressable` (`spring.press`) or `.iconBtn:active` opacity |
| Section entry | none: no `Stagger` on PDP sections |

## States

| State | Spec |
|---|---|
| In stock | full section list, `SfAtcBar` |
| Out of stock | no price block, no delivery / variants / payments, OOS footer with chin |
| Not available at location | in-stock sections, OOS footer with the location copy |
| Size missing (fashion, `p3`) | ATC opens `pdp/variants` with the warning |
| In cart | yellow strip above the ATC bar with the count |
| Sponsored | `Badge` "Ad" on the sponsored row, brand carousel and sponsored cards |
| Empty section data | hide the card (no empty title) |

## Acceptance

- [ ] Routes registered; `/pdp` opens `pdp/detail`, `/pdp/oos` opens the new screen; `check:routes` clean.
- [ ] Section order as above for the target; every section a white r16 card inset 12, 12 apart.
- [ ] Size taps switch locally; option taps show the options loader and switch in place (`src/flows/pdp/MAPPING.md` → Variant selection behaviour); ATC → `addToCart` → `pdp/added` sheet; newer model and chin `push` the successor.
- [ ] Out of stock / not available: no `SfAtcBar`, no price; banner + chin; chin appears only after the in-page card scrolls out.
- [ ] `pdp/detail`, `pdp/variants` and `pdp/added` unchanged unless the user asked to restyle them.
- [ ] Tokens only (`lint:tokens` 0 for `src/flows/pdp`); new values are `pdp*` flow tokens.
- [ ] Every sponsored element badged "Ad"; prices with the dirham sign.
- [ ] Screenshots read at top and scrolled (`--scroll 1500` and further), compared with `930:259766` (and `2316:17084` / `908:251666` for the other states).
- [ ] `source` = `Figma 2ldJbjmQq4RkhnrNFCfXQB · 930:259766`.
