# noon Credits (wallet): bappzaar master → kit mapping

Source: `bappzaar` **origin/master** `ec9be9d3a91` (2026-10-16). Read only through `git show origin/master:<path>`.
Paths are relative to `features/wallet/` unless they start with `src/`, `features/` or `marketplaces/`.

How to read the tables:

- **Kit token** is what the credits CSS/TSX uses. `--nk-color-*`, `--nk-palette-*`, `--nk-space-*`, `--nk-radius-*`, `--nk-type-*`
  are global tokens. Keys with a `credits` prefix (`--nk-color-credits-*`, `--nk-type-credits-*`) are defined in
  `src/flows/credits/tokens.ts` (`creditsFlowTokens`); JS-only values (heights, delays, providers) in `creditsTokens` /
  `creditsProviders`.
- Wallet styles use EStyleSheet `$vars` from `theme/WalletColors.ts` + `theme/WalletMetrics.ts` on top of
  `src/theme/Colors.ts` / `Metrics.ts`: `$edgeSpacing` 15, `$halfSpacing` 4, `$baseSpacing` 8, `$safeAreaBottomSpacing`
  = the home-indicator inset (`--nk-inset-bottom`). Most wallet styles are literal hexes.
- RN `Text` base (`src/theme/Styles.ts baseTextStyle`): Figtree 13 `#404553`, no lineHeight → the `credits*` type tokens
  with `line: 'normal'`. The kit renders Noontree (the brand face; Figtree is the fallback, see tokens.ts `fontFamily`).
- **SD** = server-driven. The server HTML (banner, titles, subtitles, amounts) is styled by tag name
  (react-native-htmlview): `<green>` `<black>` `<grey>` `<light>` `<warning>` `<danger>` `<normal>` `<span>` `<semibold>`.
  The repo has no fixtures, so the strings in `data.ts` are inferred from these stylesheets.
- Off-scale port values (5, 7, 25, 50, 120 px, r17 / r18) carry `design-ignore — bappzaar value`.

## 1. Screens, entry points and presentation

| bappzaar screen (registered name) | Opened by (master) | Presentation (master) | Kit route | Kit presentation |
|---|---|---|---|---|
| `noon.WalletScreen` | Account → noon Credits row (`marketplaces/noon/components/NoonAccount/NoonAccountNoonCreditsButton`), deep link `/account/credits`, order refund, Help | `navigator.push`, bottom tabs hidden | `credits/credits` (`/credits`, `/noon-credits`, `/wallet`) | push (account row → `nav.push`) |
| `noon.WalletTransactionDetailsScreen` | transaction row, rows in the pending / expiring sheet, `/account/credits?transactionCode=` | `showModal` transparent + `src/components/BottomSheet` snap 500, top r20, bg `#F5F6F8` | `credits/details` | sheet `gorhom` r20, height 500 |
| `noon.WalletPendingOrExpiringTransactionsScreen` | Pending card (`type PENDING`), expiring banner link (`type EXPIRING`) | BottomSheet r16, snap 300 (pending) / 450 (expiring) | `credits/pending`, `credits/expiring` | sheet `gorhom` r16, 300 / 450 |
| `noon.WalletNegativeBalanceScreen` | negative banner link | BottomSheet dynamic size r16 | `credits/negative-sheet` | sheet `gorhom` r16 |
| `noon.WalletFiltersScreen` | "Filters" chip | BottomSheet snap 60 % … 90 %, r20, grabber + close X | `credits/filters` | sheet `gorhom` r20, height 60 % |
| `noon.WalletSortScreen` | sort chip | BottomSheet dynamic, r16, grabber + close X | `credits/sort` | sheet `gorhom` r16 |
| `noon.WalletTopupScreen` | top-up button (any case except gift-card-only), negative sheet "Add Credits", empty-state CTA | BottomSheet dynamic, r20 | `credits/topup` | sheet `gorhom` r20 |
| `noon.GiftCardRedeemScreen` (`features/giftcards`) | top-up "Giftcards & Vouchers", or the top-up button when only gift cards are available | `showModal` (full screen), header CLOSE | `credits/giftcard` | modal |
| `noon.NoonProviderBurnOverlayScreen` → `noon.NoonProviderBurnOtpOverlayScreen` (`marketplaces/noon/screens`) | a provider row in the top-up sheet, `trackingParams.plx = 'page_wallet'` | `showOverlay` (OverlayBottomSheet) | **reused** `checkout/provider-burn` → `checkout/provider-burn-otp` with `plx: 'page_wallet'` | checkout's sheets |
| `noon.WalletBankTransferScreen` | header "Withdraw to bank", details "Withdraw to bank" pill, `/account/credits?bankTransfer=true` | `showModal`, header CLOSE | `credits/bank` (`/bank-transfer`) | modal |
| `noon.WalletBankFormScreen` | "Add new Account" / "ADD NEW ACCOUNT" | second `showModal`, header CLOSE | `credits/bank-form` | modal |
| `noon.WalletBankTransferDetailsConfirmScreen` | SUBMIT | `showOverlay` + `src/components/Overlay` (r5, floating X) | `credits/bank-confirm` | sheet `gorhom` r5, no grabber, floating X drawn by the screen |
| `noon.WalletBankTransferOTPScreen` | confirm SUBMIT | push in the modal stack, header BACK | `credits/bank-otp` | push |
| `noon.WalletBankTransferRequestedScreen` | VERIFY success | push, no header, swipe-back off | `credits/bank-requested` | push |

