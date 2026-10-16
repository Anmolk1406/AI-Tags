# Typography guidelines: which text style for which text, and why

> **Scope.** These rules cover new screens and new sections. A bappzaar or Figma port keeps the type its source specifies,
> 1:1 (design-rules.md §0), and records it in its `MAPPING.md`. Rules are advisory today. `lint:tokens` and
> `design-usage` enforce only "tokens, not raw literals".
>
> Evidence: the census of `font:` declarations in `src/**/*.css` (§1), the kit's tokens (`src/foundations/tokens.ts` →
> `type`, `fontSize`, `fontWeight`, `field`), the Origin / Field type scale ([`references/field-ds.md`](references/field-ds.md)), and the
> external guidance in §9 (Apple HIG, Material 3, WCAG 2.2, Baymard, Arabic typesetting). Values: [`references/tokens.md`](references/tokens.md).

---

## 1. What exists today

**Font.** Noontree (bundled in `src/assets/fonts`) in four weights: Regular 400, Medium 500, SemiBold 600 and Bold 700,
with Figtree, then the system font, as fallbacks. There is **no 800 file**, so `extrabold` and the Field `*Extrabold`
styles render as 700. RTL switches `--nk-font-family` to `fontFamily.rtl` (`'Cairo', 'Noontree', …`). Cairo is **not
bundled**, so Arabic falls back to the device's Arabic font unless Cairo is installed. The only other face is the
system font for the native tab-bar badge (`tabBar.badgeFont`), which is deliberate.

**Four families of text styles** (all `--nk-type-*`, CSS `font` shorthand = weight size/line family):

| Family | Count | Naming | Where from |
|---|---|---|---|
| Core semantic presets | 16 | `hero`, `title*`, `heading`, `section`, `body*`, `productTitle`, `caption*`, `micro`, `tab` | the kit's first scale (bappzaar sizes) |
| Combination presets | ~60 | `text<size><Weight>Lh<line>` (e.g. `text14SemiboldLh20`) | recurring size/weight/line combos across ports; the Origin B / A styles live here without tracking |
| **Origin / Field scale** | 36 | `fieldH40…H16`, `fieldB16…B11`, `fieldA17…A12` | the Origin Design System (coded as Field DS), with letter-spacing |
| Flow-local | ~220 | `<flow>Text…`, `mb-*`, `vip-*`, `pdp-*`, `chk-*`… in `src/flows/<flow>/tokens.ts` | 1:1 ports (membership 78, noonone 45, checkout 32 …) |

**Usage census.**
- **Volume:** 1,577 `font:` declarations, 98% of them tokens.
- **Fragmentation:** they use **487 distinct styles**: 299 are used once and 401 three times or fewer. The fragmentation comes from 1:1 ports, each copying its source's one-off metrics. It is not a scale to imitate.
- **The real working set:** about 25 styles cover half of all declarations. In order of use:

| Rank | Style | Uses | Typical job |
|---|---|---|---|
| 1 | `body-semibold` 14/18 600 | 52 | row labels, card titles |
| 2 | `body` 14/18 400 | 50 | body copy |
| 3 | `text16-bold-lh20` 16/20 700 | 49 | card / section titles, totals |
| 4 | `text14-semibold-lh20` 14/20 600 (= Origin B14 SemiBold) | 36 | titles in Origin components, snackbar title |
| 5 | `caption` 12/16 400 | 36 | meta, price row secondary |
| 6 | `text12-regular-lh18` 12/18 400 (= Origin B12 Regular) | 34 | subtitles, helper text |
| 7 | `text12-semibold-lh14` 12/14 600 | 30 | badges, tags, rating pills |
| 8 | `text14-regular-lh20` 14/20 400 (= Origin B14 Regular) | 27 | body in Origin screens |
| 9 | `product-title` 14/18 500 | 25 | product names on cards |
| 10 | `title-small` 18/24 700 | 24 | page / hero section titles |

