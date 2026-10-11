# PDP — Storefront Figma → kit mapping

Source: Figma **Storefront** `2ldJbjmQq4RkhnrNFCfXQB` · `3499:75115` "PDP" (in stock, 375 wide). `pdp/detail` renders this design over the bappzaar `NoonProductDetails` behaviour (see `MAPPING.md` for the port): same data (`pdpContent`), sheets (`pdp/variants`, `pdp/added`), variant switching (`nav.replace`), size check, wishlist / share, Visit Store (`plp/listing { query: brand }`).

Components: `src/flows/pdp/components/storefront/Sf*.tsx` (one CSS module each). Tokens: `pdpFlowTokens` = the port's values merged with `tokens.sfA` … `tokens.sfE` (keys `pdpSfa…` … `pdpSfe…` → `--nk-{color,type,layout,shadow}-pdp-sf{a..e}-*`). Every system icon is `OriginIcon` (Origin Design System); the only non-Origin glyphs are brand marks (express / rocket / noon One, MarketplaceTag), the 360° glyph (`src/assets/pdp/storefront/a/rotate-360.svg`) and the AI sparkle (`Asset aiSummarySparkle`).

## Sections, top to bottom

| Figma node | Section | Component (replaces) | Notes |
|---|---|---|---|
| 3499:75879 | Header: back · search · wishlist · share, 40px round white-90% buttons | `SfHeader` (`PdpHeader`) | gradient white → transparent; solid white + 1px border after 100px; search keeps bappzaar's `NoonExpandableSearch`: the 40px round button springs open (400 / 30 / 1) to a full-width "Search" pill (14/600 blue-gray/900) when the header turns solid and folds back at the top (→ `search/search`) |
| 3499:75118 | Gallery 375×512, dots (6 / 14×6 active), "noon's exclusive" catalog tag, 360° button | `SfGallery` (`Gallery`) | `pdpSfATokens.galleryRatio` 512/375; pager + scroll-linked pin/shrink kept; 360° toasts |
| 3499:75133 | Main info: lavender brand strip (verified · brand · Visit Store), white info card r20 top-end: title 16/500, rating pill + "(N reviews)", Prepaid Only, price 22/700 + strike + % + "(incl. of VAT)", deal tag + lowest-price nudge, dashed coupon chips, bestseller row | `SfMainInfo` (`ProductInfo`) | coupon tap copies the code; Prepaid Only when price ≥ 3000; nudge falls back to "Lowest Price in 30 days" when `was` |
| 3499:75228 | Sponsored product row 351×35 + Ad tag | `SfSponsoredRow` (new) | item = first FBT id, else an express product from another category |
| 3499:75275 → PDP Redesign `xPr9Ln37JGSBGvNtrsyD0y` · 3583:109620 | Delivery Information component set (5 variants, below) | `SfDeliveryCard` (`DeliveryCard`) | `variant` prop, auto from data (`deliveryVariantFor`); force with `pdp/detail?delivery=<variant>`; all five on `pdp/deliveryVariants` |
| 3499:75229 | "Newer model available" strip (lavender → white), 55×68 thumb, title, price, round chevron | `SfNewerModelCard` (new) | `successorFor(product)` (same brand + line, higher generation / next tier); `nav.push` |
| 3499:75276 | Variant picker: Model pills, Colour image tiles, Memory tiles (% OFF · price · was), Version pills + Learn more; dashed unavailable | `SfVariantsCard` (`VariantsCard`) | same selection logic and props |
| 3499:75389 | Trust markers: 80-tall tiles, blue `#2567E7` Origin glyphs, 12/600 labels | `SfTrustCard` (`ReinforcementCard`) | ≤ 3 tiles share the row, ≥ 4 scroll at 94 |
| 3499:75412 | Payment offers: 253×64 cards (ENBD cashback, tabby …) | `SfPaymentOffers` (`PaymentsCard`) | ENBD card is a demo constant; logos from data |
| 3499:75478 | Product Details: Overview / Highlights / Specifications accordions (`--nk-color-bg-subtle` rows, 44h) | `SfProductDetails` (`OverviewCard`) | height 0 ↔ auto, chevron rotates |
| 3499:75479 | Extended warranty: two plan cards on alice-blue, USP rows, Select | `SfExtendedWarranty` (new) | shown when `content.additional` has a warranty row; demo plans priced off `product.price`; partner/USP ticker 2.5s |
| 3499:75536 | Additional Information rows (#F9F9FB, 44 min) | `SfAdditionalInfo` (`AdditionalInfoCard`) | same rows + toasts |
| 3499:75632 | Bestseller row: mint gradient, medal, "Bestseller #N in {category}" | `SfBestsellerRow` (`CategoryBestSellerCta`) | rank parsed from `bestSellerTag`; → category PLP |
| 3499:75647 | Seller widget: 48 logo box, "Sold by", rating + positive pills, trust chips, subtitle row, "N offers from other sellers" | `SfSellerCard` (`SellerCard`) | offers row → `onOffers` |
| 3499:75700 | Product Features (A+): banners + copy capped at 610, fade + View More | `SfProductFeatures` (new) | images from `aplusImages` → gallery images; View More / Less |
| 3499:75701 | Sponsored brand carousel ("Top quality products · Shop {brand}" + Ad) | `SfSponsoredBrandCard` (new) | `sponsoredBrandProducts(product)`; header → brand PLP |
| 3499:75702 | Frequently bought together: tiles with check discs and + joins, "Buy all for …" | `SfFbtCard` (`FbtCard`) | toggle tiles, add selected to cart |
| 3499:75703 | Reviews: score 22/800 + emerald stars, AI summary (collapsible), Photo Reviews, Top Reviews cards (Verified Buy, variant chips, Helpful), All customer reviews | `SfReviewsCard` (`ReviewsCard`) | more/less, helpful votes kept |
| 3499:75876 / 75877 | "Similar products", "Top products in {category}" rails: 134-wide cards, 3:4 media, Ad, quick add, rating, price, nudge, express ETA | `SfRecommendations` + `SfRecoCard` (`Recommendations` / `RecoCard`) | Similar = other brands, Top = same brand/category; `sponsored` shows the Ad tag |
| 3499:75904 | Bottom: QTY 48 box + "Add to cart" (cta, r10), tab bar | `SfAtcBar` (`AtcBar`) | `interceptAdd` → variants sheet, add → `pdp/added`; `<TabBar active="home" />` under the ATC; Buy Now dropped (not in the design) |
| 3499:75878 | Back to top pill | inside `SfAtcBar` | floats above the bar once scrolled past `pdpTokens.backToTopAfter` |

## Delivery information variants (PDP Redesign `xPr9Ln37JGSBGvNtrsyD0y` · `3583:109620`)

| Figma variant | `variant` | Body | Auto when |
|---|---|---|---|
| Variant6 (8238:299758) | `crossSell` | white express box (1px `--nk-color-border-subtle`, r12, pt12): logo + estimate (+ kept countdown chip) · "Faster Delivery Options" grey foot · noon One banner (`--nk-color-text-primary` 44h r12, 14/600 `--nk-color-bg-subtle` "Get it today for free with" + noon One logo + chevron, light streak) · "Other Delivery Options" grey r12 box | buying options include another marketplace lane |
| No MP cross sell (3583:109621) | `noCrossSell` | the same without "Other Delivery Options" | only faster (rocket) options |
| market (3583:110101) | `market` | grey r12 box py12: `MarketplaceTag kind="market"` + "Get by **{date}**" (14/400 + 600) · chip | not express / rocket |
| express only (3583:110533) | `express` | the same with the express artwork | express / rocket, no buying options |
| Global (3583:110179) | `global` | bordered grey box: `MarketplaceTag kind="global"` row + "Free Shipping over Ð99" strip (`--nk-color-pdp-sfb-global-strip`, 13/500 `--nk-color-text-muted`, world map `src/assets/pdp/storefront/b/global-map.webp` at 20%) | forced only (no Global data yet) |

Shared: card `Card` (white r16 p12, gap 12), title 15/700/17 `--nk-color-text-strong`; "member" mark (noon One logo + 12/400 `--nk-color-text-secondary`) for members in the cross-sell variants; countdown chip "Order in N hrs" = `--nk-palette-light-brown-shade` bg, `--nk-palette-dark-orange` 12/600/19.6, r4, px3; chevrons `OriginIcon chevron-down / chevron-right` 20. Behaviour kept: buying-option rows `nav.replace` to their SKU or toast, accordions start closed and expand (height auto), the banner opens `noonone/landing` (replaces the old `VipPreference` banner).

## Values

Per-section measurements (node → kit token → value) are in the header comment of each `Sf*.tsx` and its tokens file; the shared rules:

- Cards: white, `--nk-radius-r16`, padding `--nk-space-s12`, margin `0 12px 12px` (`Card` from `components/Sections.tsx`); titles 15/700/17 `--nk-color-text-strong` (`--nk-type-pdp-sf*-section-title`).
- Sub-surfaces: `--nk-color-bg-subtle` (accordion rows, info rows), `--nk-palette-alice-blue` (offers, warranty), `--nk-color-bg-pill` (rating pills).
- Selected tiles: 1px `--nk-color-border-info`; unavailable: dashed `--nk-color-border-strong` on `--nk-color-bg-subtle`, `--nk-color-text-tertiary`.
- Ad tags: `Badge` bg `--nk-palette-border-color`, colour `--nk-color-price-old`.
- Prices: `money()` / `currency` (dirham sign).

## Known gaps

- Figma italics (Figtree Italic) and letter-spacing are dropped (kit font, no tracking tokens).
- Data the design shows but the mocks don't have: real successor field, A+ artwork, warranty plans, seller offer counts, "Other Delivery Options", brand logo for the sponsored brand card — all derived with fallbacks (see each component).
- Icon sizes off the 24/20/16 grid were kept where the Figma draws them (medal 40, store 30, chevrons 12/14).
- The live default iPhone 17 Pro has no `was` price or catalog tag, so the struck price / % and "noon's exclusive" show on mock products (e.g. `p2`) only.