Landing state variants (`?state=`): `negative`, `empty`, `error`, `list-error`, `giftcard-only`, `no-topup`, `campaign`,
`loading`; registered as `credits/negative`, `credits/empty`, `credits/error`. Bank: `?state=insufficient | blocked |
no-accounts`. Details: `?state=error`.

`src/components/BottomSheet` (gorhom) is a new kit sheet layout, `sheet: { layout: 'gorhom', radius, height }`
(`src/kit/Navigator.tsx`, tokens `sheet.gorhom*`): full width, docked to the bottom, top corners rounded, the
`#B7B7B7` 36×4 handle 18 above the sheet (tap or drag closes), backdrop black 0.5. The screen pads the safe area.

## 2. Landing (`screens/WalletScreen`, `components/Screens/WalletLanding/**`)

| Element | bappzaar | Kit |
|---|---|---|
| ScreenView | offsetHeader statusbar, bg `#FAFAFC` | `.headerWrap` padding-top inset, `--nk-color-credits-page` |
| Header (`components/WalletScreenHeader`) | px 15, pb 8; back 36 circle `#F2F3F7`, chevron 7×10, me 10; title 18/700 `#0E0E0E` | `.header`, `.back` (`--nk-color-bg-page`), `--nk-type-credits-title18-bold`, `--nk-color-text-ink` |
| "Withdraw to bank" | `Button` bg `#F2F3F7`, r18, p 8, 13/600; only when `canOpenRequest && withdrawableBalance ≥ minWithdrawLimit > 0` | `.withdraw`; `withdrawableBalance` 245.50 − withdrawn ≥ 50 |
| Gap behind the top view / panel | `#ECEDF1`, 10 px | `.gap` `--nk-color-credits-gap`, `creditsTokens.panelGap` |
| Top view height | 80 + banner 30 + top-up 70 (+5 both) + campaign 30 | `creditsTokens.top*` |
| Top view | px 15, pb 18 (10 with campaign), bottom r20, bg `#FAFAFC`; 15 placeholder | `.top` |
| Dotted background | `wallet-dotted-bg.webp` 200×350 cover, top −50, right, bottom-right r20 | `.dots` |
| Total balance (`components/WalletTotalBalance`) | one line ltr: "-" 32/500 `#5A0C0C` · currency 28/600 · integer 40/700 · ".XX" 30/700; tint `#0E0E0E` / `#5A0C0C`; minHeight 50 | `--nk-type-credits-balance-{sign,currency,40,decimal}`, `--nk-color-credits-negative`; dirham sign instead of "AED" |
| Banner (`WalletBanners/WalletBanner`) | rim 2 px gradient white → `#FFFABA80` / `#FFEDED`, r18; pill p 4/12 bg `#FDF69B80` / `#FECACA80`; html 13 lh 20 `#0E0E0E`, `<danger>` `#8C1717`; chevron 5×10 `#A35900` (expiring); glow webp 417×177 behind | `.banner*`, `--nk-color-credits-warning-*`, `--nk-color-credits-danger-*`; only the `<a>` opens the sheet |
| Top-up button (`WalletButtons/WalletTopup`) | h48 r12 px 12 bg `#0E0E0E`; 14/600 white ms 5; press opacity 0.4; logos pill width R+10 (R = 30 + 15(n−1)), h35, border 1 black, bg `#313131`, 30 logos overlapping 15, `wallet-topup-add.svg` 20 at top 0 right −10 | `.topup*`, `.logos`, `--nk-color-credits-logos-pill`, `creditsTokens.logo*` |
| Top-up title | GC only "Redeem Giftcards"; GC + providers "Add Credits or Redeem Giftcards"; providers only "Add credits"; neither → no button | same logic (`?state=giftcard-only` / `no-topup`) |
| Campaign strip | gradient (SD), p 18/8/8, top −10, bottom r12, 13 white | `.campaign` (`?state=campaign`, demo gradient tokens) |
| Panel head | white, top r20; 16 spacer; "Transactions" 16/700 ms 20 mb 15 | `.panelHead`, `.txTitle` |
| Chips (`WalletFilter/WalletList`) | r8, border 1 `#EBEBEB` / `#0E0E0E3F` active (bg `#F9F9FB`), p 7/8, 14 400 / 600; gap 5; "Clear" 14/600 `#F43333` ms 7 | `.chip`, `.clear`; Filters / sort / Expiring (toggles EXPIRING⇄ALL and sets SOONEST) / Clear |
| List | px 20, pb 20 | `.list` |
| Pending card (`WalletHeading/WalletButtonView`) | `wallet-pending-bg.webp` r8, p 10/12; icon boxes 25×22 white border `#F5F5F5` r6 overlapping 8; title 14/600, "(N)" 14 `#959595`; amount `<span>` 14/600; chevron 7×13 | `PendingCard` |
| Row (`WalletTransaction`) | h56 mb 14 (0 last); icon box 40 r8 bg `#F9F9FB` border `#0E0E0E0A`; title 14/600 1 line; amount html ms 5 (`<green>` `#008200`); subtitle html mt 3 (`<grey>` `#5D5D5D`, `<light>` `#DDDDDD`, `<warning>` `#A35900`) | `TransactionRow` |
| Expiring separator | sort SOONEST with both kinds: 1 px `#EBEBEB` mb 18, box `#F9F9FB` r12 p 8, note icon, 13 `#5D5D5D` | `NoteBox separator` |
| Pagination | cursor, 3 skeleton rows while loading more | page size 8, 3 skeleton rows |
| Loading | header + skeletons 113 / 44 / 38×160 / 44×160 / 10 × 44, r12 | same |
| Errors / empty | `WalletError`: image, 18/700, 13 lh 18, black h50 r12 button "Try Again" / "Retry"; empty `wallet-empty-transactions.svg` 161×105 + "Add Credits" when top-up exists; filtered empty `wallet-empty-filters.svg` + "Clear All Filters" | `WalletError` |

