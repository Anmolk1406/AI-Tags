# Changelog

All notable changes to `@noon/flow-kit`. Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), versions follow [semver](https://semver.org/).

## [Unreleased]

## [0.1.0] — first package release

### Added
- 17 flows / 133 screens ported 1:1 from bappzaar master and noon Figma files: home (live CMS creatives, marketplace switcher), search, categories (live CMS tree), deals, PLP, PDP (live iPhone 17 Pro data, variants, FBT, reviews), cart (Figma Cart 2.0), checkout (Figma Checkout 2.0, payments, points, slide-to-order, confirmation, failure), orders, returns, account, addresses (AddressV2), cards (Payment Cards V2), noon One acquisition + membership management, wishlist.
- Design tokens: full noon palette (`--nk-palette-*`), semantic colours, type scale, spacing, radius, shadows, component token groups (`--nk-button-*`, `--nk-pill-*` …), typed `ref.*` helpers; Noontree font with the dirham sign.
- Shared components incl. Button with NoonButton presets, Switch, Checkbox, Spinner, Toast, HtmlText, Divider family, MaskIcon, MarketplaceTag/Wordmark (Figma pills).
- Runtime: in-device Navigator (push / sheet / modal / custom transitions, logical-parent back), page URLs (`src/kit/routes.ts`), `createStore`, DemoStore (cart, wishlist, coupon), noon One membership store.
- Package: ESM, one module per file, tree-shakeable `sideEffects`, sub-path exports (`/components`, `/tokens`, `/flows`, `/flows/<id>`, `/style.css`), assets emitted as files.
- Tooling: token lint, asset optimiser + budget check, route smoke test, pixel regression (`visual-snap`), flow scaffolder.
