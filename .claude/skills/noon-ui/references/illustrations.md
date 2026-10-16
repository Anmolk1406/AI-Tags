# Illustrations and empty states

noon's illustration family comes from the **Visual Library** (Figma `4L1MFeexnspo7AmmOx4prT`): the set "From the Family"
(`427:32867`) and the two screen cuts used in My orders (`353:148295` search with no match, `353:147847` no orders
yet). Every empty, no-result or "nothing here yet" state uses one of these through `EmptyState`. Never an emoji, an
`OriginIcon` blown up, a stock graphic or a hand-drawn SVG (craft-rubric §7).

## The style

| Trait | Rule |
|---|---|
| Form | Flat, geometric, light isometric: boxes, a bag, a cart, a clipboard, coupons, a calendar, a magnifier. Straight edges, crisp corners, no outlines around the whole object. |
| Colour | Blue only, five steps: `#0076FF` accent (one small spark: an arrow, "!", the ✕ on a chip, a stripe), `#194584` navy (handles, labels, shadow edges), `#7FB9FF` mid (side faces), `#C3E2FF` light (front faces, glass), `#E9F4FF` tint (backdrop squares, paper). White faces carry the noon wordmark. No yellow, no other hue. |
| Depth | Two or three tones per object give the faces; a few `multiply` overlays for shade. No drop shadows, no glow. The glossy magnifier (no match) is the only one with gradients. |
| Brand | noon and Supermall appear as their wordmarks on the objects (the box says "noon", the bag says "super mall"), never as logos beside them. |
| Backdrop | Optional pale `#E9F4FF` square behind a flat object (calendar, clipboard). Otherwise transparent: the art sits on the screen's own surface. |
| Density | One object, or one small group of two to three, with one accent. Leave air around it; the text does the explaining. |

## The catalogue (`src/assets/shared/illustrations/`, `illustrations` in `EmptyState`)

| Name | Shows | Use for | Figma | Display |
|---|---|---|---|---|
| `searchNoMatch` | glossy magnifier | a search with no match ("We couldn't find “…”") | 353:148675 | 247 × 200 |
| `searchFilters` | magnifier between two ✕ filter chips | no results with filters on | 736:23869 | 280 × 138 |
| `ordersEmpty` | Supermall bag + noon box (screen cut) | nothing placed yet across noon & Supermall (orders, activity) | 353:148191 | 280 × 280 |
| `supermallNoon` | Supermall bag + noon box (library cut) | the same, small slot | 427:32934 | 173 × 96 |
| `cartEmpty` | cart with a spark | empty cart | 427:32979 | 110 × 120 |
| `boxesHearts` | boxes with broken hearts | nothing saved (wishlist), a cancelled / failed order | 427:33039 | 181 × 114 |
| `returnsClipboard` | clipboard with a return arrow | no returns | 427:33080 | 107 × 116 |
| `vouchers` | two coupons | no vouchers / offers / coupons | 427:32868 | 90 × 90 |
| `calendarAlert` | desk calendar with "!" | a missed date, no slots, something expired | 427:32903 | 152 × 76 |

The exports had Figma's canvas behind them (a `#1E1E1E` rect, the page frame, the screen fill); those rects are
stripped so every file is transparent. Re-exporting one: `download_assets` on the node as SVG, then remove the same
backdrop rects.

## Layouts (`EmptyState`, `src/components/EmptyState`)

A centred 311-wide column (32 side margins at 375); text centred.

| `size` | From | Art | Title | Body | Action |
|---|---|---|---|---|---|
| `compact` (default) | search no match, 353:148295 | catalogue size; 24 to the copy | B16 Bold `#1D2539` (`fieldB16Bold`) | B12 Regular `#475067` (`fieldB12Regular`), gap 4 | `Button variant="fieldText"`, 12 below |
| `full` | empty page, 353:147847 | 280 × 280; column gap 8 | H18 Bold (`fieldH18Bold`) | B14 Medium `#475067` (`fieldB14Medium`), gap 4, 12 under | `Button variant="fieldPrimary" fieldSize="H48" block` (r10, #0F7EFF) |

```tsx
<EmptyState illustration="searchFilters" title="We couldn't find “iphone” in Supermall" body="Try another store or clear the filter"
  action={{ label: 'Clear filter', onPress: clear }} />
<EmptyState size="full" illustration="ordersEmpty" title="You don’t have any orders yet"
  body="Orders placed across noon & Supermall will be visible here" action={{ label: 'Start shopping', onPress: shop }} />
```

## Copy

- Title says what happened and names the thing: "We couldn't find “Spi” in your orders", "You don’t have any orders yet".
  Sentence case, curly quotes around the query, no exclamation marks.
- Body is one line of help: what to do next ("Check the spelling or try a different word").
- One action at most; its label is the next step (≤ 2 words in `compact`: "Clear filter", "Start shopping").
- A search with no match needs no button (the field is right there); a filtered empty needs the way back (clear).
- Don't repeat the count above it ("0 results for …"): the title already says it.

Used in: PLP (`plp/listing`, filters with no results).
