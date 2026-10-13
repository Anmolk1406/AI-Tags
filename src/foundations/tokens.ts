import { pressScale } from '../motion/presets';
import { palette } from './palette';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  CENTRAL DESIGN TOKENS — single source of truth for every flow & component.
 *  Values are taken from bappzaar (`marketplaces/noon/theme/tokens/*`, NoonColors,
 *  NoonStyles and the per-component style files). Change a value here and every
 *  screen updates. Flows can override any key locally via `flow.tokens`.
 *
 *  Every token is exposed as a CSS variable:
 *    colors.textPrimary  → var(--nk-color-text-primary)
 *    spacing.s16         → var(--nk-space-s16)
 *    radius.r12          → var(--nk-radius-r12)
 *    fontSize.body       → var(--nk-font-size-body)
 *    type.titleSmall     → var(--nk-type-title-small)   (font shorthand)
 *    shadow.card         → var(--nk-shadow-card)
 *    palette.blackAlpha8 → var(--nk-palette-black-alpha8)
 *    button.primaryBg    → var(--nk-button-primary-bg)   (component groups: button, iconButton,
 *                          badge, pill, stepper, searchBar, tabBar, quickAdd, needHelp)
 *  Numbers become px, except keys ending in Scale / Opacity (unitless) and Duration (ms).
 *  Component tokens reference the semantic ones through `ref.*` (CSS vars), so flow overrides of a
 *  colour reach every button / pill that uses it.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const colors = {
  // brand
  brand: palette.yellowColor, // #FEEE00 noon yellow
  brandInk: palette.neutralBlack, // text/icons on yellow

  // text
  textPrimary: palette.blueGray900, // #1D2539 — titles, names, menu rows
  textStrong: palette.charcoalNavy, // #101628 — product titles, headings
  textBody: palette.gray800, // #343D54 — address, inputs
  textSecondary: palette.slateGray, // #666D85 — meta, captions
  textTertiary: palette.bluishGrey, // #989FB3 — legal, counts
  textMuted: palette.slateBlueGray, // #475067
  textLegacy: palette.charcoalGreyColor, // #404553 — older noon screens
  textInverse: palette.white,
  textDisabled: palette.disabledTextColor,

  // surfaces
  bgPage: palette.antiFlashWhite, // #F2F3F7 grey page behind cards
  bgSurface: palette.white,
  bgSubtle: palette.secondaryBackgroundColor, // #F9F9FB — pills, icon buttons
  bgMuted: palette.ghostWhiteColor, // #F3F4F8 — chips, image placeholders
  bgInverse: palette.neutralBlack, // #0E0E0E — primary dark CTA, toasts
  bgInfo: palette.borderGray, // #EBF4FF — soft blue ATC button
  bgChip: palette.lightBabyBlue, // #F1F7FD
  bgDisabled: palette.disabledBackgroundColor, // #0E0E0E0A — NoonButton disabled fill

  // borders
  border: palette.lightGreyColor, // #EAECF0
  borderSubtle: palette.antiFlashWhite, // #F2F3F7 — dashed separators
  borderInput: palette.kitSlate87, // #D7DAE3
  borderStrong: palette.lightGrey, // #D0D4DD
  borderInfo: palette.paleAzure, // #BDDBFF

  // interactive
  primary: palette.primaryBlue, // #0F61FF — links, text buttons, ATC text
  primaryBright: palette.azureBlue, // #0F7EFF — filled blue pills (Create, View cart)
  link: palette.newAccentColor, // #0076FF — highlights in carousels
  tabActive: palette.sapphire, // #1155CB
  tabInactive: palette.charcoalGreyColor, // #404553
  badge: palette.accentColor, // #3866DF

  // status
  success: palette.deepGreen, // #0F8857
  successSurface: palette.noonSuccessSubtle, // #E3FCF2
  successStrong: palette.noonSystemGreen, // #38AE04
  danger: palette.errorRed, // #DE1C1C
  dangerSurface: palette.noonErrorSubtle, // #FFF0F0
  warning: palette.absoluteApricot, // #FF9741
  warningSurface: palette.warningSurface, // #FFF1E0
  discount: palette.deepGreen, // "% off" text
  rating: palette.deepGreen,

  // commerce (PLP / PDP / cart)
  cta: palette.accentColor, // #3866DF — Add to cart, quick-ATC, Buy now outline
  ctaNavy: palette.buyNowNavy, // #162D68
  brandBlue: palette.accentBlue, // #0057FF — store name, size guide, filter selected
  textInk: palette.neutralBlack, // #0E0E0E — sale price
  textProduct: palette.inkBlack, // #212121 — PLP card title
  priceOld: palette.noonGrey1, // #7E859B
  discountBright: palette.greenOff, // #05AF25 — "% OFF"
  bestPriceInk: palette.grass700, // #108757
  bestSellerTag: palette.darkGreenTeal, // #0A4F4A
  couponBorder: palette.softTeal, // #BBE0DE
  couponSurface: palette.mintWhite, // #E9FBF9
  bgPdp: palette.secondaryBackgroundColor, // #F9F9FB
  bgPill: palette.softGray, // #F7F8FA — rating / highlight pills
  bgStoreStrip: palette.lightBlueInfoBg, // #E8F1FF
  pillBorder: palette.kitGray91v2, // #E7E7E7
  pillSelectedBorder: palette.paleBlue, // #D6E9FF
  starLow: palette.pumpkinOrange, // #F36302
  starMid: palette.kitAmber49, // #F8B200
  starGood: palette.greenOff,
  starGreat: palette.darkGreen,
  inCart: palette.greenColorAlpha90, // rgba(45, 175, 50, 0.9)

  // noon One / VIP
  noonOneSurface: palette.paleYellowLegacy, // #FFF3C0 (NoonColors.paleYellow)
  noonOneInk: palette.cocoaBrown, // #794000

  // overlays
  scrim: palette.primaryAlpha50, // rgba(14, 14, 14, 0.5)
  imageOverlay: palette.blackAlpha2, // rgba(0, 0, 0, 0.02)

  // SKU card (src/components/SkuCard, Figma "SKU")
  skuDiscount: palette.homeGreen800, // #008200 "33%"
  skuRatingBg: palette.mintWhite97, // #F2F8F8 flat rating pill
  skuMediaTint: palette.cobaltAlpha4, // rgba(7, 47, 143, 0.04) image box tint
} as const;

