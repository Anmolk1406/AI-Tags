<!-- external: noon-en.json -->
# Flows: anatomy, navigation, catalogue, blueprints

Everything here is read from the code (`src/kit/*`, `src/flows/*`). When this file and the code disagree, the code wins; fix this file.

Contents: 1. Anatomy of a flow · 2. Navigation API · 3. Catalogue (17 flows, 145 screens) · 4. Blueprints for common requests.

---

## 1. Anatomy of a flow

### Folder layout

```
src/flows/<id>/
├── index.ts          export const <id>Flow = defineFlow({...})       (required)
├── tokens.ts         <id>Tokens (JS consts, raw values allowed here) + <id>FlowTokens: TokenOverrides
├── data.ts           copy (`t` / `copy` objects) + mock content; may split: data.<area>.ts
├── store.ts          flow state via createStore (only if sheets/pushed screens share state)
├── <Name>Screen.tsx  one component per screen; sheets often <Name>Sheet.tsx
├── <id>.module.css   styles, tokens only (several modules per flow is normal)
├── components/       flow-only components
├── transitions.ts    optional: registerTransition(...) for flow-specific screen transitions, imported by index.ts
├── assets.ts         optional: imports from src/assets/<id>/
└── MAPPING.md        or FIGMA-MAPPING.md: source → kit value mapping
```

Big flows split by area: `noonone/` uses `screens.<area>.ts` (arrays of `ScreenDef`) + `screens/` + `data.<area>.ts`; `membership/` uses sub-folders `plans/ cancel/ family/ perks/`, each with its own `screens.ts`.

Scaffold: `npm run new-flow -- <id camelCase> "Title" "Sidebar group"` creates `index.ts`, `tokens.ts`, `data.ts`, `<Name>Screen.tsx` (with `main` + `next` screens), `<id>.module.css`, `components/`, and registers the flow in `src/flows/index.ts`. The generated CSS contains raw px/rgba (footer shadow) — replace with tokens before lint.

### `defineFlow(flow: FlowDef)` — `src/kit/registry.ts`, type in `src/kit/types.ts`

Register screen components lazily so a page only downloads what it shows: `const DetailScreen = lazyScreen(() => import('./DetailScreen'), 'DetailScreen');` then `component: DetailScreen` (`src/kit/lazyScreen.ts`; the Navigator wraps screens in `<Suspense>` and `preloadScreens()` fetches the rest in idle time). The landing page (`home/home`) stays a static import. `npm run new-flow` generates this pattern.

| Field | Type | Meaning |
|---|---|---|
| `id` | `string` | route prefix (`id/screen`) |
| `title` | `string` | sidebar label |
| `description?` | `string` | one line, shown in playground |
| `group?` | `string` | sidebar group; in use: `Discovery`, `Shopping`, `Post-order`, `Profile` |
| `initial` | `string` | screen id opened for route `<id>` |
| `screens` | `ScreenDef[]` | |
| `tokens?` | `TokenOverrides` | flow-scoped token overrides, applied via `TokenScope` to this flow's screens only |
| `sheetBackdrop?` | `Route` | screen rendered behind a sheet/modal of this flow when opened directly (default `initial`). e.g. address → `'account/account'`, noonone → `'noonone/landing'` |
| `parent?` | `Route` | Back target when a screen of this flow is opened with no history. Default `home/home`, except tab roots (no back) |
| `tabBar?` | `{ tab: TabId; screens: string[] }` | show the bottom tab bar on these screens (only when the screen is stack root) |

### `ScreenDef<P>`

| Field | Type | Meaning |
|---|---|---|
| `id` | `string` | |
| `title` | `string` | |
| `component` | `ComponentType<ScreenProps<P>>` | receives `{ params }` |
| `presentation?` | `'screen' \| 'sheet' \| 'modal'` | default `'screen'` |
| `transition?` | `TransitionName` | default per presentation: `push` / `sheet` / `modal` |
| `statusBar?` | `'dark' \| 'light'` | status bar content colour |
| `defaultParams?` | `P` | merged under navigation params; also used by sidebar/URL. Used to register *state variants* of one component (e.g. `cart/empty` = `CartScreen` + `{ state: 'empty' }`) |
| `notes?` | `string` | "what to try" text in the playground notes panel |
| `source?` | `string` | bappzaar path / Figma node / "reference: …" |
| `parent?` | `Route` | overrides `FlowDef.parent` for this screen |
| `path?` | `string \| string[]` | extra URL names, e.g. `['noon-one', 'noonvip']` → `/noon-one` |

`defineScreen(screen)` also exists (identity helper, typed params).

Built-in transitions (`src/motion/transitions.ts`): `push`, `fade`, `fade-up`, `modal`, `zoom`, `sheet`, `none`. Kit custom (`src/motion/custom/index.ts`): `card-flip`, `scale-up`, `slide-left`. Flow-registered: `checkout-alpha` (checkout), `noonone-overlay`, `noonone-instant` (noonone), `address-map`, `address-search`, `address-success` (address), `mb-overlay`, `mb-modal` (membership).

### Registering

`src/flows/index.ts`: import the flow, add it to the `export { … }` list and to `allFlows` (array order = sidebar order). `new-flow` does this for you.

### Page URLs