**Other signals from the census.**
- **Letter-spacing:** 463 declarations, mostly the Field tracking and the Figma revamps' −0.12 to −0.16 px.
- **Uppercase:** 28 uses, all in badges and overlines.
- **Truncation:** 50 line-clamps and 111 ellipses.
- **Tabular figures:** only 4 places (PLP brand count, checkout summary, the cart coupon timer and the home deal timer). Every other number in the app is proportional.
- **Italics:** 1.

**Text colours and their contrast** (WCAG ratio on white `#FFF` / the grey page `#F2F3F7` ≈ the same):

| Colour token | Hex | On white | Passes for |
|---|---|---|---|
| `textStrong` | #101628 | 18.0 | everything |
| `textPrimary` | #1D2539 | 15.3 | everything |
| `textBody` | #343D54 | 10.8 | everything |
| `textMuted` | #475067 | 8.0 | everything |
| `textSecondary` | #666D85 | 5.1 | any size (just above 4.5) |
| `sapphire` (links, active tab) | #1155CB | 6.6 | any size |
| `priceOld` | #7E859B | 3.7 | **large text only** (≥ 18.66px bold / 24px), or decorative |
| `discountBright` / `successStrong` | #05AF25 / #38AE04 | 2.9 | **fails** as text: only alongside a redundant cue |
| `textTertiary` | #989FB3 | 2.6 | **fails** as text: disabled, placeholder, legal decoration only |

---

## 2. Principles

1. **The design language decides the scale.**
   - **New screens (Origin, the default):** the Origin scale, H for headings, B for body, A for actions.
   - **Screens whose `truth` is `figma`:** the revamp's styles, through the kit's combination tokens.
   - **Screens whose `truth` is `bappzaar`:** the source's values.

   Never mix two scales on one screen. When a style the screen needs exists in both forms, `fieldB14Semibold` (with tracking) and `text14SemiboldLh20` (without), use the one matching the screen's language.
2. **Few styles per screen.** At most **5–6 text styles**: one title, one section title, one or two body weights, one meta and one label/badge style. This is a house rule, not a published number: no authoritative source gives one. Apple's and Material's whole scales have 11 and 15 styles for an entire OS, and one screen needs a fraction of that.
3. **Build hierarchy with size first, then weight, then colour.**
   - **Size:** adjacent levels differ by **at least 2px** (14 → 16 → 18 → 24); Apple's steps run about 1.13–1.25× between adjacent styles. A 1px step (13 next to 14, 15 next to 16) reads as a mistake, not a level.
   - **Weight:** at one size, use weight for emphasis: 400 body, 600 label, 700 heading. Apple's "emphasised" styles change the weight, not the size.
   - **Colour:** for de-emphasis, step down `textStrong` → `textPrimary` → `textSecondary`. Never use colour alone to carry meaning (WCAG 1.4.1).
4. **Weights: four, used for roles.**
   - 400 for reading text.
   - 500 for product names and quiet labels.
   - 600 for labels, buttons and titles inside components.
   - 700 for headings, prices and totals.

   Don't use 800 (it renders as 700) or light weights.