export const spacing = {
  s0: 0,
  s2: 2,
  s4: 4,
  s6: 6,
  s8: 8,
  s10: 10,
  s12: 12,
  s14: 14,
  s15: 15, // `edgeSpacing` in bappzaar
  s16: 16,
  s18: 18,
  s20: 20,
  s24: 24,
  s32: 32,
  s36: 36,
  s40: 40,
  s48: 48,
  s56: 56,
  s64: 64,
  s72: 72,
  s80: 80,
  s88: 88, // centred Header side slots
} as const;

export const radius = {
  r0: 0,
  r2: 2,
  r4: 4,
  r6: 6,
  r8: 8,
  r10: 10,
  r12: 12,
  r14: 14,
  r16: 16,
  r20: 20,
  r24: 24,
  r30: 30,
  r32: 32,
  r48: 48,
  full: 9999,
} as const;

export const fontSize = {
  microSm: 8,
  micro: 9,
  label: 10,
  caption: 11,
  bodySmall: 12,
  bodyCompact: 13,
  body: 14,
  bodyMedium: 15,
  bodyLarge: 16,
  bodyLead: 17,
  titleSmall: 18,
  titlePromo: 19,
  title: 20,
  titleMedium: 22,
  titleLarge: 24,
  headline: 28,
  display: 32,
  hero: 40,
} as const;

/**
 * Noontree is the noon brand face (bundled in src/assets/fonts, @font-face in global.css).
 * Note: bappzaar master's primaryFont() is still 'Figtree' (Noontree only in a few modules) — Figtree stays as the fallback.
 */
