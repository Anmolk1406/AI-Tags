# pdp: flow brief

Read with `../screens.md`, `src/flows/pdp/FIGMA-MAPPING.md` (the look) and `src/flows/pdp/MAPPING.md` (bappzaar behaviour and values). Skill: `/pdp`. This brief reflects the branch as of 2026-10-23.

## What `pdp/detail` is now

- **Look**: the "New PDP" Figma, Af34gfmhQ1D0wstXUEHSIF · 64:5571. It builds on Storefront 2ldJbjmQq4RkhnrNFCfXQB · 3499:75115.
- **Behaviour**: bappzaar `NoonProductDetails`.
- Truth is `mixed`, verified 2026-10-12. The default product is the live iPhone 17 Pro (`IPHONE_17_PRO_ID`, its captured content in `src/data/products/N70211593V/content.ts` + `src/data/families/iphone-17-pro.ts`).
- **The PDP is a template.** Everything it shows comes from the data layer: `pdpView(product)` in `src/data/views/pdp.ts` builds a `PdpContent` from the product card (`src/data/products/<id>/product.ts`), its page content (`content.ts`, over its family's) and noon-wide promotions (`src/data/promotions.ts`). Copy is `src/data/copy/pdp.ts`. Screens and components compute nothing and hold no text; a section with no data hides itself.
- All four screens are `lazyScreen`:
  - `pdp/detail`
  - `pdp/deliveryVariants` (all five delivery cards stacked)
  - `pdp/variants` (sheet)
  - `pdp/added` (sheet)

## Section groups, not variants

`sfA`–`sfE` (Storefront) and `npA`–`npE` (New PDP deltas) are **section groups**. All of them are always merged into `pdpFlowTokens` in `src/flows/pdp/tokens.ts`.

| Group | Sections |
|---|---|
| A | header, gallery, main info, bundle |
| B | delivery, newer model, free gifts, variants |
| C | trust, payments, product details (AI overview), warranty, info, bestseller |
| D | seller, A+ features, sponsored brand, FBT |
| E | reviews, rails, ATC bar |

- Token keys are prefixed `pdpSfa…` / `pdpNpa…`. They become `--nk-<kind>-pdp-np<x>-*` vars.
- Copy per group is in `src/data/copy/pdp.ts` (`npaCopy` … `railCopy`, plus `sfCopy.<component>` for the storefront components). What a section derives (combos and the best saving, delivery lanes and layout, AI overview, A+ images, gifts, FBT items, sponsored items, newer model, rails, warranty plans) is a `PdpContent` field computed in `pdpView`; `mainInfoView(shown, content)` follows the selected option.
- JS-only numbers (scroll thresholds, motion) go in `pdpTokens`, not in the CSS-var token set.

## Runtime switches

- **Delivery variant**: `crossSell | noCrossSell | market | express | global`.
  - It is derived from the data (`content.deliveryVariant`, from `deliveryVariantFor` in `views/pdp.ts`).
  - The `delivery` URL param can force any of them, e.g. `/pdp?delivery=global`. `global` is force-only.
- **`productId`**: any product id; its `content.ts` (captured for the iPhone, written demo content for the rest, `source.kind` says which) fills the page.
- **`recsVariant`** 0/1/2 on `pdp/added`. The default 0 means no recommendations, because every A/B flag is off with no bucket assigned.
- **`sizeMissing`** on `pdp/variants`.

## Render order (`src/flows/pdp/DetailScreen.tsx`)

SfHeader → SfGallery (pinned and shrinking) → SfMainInfo → SfBundleCard → SfSponsoredRow → SfDeliveryCard → SfNewerModelCard → SfFreeGifts → SfVariantsCard → SfPaymentOffers → SfTrustCard → SfProductDetails → SfAdditionalInfo → SfBestsellerRow → SfSellerCard → SfProductFeatures → SfSponsoredBrandCard → SfExtendedWarranty → SfFbtCard → SfReviewsCard → SfRecommendations → SfAtcBar (Qty · Buy now · Add to cart · back to top).

All of these live in `src/flows/pdp/components/storefront/`. Most wrap themselves in `Card` from `components/Card.tsx`.

The pre-Storefront components were removed. What remains in `src/flows/pdp/components/` besides `storefront/`: `Card.tsx` and `Asset.tsx`.

## Recipes

- **New section**:
  1. create `Sf<Name>.tsx` with a CSS module, wrapped in `Card` and taking `content: PdpContent`;
  2. put its copy in `src/data/copy/pdp.ts` (`sfCopy.<name>`), its data in `ProductContent` (`src/data/types.ts`) and any derivation in `pdpView` (`src/data/views/pdp.ts`) as a new `PdpContent` field;
  3. put tokens with no central equivalent in a `tokens.np?.ts`, prefixed and marked `token-lint-ignore`, and add the file to the `mergeTokens` call;
  4. place the section in DetailScreen's order;
  5. make it **self-hiding** when its data is empty, as SfFreeGifts, the bundle and the AI overview do.
- **New delivery variant**: add it to `DeliveryVariant` and `deliveryVariants` in `src/data/views/pdp.ts`, and to `sfCopy.deliveryVariants.labels` in `src/data/copy/pdp.ts` (`satisfies Record<DeliveryVariant, string>`, so TypeScript flags a missing key).
- **Product content**: write `src/data/products/<id>/content.ts` with `defineContent` (`ProductContent`; reference `N70211593V/content.ts`); a variant family's shared text and reviews go in `src/data/families/<family>.ts`. Mark it `source: { kind: 'written' | 'captured' }`.
- **Switching SKU in place**: DetailScreen keeps `productId` in local state.
  - Picker taps go through `onSelect`. It records the scroll anchor and calls `rebase` from `useTabBarScrollHide`, so the page doesn't jump.
  - Buying options and lanes use `nav.replace('pdp/detail')`. Recommendations and newer model use `nav.push`.
- **Scroll**:
  - the gallery pins via CSS sticky, with a spacer for its travel;
  - content overlaps the image by 20 on a page-grey layer;
  - the header goes solid at 150 − 50;
  - back-to-top shows after one device height;
  - opening an accordion scrolls the page 120 (`onAccordionOpen`).

## Gotchas

- Buy Now is **back** (New PDP group A, #041F62, → checkout). The Storefront table above it in FIGMA-MAPPING.md still says it was dropped; group A wins.
- The selected option's `salePrice` drives the shown price only when the option has no `productId`.
- Fashion products preselect the first in-stock size, and DetailScreen never passes `interceptAdd`. Only the `ProductCard` "+" opens `pdp/variants`.
- The live iPhone has no `was` price or catalog tag. Use mock product `p2` to see them.
- There are no italics or letter-spacing in the kit type scale. FIGMA-MAPPING lists these as known gaps.
