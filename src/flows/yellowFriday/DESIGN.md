# Yellow Friday × Orbi — design record

## Request

- Problem: Yellow Friday reads as a sale catalogue; customers hunt for deals instead of discovering the few that fit them. The brief (`yellow_friday_personalized_shopping.md`): a short, personalised journey where every pick has a reason, every step gives control, and every next step is closer to purchase.
- Audience and entry point: signed-in customers with at least one signal (a recent purchase, repeat browsing, a wishlist). Entry from the Home campaign strip / Orbi, the Deals tab, or the `/yellow-friday` link in a push or email.
- Outcome: a 30–60 second journey ending with a lineup of 3–5 picks added to the cart (or kept on the wishlist), with a visible saving against today's noon price. Metrics in the brief: attach rate, AOV, units per order, time to add to cart, dismissals.
- Size: large · Flow: `yellowFriday` · Neighbours read: `deals` (rails, SkuCard), `home` (DealTimer, module rhythm), `credits` (sheets, store), `pdp` (Price, ProductImage), `cart` (DemoStore add / wishlist), the Orbi prototype repo (3D-Bot-noon-Flow: the bot's seven faces, the sheet choreography, the colour-slider picker).

## Research

- Repo patterns: product rails and quick add — `src/flows/deals/DealsScreen.tsx` (Rail + ProductCard / SkuCard); countdown pill — `src/flows/home/components/DealTimer.tsx`; Origin sheets with a footer CTA — `src/flows/cart` / `src/flows/credits`; flow-local store across stack entries — `src/flows/credits/store.ts`; price with reference and discount — `src/components/Price`; confetti / count-up / stagger — `src/motion/recipes.tsx`; interest-style selectable cards — `src/flows/plp/FiltersSheet.tsx` (draft-then-commit).
- Mobbin: searched 2026-10-17 (interest selection, mascot-led offers, swipe-to-decide recommendations, bundle builders).

| Reference | Pattern seen | Use for noon | Avoid |
|---|---|---|---|
| [Tabby · favourite categories](https://mobbin.com/screens/e02a4b1d-a31b-4144-90dc-95039a36a3a4) | Chip-cards with an emoji, multi-select, one Next | Interest cards in the sheet, max two, pre-selected guess | Their green selection colour (we use noon yellow + ink border) |
| [Uber Eats · select 3 to get started](https://mobbin.com/screens/c8cc7aac-e5ad-4a2f-b5ab-638cc34ddaac) | A stated limit ("select 3") and a Skip | "Pick up to two" counter under the grid; Skip on the landing | A mandatory step — ours is one tap because the guess is pre-selected |
| [Zalando · your interests](https://mobbin.com/flows/96bb709b-ff49-45d8-ace4-a03add2e571b) | Interests editable later ("edit" pill row) | The "Not me?" correction on the landing signal row | A separate settings flow in v1 |
| [Deepstash · recommendations](https://mobbin.com/screens/26562596-2a4a-4bae-a679-bcc6ec691a3e) | One card at a time, Skip / Add, a stamp on drag | Reveal card stack: drag with Saved / Skip stamps, two round actions | Their red/green button pair — ours is × outline and a yellow heart |
| [Gymshark · Alex's edit](https://mobbin.com/screens/f6a9b0b9-2083-4f68-afc0-8c36a4891042) | "Picked out just for you… the more time we spend together the better" | The reason chip on every card; honest copy about inference | Lifestyle imagery that hides the product |
| [Grill'd · family bundle](https://mobbin.com/screens/ed7a4ba7-6834-4b61-a589-202a51249fd7) | Rows with Swap, a sticky total CTA | Bundle rows with Swap / ×, sticky total + saving | "Required" sections — nothing is forced |
| [Uber Eats · frequently bought together](https://mobbin.com/screens/d13d8e09-fca3-446b-b652-d9305c49b0ea) | "Add 2 · 15.74 ~~30.74~~" CTA with the struck reference | Footer total with struck reference and the saving pill | Up-sell rows unrelated to the item |
| [Target · Circle Week](https://mobbin.com/screens/7b83a7ee-8624-4d4a-b6cb-d47506c8ddb6) / [foodpanda · trial](https://mobbin.com/screens/6075a2b9-1b49-46a0-bf96-ead4532f5bf9) | Mascot + one message + one CTA | Orbi hosts every screen with one line and one primary action | Full-bleed brand colour pages (white theme) |

Takeaways for noon: (1) one question, pre-answered — `Pressable` cards + `SheetFooter`; (2) every pick explains itself — `Pill` reason + compatibility chips on a `ProductImage` card, `Price` with reference; (3) the bundle is rows with Swap, a `Segmented` budget and a live total in the `Screen` footer; (4) the payoff is one haul card with `CountUp`, a bonus card with progress, and `Confetti` once.

## Approaches

One clear approach: the brief's four acts map 1:1 to screens, and the branching rule (strong signals skip the question) is a second CTA on the landing rather than a separate flow. Considered and dropped: a single long scrolling page (loses the one-decision-per-screen rhythm the brief asks for) and a chat-style Orbi conversation (slower than 60 s, hides the products).

## Decisions and assumptions

- One persona is mocked (the brief's tech upgrader, played by the demo user): signal = iPhone 17 Pro bought 12 days ago; five picks ranked in `data.ts` — source: brief §5.
- Savings are measured against today's noon price (`Pick.ref`), never a list price — source: brief §1 step 5 / §7 guardrails.
- The journey never blocks: Skip on every pushed screen, the sheet is one tap, the landing links to the picks directly — source: brief §6.
- Orbi is a flat vector stand-in (`components/Orbi.tsx`, three faces) for the 3D bot; swap for the real asset when exported — assumption.
- New ideas added beyond the brief (all optional, all flow-local): a compatibility chip from the known device on every card; "Watch price" on a skipped pick (Orbi keeps it on a list, toast); "Surprise me" (one swap to a better-value match inside the budget); a shareable lineup; the bonus shown as progress until it unlocks — source: repo (Orbi's working/greeting faces lend themselves to a host that reacts) + research.
- Prices use the dirham sign via `currency`; `Price` for product prices, `formatPrice` for totals — source: repo rules.

## Design direction

| Section (top → bottom) | Component | Tokens / variant | Notes |
|---|---|---|---|
| Landing header | `Header` + `IconButton` share | `plain` | Back to Home (`parent`) |
| Hero | flow `.hero` + `Orbi` (`Float`) | `heroGradient` (brand → noonOneSurface → surface), r20 | eyebrow `captionBold`, `titleLarge`, `body` muted |
| Signal row | `Pressable` + `Text` | bg-surface, border, r12 | "Based on · iPhone 17 Pro · 12 days ago · Not me?" |
| Countdown | flow `Countdown` | text-primary tiles, `bodyBold`, tabular | `useInterval`, ticks only while on top |
| CTAs | `Button` `noon` + `noonGhost` | block | Discover my deals → sheet · Skip to my picks → reveal |
| Why these picks | `Stagger` of `.signalCard` + `Icon` | bg-subtle, r16, brand icon disc | three signals from the brief §3 |
| Picked for you | `SkuCard` rail | feed look, Yellow Friday price as `price`, ref as `was` | tap → PDP |
| Interests sheet | `SheetHeader` / `SheetBody` / `SheetFooter` | Origin sheet | 3 × 2 `Pressable` cards, brand fill + ink border when on, `Pop` tick |
| Reveal header | `Header` (step dots) + Skip | `captionBold` | |
| Orbi bubble | `Orbi` + `.bubble` | border, r16 / r4 | mood follows the last action |
| Card stack | `motion.div` drag + `ProductImage` + `Pill` ×2 + `Price lg` | surface, border, r24, `shadow-sheet` | Saved / Skip stamps on drag, −n% badge (danger) |
| Actions | two `.roundBtn` + Watch price | brand heart, outline × | `n of 5` between |
| Tray + CTA | `.tray` + `Button noon` | | AnimatePresence thumbs, `currency` total |
| Build head | `titleLarge` + `body` | | |
| Budget | `Segmented` `field` 40 + status line | success / danger text | over / within budget |
| Rows | `motion` row: `ProductImage` + `Price sm` + Swap + × | border, r16 list | exit collapses |
| Surprise me | `Button noonSecondary` + `Icon sparkles` | | toast success / none |
| Complete the set | `Pressable` dashed row + brand `+` | border-strong dashed, r16 | adds the next pick |
| Footer | totals + `Button noon` | `title`, `priceOld` strike, success pill | Review my lineup → payoff `fade-up` |
| Swap sheet | radio rows (`Pressable` + `ProductImage` + `Price`) + `SheetFooter` | primary border / bg-chip when on | Use this one |
| Payoff head | `Pop` `Orbi` + `titleLarge` + `body` | `Confetti` once | |
| Haul card | `Stagger` images, rows, totals (`CountUp`), saving line | border, r20, dashed divider | |
| Bonus | `.bonus` + progress + `Icon truck` | brand (unlocked) / bg-subtle (locked) | 3 of 3 picks |
| Share | `Pressable` row + `Icon share` | border, r16 | toast |
| Footer | `Button noon` add all + `noonGhost` save later | | DemoStore `addToCart` / `toggleWishlist`, toast with View cart |

New pieces (gap → closest existing → extension; flow-local or shared): `Orbi` (no mascot in the kit → `Float`/`Pop` wrap it; flow-local), `Countdown` (`DealTimer` is a home-token pill → three tiles on central tokens; flow-local), the swipe card (no card-stack primitive → `motion` drag over `ProductImage` + `Pill` + `Price`; flow-local), the interest card (closest `Pill`/filter option → a taller `Pressable` card; flow-local). None promoted yet.

## States

| State | How it's shown | How the user leaves it |
|---|---|---|
| loading | none: picks are local fixtures (a real engine would show `Skeleton` cards in the stack and rail) | — |
| empty | reveal: dashed "nothing saved yet" card when all five are seen; build: "Nothing in your find yet" + the suggestion row; payoff: CTAs disabled at 0 items | save a pick, add the suggestion, or Back |
| error | not modelled (no network) | — |
| success | payoff: confetti once, count-up total, bonus unlocked at 3 picks; toasts for watch / swap / add / save | Add all → toast with View cart; Close → root |
| disabled | "Build my find" until one pick is saved; "Surprise me" with no rows; footer CTAs at 0 items | act on the screen |

## Navigation and state

- `landing` → `nav.sheet('yellowFriday/interests')` or `nav.push('yellowFriday/reveal')`; the sheet's CTA closes then pushes `reveal` after 260 ms (sheet-out). `reveal` → `push('yellowFriday/build')`; `build` → `sheet('yellowFriday/swap', { pickId })`, `push('yellowFriday/payoff', {}, { transition: 'fade-up' })`; `payoff` → `popToRoot`, `push('cart/cart')` from the toast action; cards → `push('pdp/detail', { productId })`.
- State: `store.ts` (`createStore`): interests, index, saved, skipped, watched, budget, swaps; `lineup()` / `lineupTotals()` derive the rows and the saving. Cart and wishlist go through `useDemoStore()`.
- Page URL `/yellow-friday` (`src/kit/routes.ts`), `parent: 'home/home'`.

## Motion

- Landing hero fades in (`FadeIn`), Orbi floats (`Float` 5 px / 3.2 s); signal cards `Stagger`.
- Interest tick pops in (`spring.bouncy`); cards press at 0.97.
- Reveal: card enters on `spring.gentle`, drag rotates ±8°, stamps fade with x, exit flies out on `tween('medium','in')`; tray thumbs `spring.bouncy` with `layout`; Orbi mood changes per action.
- Build: rows `layout` + collapse on remove (`spring.gentle`); saving pill re-pops on change; Segmented thumb is the Field spring.
- Payoff: `Confetti` once after 350 ms, `Pop` for Orbi, `CountUp` for the total, `Stagger` for the images; bonus progress width eases 400 ms.
- Screen transitions: default push for reveal / build, `fade-up` for the payoff, Origin sheets for interests / swap.

## Validation

| Check | Result |
|---|---|
| `npm run verify` | pending |
| `npm run lint:tokens -- -v src/flows/yellowFriday` | pending |
| `node scripts/check-duplicates.mjs src/flows/yellowFriday` | pending |
| `npm run skill:check` | pending |
| `check:routes` / journeys | pending |
| Screenshots vs reference | pending |
| Craft gate (`craft-rubric.md`) | pending |