export const fontFamily = {
  primary: "'Noontree', 'Figtree', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  rtl: "'Cairo', 'Noontree', 'Figtree', sans-serif",
} as const;

export const fontWeight = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
} as const;

/** Typography presets → CSS `font` shorthand. Use via `<Text variant="titleSmall">` or `font: var(--nk-type-title-small)`. */
export const type = {
  hero: { size: 28, line: 34, weight: 700 },
  titleLarge: { size: 24, line: 30, weight: 700 },
  title: { size: 20, line: 26, weight: 700 },
  titleSmall: { size: 18, line: 24, weight: 700 },
  heading: { size: 17, line: 22, weight: 700 }, // profile name, toggle title
  section: { size: 16, line: 22, weight: 700 }, // module titles
  bodyLarge: { size: 16, line: 22, weight: 400 },
  bodyMedium: { size: 15, line: 20, weight: 500 }, // menu rows
  body: { size: 14, line: 18, weight: 400 },
  bodyBold: { size: 14, line: 18, weight: 700 },
  bodySemibold: { size: 14, line: 18, weight: 600 },
  productTitle: { size: 14, line: 18, weight: 500 },
  caption: { size: 12, line: 16, weight: 400 },
  captionBold: { size: 12, line: 16, weight: 600 },
  micro: { size: 11, line: 14, weight: 500 },
  tab: { size: 14, line: 17, weight: 600 }, // NoonApp.getTab: fontSize 14, semibold

  // Recurring combos across components + flows: text<size><Weight>Lh<line> (Lh1 / Lh1p35 = unitless line-height).
  // Raw shorthand → token lookup: scripts/token-map.json (`type`).
  text10MediumLh12: { size: 10, line: 12, weight: 500 },
  text10SemiboldLh12: { size: 10, line: 12, weight: 600 },
  text11RegularLh14: { size: 11, line: 14, weight: 400 },
  text11BoldLh18: { size: 11, line: 18, weight: 700 },
  text12RegularLh1: { size: 12, line: '1', weight: 400 },
  text12RegularLh14: { size: 12, line: 14, weight: 400 },
  text12RegularLh18: { size: 12, line: 18, weight: 400 },
  text12MediumLh1: { size: 12, line: '1', weight: 500 },
  text12MediumLh14: { size: 12, line: 14, weight: 500 },
  text12MediumLh15: { size: 12, line: 15, weight: 500 },
  text12MediumLh16: { size: 12, line: 16, weight: 500 },
  text12MediumLh18: { size: 12, line: 18, weight: 500 },
  text12SemiboldLh1: { size: 12, line: '1', weight: 600 },
  text12SemiboldLh14: { size: 12, line: 14, weight: 600 },
  text12BoldLh1: { size: 12, line: '1', weight: 700 },
  text12BoldLh16: { size: 12, line: 16, weight: 700 },
  text13RegularLh1p35: { size: 13, line: '1.35', weight: 400 },
  text13RegularLh16: { size: 13, line: 16, weight: 400 },
  text13RegularLh17: { size: 13, line: 17, weight: 400 },
  text13RegularLh18: { size: 13, line: 18, weight: 400 },
  text13RegularLh20: { size: 13, line: 20, weight: 400 },
  text13MediumLh16: { size: 13, line: 16, weight: 500 },
  text13MediumLh17: { size: 13, line: 17, weight: 500 },
  text13MediumLh18: { size: 13, line: 18, weight: 500 },
  text13SemiboldLh1: { size: 13, line: '1', weight: 600 },
  text13SemiboldLh16: { size: 13, line: 16, weight: 600 },
  text13SemiboldLh18: { size: 13, line: 18, weight: 600 },
  text14RegularLh1: { size: 14, line: '1', weight: 400 },
  text14RegularLh20: { size: 14, line: 20, weight: 400 },
  text14RegularLh22: { size: 14, line: 22, weight: 400 },
  text14MediumLh1: { size: 14, line: '1', weight: 500 },
  text14SemiboldLh1: { size: 14, line: '1', weight: 600 },
  text14SemiboldLh16: { size: 14, line: 16, weight: 600 },
  text14SemiboldLh20: { size: 14, line: 20, weight: 600 },
  text14BoldLh1: { size: 14, line: '1', weight: 700 },
  text14BoldLh20: { size: 14, line: 20, weight: 700 },
  text15MediumLh18: { size: 15, line: 18, weight: 500 },
  text15SemiboldLh19: { size: 15, line: 19, weight: 600 },
  text15SemiboldLh20: { size: 15, line: 20, weight: 600 },
  text16RegularLh20: { size: 16, line: 20, weight: 400 },
  text16RegularLh21: { size: 16, line: 21, weight: 400 },
  text16SemiboldLh18: { size: 16, line: 18, weight: 600 },
  text16SemiboldLh20: { size: 16, line: 20, weight: 600 },
  text16SemiboldLh22: { size: 16, line: 22, weight: 600 },
  text16BoldLh1: { size: 16, line: '1', weight: 700 },
  text16BoldLh20: { size: 16, line: 20, weight: 700 },
  text17MediumLh30: { size: 17, line: 30, weight: 500 },
  text17SemiboldLh20: { size: 17, line: 20, weight: 600 },
  text17SemiboldLh22: { size: 17, line: 22, weight: 600 },
  text18SemiboldLh22: { size: 18, line: 22, weight: 600 },
  text18BoldLh20: { size: 18, line: 20, weight: 700 },
  text18BoldLh22: { size: 18, line: 22, weight: 700 },
  text19BoldLh24: { size: 19, line: 24, weight: 700 },
  text20BoldLh24: { size: 20, line: 24, weight: 700 },
  text22BoldLh28: { size: 22, line: 28, weight: 700 },
  text15BoldLh20: { size: 15, line: 20, weight: 700 }, // SKU price (Figma "SKU", cart + home)
  text10RegularLh11: { size: 10, line: 11, weight: 400 }, // SKU "Ad" tag
} as const;

