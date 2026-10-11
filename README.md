# @noon/flow-kit

The noon app as a **React UI kit for clickable prototypes**: noon design tokens, a central component library, a motion system and **17 ready-made flows (133 screens)** ported 1:1 from **bappzaar** (the noon React Native app) and the noon Figma files.

Use it two ways:

- **As a package** — drop a working noon phone (or any single screen, component or token) into your own React app.
- **As a repo** — clone it, `npm run dev`, and edit / extend flows with live reload.

```bash
npm install @noon/flow-kit react react-dom
```

```tsx
import { NoonPrototype, homeFlow, pdpFlow, cartFlow, checkoutFlow } from '@noon/flow-kit';
import '@noon/flow-kit/style.css';

export default function Demo() {
  return <NoonPrototype flows={[homeFlow, pdpFlow, cartFlow, checkoutFlow]} initialRoute="home/home" />;
}
```

> Requires React 19 and a bundler that understands ESM + `new URL(..., import.meta.url)` assets (Vite, webpack 5, Next.js, Rspack…). Node ≥ 20 for development.

---

## What you can import

| Import | What it is |
|---|---|
| `@noon/flow-kit` | everything below + `NoonPrototype`, `Navigator`/`useNav`, `DemoStore`, `PhoneFrame`, motion presets/recipes, mocks |
| `@noon/flow-kit/components` | the component library only (Button + NoonButton presets, Text, Screen, Header, SearchBar, ProductCard, Price, Tag/MarketplaceTag, Switch, Checkbox, Spinner, Toast, HtmlText, Divider…) |
| `@noon/flow-kit/tokens` | design tokens as data: `colors`, `palette`, `spacing`, `radius`, `type`, `shadow`, `layout`, component tokens (`buttonTokens`, `pillTokens`…), `ref.*` helpers |
| `@noon/flow-kit/flows` | `allFlows` + every flow definition |
| `@noon/flow-kit/flows/<id>` | one flow, e.g. `@noon/flow-kit/flows/checkout` — smallest bundle |
| `@noon/flow-kit/style.css` | all kit CSS (tokens as CSS variables, fonts, component + flow styles). Import once. |

The package is ESM, one module per source file, `sideEffects`-marked — bundlers only include the flows/components you import. Images, Lotties and fonts are separate files loaded on demand (nothing is base64-inlined into JS).

### Flows

| Flow id | Screens | Notes |
|---|---:|---|
| `home` | 1 | marketplace switcher, address, rotating search, CMS feed (live noon.com creatives) |
| `search` | 1 | |
| `categories` | 4 | live CMS: 29 category tiles × 175 sub-categories, inline drill-down |
| `deals` | 1 | dynamic bottom tab |
| `plp` | 3 | listing, filters, sort |
| `pdp` | 3 | real iPhone 17 Pro data, variants, FBT, reviews, quick-cart |
| `cart` | 8 | Figma Cart 2.0 styling, marketplace groups, 5 overlays |
| `checkout` | 21 | Figma Checkout 2.0, payments, points & vouchers, slide-to-order, confirmation, failure |
| `orders` | 3 | |
| `returns` | 5 | history → submission → details (+13 sheets) |
| `account` | 17 | profile, security, notifications, preferences, country/language… |
| `address` | 10 | AddressV2: list, map pin, form, controls |
| `cards` | 8 | Payment Cards V2 |
| `noonone` | 22 | noon One acquisition: entry points → landing → plans → payment → success |
| `membership` | 24 | noon One management: manage, change/upgrade, cancel, family, referrals |
| `wishlist` | 2 | |

Each flow folder has a `MAPPING.md` (or `FIGMA-MAPPING.md`) that records the bappzaar/Figma source of every value.

### Routing & page URLs

Screens are addressed as `flow/screen`. Friendly page names live in `src/kit/routes.ts` and on each screen's `path`:

```ts
nav.push('plp', { query: 'iphone' });   // same as 'plp/listing'
nav.push('checkout');                    // flow → its initial screen
```

In the dev preview every page is a URL: `/homepage`, `/search`, `/plp?query=iphone`, `/pdp?productId=p2`, `/cart`, `/checkout`, `/order-confirmation`, `/addresses`, `/cards`, `/noon-one`, `/manage-membership`, `/returns?productId=p5` … Back from a page opened directly goes to its logical parent (`FlowDef.parent`).

### Theming

All styling reads CSS variables generated from `src/foundations/tokens.ts` (`--nk-color-*`, `--nk-palette-*`, `--nk-type-*`, `--nk-space-*`, `--nk-radius-*`, `--nk-button-*` …). Override at runtime:

```tsx
<NoonPrototype flows={allFlows} tokens={{ colors: { brand: '#FEEE00', cta: '#3866DF' } }} />
```

Fonts: Noontree (bundled) with the dirham sign (U+E001) used for all prices; Cairo for RTL. `rtl` prop flips the whole prototype.

---

## AI skills

`.claude/skills/` holds Claude Code skills that build noon screens and flows with this kit, from a prompt, a Figma link or a screenshot:

| Skill | Use it for |
|---|---|
| `/noon-ui` | The main skill: any noon page or flow. Classifies the request, routes to a screen skill, and holds the design system references (tokens, components, assets, motion), flow catalogue, blueprints and validation. |
| `/home-page` | Home feed and campaign / landing pages (Homepage Revamp 2025). |
| `/search` | Search entry, suggestions, recent / trending, results with sort and filters. |
| `/cart` | Cart 2.0: shipment groups, carousels, coupon, payment offers, states. |
| `/checkout` | Checkout 2.0: sections, payment methods, slide to pay, placing and confirmation. |
| `/pdp` | Product detail page, its sheets, out-of-stock and newer-model states. |

Open the repo in Claude Code and either type the skill (`/home-page build a Ramadan campaign landing page`, `/checkout add a gift-wrap step`, `/search add voice search`) or just describe the page ("build a loyalty page", "update the PDP to this Figma: <link>"); Claude picks the matching skill from its description. Each screen skill has a `spec.md` (screens, sections, tokens, data, acceptance) and ends with visual validation: `node .claude/skills/noon-ui/scripts/snap.mjs <flow>` screenshots every screen of a flow for review.

Keep the skills in step with the code: `npm run skill:check` validates every skill (frontmatter, file paths, `--nk-*` variables, `flow/screen` routes, and coverage of components, tokens, motion, assets and flows) and runs in CI.

## Develop / contribute

```bash
npm install
npm run dev            # phone preview → http://localhost:5180
```

Read **[CONTRIBUTING.md](./CONTRIBUTING.md)** before opening a PR — it covers the folder layout, the porting process (analyse → map → implement), token and asset rules, and the checks every PR must pass:

```bash
npm run verify         # typecheck (app + lib) · token lint · library build
npm run check:routes   # every screen renders with no console errors (dev server running)
npm run visual:snap -- <dir> && npm run visual:diff -- <base> <dir>   # pixel regression
npm run assets:check   # asset size budget + duplicate detection
```

Scaffold a new flow: `npm run new-flow -- loyalty "noon Loyalty" "Profile"`.

## Release

Versions follow semver; every user-facing change adds a line to [CHANGELOG.md](./CHANGELOG.md). `npm publish` runs `prepublishOnly` (= `npm run verify`). Check the tarball first with `npm run pack:check`.
