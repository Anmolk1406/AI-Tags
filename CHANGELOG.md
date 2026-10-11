# Changelog

All notable changes to `@noon/flow-kit`. Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), versions follow [semver](https://semver.org/).

## [Unreleased]

### Added
- Motion: `supermall` presets from the noon X Supermall motion spec (soft / standard / tab / text-in eases, sampled XMP drop, corner rounding and bolt curves, critically damped return spring, reveal / rows / page / cards / shimmer / banner / swap / press / top-sheet / bolt / nudge / ticker timings), `keyedEase()`, and `haptic()` / `haptics` (`src/motion/haptics.ts`).
- `OriginIcon` + 399 Origin Design System system icons (`src/assets/icons/origin/`, typed `OriginIconName`, outline / `filled` pairs); `npm run icons:import -- <folder>` imports a Figma export.
- Motion: `handoff` preset group (the search → PLP ProtoPie handoff from github.com/saswata2002/Brand-Widget-PLP: spring 280.6 / 27.14, recorded ease-out / S-curve / reveal fades, staggers, brand widget springs), `appleSpring()`, `sampledEase()`; recipes `BlurSwap`, `SkeletonReveal`, `SpringPager`; transition `results-fade`.
- PDP: Delivery information as a variant component (`SfDeliveryCard variant`: crossSell / noCrossSell / market / express / global, PDP Redesign Figma 3583:109620), auto-picked from the delivery data, `?delivery=` override, `pdp/deliveryVariants` screen.
- PDP: `pdp/detail` restyled 1:1 to the Storefront PDP Figma (2ldJbjmQq4RkhnrNFCfXQB · 3499:75115) with the same behaviour — `components/storefront/Sf*` sections, Origin icons, new newer-model / sponsored / extended-warranty / A+ / sponsored-brand sections, ATC bar over the tab bar; `FIGMA-MAPPING.md`.
- `NeedHelpButton` (floating "Need help?" pill that folds into its icon on scroll, Accounts Figma 8924:67388) on home and account; `needHelp` token group (`needHelpTokens`), `shadow.floating`, palette `charcoalAlpha12`; `Screen` `overlay` slot.
- `useStatusBar(tone)` (kit): a screen can override the status-bar ink at runtime while it is on top; `ScreenDef.statusBar` stays the default.
- Home: department tabs + tab CMS widget (from ashbun/noon-app) under the header; the header re-skins with the active tab.
- `SearchInput`: optional `fill` (picked-suggestion fill animation) and `onFieldPress` (read-only field as a button).
- Search / PLP: suggestion choreography (fall-in, in-place crossfades, bottom-up exits, fast exit into results), results "in place" under the same search bar, marketplace strip, chip and card skeleton reveals, bottom nav, "Shop phones by brand" widget (spring pager, select / clear morph) driving the brand filter; `search/suggestions` screen; 48 phones in `src/mocks/phones.ts`.

### Changed
- `TabBar`: animated selection — the indicator slides between tabs, the selected icon cross-fades and pops (`spring.bouncy`), the label lifts in.
- `search/search` pushes with `slide-left`; `plpTokens.chipReveal` / `cardRise` / `loadingMs` replaced by `plpTokens.timeline` / `swap` / `brandWidget`.

## [0.1.0] — first package release

### Added
- 17 flows / 133 screens ported 1:1 from bappzaar master and noon Figma files: home (live CMS creatives, marketplace switcher), search, categories (live CMS tree), deals, PLP, PDP (live iPhone 17 Pro data, variants, FBT, reviews), cart (Figma Cart 2.0), checkout (Figma Checkout 2.0, payments, points, slide-to-order, confirmation, failure), orders, returns, account, addresses (AddressV2), cards (Payment Cards V2), noon One acquisition + membership management, wishlist.
- Design tokens: full noon palette (`--nk-palette-*`), semantic colours, type scale, spacing, radius, shadows, component token groups (`--nk-button-*`, `--nk-pill-*` …), typed `ref.*` helpers; Noontree font with the dirham sign.
- Shared components incl. Button with NoonButton presets, Switch, Checkbox, Spinner, Toast, HtmlText, Divider family, MaskIcon, MarketplaceTag/Wordmark (Figma pills).
- Runtime: in-device Navigator (push / sheet / modal / custom transitions, logical-parent back), page URLs (`src/kit/routes.ts`), `createStore`, DemoStore (cart, wishlist, coupon), noon One membership store.
- Package: ESM, one module per file, tree-shakeable `sideEffects`, sub-path exports (`/components`, `/tokens`, `/flows`, `/flows/<id>`, `/style.css`), assets emitted as files.
- Tooling: token lint, asset optimiser + budget check, route smoke test, pixel regression (`visual-snap`), flow scaffolder.