export const shadow = {
  none: 'none',
  card: `0 1px 2px ${palette.blackAlpha4}`, // NoonStyles.shadow()
  raised: `0 3px 6px ${palette.darkGrayColorAlpha10}`, // shadow2
  lg: `0 7px 16px ${palette.blackAlpha18}`, // shadow3 (softened for web)
  tabBar: `0 -3px 4px ${palette.blackAlpha8}`, // NoonApp.getTabOptions iOS shadow: opacity 0.08, radius 4 (UIKit offset 0, -3)
  thumb: `0 1px 4px ${palette.blackAlpha6}`,
  bottomBar: `0 -2px 6px ${palette.blackAlpha8}`, // sticky footer (BottomBar)
  floating: `0 -4px 32px ${palette.charcoalAlpha12}`, // floating action pill (NeedHelpButton)
} as const;

export const layout = {
  deviceWidth: 390,
  deviceHeight: 844,
  screenRadius: 52, // device screen corner
  screenSmoothing: 1, // Figma corner smoothing (0–1); 1 = 100%
  statusBar: 54,
  homeIndicator: 34,
  tabBar: 49, // bappzaar native bottom tabs (UITabBar, stacked): 49pt above the home-indicator inset
  header: 56,
} as const;


/** camelCase token key → CSS var segment (same rule as the ThemeProvider): textPrimary → text-primary. */
export const kebab = (s: string) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

/** Typed `var(--nk-…)` references, for component tokens and TSX inline styles (typos fail tsc). */
export const ref = {
  color: (k: keyof typeof colors) => `var(--nk-color-${kebab(k)})`,
  palette: (k: keyof typeof palette) => `var(--nk-palette-${kebab(k)})`,
  space: (k: keyof typeof spacing) => `var(--nk-space-${kebab(k)})`,
  radius: (k: keyof typeof radius) => `var(--nk-radius-${kebab(k)})`,
  type: (k: keyof typeof type) => `var(--nk-type-${kebab(k)})`,
  fontSize: (k: keyof typeof fontSize) => `var(--nk-font-size-${kebab(k)})`,
  fontWeight: (k: keyof typeof fontWeight) => `var(--nk-font-weight-${kebab(k)})`,
  shadow: (k: keyof typeof shadow) => `var(--nk-shadow-${kebab(k)})`,
  layout: (k: keyof typeof layout) => `var(--nk-layout-${kebab(k)})`,
};