## 3. Transaction details (`screens/WalletTransactionDetailsScreen`, `components/Screens/WalletTransactionDetails/**`)

| Element | bappzaar | Kit |
|---|---|---|
| Sheet | snap 500, r20, bg `#F5F6F8` | `gorhom(20, 500)`, `.detailsRoot` `--nk-color-credits-sheet-grey` |
| Header (pinned) | px 20 pt 20 pb 12 mb 10; icon box 48 white border `#0E0E0E12` r8; title 16/600; subtitle html pt 3; amount html ms 5 | `.detailsHeader` |
| Section card | white p 12 r12 mb 15 (DESCRIPTION p 0, inner p 12) | `.card`, `.sub` |
| Withdraw pill | p 4/8 r12 bg `#F4F9FF` border `#DCECFF`; bank 12 + "Withdraw to bank" 13 + chevron 6×10 `#0076FF` | `.withdrawPill` → `credits/bank` (the sheet stays open, as on master) |
| Note | `wallet-note.svg` 16 + 13 `#5D5D5D` ms 5 | `.noteRow` |
| Order row | dashed 3/3 1.5 `#EBEBEB` full width; orderNr 14/500 `#5D5D5D`; "View Order Details" 13/600 + chevron 6×11 | `.dashed`, `.orderRow` → closes, `orders/tracking` (rocket is a no-op, as on master) |
| Expiry lots | html mb 14; `<normal>` `#0E0E0E` 13 px, `<grey>` `#959595`, `<warning>` `#8C4A00` | `.lot` |
| History | title 14 `rgba(14,14,14,.655)` mb 10; rail 20 wide, dashed 1.5 `#D0D4DD` connector; title 14/500; amount html; subtitle mt 4 | `.timeline*` |
| Loading / error | skeleton 65 square + two bars + 50×20, four 100 blocks; WalletError + Retry | same |