- Every screen: `/<flow>/<screen>`; every flow: `/<flow>` (its `initial`). Query params become screen params: `/plp?query=iphone`, `/pdp?productId=p2`.
- Friendly aliases: `pageAliases` in `src/kit/routes.ts` (only active for registered screens) plus each `ScreenDef.path`.
- `registry.qualify(input, currentFlow)` resolution order: contains `/` → as is; screen of the current flow (so checkout's own `add-card` beats the global alias); alias; flow id → initial; else `currentFlow/input`.

`pageAliases` (current):

| Alias | Route | Alias | Route |
|---|---|---|---|
| `homepage`, `home` | `home/home` | `orders` | `orders/list` |
| `search` | `search/search` | `order-tracking` | `orders/tracking` |
| `categories` | `categories/categories` | `returns` | `returns/details` |
| `deals` | `deals/deals` | `account` | `account/account` |
| `plp`, `listing` | `plp/listing` | `edit-profile` | `account/editProfile` |
| `filters` | `plp/filters` | `account-security` | `account/security` |
| `pdp`, `product` | `pdp/detail` | `notifications` | `account/notifications` |
| `cart` | `cart/cart` | `addresses` | `address/select` |
| `checkout` | `checkout/checkout` | `add-address` | `address/map` |
| `order-confirmation` | `checkout/confirmation` | `cards` | `cards/cards` |
| `payment-failure` | `checkout/payment-failure` | `add-card` | `cards/add` |
| | | `wishlist` | `wishlist/wishlist` |

Screen `path`s: categories `all-categories`; returns `returns-history`, `returnable-items`; noonone and membership (see catalogue).

### Tab bar

`TAB_ROUTES` (`src/kit/Navigator.tsx`): `home → home/home`, `categories → categories/categories`, `deals → deals/deals`, `account → account/account`, `cart → cart/cart`. `TabId = 'home' | 'categories' | 'deals' | 'account' | 'cart'`. The tab bar renders only on stack index 0 when the flow's `tabBar.screens` includes the screen. Tab flows: home (`home`), categories (`categories, expanded, loading, error`), deals (`deals`), account (`account, signedOut`), cart (`cart, empty, loading`). Tab-root screens pass `withTabBar` to `<Screen>` so content scrolls clear of the bar. A new flow cannot add a sixth tab without changing `TabId` + `TabBar`; new pages are pushed from a tab.

### Parent flows (Back when opened directly)

`parentOf(route)` = `screen.parent ?? flow.parent ?? (tab root ? none : 'home/home')`. Set today: orders, returns, address, cards, noonone, membership → `account/account`; checkout → `cart/cart`. A new account-area flow (loyalty, rewards) should set `parent: 'account/account'`.

### `source` / `notes`

Every `ScreenDef` gets both. `source` = where it came from (bappzaar path at master, `Figma <fileKey> · <node>`, or `reference: <what the user shared>`); flows often build it from consts (`const S = 'marketplaces/noon/screens'`). `notes` = imperative "what to try" (taps, params, timings): e.g. `'Try orderId o3 (delivered → Return item) or o5 (cancelled).'`

`truth` (`'bappzaar' | 'figma' | 'mixed' | 'reference'`) = which reference wins when they disagree; omitted → inferred from `source` by `screenTruth()` (`src/kit/registry.ts`): Figma + bappzaar paths → `mixed`, Figma alone → `figma`, a shared link → `reference`, else `bappzaar`. `mixed` / `figma` screens need the flow's `FIGMA-MAPPING.md` (or `MAPPING.md`) to say which area follows which. `verified: 'YYYY-MM-DD'` = last side-by-side check against the reference. Example (`src/flows/cart/index.ts`): `source: 'marketplaces/noon/screens/NoonCartScreen; sticky footer + savings tab Figma Af34gfmhQ1D0wstXUEHSIF · 127:40209'`, `truth: 'mixed'`, `verified: '2026-10-12'`.

### MAPPING.md / FIGMA-MAPPING.md

Present in: categories, pdp, returns, checkout (both), cart (FIGMA), noonone, membership, membership/perks. Structure used by real files:

1. Header: source of truth (bappzaar master SHA + date, Figma file key + frame, or live API call) and how to read the tables (token prefixes, `SD` = server-driven).
2. Render tree (master component tree in a code block) and/or "Live variants (FeatureFlags)" table: switch · live value · effect used.
3. Numbered sections per screen area (`## 1. Screen + header`, `## 2. Gallery`, …), each a table: `bappzaar | Property | Master | Kit token` (or `Figma variable | Value | Kit token` for FIGMA-MAPPING).
4. Copy (keys from `noon-en.json`), server-driven fields + demo values, assets, screens/routes table, documented exceptions (literal geometry), shared follow-ups outside the flow.

### data.ts conventions

- Copy as a flat object, each string commented with its translation key: `export const t = { checkout: 'Checkout', // noon_checkout … }` (cart, checkout, cards, address). membership loads `locale/vip-en.json` verbatim and exposes `t(key, params)` with `{{x}}` interpolation.
- Server-driven content (CMS creatives, HTML messages, plan data) authored to the real response shape, file header says so: "realistic UAE demo values".
- Images via `import x from '../../assets/<flow>/…'` or `import.meta.glob` (home). Products from `src/mocks/products.ts`, never redefined.
- Prices: `` `${currency} ${formatPrice(n)}` ``; HTML strings for `HtmlText` use `<b>`, `<highlight>`.
- Per-item mock tints/swatches are allowed literals with `// token-lint-ignore: mock …`.

### store.ts with `createStore` (`src/kit/createStore.ts`)

```ts
const store = createStore<S>(initial);
store.get(); store.set(next); store.patch(partial | (s) => partial); store.subscribe(fn);
const v = store.useStore();            // whole state
const n = store.useStore((s) => s.n);  // selector must return a stable slice/primitive
```
Use it whenever a sheet or pushed screen must read/write the same state (sheets are separate stack entries). Examples: `plp/store.ts` (`plpStore.get/set/reset`, `usePlpStore()` — sort + filters shared by grid, Filters, Sort), `account/store.ts` (`setAccountState = store.patch`, `useAccountState()`), `noonone/store.ts` (`noononeStore`, `useNoonone`, `completeSubscription(nav, plan)`, `popToLanding(nav)`), `membership/store.ts` (`membershipUi`, `membershipEvents.membershipChanged/notify/consume*` — UI events that outlive a screen), `checkout/store.ts` (`checkoutStore`, `useCheckout(select)`), `address/store.ts` (`addressStore`, `useAddressStore(select)` — read by checkout), `cards/store.ts`, `returns/store.ts`.

### DemoStore (`src/kit/DemoStore.tsx`) — `useDemoStore()`

Cross-flow cart/wishlist/coupon state, in memory (refresh resets). `<NoonPrototype emptyCart>` seeds an empty cart.

| Member | Signature / shape |
|---|---|
| `cart` | `CartLine[]` — `{ product, qty, variant?, customization?: {code,question,answer}[], warranty?: string \| null, foupon?: boolean }` |
| `cartCount` / `cartTotal` | sum of qty / Σ qty × price |
| `addToCart` | `(productId, qty = 1) => void` (merges qty) |
| `setQty` | `(productId, qty) => void` (≤ 0 removes) |
| `removeFromCart`, `clearCart` | `(productId)`, `()` (also clears coupon) |
| `updateLine` | `(productId, patch: Partial<Omit<CartLine,'product'>>)` |
| `moveToWishlist` | `(productId)` — out of cart/inactive, into wishlist |
| `coupon` / `applyCoupon` / `removeCoupon` | `string \| null` / `(code) => CouponState` / `()` |
| `cartTotals` | `CartTotals`: `itemCount, subtotal, savings, addOns, foupons, shipping, freeDelivery, groups[{type,subtotal,shipping,remaining}], coupon, couponDiscount, total, totalSavings` |
| `inactiveCart` / `removeInactive` | out-of-stock lines / `(productId)` |
| `cartUpdatesDismissed` / `dismissCartUpdates` | cart banner state |
| `wishlist` | `string[]` product ids (seed: products[1], [5], [6]) |
| `toggleWishlist` | `(productId) => boolean` (new state) |
| `isWishlisted` | `(productId) => boolean` |

Also exported: `useCartTotals()`, `computeCartTotals(cart, code)`, `evaluateCoupon(code, subtotal)`, `cartGroupOf(product) → 'express' | 'marketplace' | 'xborder'`, `cartAddOns` (`ew1`, `ew2`), `cartCoupons` (`NOON10` 10% cap 150, `SAVE50` flat 50 min 300), `FREE_DELIVERY_THRESHOLD = 100`, `SHIPPING_FEE = 10`, `FOUPON_VALUE = 15`. Seed cart: p1 (engraving), p6 (`46mm`), p8, p11; inactive: p7.

### Membership store (`src/kit/membership.ts`)

`membershipStore = createStore<MembershipState>({ status: 'none', savings: 0, role: 'owner', family: [] })`. Append-only (several flows depend on it).

- `MembershipState`: `status: 'none' | 'trial' | 'active' | 'cancelled'`, `plan?: { id, name, period: 'monthly' | 'yearly', price, seats }`, `renewsOn?` (ISO), `savings`, `role: 'owner' | 'member'`, `family: { id, name, phone?, status: 'invited' | 'joined' }[]`, `paymentCard?: { brand: 'visa'|'mastercard'|'amex'|'mada', last4 }`.
- Hooks: `useMembership(select?)`, `useIsNoonOneMember()` (active or trial), `isNoonOneMember(s)`, `useMembershipManage()` (adds `upcomingPlan?, ownerName?, reminderSet?, referralCode?, memberSince?`), `useMembershipEligibility(select)` → `{ trialEligible }`.
- `membershipActions`: `subscribe(plan, { trial?, card? })`, `changePlan(plan)`, `cancel()`, `reactivate()`, `inviteMember({id,name,phone?})`, `removeMember(id)`, `leaveFamily()`, `demo(partial)`.
- `membershipManageActions`: `scheduleUpgrade(plan)`, `cancelUpgrade()`, `setReminder(on)`, `updatePaymentCard(card)`, `applyReferral(code)`, `memberJoined(id)`.
- `noonOneJourneyActions`: `subscribe(plan, opts)` (also consumes trial eligibility), `resetToNonMember()`.
- Entry points switch on `useIsNoonOneMember()`: account ProfileCard noon One strip ("Start Trial" / "Join Now" vs savings), cart payment callouts + `noonone/cartOverlay` push, checkout `NoonOneSection`, PDP `VipPreference`.

### Mocks (`src/mocks/products.ts`, `src/mocks/categories.ts`)

`Product`: `id, brand, title, price, was?, rating, ratingCount, emoji, tint, image?, express?, tag?: 'Best Seller' | 'Top Rated' | 'New' | 'Selling out fast', delivery` (HTML, e.g. `'Get it <b>Tomorrow</b>'`), `category, coupon?, colors?, sizes?, highlights?, seller?`; live-data extras: `sku, offerCode, images, categoryId, categoryPath, rank, nudges?: { text, kind }[], stockLeft, freeDelivery, attributes {model,color,storage,version}, variantFamily, sellerRating, description, featureBullets, specs`.

- `products`: mock `p1`…`p14` first (indices stable), then `liveProducts` appended (`iphone-17-pro` = `IPHONE_17_PRO_ID` `'N70211593V'` family, carousel and FBT items). `products.slice(0, n)` gives mocks.
- Helpers: `productById(id)` (falls back to `products[0]`), `discountPct(p)`, `formatPrice(n)` (en-US, ≤ 2 decimals), `currency` (`''` dirham), `variantFamilies`, `fbtFor`, `user` (`firstName 'Ankit'`, `lastName`, `email`, `phone`, `noonOne`, `credits: 25.5`, `address { label 'Home', line 'Marina Gate 2, Dubai Marina', city 'Dubai' }`), `categories` (12 `{ id, name, emoji }`).
- `categories.ts`: `taxonomy`, `categoryById`, `categoryPath(id)`, `isInCategory(id, ancestorId)`, `leafName(id)`.

---

## 2. Navigation API (`src/kit/Navigator.tsx`)

`const nav = useNav();` (throws outside `<NoonPrototype>`).

| Member | Signature | Notes |
|---|---|---|
| `push` | `(route, params?, opts?: { transition?, presentation? }) => void` | `route` = `flow/screen`, bare `screen` (current flow), alias, or `flow` |
| `replace` | `(route, params?, opts?)` | swaps the top entry; default transition `fade`. Used for variant switches (`nav.replace('pdp/detail', { productId })`) and loader → result (`checkout/placing` → `checkout/confirmation`) |
| `sheet` | `(route, params?)` | = `push(route, params, { presentation: 'sheet' })` |
| `back` | `() => void` | pops; with no history slides in `parentOf(route)` |
| `popToRoot` | `() => void` | keeps `stack[0]` |
| `reset` | `(route, params?)` | new stack (fade). Post-order exits: `nav.reset('home/home')`, `nav.reset('orders/list')` |
| `switchTab` | `(tab: TabId)` | stack = `[TAB_ROUTES[tab]]`, no transition |
| `toast` | `(message, opts?: { icon?, action?: { label, onPress }, duration? = 2600, tone?: 'default' \| 'success' \| 'error' })` | max 2 visible |
| `canGoBack` | `boolean` | stack > 1 or a logical parent exists; `Header` shows back from this |
| `route`, `params`, `flowId` | of the calling screen | |
| `isRoot` | `boolean` | screen is `stack[0]` (tab root) |
| `stack` | `StackEntry[]` | `{ key, route, params, presentation, transition }` |

`useParams<P>()` → `useNav().params as P`. Screens also get `params` as a prop (`ScreenProps<P>`). Params arrive as strings when opened by URL (`?empty=1`).

Presentations:

| | How | Chrome |
|---|---|---|
| `screen` | default / `push` | full page, `push` slide; covered screen gets the transition's `under` style |
| `sheet` | `presentation: 'sheet'` or `nav.sheet` | `SheetLayer`: scrim (tap = back), white top-r24 sheet, max-height 88%, grabber, `padding-bottom: var(--nk-inset-bottom)`, drag down > 120px or > 600 px/s dismisses. Component renders its own content (no `<Screen>`), manages inner scroll |
| `modal` | `presentation: 'modal'` | full-screen slide up (`modal`); custom overlays (noonone, membership) use `modal` + a transparent transition (`noonone-overlay`, `mb-overlay`) and draw their own backdrop + sheet (`VIPOverlay`, `VipOverlay`) |

Patterns: in-screen overlays (`returns` `ReturnsOverlay open onClosed`, cart invoice) are local state, not routes — use them when the overlay needs the screen's live state and shouldn't be deep-linkable. Close-then-navigate: `nav.back(); setTimeout(() => …, 600)` (account SignOutSheet) or `VipOverlay` `close(after)`.

---

## 3. Catalogue

Format per flow: id · group · initial · parent/tab. Screen rows: id · title · presentation/transition · path/defaultParams · what it shows.

### home · Discovery · `home` · tab `home`
Files: `src/flows/home/HomeScreen.tsx` — the noon app home feed 1:1 with bappzaar master (`ba159e20`): the live app home CMS payload's modules in its order (`homeFeed` in `data.feed.ts`, one `switch`; tokens `tokens.feed.ts`, keys `homeBz*`), each spaced by its own `ModuleWrapper` (innerPadding / bottomMargin, no feed gap) — and `ClassicHomeScreen.tsx` (previous bappzaar port). Header and hero creatives as before (Figma `iRE9RwO94eMAyW3j3XKNXW` · `1337:5102` header, Eid `Af34gfmhQ1D0wstXUEHSIF` · `89:34398` creatives); mapping in `src/flows/home/FIGMA-MAPPING.md` → "Home feed · bappzaar modules". Tokens: `tokens.ts` merges `tokens.header.ts`, `tokens.rails.ts`, `tokens.modules.ts`, `tokens.tabs.ts`, `tokens.eid.ts`, `tokens.feed.ts` (keys prefixed `home`). bappzaar module components: `BzModuleWrapper` (+ `Sponsored`), `AdBannerModule`, `BannerCarousel` (+ `SnappedBannerCarousel`), `BannerScroller`, `EasyBannerScroller`, `ProductCarousel` (central `ProductCard carousel`), `MegaDeals`, `AdProductLedDisplay`, `ItemCarousel`; creatives in `src/assets/home/bz/`. The 2025 Figma modules (`PromoTicker`, `CategoryGrid`, `OfferTickets`, `ProductRail`, `KeepShopping`, `BrandAdModule`, `LaunchModule`, `HeroBanners`, `DepartmentTabs`, `EidAdBanner`) stay in `components/` but are not rendered.

| id | title | path | shows |
|---|---|---|---|
| `home` | Home | `/homepage` | `HomeHeader` (light-blue 2025 gradient header r12, classic `ExperienceSwitcher`, address row, `SearchBarButton variant="2025"`; collapses past 100px, search stays) → feed in live-payload order: homepage-toggle strip `SnappedBannerCarousel` (341×36.9, auto 3s) → `EidBanners` (noonDynamicCarousel at the CMS layout: 263.67×395.67 r16, gap 15; Nike / Areej / WHOOP) → category icons `BannerScroller` (2 rows, 86 wide) → top-fold-2 `AdBannerModule` (Soundcore 360×90 r20) → "Best picks for you" `ProductCarousel` (138 cards) → "Offers for you" `EasyBannerScroller` (135×176 marquee) → sfu ad (360×90 + Sponsored) → "Bestsellers for you" → "In the spotlight" → 2 coupon carousels → `MegaDeals` (countdown tab, 2×2) → `AdProductLedDisplay` → "Previously browsed products" → "Maximize your savings" (2-row brick marquee) → 2 coupon carousels → "Keep shopping for" `ItemCarousel` → strip-slider (341×140.8) → 2 carousels → category `BannerCarousel`s (Women's, Men's, Beauty, Home & kitchen; 94.29 wide) → "Explore More" (#f9f2a4) → dine-out carousel with media header → Electronics → "Kids' fashion" scroller → Emaar strip |
| `classic` | Home (classic) | `/home-classic` | The previous home: yellow header, `ExperienceSwitcher`, Supermall toggle, `HeroCarousel` portrait cards, promo strip, tile rows, `CardRail`s (offers, spotlight, savings, banners), "Deals of the day" with `DealTimer`, "Recommended for you" `ProductCard` grid |

Flow components: `HomeHeader`, `DepartmentTabs`, `PromoTicker`, `HeroBanners`, `CategoryGrid`, `RecommendedRail` (icon tabs + `SkuCard` rail; currently not on the screen), `ProductRail`, `OfferTickets`, `KeepShopping`, `BrandAdModule`, `LaunchModule`, `ExperienceSwitcher`, `HeroCarousel`, `DealTimer`. Section titles via the exported `Module` (`Text variant="heading"`, `new-black`, x=14, optional `gap`). Copy from here for: any CMS-style feed or campaign page, collapsing header on scroll, horizontal rails, dark sponsored modules.

### search · Discovery · `search`
File: `src/flows/search/SearchScreen.tsx` (82).

| id | title | shows |
|---|---|---|
| `search` | Search | `slide-left` push. Header `SearchInput` (back, autofocus, `fill`, submit → `plp/listing { query }` with `results-fade`). Empty → presearch: `RecentSearches` (edit mode wobble + delete) + "Trending searches" `Pill variant="tag" icon="flame"` (first: "phone"). Typing → `SuggestionRow`s fall in from −20px top → bottom, changed rows crossfade in place (`BlurSwap`), match bolded; no match → "Search for …" row; cleared → rows leave bottom → top |
| `suggestions` | Suggestions | the same screen opened in the typing state (`defaultParams: { q: 'phone' }`) |

Pattern: one screen, three states (presearch, suggestions, leaving) on the `handoff` motion (`motion.md` → "Search → results handoff"): presearch and eight fixed suggestion slots driven by variants, so every exit is staggered and interruptible.

### categories · Discovery · `categories` · tab `categories`
File: `CategoriesScreen.tsx` (81) + `components/CollapsibleBannerModule.tsx`. Data: `data.live.ts` (live CMS snapshot, 29 tiles × 175 sub-categories).

| id | title | params | shows |
|---|---|---|---|
| `categories` | Categories | path `all-categories` | `SearchBarButton` header, `AdBannerModule` pre-search banner, 3-col tile grid; tap a tile opens its sub-category list inline under the row; sub-category → `plp/listing { query, categoryId }` |
| `expanded` | Category opened | `{ open: 'mobiles-accessories' }` | same, with a row open |
| `loading` | Loading | `{ state: 'loading' }` | `ProgressLoader`: pale page + 4px sweeping bar above the tabs |
| `error` | Error | `{ state: 'error' }` | `ErrorView`: empty-error image, "Oops! Something went wrong.", Retry |

Copy from here for: loading/error states of a CMS page (`ViewState` switch), inline expand grid.

### deals · Discovery · `deals` · tab `deals`
File: `DealsScreen.tsx` (118). Reuses `home/data` (`tileRows`, `savingsRows`) and `home.module.css`.

| id | title | shows |
|---|---|---|
| `deals` | Deals | `SearchBarButton` header; cashback strips rail, hero banners rail, category tile rows, `Rail`s of compact `ProductCard`s with "View All" + chevron ("Lowest prices of the year", "Apple bestsellers", "Mega deals", "Bestselling deals", "Trending deals"), savings rail, "Today's Offers & Deals" 2-col grid |

Copy from here for: any offers/campaign page (strips → heroes → tiles → product rails → grid). Smallest complete feed example.

### plp · Shopping · `listing`
Files: `ListingScreen.tsx`, `FiltersSheet.tsx`, `SortSheet.tsx`, `store.ts`, `brands.ts` (`phoneBrands`, `brandWidgetFor`), `components/NavPills.tsx` (`RevealChip`), `components/SkeletonCard.tsx`, `components/BrandWidget.tsx`, `components/MarketplaceStrip.tsx`. Data: `products` (shared catalogue + `src/mocks/phones.ts`), `searchProducts, isPhoneQuery, applyFilters, applySort, countFilters, facets, sortOptions`.

| id | title | presentation | params | shows |
|---|---|---|---|---|
| `listing` | Listing | screen | `{ query: 'Best sellers' }` | Opens in place from search (`results-fade`). Header: `SearchInput` at the search screen's spot (`onFieldPress` → back to editing) · `MarketplaceStrip` (bappzaar `NoonFulfillmentTabs`: noon "Wide assortment" / supermall / express / Global / Minutes, sliding 3px indicator; express = the delivery filter) · `CatalogListHeader` pill row (bappzaar `NoonCatalogListNavPill`): Filter (count, attention animation), Sort, divider, Deals / Brand / Price facet dropdowns, brand + category quick pills, each dropping in over its skeleton (`RevealChip`). Meta "N results for “q”". No brand widget (`BrandWidget` / `brands.ts` are kept for variants but not rendered). Grid: `ProductBoxVertical`s rising out of `SkeletonCard`s (`SkeletonReveal`, 60ms stagger, first 8), filter changes dissolve and re-rise, `layout` reorder on sort; empty "No results match your filters" + Clear all. Bottom `TabBar` rises 88px |
| `filters` | Filters | sheet | `{ facet? }` | Left facet sidebar + option pills (`Pill variant="filter"`), "Search across filters", footer Clear All / Show N results (draft → commit to `plpStore`) |
| `sort` | Sort | sheet | | Radio list; dot slides via `layoutId="sort-radio"`; pick → `plpStore.set` → `setTimeout(nav.back, 180)` |

Copy from here for: any grid of products, filter/sort sheets sharing a store, skeleton → content.

### pdp · Shopping · `detail`
Files: `DetailScreen.tsx` (Storefront PDP, Figma `3499:75115`: `components/storefront/{SfHeader,SfGallery,SfMainInfo,SfSponsoredRow,SfDeliveryCard,SfNewerModelCard,SfVariantsCard,SfTrustCard,SfPaymentOffers,SfProductDetails,SfExtendedWarranty,SfAdditionalInfo,SfBestsellerRow,SfSellerCard,SfProductFeatures,SfSponsoredBrandCard,SfFbtCard,SfReviewsCard,SfRecommendations,SfAtcBar}.tsx`, `FIGMA-MAPPING.md`, `tokens.sfA`–`sfE`), the port's `components/{Gallery,SfHeader,SfMainInfo,Sections,Variants,Reviews,SfAtcBar,RecoCard,VipPreference,Stars,Asset}.tsx`, `AddedSheet.tsx`, `VariantsSheet.tsx`, `data.ts` + `data.live.ts`, `MAPPING.md` (522 lines).

| id | title | presentation | params | shows |
|---|---|---|---|---|
| `detail` | Product detail | screen, `overlayHeader` | `{ productId: IPHONE_17_PRO_ID }` | pinned shrinking `SfGallery` → `SfMainInfo` (title toggle, `PdpPrice`, nudge ticker, rating → scroll to reviews) → `DeliveryCard` → `PaymentsCard` → `VariantsCard` (chip groups; other SKU → `nav.replace`) → `ReinforcementCard` → `OverviewCard` (accordions) → `AdditionalInfoCard` → `CategoryBestSellerCta` → `SellerCard` → `FbtCard` → `ReviewsCard` (AI summary) → `Recommendations` "More from {brand}" / "Customers Also Viewed". Header turns white after 100px; "Back to top" past one screen. Footer `SfAtcBar`: QTY · Buy Now · Add to cart (loading lottie) → `nav.sheet('pdp/added')` |
| `deliveryVariants` | Delivery information variants | screen | `{ productId }` | every `SfDeliveryCard` variant (crossSell, noCrossSell, market, express, global; PDP Redesign 3583:109620) stacked; `pdp/detail?delivery=<variant>` forces one on the PDP |
| `variants` | Variants | sheet | `{ productId, sizeMissing? }` | size chips, QTY + ADD TO CART, warning + shake when size missing |
| `added` | Added to cart | sheet | `{ productId, qty?, recsVariant? }` | `Lottie name="atcCheck"` over product image, row slides in, CONTINUE SHOPPING / VIEW CART |

Copy from here for: detail pages with stacked white cards (`Card` in `Sections.tsx`), sticky action bar with loading state, header that solidifies on scroll (`useScroll({ container })` + `useMotionValueEvent`).

### cart · Shopping · `cart` · tab `cart`
Files: `CartScreen.tsx` (164), `components/{CartHeader,CartGroup,CartItem,InactiveGroup,CouponInput,SalesCallout,CartCarousel,FreeGifts,CartFooter,DynamicInvoice,CartWave,CartSnackBar,QuantitySelector}.tsx`, `invoice.ts`, `data.ts` (`t`, `cartUpdates`, `paymentCallouts`, `freeGift`), `FIGMA-MAPPING.md`.

| id | title | presentation | params | shows |
|---|---|---|---|---|
| `cart` | Cart | screen | | 450ms loader → `CartHeader` (address, animated on scroll) + server-ordered `SECTIONS`: `updates` banner → `groups` (`CartGroup` per express / marketplace / xborder with free-delivery progress, `CartItem` stepper, heart, chips) → `secondary_groups` (`InactiveGroup`) → `cms_bottom` (`CartCarousel` offers) → `wishlist` carousel → `free_gifts` → `coupon_tray` (`CouponInput`) → `callouts` (payment offers). Footer `CartFooter`: savings wave tab, sliding invoice, Total · N items + Checkout (→ `checkout/checkout { coupon }` or `noonone/cartOverlay`) |
| `empty` | Cart (empty) | screen | `{ state: 'empty' }` | empty-generic image, "Your cart is empty" + recommendations; no footer |
| `loading` | Cart (loading) | screen | `{ state: 'loading' }` | ProgressLoader |
| `variants` | Change variant | sheet | `{ productId: 'p6' }` | variant chips → Update Item |
| `customize` | Customize item | sheet | `{ productId: 'p1' }` | engraving text with counter, Save Message → toast |
| `discount` | Discount details | sheet | `{ productId, tagId, copyOnly? }` | apply coupon, terms, eligible items carousel |
| `bundles` | Bundle details | sheet | `{ productId: 'p8' }` | gradient header + bundle Lottie, items, Combo Total |
| `updates` | Cart updates | sheet | | price-drop / out-of-stock list |

Copy from here for: server-ordered section switch (`SECTIONS.map(renderSection)`), sticky footer that measures itself (`onHeightChange` → `contentStyle.paddingBottom`), one screen registered as several states.

### checkout · Shopping · `checkout` · parent `cart/cart`
Files: `CheckoutScreen.tsx` (272) + 20 screens, `components/` (CheckoutHeader, CheckoutShipment, DeliveryInstruction, ReceiverDetails, BurnSection, PaymentMethods, PaymentSummary, DynamicInvoice, CouponStatus, EarnCallout, NoonOneSection, DetachedAddress, SlideButton, VoucherToast, Reloader, ProviderForm, RewardsPrimitives…), stores `store.ts`, `store.delivery.ts`, `store.rewards.ts`, `totals.ts` (`useCheckoutTotals`), `MAPPING.md` + `FIGMA-MAPPING.md`.

| id | title | presentation / transition | shows |
|---|---|---|---|
| `checkout` | Checkout | screen | sections via `params.sections` (default `FIGMA_SECTIONS`: `shipments, delivery_instructions, receiver_details, payment, payment_summary`; `MASTER_SECTIONS` adds `detached_address, integrated_noonone, coupon_status, earn, dynamic_invoice`). Footer: `SlideButton` (or Apple Pay) + "N Items" + total. Slide → `checkout/placing` |
| `promise-info` | Delivery lane info | sheet | lane title + text (`{ title, textContent }`) |
| `cards-select` | Select card | sheet | saved cards |
| `add-card` | Add card | sheet | card form + validation |
| `special-emis` | Special EMIs | sheet | |
| `emi-plans` | Installment plans | sheet | |
| `alternate-phone` | Receiver details | sheet | receiver form |
| `alternate-phone-contacts` | Contacts | sheet | contact list |
| `learn-more` | Delivery instructions | sheet | `{ isList: true }` |
| `burn-providers` | Points & vouchers | sheet | provider list (SHARE, Skywards, YOUGotaGift, Flex, Gift+) |
| `provider-burn` | Redeem points | sheet | `{ code: 'share' }` provider form |
| `provider-burn-otp` | Verify OTP | sheet | amount entry, balance, OTP |
| `earn` | Earn points | sheet | |
| `provider-earn` | Earn points (provider) | sheet | |
| `provider-earn-help` | How it works | sheet | |
| `installation` | Installation slots | sheet | `{ shipmentId: 'shp-1' }` slot picker |
| `placing` | Placing order | screen / `none` | post-order loader, then `nav.replace('checkout/confirmation', {}, { transition: 'checkout-alpha' })` or failure |
| `confirmation` | Order confirmation | screen / `checkout-alpha`, `statusBar: 'dark'` | header, `ShipmentV2` card (stacked image carousel, shipment nr), address + delivery instructions, notifications banner; sticky Continue shopping (`nav.reset('home/home')`) / View order (`nav.reset('orders/list')`) |
| `track-steps` | How to track | sheet | steps image + CONTINUE SHOPPING |
| `payment-failure` | Payment failed | modal | failure + `Button variant="noonDotted"` Need help |
| `payment-failure-help` | Need help | sheet | |

Copy from here for: long forms of section cards, slide-to-confirm, loader → result with `replace`, success page, loyalty points UI (`BurnSection`, `RewardsPrimitives`, `data.rewards.ts`).

### orders · Post-order · `list` · parent `account/account`
List + tracking follow the PDS reference (pds-noon-as.vercel.app one-flows, measured — `MAPPING.md` "PDS reference"); cancel is the bappzaar port.
Files: `OrdersListScreen.tsx` (107), `OrderTrackingScreen.tsx` (280), `OrderCancelScreen.tsx` (105), `components/{OrderCards,StatusHeader,Thumb,PinTiles,StarRating,ImageStack,Stepper,WindowPill,BillSummary}.tsx`, `assets.ts` (`src/assets/orders/pds/`), `motion.ts` (`reveal`, `pressDip`), `data.ts` (`orders` o1 active · o3/o4 delivered · o7 returned · o8 exchanged · o5 cancelled, `activeOrders`, `historyOrders`, `orderFilters` + `matchesFilter`, `trackingSteps`, `heroVariant`, `money2`, `cancelReasons`, `orderById`), `MAPPING.md`.

| id | title | params | shows |
|---|---|---|---|
| `list` | My orders | | Header scrolls with the page: back circle + "Search all orders" pill; chips Filter ▾ · Delivered · Cancelled · Returns · supermall · express (tap toggles a filter, `supermall.press` dip). "Active" `ActiveOrderCard` (status strip + express pill, thumb, Arriving today / On time, Call / Chat rider, Delivery PIN tiles). "Order history" `HistoryOrderCard`s: delivered + exchanged (price, warranty chip, `StarRating` → `openReview` from `reviews/store`), return completed (refund chip, Track my refund → `returns/details`), cancelled (×2 thumb, Refund credited row). Collapsed `NeedHelpButton` FAB. Content reveals on `supermall.reveal` |
| `tracking` | Order tracking | `{ orderId: 'o1', variant?: 1–4 }` | Header (back, order no. + copy, item count, ⋯), 8-card `ImageStack` ring + express pill, status line, 32/700 ETA, `WindowPill` (variant 1 white pill; 2 warm wash + glass pill + heat advice; 3 orange glowing pill; 4 warm glow behind the tracker — 2–4 rotate the stack); tracker card (`Stepper` fill + disc pops, rider row, Share delivery PIN, Reschedule / See all updates); Delivering to (address, receiver, checkbox tiles); Order summary (Cancel items → `orders/cancel`, return / warranty notes); `BillSummary` (Apple Pay, noon One strip → `noonone/landing`, coupon, total, savings footer, Download invoice); FAB |
| `cancel` | Cancel items | `{ orderId: 'o1' }` | `Header variant="transparent"`; checkbox cards expanding reason pickers; footer refund banner + `Button variant="secondary"` / `variant="checkout"` |

Copy from here for: card lists with status strips, a horizontal stepper, PIN tiles, star rating rows, a bill summary with a savings footer, footer with two buttons.

### returns · Post-order · `history` · parent `account/account`
Files: `ReturnsHistoryScreen.tsx`, `ReturnableListScreen.tsx`, `ReturnSubmitScreen.tsx` (376), `ReturnSummaryScreen.tsx`, `ReturnDetailsScreen.tsx`, `components/{AFSBackHeader,AFSButton,ReturnsOverlay,TrackingSteps,FeedbackWidget,CommentInput,SummaryButton,ProductDetails,Dashed}.tsx`, `components/sections/Sections.tsx`, `components/overlays/{SubmitOverlays,DetailsOverlays}.tsx`, `store.ts` (`returnsStore`), `MAPPING.md`.

| id | title | path / params | shows |
|---|---|---|---|
| `history` | Returns history | path `returns-history`; `?empty=1` | expanding search (250ms), year picker, status chips, return cards with status gradient strip, footer "New return request" → `returnable` |
| `returnable` | Your recent purchases | path `returnable-items` | blur back header, status strip, Return button → `submit` |
| `submit` | Return an item | `{ orderId: 'o3', productId: 'p5' }`; `?error=1` | progressive sections reason → photos → resolution → refund method → pickup; done sections collapse into edit cards; overlays: refund details, upload image, guidelines, evidence skip, pickup address |
| `summary` | Return request summary | `{ productId: 'p5' }` | detail tiles, reason, pickup; footer Continue shopping → `nav.switchTab('home')` |
| `details` | Return details | `{ productId: 'p5' }` (alias `/returns`) | processing Lottie + success header (after `success=1`), tracker → timeline overlay, cancel return confirm, NPS → feedback overlay, refund summary, policy |

The README's "+13 sheets" are in-screen `ReturnsOverlay`s, not registered routes. Copy from here for: step-by-step forms, success header moving up, in-screen overlays.

### reviews · Post-order · `rate` · parent `orders/list`
R&R 2.0 (Figma `KzR8dy12uT8CtgBRHHY6Qx`, repo vbirla789/R-R-2.0-with-checkbox). All nine screens built, plus shared parts: `store.ts` (`reviewsStore`, `useReviews`, `reviewsActions`, `openReview(nav, { orderId?, rating, product?, variant? })`, `reviewsNav` graph helpers), `data.ts` (products, pools, `getAttributes`, drafts, `copy`), `tokens*.ts` (`reviewsMotion`), `components/` (`StarRatingInput`, `AttributeChips`, `ReviewProductHeader`, `AiToggle`, `DraftCard`, `AddPhotos`, `MockKeyboard`, `ReviewHeader`, `ReviewFooter`, `ReviewTextField`, `ReviewSheet` / `RewriteSheet` / `EditReviewSheet`, `PastOrderCard`), `README.md`, `MAPPING.md`. Alias `/reviews`.

| id | title | presentation / path | shows |
|---|---|---|---|
| `rate` | Rate & pick | push · `rate-review` · `{ rating: 4, variant: 'A' }` | ManualReview: product + stars, Write with AI, checkbox picks, note → loader / draft |
| `aiLoader` | AI writing | push · `review-ai-loader` | purple bloom sweep, Stop processing → replace with draft (fade) |
| `draft` | Review draft | push · `review-draft` | draft A: polaroid top, show more / less, edit sheet |
| `draftB` | Review draft (B) | push · `review-draft-b` | draft B: in-place edit, Save bar + keyboard |
| `new` | Write a review | push · `new-review` · `{ product: 'bike' }` | single scroll: chips, inline AI draft, photos, edit patterns |
| `pastOrders` | Rate your past orders | fade · `rate-past-orders` | product strip, per-product picks + draft |
| `submitted` | Review submitted | fade · `review-submitted` | success Lottie, review card, auto-advance |
| `deck` | Rate past orders (deck) | fade · `rate-orders-deck` | stacked swipe deck, one-tap stars |
| `slider` | Rate past orders (slider) | fade · `rate-orders-slider` | horizontal strip variant |

### account · Profile · `account` · tab `account` (`account`, `signedOut`)
Files: `AccountScreen.tsx`, `components/{ProfileCard,ActionCards,AccountSection,MenuGroup,AccountFooter,EditRing}.tsx`, sheets, `store.ts`, `data.ts` (`accountSection, settingsSection, securitySection, MenuItem { id, title, icon, route?, presentation?, toast? }`, `copy`), `MAPPING.md` (bappzaar master → kit for the top blocks).

| id | title | presentation / transition | shows |
|---|---|---|---|
| `account` | Account | screen | `ProfileCard` (name, completion ring → stays filled, noon One strip: Start Trial / Join Now, members see savings), `ActionCards` (title-only cards, My Orders → `orders/list`, My Wishlist → `wishlist/wishlist`, four 48×68 tiles overlapping by 10 — product photos, else the bappzaar default icons; `?orders=none` / `?wishlist=none`), noon Credits row, `MenuGroup`s (Addresses modal, Manage cards, Returns, Warranty toast, Language switcher, Country; Preferences, Notifications; Account security, Sign out), `AccountFooter`. Sections stagger in (spring, 50ms each) |
| `signedOut` | Signed out | screen | slides + sign-in CTA |
| `editProfile` | Edit profile | screen | floating-label fields, gender/tourist/nationality/diet chips, % badge, Save footer |
| `birthday` | Birthday picker | sheet | date wheel |
| `nationality` | Nationality list | sheet | |
| `security` | Account security | sheet | rows → manage devices / change password / deletion |
| `manageDevices` | Manage devices | screen | device list, sign out device |
| `changePassword` | Change password | screen | `Header back`, password fields + requirement checks, footer submit with `Spinner` |
| `deletion` | Account deletion | modal | |
| `deletionReason` | Deletion reason | sheet | |
| `notifications` | Notifications | sheet | `Switch` rows |
| `preferences` | Preferences | sheet | |
| `policies` | Policies | sheet | |
| `country` | Country selector | sheet | |
| `changeCountry` | Change country | modal / `fade` | `{ country: 'SA' }` full-screen Lottie |
| `changeLanguage` | Change language | modal / `fade` | `{ language: 'ar' }` |
| `signOut` | Sign out | sheet | icon card + Cancel / Yes, sign out (`SheetBody`, `SheetButtons`) |

Copy from here for: profile hubs, menu groups of rows, simple confirm sheets, settings sheets.

### address · Profile · `select` · parent + `sheetBackdrop` `account/account`
Files: `SelectScreen.tsx`, `MapScreen.tsx` (358), `SearchScreen.tsx`, `SuccessScreen.tsx`, `ControlsSheet.tsx`, `LocationAccessSheet.tsx`, `components/{select,form,map,StreetMap,mapWorld}.tsx`, `store.ts` (`addressStore`, `useAddressStore` — used by checkout), `transitions.ts`.

| id | title | presentation / transition | params | shows |
|---|---|---|---|---|
| `select` | Address Book | modal | | 650ms skeleton → saved address cards (default = blue header), tap → loader + "Address updated" toast; ⋯ → `controls` sheet; search; Delivery / Locker-Pickup tabs; Add new address → `map` |
| `map` | Map pin (add) | modal / `address-map` | `{ flow: 'create' }` | draggable map, pin lift/drop, tooltip, unserviceable state, current location |
| `create` | Address details (create) | modal / `address-map` | `{ flow, placeId, expanded: true }` | form overlay: Home/Work/Other chips, floating labels, required errors |
| `update` | Address details (edit) | modal / `address-map` | `{ flow: 'update', addressId, expanded }` | |
| `success` | Address saved | `address-success` | `{ line }` | success animation |
| `controls` | Address controls | sheet | `{ id }` | Edit / Share / Verify / Delete |
| `search` | Search location | modal / `address-search` | | results, current location, locate on map |
| `locationAccess` | Location access | sheet | | permission prompt |
| `locationOff` | Address Book (location off) | modal | `{ locationDenied: true }` | "Location not enabled" nudge |
| `toast` | Address toast | screen | `{ demoToast, skipLoading }` | toast demo |

### cards · Profile · `cards` · parent `account/account`
Files: `CardsScreen.tsx` (298), `AddCardScreen.tsx`, `AddCardSuccessScreen.tsx`, `components/{AnimatedListCard,ActionsOverlay,Form,Headers,Bits,primitives}.tsx`, `store.ts` (`cardsStore`, `useCards`), `utils.ts`.

| id | title | params | shows |
|---|---|---|---|
| `cards` | Saved cards | `statusBar: 'dark'` | 1s shimmer → wallet-style stacked cards bouncing in; "Add card" pill collapses on scroll; drag to fan; tap → card flies up over actions panel |
| `actions` | Card actions | `{ select: 'first-non-default' }` | Add name / Set as default / Delete |
| `delete` | Delete confirmation | `{ select, action: 'DELETE_CARD' }` | |
| `empty` | No saved cards | `{ seed: 'empty' }` | empty state |
| `many` | Many cards (sections) | `{ seed: 'many' }` | Top cards / All other cards |
| `add` | Add card | | scan / tap / manual options → form, live brand logo |
| `form` | Add card — form | `{ manual: true }` | |
| `success` | Card saved | transition `fade` | save_card reveal Lottie |

### noonone · Profile · `landing` · parent `account/account` · `sheetBackdrop` `noonone/landing`
Files: `screens/*.tsx` (22 screens), `screens.{landing,plans,payment,offers,entry}.ts`, `components/landing/{modules,LandingHeader,StickyFooter,TransitionAnim,DashedLine}.tsx`, `components/plans/PlanCard.tsx`, `components/VIPOverlay.tsx`, `VIPButton.tsx`, `store.ts`, `data.*.ts`, `MAPPING.md` (662). Overlays = `{ presentation: 'modal', transition: 'noonone-overlay' }`.

| id | title | presentation | path / params | shows |
|---|---|---|---|---|
| `landing` | noon One | screen, dark status | path `noon-one`, `noonvip` | non-member: `BannerModule` (Lottie hero), `MpBenefitsCarousel`, `BenefitsModule`, `FamilyPlanModule`, `GuideStepsModule`, `FaqModule`, terms; sticky `StickyFooter` "Start free trial" + View all plans. Member: bg image + `MembershipOverviewModule` (→ `membership/manage`), `SavingsOverviewModule`, benefits, FAQ. Skeleton while loading; `TransitionAnim` success |
| `success` | Subscribed (success animation) | screen | `{ demo: 'success' }` | |
| `plans` | Choose your plan | screen | path `noon-one-all-plans`, `vip-plans` | segmented plan select V3, `PlanCard`s, footer CTA |
| `planDetails` | Plan details (trial guide) | overlay | `{ planCode: 'ONE_MONTHLY', variant: 'landing' }` | plan card + trial tag, reminder, CTA |
| `trialGuide` | Trial guide | overlay | | |
| `planOption` | Plan options | overlay | | |
| `familyPlans` | Family plans | screen | path `noon-one-sharing` | members, benefits, footer |
| `payment` | Payment | screen | `{ planCode: 'ONE_MONTHLY' }` | saved card / new card / CVV / Apple Pay / mobile pay, footer subscribe |
| `addCard` | Add card | overlay | | |
| `addCvv` | Add CVV | overlay | `{ cardId: 'card_2' }` | |
| `mobilePay` | Pay with mobile | overlay | | phone + OTP |
| `info` | Info popup | overlay | | |
| `generic` | Generic overlay | overlay | | |
| `offers` | noon One offers | overlay | path `noon-one-vouchers`, `noon-one-bank-offers`, `noon-one-input-referrals`, `noon-one-referrals-input` | vouchers / bank offers / referral input tabs |
| `partnerOffer` | Partner offer | screen | `{ campaignCode: 'enbd' }`; path `noon-one-partner-offer`, `noon-one-stc` | |
| `confirmOffer` | Confirm offer plan | overlay | `{ offer: 'ONE30' }` | |
| `confirmVoucher` | Confirm voucher plan | overlay | `{ offer: 'SARA25', code: 'SARA25' }` | |
| `bundle` | Bundle (Yango Play) | modal / `sheet`, light status | `{ bundlePartnerCode: 'yango' }`; path `noon-one-bundle` | |
| `acceptInvite` | Accept plan invite | overlay | path `noon-one-share-invite` | |
| `acceptInviteError` | Accept invite error | overlay | | |
| `cartOverlay` | Cart overlay | overlay | | upsell pushed from cart Checkout |
| `ocOne` | OC One overlay | overlay | `{ status: 'succeeded' }` | order-confirmation upsell |

Copy from here for: marketing/benefit landing pages (`modules.tsx`), plan pickers, subscription payment, success celebration, sticky CTA footers.

### membership · Profile · `manage` · parent `account/account`
Files: `ManageMembershipScreen.tsx`, `components/{ManagePlan,FamilyMembersSection,VipOverlay,primitives,icons}.tsx`, `plans/ cancel/ family/ perks/` (each `screens.ts`), `store.ts` (`membershipUi`, `membershipEvents`), `data.ts` (`t()` over `locale/vip-en.json`), `MAPPING.md`, `perks/MAPPING.md`. Overlays = `overlayScreen` (`{ presentation: 'modal', transition: 'mb-overlay' }`).

| id | title | presentation | path / params | shows |
|---|---|---|---|---|
| `manage` | Manage membership | screen / `mb-modal` | path `manage-membership`, `noon-one-manage-membership`; `?state=active\|trial\|cancelled\|familyOwner\|familyMember\|upcoming` | `ManagePlan` card(s) + benefits, plan action row, `FamilyMembersSection`, payment method + buttons, cancel row; `SuccessAnim` on `celebrate` |
| `upgrade` | Change plan | screen | path `noon-one-upgrade`, `upgrade-plan` | |
| `reviewPlan` | Review and confirm | overlay | `{ planId: 'ONE_ANNUAL' }` | |
| `switchPlan` | Switch plan | overlay | `{ planId: 'ONE_DUO_MONTHLY' }` | |
| `info` | Info overlay | overlay | | |
| `changePlan` | Choose your plan | screen | path `change-plan` | |
| `invoice` | View invoice | screen | path `invoices`, `invoice` | |
| `cancel` | Cancel membership | screen | path `cancel-membership`; `{ mode: 'cancel' }` | multi-page retention flow |
| `cancelSheet` | Cancel – overlay page | overlay | `{ mode, index: 1, state: 'trial' }` | |
| `unusedSeats` | Unused seats | overlay | `{ mode: 'cancel' }` | seat rings, Share invite |
| `planOptions` | Switch plan instead | overlay | `{ mode: 'cancel' }` | |
| `groupSavings` | Family group savings | overlay | | |
| `loseAccess` | Lose access warning | overlay | | |
| `leaveFamilyOverlay` | Leave family plan – confirm | overlay | `{ mode: 'leave' }` | |
| `confirmOffer` | Confirm retention offer | overlay | `{ mode: 'cancel' }` | |
| `familyPlans` | Family plans | screen | path `family-plan`, `family-plans` | |
| `familyReview` | Family plan review | overlay | `{ planCode: 'ONE_FAMILY_MONTHLY' }` | |
| `shareInvite` | Share plan invite | screen | path `share-invite` | |
| `removeMember` | Remove family member | overlay | `{ memberId: 'Z8K2M4' }` | |
| `leaveFamily` | Leave family plan | screen | path `leave-family` | |
| `referrals` | Refer & Earn | screen | path `referrals`, `noon-one-referrals` | title, header image, stat tiles, "how it works" steps; sticky footer: dashed copy-code box + WhatsApp / share buttons |
| `referralsInput` | Referral code | overlay | path `referral-code`; `{ preselectedIndex: 1 }` | |
| `partner` | Partner offer | overlay | | |
| `yangoCredits` | Yango Play credits T&C | overlay | `{ isTrialValid: true }` | |

Copy from here for: subscription management, retention/cancel flows, referral pages, stat tiles.

### wishlist · Profile · `wishlist`
Files: `WishlistScreen.tsx` (78), `EmptyWishlistScreen.tsx`, `components/{WishlistHeader,CollectionTile,WishlistAtc,ViewCartPill,EmptyState}.tsx`, `data.ts` (`collections`).

| id | title | shows |
|---|---|---|
| `wishlist` | Wishlist | `WishlistHeader` (title swaps "Wishlist" → "All Saved Items" on scroll, Create pill fades), collections `nk-hscroll`, 2-col grid of `ProductCard quickAdd={false} compact` + `WishlistAtc` (soft ATC → stepper), `AnimatePresence` exit on un-heart; floating `ViewCartPill` springs up (outside `<Screen>` in a `.stage` wrapper); inline empty state when no items |
| `empty` | Empty wishlist | `EmptyState`: floating hearts, "Nothing saved yet", "Start adding items" → search |

Copy from here for: saved-items grids, floating pill CTAs, animated empty states.

---

## 4. Blueprints

Each blueprint: start from · screens · sections in order · components/motion · data. Routes for new flows are suggestions; pick ids that don't collide.
<!-- planned: pdp/oos, ../../cart/SKILL.md, ../../checkout/SKILL.md, ../../pdp/SKILL.md -->

### Home page
Start from `home/home` (copy `HomeScreen.tsx`, `home/data.ts`). Tab root: `tabBar: { tab: 'home', screens: [...] }` only if you replace the home flow; otherwise build as a pushed screen.
Design source: Figma Homepage Revamp 2025, analysed in `../../home-page/references/figma-homepage-2025.md`; screen skill `/home-page` (`../../home-page/SKILL.md`).
1. Header (custom, not `Header`): gradient bg with an r12 bottom (2025: light-blue radial), `ExperienceSwitcher` (73×76 tiles, r15, gap 6, selected tile `brand`), address row (16/21 600 + 14/18) + a 36 white wishlist circle, `SearchBarButton height={48}`. Collapse the switcher and address past 100px (`onScroll` + `motion.div animate height`); the search stays pinned. The 2025 design has no toggle row.
2. Feed `gap: 28`, titles `Text variant="heading"` in `--nk-palette-new-black` with `padding: 0 14px`, rails `padding: 0 12px`. Order: PromoTicker (351×62 ticket + n/N pager) → hero banners (330×150 r20, gap 9, "Ad" badge) → CategoryGrid (2 rows of 92×128 tiles, gap 16) → "Recommended for you" (sticky icon tabs + 134px SKU rail) → OfferTickets → Bestsellers rail → Keep shopping for → sponsored BrandAdModule (dark, full-bleed, video tile) → Selling out fast rail → LaunchModule (dark inset r20). These modules are not built yet; the analysis names them and gives their specs. Never place two dark or two sponsored modules next to each other.
Current implementation (bappzaar port in `src/flows/home`): CMS gradient header (`homeTokens.headerBg`) with `SearchBarButton rotatingWords` and a Supermall toggle row; feed `gap: 20`: hero carousel → promo strip → 2-row tile `nk-hscroll` → `CardRail`s (offers 147×192, spotlight 147×205) → savings rows → banners (357×147) → deal card (yellow gradient, `DealTimer`, compact `ProductCard width={156}`) → "Recommended for you" grid with `whileInView` rise.
Screen: `<Screen header background="bgSurface" withTabBar safeTop={false} onScroll>`. Every tile → `nav.push('plp/listing', { query })`.

### Search
Start from `search/search`. Header `SearchInput` (with `fill`); presearch (recent + trending `Pill variant="tag"`) ↔ suggestion slots on the `handoff` motion (`searchTokens`); rows crossfade with `BlurSwap`. Every pick → `go()` → rows leave fast → `nav.push('plp/listing', { query }, { transition: 'results-fade' })`. Data: `recentSearches`, `trending`, `suggest(q)`.

### PLP / category listing
Start from `plp/listing` (+ `filters`, `sort`, `store.ts`). Header `SearchInput onFieldPress` + `MarketplaceStrip` + `nk-hscroll` pills wrapped in `RevealChip`; meta line; 2-col grid `gap 12, padding 2px 12px`; cards in `SkeletonReveal` on `plpTokens.timeline` (first 8); filter swaps via `plpTokens.swap`; empty filter state; `TabBar` footer. Sheets read/write `plpStore`. Pass `categoryId` from categories.

### PDP
Start from `pdp/detail`. `<Screen ref overlayHeader safeTop={false} footer={<SfAtcBar/>}>` (QTY + Add to cart over the tab bar); white `Card` sections in the Storefront order (gallery → main info → sponsored row → delivery → newer model → variants → trust → payment offers → product details → extended warranty → additional info → bestseller → seller → A+ features → sponsored brand → FBT → reviews → similar / top products), all in `components/storefront`. Variant SKU switch with `nav.replace`. ATC → `addToCart` → `nav.sheet('pdp/added')`. Data: `pdpContent(product)`, `productById`.
Design source: the newer Storefront Figma, analysed in `../../pdp/references/figma-storefront-pdp.md`; screen skill `/pdp` (`../../pdp/SKILL.md`).
- Order: gallery (+ 360 button) → info (brand strip `--nk-palette-lavender` + "Visit Store") → sponsored product row ("Ad") → "Newer model available" card → delivery / variants / reinforcement / payment offers (in stock only) → Product Details accordions (Overview · Highlights · Specifications) → Bestseller → Seller → Product Features (A+, collapsed at 610 + View More) → sponsored brand carousel → Frequently bought together → Ratings & Reviews (photo reviews, bordered review cards) → Similar Products → Top products in {category}. Card titles 15/700/17.
- States: out of stock / not available at location → no price block and no `SfAtcBar`; the footer is an OOS banner (top r16, red 12/600) + a successor chin that slides up (`spring.sheet`) once the in-page newer-model card leaves the viewport. The newer model opens with `nav.push('pdp/detail', { productId })`. In stock: QTY + full-width Add to cart.
- Ask before restyling `pdp/detail` (a 1:1 bappzaar port); otherwise add new screens (e.g. `pdp/oos`).
- Brand storefront: no design yet. "Visit Store" → `nav.push('plp/listing', { query: brand })`; ask for storefront frames before building one.

### Cart
Start from `cart/cart`. Keep `SECTIONS` switch; groups from `cartGroupOf`; totals only from `useDemoStore().cartTotals`; footer `CartFooter` (measured height → content padding); empty state with recommendations; states as extra ScreenDefs (`{ state: 'empty' | 'loading' }`). Item edits open sheets (`nav.sheet('cart/variants', { productId })`).
Design source: Figma Cart 2.0, analysed in `../../checkout/references/figma-cart-checkout.md` (node tables in `src/flows/cart/FIGMA-MAPPING.md`); screen skill `/cart` (`../../cart/SKILL.md`).
- Page `bgPage`, 12 gutter, 12 between r16 cards. Order: groups → offers carousel → wishlist carousel → free gifts → coupon → payment offers.
- Groups are themed only via `groupTheme` (`src/flows/cart/tokens.ts`). Keep the overlaps: glass container −24 over the progress footer, stepper −16 over the image, savings wave −16 over the footer.
- Footer = `CartFooter`: Total with a dotted underline opens the invoice, plus the brand-blue Checkout button (h52 r12).
- States as ScreenDefs: `empty`, `loading` exist; add `error` (`{ state: 'error' }`, the categories `ErrorView` pattern + `Button variant="dark" size="sm"`) and a best-price variant if needed.
- Not built yet: supermall group, best-price coupon strip, installment-tile payment offers, freebie line item.

### Checkout
Start from `checkout/checkout`. Section cards on `--nk-color-chk-fig-page`, `contentStyle={{ paddingInline: 'var(--nk-space-s12)' }}`; new step = new `CheckoutSectionId` + sheet screen. Confirm with `SlideButton` → `push('checkout/placing', …, { transition: 'none' })` → `replace('checkout/confirmation', {}, { transition: 'checkout-alpha' })`. Exits: `nav.reset('home/home')` / `nav.reset('orders/list')`. Address from `useAddressStore`.
Design source: Figma Checkout 2.0, analysed in `../../checkout/references/figma-cart-checkout.md`; `src/flows/checkout/FIGMA-MAPPING.md` maps every node. Screen skill `/checkout` (`../../checkout/SKILL.md`).
- Order (`FIGMA_SECTIONS`): shipments → delivery instructions → receiver → Points & Vouchers + Pay With (one card, split by a 1px line) → payment summary. Dock = `SlideButton` + "N Items · total".
- Selected method / option = `--nk-palette-alice-blue` fill + 1px `--nk-color-link` (payment) or `--nk-palette-light-blue` (instructions) border; unselected keeps a 1px transparent border so nothing shifts.
- Empty CVV disables the slider ("Enter CVV"); a press on the disabled slider scrolls to payment (`guideToPayment`).

### Orders & tracking
Start from `orders/*`. List: header in the scroll (no scroll reaction), chip row in `.nk-hscroll`, sections "Active" / "Order history", flow-local `OrderCards` (status strip, `Thumb`, `PinTiles`, `StarRating`). Tracking: `ImageStack` ring, `WindowPill`, tracker card with `Stepper`, info blocks (Delivering to · Order summary · `BillSummary`), `NeedHelpButton collapsed` as the chat FAB. Data: `orders` shape (`status, statusWord, step 0..3, stepDates, eta, items, itemCount, stack, pin, rider, address, receiver, bill, marketplace`).

### Returns
Start from `returns/*`. History (search + chips + cards) → returnable list → submit (progressive sections, collapsed edit cards, in-screen overlays) → details/summary. Reuse `AFSBackHeader`, `AFSButton`, `ReturnsOverlay`, `TrackingSteps`.

### Account / profile
Start from `account/account`. Page `bgPage`, sections 12 apart, gutter 15; `ProfileCard` → `ActionCards` → value row (noon Credits pattern) → `MenuGroup`s from `MenuItem[]` data (`route` + `presentation` or `toast`) → footer. Entry with `enter(i)` spring stagger. Settings live in sheets (`SheetBody`, `SheetButtons`). New inner screens: `<Screen header={<Header title back />}>`.

### Loyalty / rewards (no existing flow — composed)
No loyalty flow exists. Compose from: noonone landing modules (hero, benefits, guide steps, FAQ), membership manage (status card, rows), referrals (stat tiles, code box footer), checkout rewards (`BurnSection`, `data.rewards.ts` providers/points), account (`ActionCards`, credits row), deals (rails). Suggested flow `loyalty`, group `Profile`, `parent: 'account/account'`, `path: ['loyalty']`:
1. `hub` (screen): `Header title="noon Rewards"`; points balance card (big number with `CountUp` from `src/motion/recipes`, tier name, progress bar to next tier — `motion.div` width spring); "Ways to earn" `nk-hscroll` of tiles; "Redeem" 2-col grid of reward cards; "Your benefits" (`BenefitsModule` pattern); "How it works" steps (`GuideStepsModule` / referrals steps); FAQ accordion. Entry from account: add a row to `accountSection` or a strip like the noon One strip.
2. `tiers` (screen): tier cards in a vertical list or `Segmented` tabs; current tier tagged; benefits per tier as `ListRow`s.
3. `reward` (sheet): reward image, cost in points, terms, `Button variant="noon" block` Redeem → loading → toast `tone: 'success'` → points deducted in `store.ts`.
4. `history` (screen): month-grouped rows (orders list month labels), +earned green / −spent, filter `PillRow`.
5. `success` (screen, `fade`) or celebration: `Confetti fireKey` recipe or a kit `Lottie` (`orderConfirmedCheck`, `reviewCheck`).
Data (`data.ts`): `points`, `tier`, `tiers[] { id, name, threshold, benefits[] }`, `rewards[] { id, title, cost, image }`, `activity[] { id, date, month, label, points }`; state in `createStore({ points, redeemed: [] })`. Prices with `currency`.

### Membership / subscription
Acquisition: start from `noonone` (landing → plans → payment → success; `noonOneJourneyActions.subscribe`). Management: `membership/manage` (plan card, family, payment, cancel → retention pages). Read status with `useIsNoonOneMember()`; never fork the store.

### Wishlist
Start from `wishlist/wishlist`: collections rail, grid of compact cards + soft ATC, floating `ViewCartPill`, empty state. Read/write `useDemoStore().wishlist` / `toggleWishlist`.

### Deals / offers / campaign page
Start from `deals/deals` (strips → heroes → tiles → `Rail`s → savings → grid). For coupons, reuse cart `DiscountDetailsSheet` (apply, terms, eligible items) and `CouponInput`. Timers: home `DealTimer`. Campaign variant of the Homepage 2025 language (see Home page above): a pushed screen with `Header` back + search, a campaign hero, PromoTicker, CategoryGrid, tabbed product rails, OfferTickets and an optional `DealTimer` rail.

### Onboarding (no existing flow — composed)
Compose from account `signedOut` (slides `signedOutSlides`), noonone landing hero/benefits, address `locationAccess` sheet, account `notifications` sheet (`Switch` rows). Flow `onboarding`: `welcome` (carousel of slides, dots, `Button variant="noon" block` Continue in footer) → `location` (sheet, reuse address permission pattern) → `notifications` (sheet) → `interests` (chip grid with `Pill variant="filter"` selected state) → `nav.reset('home/home')`. Use `fade` / `fade-up` between steps.

### Address / cards management
Use the flows as they are (`nav.push('address/select', {}, { presentation: 'modal' })`, `nav.push('cards/cards')`). For a new saved-items manager copy `cards` (shimmer → list, actions overlay, delete confirm, empty) or `address/select` (skeleton cards, ⋯ → controls sheet, default badge, toast on change).

### Empty / error / loading states
- Loading CMS page: categories `ProgressLoader` or cart `CartLoading`; per-item: `Skeleton` / `SkeletonCard`; cards shimmer (cards flow).
- Error: categories `ErrorView` (image, title, message, Retry → loading).
- Empty: cart `EmptyCart` (image + header + message + recommendations), wishlist `EmptyState` (animated art + CTA), PLP/orders inline "no results" + Clear filters.
- Register each as its own `ScreenDef` with `defaultParams` (`{ state: 'empty' }`) so it opens by URL and is screenshot-able.