const transparent = 'transparent';
/** kit variants share one disabled look (#EAECF0 fill, disabled text, no border) */
const kitDisabled = { bg: ref.color('border'), fg: ref.color('textDisabled'), border: transparent };

/**
 * <Button> — every visual value of src/components/Button. CSS: var(--nk-button-<key>), e.g.
 *   --nk-button-primary-bg / -fg / -border / -bg-disabled / -fg-disabled / -border-disabled
 *   --nk-button-md-height / -padding-x / -radius / -font   (sm · md · lg)
 *   --nk-button-noon-padding-y, --nk-button-noon-press-scale …
 * Kit variants are the noon app's CTAs; `noon*` are bappzaar marketplaces/noon/components/NoonButton
 * (styles.ts DEFAULT/GHOST/DOTTED_PRESETS, r12, padding 14/24, 16/600, press opacity .95 + scale .98, 200ms).
 */
export const button = {
  gap: 6,
  borderWidth: 1,
  /** <Pressable> default press scale (AnimatedPressable 0.96) */
  pressScale,

  smHeight: 32,
  smPaddingX: 10,
  smRadius: ref.radius('r8'),
  smFont: ref.type('captionBold'),
  smIconSize: 14,
  mdHeight: 40,
  mdPaddingX: 14,
  mdRadius: ref.radius('r10'),
  mdFont: ref.type('bodyBold'),
  mdIconSize: 16,
  lgHeight: 52, // min-height
  lgPaddingX: 24,
  lgRadius: ref.radius('r12'),
  lgFont: ref.type('text16SemiboldLh20'),
  lgIconSize: 18,
  /** kit `loading` spinner */
  spinnerSize: 18,
  spinnerDuration: 700,

  // kit variants — #3866DF Add to cart / View cart
  primaryBg: ref.color('cta'),
  primaryFg: ref.color('textInverse'),
  primaryBorder: transparent,
  primaryBgDisabled: kitDisabled.bg,
  primaryFgDisabled: kitDisabled.fg,
  primaryBorderDisabled: kitDisabled.border,
  // #0057FF cart Checkout, Cancel selected
  checkoutBg: ref.color('brandBlue'),
  checkoutFg: ref.color('textInverse'),
  checkoutBorder: transparent,
  checkoutBgDisabled: kitDisabled.bg,
  checkoutFgDisabled: kitDisabled.fg,
  checkoutBorderDisabled: kitDisabled.border,
  // #0F7EFF Create pill, View cart floating
  brightBg: ref.color('primaryBright'),
  brightFg: ref.color('textInverse'),
  brightBorder: transparent,
  brightBgDisabled: kitDisabled.bg,
  brightFgDisabled: kitDisabled.fg,
  brightBorderDisabled: kitDisabled.border,
  // #0E0E0E Login, Continue shopping
  darkBg: ref.color('bgInverse'),
  darkFg: ref.color('textInverse'),
  darkBorder: transparent,
  darkBgDisabled: kitDisabled.bg,
  darkFgDisabled: kitDisabled.fg,
  darkBorderDisabled: kitDisabled.border,
  // white + #3866DF border — Buy now
  outlineBg: ref.color('bgSurface'),
  outlineFg: ref.color('cta'),
  outlineBorder: ref.color('cta'),
  outlineBgDisabled: kitDisabled.bg,
  outlineFgDisabled: kitDisabled.fg,
  outlineBorderDisabled: kitDisabled.border,
  // white + #EAECF0 border — Cancel, Clear all
  secondaryBg: ref.color('bgSurface'),
  secondaryFg: ref.color('textPrimary'),
  secondaryBorder: ref.color('border'),
  secondaryBgDisabled: kitDisabled.bg,
  secondaryFgDisabled: kitDisabled.fg,
  secondaryBorderDisabled: kitDisabled.border,
  // #EBF4FF + #0F61FF text — wishlist ATC, View options
  softBg: ref.color('bgInfo'),
  softFg: ref.color('primary'),
  softBorder: transparent,
  softBgDisabled: kitDisabled.bg,
  softFgDisabled: kitDisabled.fg,
  softBorderDisabled: kitDisabled.border,
  // #DE1C1C Yes, sign out
  dangerBg: ref.color('danger'),
  dangerFg: ref.color('textInverse'),
  dangerBorder: transparent,
  dangerBgDisabled: kitDisabled.bg,
  dangerFgDisabled: kitDisabled.fg,
  dangerBorderDisabled: kitDisabled.border,
  // text only
  ghostBg: transparent,
  ghostFg: ref.color('primary'),
  ghostBorder: transparent,
  ghostBgDisabled: kitDisabled.bg,
  ghostFgDisabled: kitDisabled.fg,
  ghostBorderDisabled: kitDisabled.border,

  // NoonButton metrics (all noon* variants)
  noonRadius: ref.radius('r12'),
  noonPaddingY: 14,
  noonPaddingX: ref.space('s24'),
  noonFont: ref.type('text16SemiboldLh20'),
  noonBorderWidth: 0,
  noonPressScale: 0.98,
  noonPressOpacity: 0.95,
  noonPressDuration: 200,
  noonLoaderSize: 24,
  // variant primary: newAccentColor / white; disabled disabledBackgroundColor / disabledTextColor
  noonBg: ref.color('link'),
  noonFg: ref.color('textInverse'),
  noonBgDisabled: ref.color('bgDisabled'),
  noonFgDisabled: ref.color('textDisabled'),
  noonLoader: ref.palette('white'),
  // variant secondary: white, newAccentColor text + 1px border
  noonSecondaryBg: ref.color('bgSurface'),
  noonSecondaryFg: ref.color('link'),
  noonSecondaryBorder: ref.color('link'),
  noonSecondaryBorderWidth: 1,
  noonSecondaryBgDisabled: ref.color('bgSurface'),
  noonSecondaryFgDisabled: ref.color('textDisabled'),
  noonSecondaryBorderDisabled: ref.color('bgDisabled'),
  noonSecondaryLoader: ref.color('link'),
  // type ghost: transparent, no padding
  noonGhostFg: ref.color('link'),
  noonGhostFgDisabled: ref.color('textDisabled'),
  // bappzaar GHOST_PRESETS.secondary / DOTTED_PRESETS.text = newTextPrimary (#0E0E0E)
  noonGhostSecondaryFg: ref.color('textInk'),
  noonGhostSecondaryFgDisabled: ref.color('textDisabled'),
  // type dotted: text over a 0.5/3 round-dotted line, 2px below
  noonDottedFg: ref.color('textInk'),
  noonDottedFgDisabled: ref.color('textDisabled'),
  noonDottedLine: ref.color('textInk'), // NoonButton dotted Line stroke = dottedColor ?? newTextPrimary
  noonDottedLineDisabled: ref.color('textDisabled'),
  noonDottedLineGap: 2,
  noonDottedDash: '0.5, 3',
} as const;