5. **Line height scales inversely with size.** Multi-line body text gets about **1.3–1.5× its size** (14/20, 12/18, 16/22; Material Body M 14/20). Headings get about **1.1–1.3×** (18/24, 20/26, 24/30, 28/34). Text must still fit when a user forces 1.5× line height (WCAG 1.4.12), so don't size boxes to exactly one tight line. One-line chips and badges may sit tight (12/14, 12/16). A unitless `Lh1` belongs only to single-line numerals inside fixed-height controls.
6. **Minimum sizes.**
   - **11px is the floor** for any text a user must read (Apple's minimum; B11 in Origin).
   - **10px** is allowed only for a two- or three-character tag inside a component: the "Ad" tag and quantity indicators.
   - **8–9px** (`microSm`, `micro` font sizes): never for new text.
   - **14px is the default reading size**; body copy smaller than 13px needs a reason.
7. **Use the whole token.** Set type with `font: var(--nk-type-*)` or `<Text variant color>`, never `font-size` or `font-weight` alone. The only exception is component internals that scale relatively, like `Price .cur` at 0.7em. Add `letter-spacing` only from the Field tracking tokens, never on Arabic text (§7).
8. **Components own their type.** `Header`, `Button`, `Pill`, `Price`, `SheetHeader`, `Snackbar`, `TabBar`, `StatusChip`, `EtaBadge` and `SkuCard` set their own fonts. Don't restyle them through `className`. If a reference shows different type on one of them, it's a different component: ask (design-rules.md §0).

---

## 3. Which style for which text (new screens)

The **Origin** column is the default (design-rules.md §0). The **kit core** column is for screens on the bappzaar / Figma
revamp side, and for anywhere tracking must be off. Colour is part of the role: pair them as shown.

| Text | Origin (Field) style | Kit core equivalent | Colour | Notes |
|---|---|---|---|---|
| **Page hero / success title** (landing, order placed, empty state headline) | `fieldH24Bold` 24/32 (`fieldH28Bold` for a full-bleed hero) | `title-large` 24/30 · `hero` 28/34 | `textStrong` | one per screen; max 2 lines |
| **Screen title in a header** | `Header variant="field"` (H16 Bold; centred B16 SemiBold) | `Header` (`section` 16/22 700) | `textPrimary` | never set by the screen; one line + ellipsis |
| **Section / module title** | `fieldH18Bold` 18/24 · `fieldH16Bold` 16/20 for dense lists | `title-small` 18/24 · `section` 16/22 | `textStrong` | sentence case; ≤ 1 line, ellipsis |
| **Card title / row label / sheet item** | `fieldB14Semibold` 14/20 | `text14-semibold-lh20` · `body-semibold` 14/18 | `textPrimary` | ≤ 2 lines |
| **Sheet title** | `SheetHeader` (16/22 600) | same | `textPrimary` | component-owned |
| **Product name** (cards, rows) | `fieldB14Medium` 14/20 · on SKU / PLP cards `product-title` 14/18 500 | `product-title` | `textProduct` / `textStrong` | **2-line clamp** on cards, 1 in compact rows; never bold |
| **Body / description** | `fieldB14Regular` 14/20 | `text14-regular-lh20` · `body` 14/18 | `textBody` / `textPrimary` | paragraphs ≤ ~60 characters/line (a phone width at 14px) |
| **Lead paragraph** (onboarding, sheet intro) | `fieldB16Regular` 16/22 | `body-large` 16/22 | `textBody` | short, 1–3 lines |
| **Secondary / meta** (subtitle, date, seller, delivery line) | `fieldB12Regular` 12/18 | `text12-regular-lh18` · `caption` 12/16 | `textSecondary` | 1–2 lines |
| **Emphasised meta** (a date in a delivery line, "Free") | `fieldB12Semibold` 12/18 | `caption-bold` 12/16 600 | `textPrimary` or a semantic colour | bold the fragment, not the whole line (`<b>` in `HtmlText`) |
| **Fine print / legal / counts** | `fieldB11Regular` 11/14 | `text11-regular-lh14` | `textSecondary` (not `textTertiary`) | the floor: never smaller |
| **Badge / tag / status chip** | `StatusChip`, `EtaBadge`, `Tag` (B11/B12 SemiBold) | `text12-semibold-lh14` | the component's tone | 1–3 words; sentence or Title Case; UPPERCASE only for ≤ 2-word overlines ("NEW", "AD") |
| **Button / CTA label** | `Button variant="field*"` (A16 / A14 / A12 SemiBold) | `Button` (`lg` 16/20 600 · `md` 14/18 700 · `sm` 12/16 600) | component | verb first, ≤ 3 words, never wraps |
| **Link / inline action** | `fieldA14Semibold` 14/20 | `text14-semibold-lh20` | palette `sapphire` (`--nk-palette-sapphire`) | a verb ("Change", "View all"); no underline in-app |
| **Input value / placeholder** | `TextField` / `SearchInput variant="field"` (B14–B16) | component | value `textPrimary`, placeholder `textSecondary` | ≥ 16px in real web inputs (iOS zooms below 16); the kit's phone frame is exempt |
| **Tab / segment label** | `Segmented variant="field"`, `TabBar` | component | component | 1 word |
| **Price (sale)** | `<Price>` · `SkuCard` (15/20 700) | `<Price size>` | `textInk` | always the component: it pairs sale, was and % |
| **Price (was) / discount** | inside `<Price>` (12, struck / 12 600) | — | `priceOld` / `discountBright` | secondary: smaller and lighter than the sale price, never bold |
| **Order total / grand total** | `fieldH18Bold` 18/24 · `fieldB16Bold` 16/22 | `text16-bold-lh20` | `textStrong` | label at the same size in 400–600; amount 700 |
| **Counters, timers, quantities** | the role's style + `font-variant-numeric: tabular-nums` | same | role colour | digits that change must not jiggle |

**Anything not in this table.** Find the closest role above. If the reference specifies a size the scale lacks, make it a flow type token (`<flow>Text<size><Weight>Lh<line>` in the flow's `tokens.ts`; design-rules.md §5) and note the source.

---

## 4. Hierarchy recipes

- **Product card** (SkuCard / ProductBoxVertical):

  | Element | Style |
  |---|---|
  | name | `product-title` 14/18 500, 2 lines |
  | price row | sale 15–16 700, was 12 400 struck, discount 12 600 |
  | delivery | 12 medium, `textSecondary` |
  | badge | 12 600 on the image |

  That's four sizes at most, and the price is the only 700.
- **List row** (account, settings): title 14–15 600 `textPrimary`, subtitle 12/18 `textSecondary`, value or chevron on the end. Nothing larger than the section title above it.
- **Section** (home module, checkout card): section title 16–18 700 `textStrong`, an optional "View all" link at 14 600 `sapphire` on the title's baseline, content below. Keep **≥ 16px** between the title and the previous section, so the space groups content, not only the type.
- **Bottom sheet:** `SheetHeader` title (16/22 600), an optional subtitle at 12/18, a body at 14/20, then `SheetFooter` buttons. Don't put an H24 inside a sheet.
- **Summary / totals:** rows at 14/20 400 (label `textSecondary`, value `textPrimary`), separator, total row at 16 700 both sides. Use tabular figures in the amount column so the decimals line up.
- **Empty / success state:** title H24 (or `title-large`), one body line at 14/20 `textSecondary`, one primary button. Nothing else competes.

---

## 5. Commerce-specific rules

- **Price is easy to find and clearly the one you pay** (Baymard: 11% of mobile sites make the price hard to locate).
  - **Size:** on a card, the sale price is the only 700 and is as large as the product name or larger. On the PDP it sits close to the title's size (`<Price size="lg">` 22 vs the 16–18 title).
  - **Grouping:** the struck price, the sale price and the % live together in one `<Price>`, never split across the card (Baymard: 14% of sites put promotions far from the price).
  - **Weights:** 700 for the sale price. The old price uses 400, struck, in `priceOld`, smaller than the sale price.
  - **Discount badge:** 600 in green. Since that green fails contrast as text (§1), the "% OFF" wording is the redundant cue: keep it, don't reduce it to a bare number in green.
- **Currency.**
  - **Sign:** the dirham sign `currency` (U+E001) set by `<Price>` at 0.7em, semibold, before the amount; never the text "AED".
  - **Line breaks:** never break between the sign and the amount (`&nbsp;`, as `<Price>` does).
- **Numbers.**
  - **Tabular figures:** use `tabular-nums` (or `lining-nums tabular-nums`) for anything that updates in place (countdowns, steppers, cart counts) or is compared in a column (bill summaries).
  - **Static numbers:** a price on a card can stay proportional.
- **Product names:** 500 weight, 2 lines with an ellipsis on cards, the full name on the PDP. The 2-line clamp is an industry convention, not a researched number. It satisfies Apple's rule that truncated text must be available in full in a detail view. Never UPPERCASE a product name; keep the brand's casing.
- **Urgency and status copy** ("Only 2 left", "Arrives tomorrow"): 12 600 in the semantic colour, plus an icon or the words themselves. Colour alone never carries the meaning.
- **Copy casing:** Sentence case for titles, labels and buttons ("Add to cart", "Delivery instructions"). Title Case only where the app's copy (`noon-en.json`) has it. UPPERCASE only for short overlines and badges, with 0 to +0.5 px tracking at 11–12px (Material Label S +0.5; Apple tracks 11pt at +6/1000 em). All caps slows the reading of anything longer (NN/g).

---

## 6. Truncation and layout

- **Every text box declares its overflow.** Use `lines` on `<Text>` or `-webkit-line-clamp` + `overflow: hidden`.

  | Text | Lines |
  |---|---|
  | titles in headers and rows | 1 |
  | product names on cards | 2 |
  | descriptions in cards | 2–3, with "Read more" if needed |
  | body in sheets / pages | unclamped |
- **Don't shrink text to fit.** Truncate, wrap or rephrase, but don't drop a size because a string is long. Test with the longest realistic string and in Arabic: it runs about 20–30% longer or shorter and taller.
- **Fixed heights:** a fixed-height text box (e.g. SkuCard title 36 = 2 × 18) must equal lines × line-height, or the clamp cuts glyphs.
- **Alignment:**
  - Start-align body text (`text-align: start`).
  - Centre only short, standalone lines: empty states, success titles, buttons.
  - Never justify.
- **Numbers in a column:** end-aligned, and tabular.

---

## 7. Arabic / RTL

- **Letter-spacing:** never on Arabic. Tracking breaks the connected script. Wrap the Field tracking in `:global([dir='ltr'])` (or drop it) for text that can be Arabic.
- **No italics, no faux bold, no UPPERCASE:** Arabic has no case. Weight emphasis works, but use 600–700 sparingly: heavy Arabic closes up its counters.
- **Line height:** Arabic needs **more** of it. Body Lh20 at 14px is the minimum; avoid `Lh1` and tight 12/14 styles on Arabic strings, or the dots and marks get clipped. If a badge must take Arabic, test it at that height.
- **Optical size:** Arabic has no capitals, so at the same pixel size it reads smaller than Latin. Apple suggests about **+2pt** (WWDC22 "Design for Arabic": about +10%). Keep body at 14 or above for Arabic copy, prefer 15–16 for reading text, and don't use 11px Arabic for anything but counts.
- **Digits:** an Arabic locale may show Western (0–9) or Eastern Arabic (٠–٩) digits; plan for both widths. Never reverse the digits inside a number (prices, phone, card numbers); only sequences and progress mirror.
- **Paragraph direction:** a paragraph of 3+ lines aligns by its own language, not by the screen's direction (Apple HIG, Right to left).
- **Font:** the RTL stack names Cairo, but Cairo isn't bundled (§1), so check Arabic screens on a device or bundle the face. **Mixed strings:** numbers and prices stay LTR inside RTL text. `<Price>` handles this; hand-built price strings need `dir="ltr"` / `unicode-bidi: isolate` on the amount.
- **Mirroring:** start/end, not left/right (`text-align: start`, `inset-inline-*`), so text alignment mirrors with the layout.

---

## 8. Review checklist (type)

1. Every `font:` is a `--nk-type-*` token, or the text is a component that owns its type.
2. The screen uses **≤ 6 styles**, from **one** scale (Origin, kit core, or the port's source).
3. Adjacent hierarchy levels differ by **≥ 2px**, or by a whole weight step at the same size.
4. No reading text below 11px. Body text is 14px, at 1.4× or more line height.
5. Text colour passes contrast: `textSecondary` or darker for anything informative. `priceOld`, green discount and `textTertiary` are used only with a redundant cue or as decoration.
6. Every text box has a declared overflow (lines or ellipsis), checked with the longest string.
7. Prices go through `<Price>`. Totals and changing numbers are tabular.
8. Sentence case. UPPERCASE only on ≤ 2-word badges.
9. RTL: no tracking on Arabic, line heights of at least 1.4×, amounts isolated LTR.

---

## 9. Sources and how they map to the kit

| Source | What it says | Kit decision |
|---|---|---|
| [Apple HIG: Typography](https://developer.apple.com/design/human-interface-guidelines/typography) | Default Dynamic Type sizes (size/leading): Large Title 34/41, Title 1 28/34, Title 2 22/28, Title 3 20/25, Headline 17/22 semibold, Body 17/22, Callout 16/21, Subhead 15/20, Footnote 13/18, Caption 1 12/16, Caption 2 11/13. **11pt minimum**, 17 default. Avoid light weights. Use weight, size and colour for hierarchy. Tight leading only when height is constrained and never for 3+ lines. Avoid truncation unless a detail view shows the full text. | 11px floor; Origin H28 / H24 / H20 / H18 ≈ Title 1–3; B12 / B11 ≈ Caption 1 / 2. noon body is 14, a denser commerce UI than iOS 17. Weights 400–700 only. |
| [Material 3 type scale](https://github.com/material-components/material-web/blob/main/tokens/versions/v0_192/_md-sys-typescale.scss) ([usage text](https://flet.dev/docs/types/texttheme)) | Display 57/45/36, Headline 32/28/24, Title 22/16/14 (M and S Medium), Body 16/24, 14/20, 12/16, Label 14/20, 12/16, 11/16 Medium. **Title** = shorter, medium-emphasis text. **Body** = longer passages (Body M the default). **Label** = text inside components (buttons, chips). | the roles in §3: H = headline/title, B = body, A = label (actions). Body 14/20 = Body M. |
| [WCAG 2.2 1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html), 1.4.1 Use of Color, 1.4.4 Resize Text, [1.4.12 Text Spacing](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html) | 4.5:1 for text, 3:1 for large text (≥ 24px, or ≥ 18.5px bold). Only disabled, decorative and logo text is exempt, **so struck prices and grey captions are not**. Colour is never the only cue. Text survives 200% zoom and 1.5× line height. | the contrast table in §1; the limits on `priceOld`, the greens and `textTertiary`; declared overflow instead of fixed clipping |
| [Baymard: price and discount display](https://baymard.com/blog/product-page-price-discounts), [line length](https://baymard.com/blog/line-length-readability) | The price must be easy to find (11% of mobile sites fail) and close to header / title size. The struck original sits next to a dominant sale price. Keep struck price, badge and saving together. Show % and amount when room allows (the "Rule of 100": % under 100, amount above). Body lines run 50–75 characters. | §5 price rules; `<Price>` keeps sale / was / % together |
| [MDN: font-variant-numeric](https://developer.mozilla.org/en-US/docs/Web/CSS/font-variant-numeric) | `tabular-nums` gives equal-width figures, so columns and changing numbers don't shift; `lining-nums` keeps figures on the baseline | §5 Numbers |
| [Apple HIG: Right to left](https://developer.apple.com/design/human-interface-guidelines/right-to-left), [WWDC22 Design for Arabic](https://developer.apple.com/videos/play/wwdc2022/10034/), [CSS Text 3 §7.2.1](https://www.w3.org/TR/css-text-3/#cursive-tracking) | Arabic about +2pt / +10% larger and taller (dots, marks). Tracking 0: browsers must not break cursive joins. Never reverse the digits in a number. Paragraphs of 3+ lines align by their own language. Mirror navigation, not photos or logos. | §7 |
| [NN/g](https://www.nngroup.com/articles/glanceable-fonts/) | All caps slows the reading of anything longer than a short label | UPPERCASE only on ≤ 2-word badges |

**House rules with no external number:** "≤ 6 styles per screen", "≥ 2px between levels" and "2-line product names". They
are this kit's choices, drawn from the scales above.

---

## 10. Pending (decisions these guidelines don't make)

- **Consolidation:** 487 styles in use, 299 of them used once. Ports keep their source values by design, but the kit core and combination presets could fold into the Origin scale. That would mean mapping each `text*` token to its nearest B / H / A style, with a visual diff per flow. It's not started.
- **Arabic font:** bundle Cairo (or noon's production Arabic face) so RTL previews are faithful.
- **Line-height scale:** the kit has no line-height tokens, so line heights live inside each `font` shorthand. Origin's B / H line heights (14/20, 12/18, 16/22) are the ones to standardise on.
- **Enforcement:** a `design-usage` finding for off-scale sizes (below 11px, or a 1px step) on screens with `truth` other than `bappzaar`, the same way spacing is reported today.
