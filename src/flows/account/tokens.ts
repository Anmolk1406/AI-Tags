import type { TokenOverrides } from '../../foundations/tokens';

/**
 * Account-only tokens (values from bappzaar NoonAccount/* styles).
 * `accountTokens` is used directly by this flow's components; `accountFlowTokens`
 * is applied to the whole flow through `flow.tokens` (every key becomes a CSS var,
 * e.g. colors.acctSubtitle → var(--nk-color-acct-subtitle)).
 */
export const accountTokens = {
  edge: 15, // edgeSpacing
  sectionGap: 12,
  cardRadius: 16,
  menuRadius: 14,
  /** NoonAccountProfileHeader: noon One avatar = LinearGradient [paleYellow, noonOneBannerAmber(0.3)] {0,1}→{1,2} — on the 135° line the box spans 50%…150% */
  avatar: { size: 51, bg: 'var(--nk-palette-white-smoke)', noonOneFrom: 'var(--nk-palette-pale-yellow-legacy)', noonOneTo: 'var(--nk-palette-noon-one-banner-amber-alpha30)', noonOneInk: 'var(--nk-palette-cocoa-brown)', noonOneGradient: 'linear-gradient(135deg, var(--nk-palette-pale-yellow-legacy) 50%, var(--nk-palette-noon-one-banner-amber-alpha30) 150%)' },
  ring: { bg: 'var(--nk-palette-warning-surface)', border: 'var(--nk-palette-warning-border)', fill: 'var(--nk-palette-absolute-apricot)', idle: 'var(--nk-palette-slate-gray)', counter: 'var(--nk-palette-sunset-orange)' },
  noonOne: { surface: 'var(--nk-palette-pale-yellow-legacy)', from: 'var(--nk-palette-noon-one-banner-peach)', to: 'var(--nk-palette-noon-one-banner-cream)' },
  heroBlue: 'linear-gradient(160deg, var(--nk-palette-primary-blue) 0%, var(--nk-palette-kit-blue62) 55%, var(--nk-palette-kit-blue74) 100%)',
  heroHeight: 320,
  footerMuted: 'var(--nk-palette-bluish-grey)',
  subtitle: 'var(--nk-palette-blue-gray500)',
  /** NoonAccountLanguageSwitcher ITEM_WIDTH */
  langItem: 59,
  /** react-native-switch config used by Preferences + Notifications */
  switch: { circle: 16, barHeight: 20, width: 46, inset: 2, active: 'var(--nk-palette-blue-gray900)', inactive: 'var(--nk-palette-light-grey-color)' },
} as const;

export const accountFlowTokens: TokenOverrides = {
  colors: {
    bgPage: 'var(--nk-palette-anti-flash-white)',
    // NoonColors values with no matching kit token
    acctSubtitle: 'var(--nk-palette-blue-gray500)', // blueGray500
    acctOutline: 'var(--nk-palette-gray200)', // gray200
    acctSlate: 'var(--nk-palette-slate500)', // slate500
    acctNightfall: 'var(--nk-palette-night-fall)', // nightFall
    acctDisabled: 'var(--nk-palette-gray-color)', // grayColor
    acctInputBg: 'var(--nk-palette-kit-gray97)', // AddressV2FormInput bg
    acctFieldBg: 'var(--nk-palette-blue-gray50)', // blueGray50
    acctOrangeTint: 'var(--nk-palette-noon-system-orange-tint)', // noonSystemOrangeTint
    acctRed: 'var(--nk-palette-red-color)', // redColor
    acctBadgeFrom: 'var(--nk-palette-orange300)', // orange300
    acctBadgeTo: 'var(--nk-palette-pumpkin-orange)', // pumpkinOrange
    acctBadgeRingFrom: 'var(--nk-palette-light-apricot)', // lightApricot
    acctBadgeRingTo: 'var(--nk-palette-tangerine)', // tangerine
    acctLegacyBorder: 'var(--nk-palette-border-color)', // $borderColor (deletion screen)
    acctPasswordBorder: 'var(--nk-palette-kit-slate55)',
    acctPasswordMuted: 'var(--nk-palette-kit-gray73)',
    acctTabText: 'var(--nk-palette-dark-navy-alpha60)',
    acctTabTextActive: 'var(--nk-palette-dark-navy-alpha92)',
  },
  // noon One strip (NoonAccountNoonOne*: RN Text without lineHeight → normal)
  type: {
    acctNoonOneTitle: { size: 15, line: 'normal', weight: 700 }, // NotSubscribed title
    acctNoonOneCta: { size: 14, line: 'normal', weight: 700 }, // joinButtonText / Subscribed title
    // NoonAccountProfileHeader name / email (no lineHeight → normal)
    acctProfileName: { size: 17, line: 'normal', weight: 700 },
    acctProfileEmail: { size: 12, line: 'normal', weight: 400 },
    // NoonAccountActionCard title
    acctActionTitle: { size: 16, line: 22, weight: 700 },
    // one-off master styles (token lint cleanup)
    acctText24BoldLh1: { size: 24, line: '1', weight: 700 },
    acctText15MediumLh25: { size: 15, line: 25, weight: 500 },
    acctText11BoldLh1: { size: 11, line: '1', weight: 700 },
    acctText14MediumLh22: { size: 14, line: 22, weight: 500 },
    acctText16MediumLh20: { size: 16, line: 20, weight: 500 }, // language tab (with 'Cairo' family override)
    acctText17BoldLh20: { size: 17, line: 20, weight: 700 },
    acctText13SemiboldLh22: { size: 13, line: 22, weight: 600 },
    acctText13BoldLh16: { size: 13, line: 16, weight: 700 },
    acctText18SemiboldLh20: { size: 18, line: 20, weight: 600 },
    acctText16BoldLh18: { size: 16, line: 18, weight: 700 },
    acctText21RegularLh1: { size: 21, line: '1', weight: 400 },
  },
  radius: {
    acctNoonOne: 16, // NoonAccountNoonOneLayout bannerContainer borderBottom radii
    acctTile: 9, // NoonAccountActionCard imageWrapper
  },
  layout: {
    acctNoonOneLogoW: 48,
    acctNoonOneLogoH: 36,
    acctNoonOneChevronW: 6,
    acctNoonOneChevronH: 11,
    // NoonAccountActionCard imageWrapper 48×68, imageWrapperOuter marginHorizontal −5
    acctTileW: 48,
    acctTileH: 68,
    acctTileOverlap: -5,
  },
};