/** <IconButton> (Header) — 40px circle (NoonBackButton). CSS: var(--nk-icon-button-<key>). */
export const iconButton = {
  size: 40,
  iconSize: 20,
  radius: '50%',
  borderWidth: 1,
  fg: ref.color('textInk'),
  outlineBg: ref.color('bgSurface'),
  outlineBorder: ref.color('border'),
  glassBg: ref.palette('whiteAlpha90'),
  glassBorder: ref.color('borderSubtle'),
  glassBlur: 8,
  subtleBg: ref.color('bgSubtle'),
  subtleBorder: ref.color('border'),
  plainBg: transparent,
  badgeOffset: -2,
} as const;

/** Count badge on IconButton / TabBar. CSS: var(--nk-badge-<key>). */
export const badge = {
  size: 18,
  paddingX: 5,
  radius: 9,
  bg: ref.color('badge'),
  fg: ref.color('textInverse'),
  font: ref.type('text11BoldLh18'),
  /** TabBar badge ring */
  ringWidth: 1.5,
  ringColor: ref.color('bgSurface'),
} as const;

/** <Pill> — PLP nav pill / home tag chip / filter option (NoonCatalogListNavPill). CSS: var(--nk-pill-<key>). */
export const pill = {
  gap: 6,
  iconSize: 16,
  dropdownIconSize: 14,
  removeIconSize: 13,
  pressScale: 0.94,
  transitionDuration: 280,
  bg: ref.color('bgSurface'),
  border: ref.color('border'),
  borderWidth: 1,
  fg: ref.color('textMuted'),
  selectedWeight: ref.fontWeight('semibold'),
  // nav (sm 26 · md 30 · lg 32)
  navHeight: 30,
  navHeightSm: 26,
  navHeightLg: 32,
  navPaddingX: 11,
  navLgPaddingX: 12,
  navRadius: ref.radius('r20'),
  navFont: ref.type('text13MediumLh16'),
  navFontSizeLg: ref.fontSize('body'),
  navSelectedBorder: ref.color('pillSelectedBorder'),
  navSelectedFg: ref.color('primary'),
  // tag
  tagPaddingY: 8,
  tagPaddingX: 12,
  tagRadius: ref.radius('r32'),
  tagFont: ref.type('body'),
  tagFg: ref.color('textPrimary'),
  tagSelectedBorder: ref.color('textPrimary'),
  // filter
  filterPadding: 8,
  filterRadius: ref.radius('r8'),
  filterBorderWidth: 2,
  filterFont: ref.type('productTitle'),
  filterFg: ref.color('textBody'),
  filterSelectedBorder: ref.color('brandBlue'),
  filterSelectedBg: ref.palette('filterSelectedBackground'),
  // selected-count bubble
  countSize: 20,
  countBg: ref.color('primary'),
  countFg: ref.color('textInverse'),
  countFont: ref.type('text12BoldLh1'),
  rowGap: 8,
  rowPadding: 15,
} as const;