## 4. Pending / expiring / negative sheets

| Element | bappzaar | Kit |
|---|---|---|
| List | px 15 pb 50; header DefaultView 16/700 mt 25 mb 20 + "N Transactions" 13 `#959595`; pill p 4/8 r4 — PENDING bg `#F0FDF1` text `#006300`, EXPIRING bg `#FEFEEB` text `#A35900` | `DefaultView sheet`, `AmountPill` |
| Expiring note | bg `#F9F9FB` r12 p 10/8 mb 20, 13 lh 16 `#5D5D5D` ms 10 | `NoteBox sheet` |
| Footer (EXPIRING) | mt 10 px 15 pb 20; "Shop now" black r12 p 14 mb 10 16/600 white; "View all Expiring Credits" white border `#DFDFDF` 16/600 `#5D5D5D` | `WalletButton` primary / secondary; Shop now → Home tab, View all → filters EXPIRING + SOONEST |
| Negative | pt 40 px 15; WalletError (no button); buttons mt 50, p 12/24: "Add Credits" + "I'll do it later", or "GOT IT" | `NegativeSheet` |

## 5. Filters / sort / top-up

| Element | bappzaar | Kit |
|---|---|---|
| Sheet header | my 15; title 18/700; close 36 r18 `#F2F3F7`, X 10×11 | `SheetTitleRow` |
| Radio row | p 14 r12, bg `#F9F9FB` selected; radio svg 24×25 me 8 (sort sheet 5); label 16 `#0E0E0E`; "Default" pill p 2/10 r8 bg `#0E0E0E0A` 13 `#5D5D5D` | `RadioRow` |
| Sections | titles 16/600 mb 10; divider 2 px `#EBEBEB` my 20; 8 px gap only before "Expired" | `.sectionTitle`, `.divider`, `.gap8` |
| Date inputs | label 14/600 (`#939393` when filled — inverted on master), input p 14/12 border `#DFDFDF` r12 14/600, "DD/MM/YYYY" `#959595` | `.inputLabel`, `.dateInput` |
| Calendar (react-native-calendars, period) | border `#DFDFDF` r12 pt 15; month 14/600 between 6×10 chevrons; weekdays 10/700 uppercase `#959595`; day 14/600; start / end `#0076FF` white, between `#E8F0FE` / `#0937A5`, lone start `#CFD9E7`; other month `#D0D7DE`; today `#1A73E8` | `PeriodCalendar`, `--nk-color-credits-calendar-*` |
| Footer | absolute, px 15 pt 15; h50 r12, `#0E0E0E` once changed else `#DFDFDF`; 18/600 white; spinner / "Retry" / "0 Transactions" / "Apply" | `.filtersFooter`, `.apply` |
| Top-up | "Add credits" 18/700 mt 25; card p 12 r12; subtitle 13 `#5D5D5D` mb 10; option h49 r8 bg `#F9FAFB` border `#EBEBEB` mb 8, icon 45, 14/600, chevron 14×15 | `TopupSheet` |