/** <QuantityStepper> — cart (NoonCartItemQuantitySelector) · filled (quick ATC) · soft (wishlist). CSS: var(--nk-stepper-<key>). */
export const stepper = {
  height: 36,
  radius: ref.radius('r8'),
  paddingX: 6,
  buttonPadding: 4,
  iconSize: 16,
  valueHeight: 20,
  valueMinWidth: 16,
  disabledOpacity: 0.4,
  cartWidth: 92,
  cartBg: ref.color('bgSurface'),
  cartBorder: `1px solid ${ref.color('borderInput')}`,
  cartFg: ref.palette('secondaryTextColor'),
  cartValueFg: ref.color('textInk'),
  cartFont: ref.type('text14BoldLh20'),
  filledWidth: 76,
  filledBg: ref.color('cta'),
  filledBorder: '0',
  filledFg: ref.color('textInverse'),
  filledValueFg: ref.color('textInverse'),
  filledFont: ref.type('text16BoldLh20'),
  softWidth: 120,
  softBg: ref.color('bgInfo'),
  softBorder: `1.2px solid ${ref.color('borderInfo')}`,
  softFg: ref.color('primary'),
  softValueFg: ref.color('primary'),
  softFont: ref.type('text18BoldLh20'),
} as const;

/** <SearchBarButton> / <SearchInput> (NoonSearchBarButton, NoonSearchScreen). CSS: var(--nk-search-bar-<key>). */
export const searchBar = {
  height: 52,
  radius: ref.radius('r12'),
  paddingX: 12,
  gap: 8,
  pressScale: 0.98,
  bg: ref.color('bgSurface'),
  border: ref.color('borderInput'),
  inputBorder: ref.palette('gray400'),
  iconSize: 20,
  cameraSize: 24,
  placeholderFont: ref.type('text17MediumLh30'),
  placeholderTracking: -0.2,
  placeholderFg: ref.color('textPrimary'),
  tickerHeight: 30,
  dividerHeight: 24,
  dividerGap: 4,
  fieldFont: ref.type('bodyLarge'),
  fieldFg: ref.color('textBody'),
  fieldPlaceholder: ref.color('textSecondary'),
  clearIconSize: 18,
} as const;

/** <TabBar> (NoonApp.getTabScreens). CSS: var(--nk-tab-bar-<key>). */
export const tabBar = {
  // bappzaar native bottom tabs (NoonApp.getTab / getTabOptions → react-native-navigation UITabBar): opaque white,
  // shadow 0.08 / 4, no indicator; labels primaryFont semibold 14 in both states, charcoalGreyColor → sapphire;
  // icons the tabbar webps at native size, iconInsets top 3; badge = the native badge in accentColor.
  bg: ref.color('bgSurface'),
  shadow: ref.shadow('tabBar'),
  barShadow: ref.shadow('tabBar'),
  fg: ref.palette('charcoalGreyColor'),
  fgInactive: ref.palette('charcoalGreyColor'), // #404553
  fgActive: ref.palette('sapphire'), // #1155CB
  iconBox: 32,
  iconSize: 32,
  iconInsetTop: 3,
  gap: 0,
  font: ref.type('tab'),
  labelFont: `600 14px/14px var(--nk-font-family)`,
  labelFontActive: `600 14px/14px var(--nk-font-family)`,
  labelTracking: 0,
  pressScale: 1,
  height: ref.layout('tabBar'),
  // UITabBarItem badge: 18 high capsule, min 18 wide, 13pt system text, top-right of the icon
  badgeTop: -2,
  badgeEnd: -8,
  badgeLeft: 'calc(50% + 6px)',
  badgeFont: `400 13px/18px -apple-system, BlinkMacSystemFont, system-ui, sans-serif`,
} as const;

/** <QuickAdd> on ProductCard (NoonProductBoxAddToCart). CSS: var(--nk-quick-add-<key>). */
export const quickAdd = {
  size: 36,
  expandedWidth: 76,
  radius: ref.radius('r8'),
  bg: ref.color('bgSurface'),
  border: ref.color('borderSubtle'),
  shadow: ref.shadow('thumb'),
  icon: ref.palette('black'),
  iconSize: 22,
  filledBg: ref.color('cta'),
  countFg: ref.color('textInverse'),
  countFont: ref.type('text13SemiboldLh1'),
  pressScale: 0.9,
} as const;

/** <NeedHelpButton> floating help pill (Accounts Figma 4NvyqO60K7Xn4gRJrkWmzQ · 8924:67388). CSS: var(--nk-need-help-<key>). */
export const needHelp = {
  size: 48, // collapsed circle = expanded height (2 border + 12 padding + 20 icon + 12 + 2)
  padding: 12,
  gap: 8,
  radius: ref.radius('full'),
  borderWidth: 2,
  border: ref.palette('lightBlue'), // blue/200 #BBDAFF
  bg: ref.color('bgSurface'),
  shadow: ref.shadow('floating'),
  icon: ref.color('brandBlue'), // #0057FF
  iconSize: 20,
  fg: ref.color('textPrimary'), // blue-gray/900
  font: ref.type('text16SemiboldLh20'), // Primary/Label2/Semibold
  tracking: -0.16,
  inset: 16, // from the screen edge / above the tab bar
  pressScale: 0.96,
} as const;

export const tokens = { colors, palette, spacing, radius, fontSize, fontFamily, fontWeight, type, shadow, layout, button, iconButton, badge, pill, stepper, searchBar, tabBar, quickAdd, needHelp };
export type Tokens = typeof tokens;

type Widen<T> = { [K in keyof T]?: T[K] extends object ? Widen<T[K]> : string | number };
/** Partial token overrides a flow (or a consumer app) can apply. Extra keys are allowed for flow-specific tokens. */
export type TokenOverrides = { [K in keyof Tokens]?: Widen<Tokens[K]> & Record<string, unknown> };