Providers are server data (`get-provider-list-v2`). The kit lists checkout's SHARE, Skywards, YOUGotaGift and Flex
(`creditsProviders`; their logos are brand-colour stand-ins, like checkout's `ProviderLogo`).

## 6. Gift card redeem (`features/giftcards/screens/GiftCardRedeemSceen`)

Header CLOSE. `src/components/Tabs`: two tabs (min width 50 %), h40, border-bottom 3 (`#3866DF` active), 14 bold,
grey 3 px line. Slide pv 20, px 15. Info box p 15 bg `#FFF8EC` (16 icon + 14 text pl 10). FormikTextInput label 14 bold
`#404553` mb 8; input p 12 r4 border `#ECEEF4` 16; error 13 red min 24. REDEEM PrimaryButton r4 h50, 16 bold. Success:
image 155×140, 19/600 title, 14 `#7E859B` text, "Go back". Validation copy from `src/locale/translations/en.json`.
Demo: codes starting `0000` are rejected (the server message is shown on master); a gift card credits 100, a voucher 50.

## 7. Withdraw to bank (legacy screens)

| Element | bappzaar | Kit |
|---|---|---|
| Top bar (RNN) | white, 44 + status bar; logo 86×25; CLOSE "Cancel" 17 pt black (iOS default) / BACK `back.webp` 24 | `NativeTopBar` |
| PrimaryButton | h50 r0 `#3866DF`, disabled `#ced1da`, 14 bold white, Pulse loader | `PrimaryButton` (`--nk-color-cta`, `--nk-palette-gray-color`) |
| Warning | bg `#fff8ec` border `#f5af39` mx 15 mt 15 p 10, `important-orange.webp` 20×21, html 13 | `.warning` |
| Amount box | mx 20 my 10 bg `#F5F5F5` r5; title 15 `#404553`; currency 17 bold; input 17 bold bg `#ced1da` r5 p 2/10, maxLength 4; separator 0.5; "Withdraw all available …" radio 14; error 14 `#FA0000` | `.amount*` |
| Accounts | border 0.5 `#3866DF` r5; card radio + "AC No:" 12 bold, five lines 13 `#7e859b` (48 %) / 13 bold; separator `#f0f2f7`; "Delete" 13 `#3866DF` | `AccountCard` |
| Terms + submit | radio + 13 `#7e859b`; SUBMIT full width, disabled until terms + account; amount checks required → min 50 → max 5000 → balance | same |
| Blocked states | insufficient (box with 0, text 14 lh 21, `empty-bank-transfers.webp`, "Back to Noon Credits"); `disableOpenRequestMessage`; no accounts (EmptyView 16 bold / 14 `#7e859b`, "ADD NEW ACCOUNT") | `?state=insufficient | blocked | no-accounts` |
| Bank form | "New Bank Details" 22 bold; TextField title 14/500, box border `#DADCE3` r8 px 15, input 13/500, helper 12 `#7E859B` / error 12 `#FA0000` after blur; Picker p 12; ADD r4, disabled until valid | `BankFormScreen` (validate.ts rules ported; the Picker cycles the verified phones in place of the iOS wheel) |
| Confirm (Overlay) | r5, X 37 white circle top −18 right 30; title 16 bold p 20; amount 12 + 28 bold; details bg `#F5F5F5` mx 30 mb 40, 13 / 15 bold right | `BankConfirmSheet` |
| OTP | 14 bold title, 13 text; input 20 bold, letter-spacing 10, underline `#f1f4fd`, 4 chars; VERIFY; "Resend OTP" disabled 15 s with orange "in 15", max 2 sends | `BankOtpScreen` (`0000` fails in the demo) |
| Requested | p 45; image 181×143; 20 bold; 14 `#7e859b`; "WHAT HAPPENS NEXT?" content width, px 35 | `BankRequestedScreen` |

Native `Alert.alert` (delete confirmation, API errors) → `NativeAlert`, an iOS alert stand-in inside the flow.

## 8. State

- Balance: `useDemoStore().credits` (seeded from `user.credits` 248.50) plus `creditEntries`, added by `addCredits()`
  from the gift card / voucher redeem, the checkout redeem sheets in wallet mode (`plx: 'page_wallet'`) and a bank
  transfer. The account row reads the same value.
- Flow store (`store.ts`): filters, refetch counter, the Filters sheet's prefetched flag, saved bank accounts and the
  selected one, the amount already withdrawn.

## 9. Not ported / deviations

- `/bank-transfer-web` (DynamicLoaderScreen, CMS content): not in the repo. WHAT HAPPENS NEXT? closes the modal back to
  the wallet.
- Remote icons (transaction, history, provider logos, campaign icon) → Origin icons / brand-colour stand-ins.
- The scrim of the confirm Overlay is the gorhom 0.5 black (master: `rgba(30,30,30,.7)`).
- The bank form Picker cycles the phones instead of opening the iOS wheel.
- Master quirks kept: From / To label colour inverted; 8 px gap only before "Expired"; future dates selectable;
  "1 Transaction" for zero; rocket "View Order Details" does nothing.
