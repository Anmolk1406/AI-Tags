import type { TokenOverrides } from '../../foundations/tokens';

/**
 * Address-only tokens (values copied from bappzaar origin/master AddressV2 / MapV2 `styles.ts`,
 * `src/constants/AddressConstants.ts` and NoonColors). Anything that already exists as a kit
 * token (#3866DF accent → --nk-color-cta, #1D2539 → --nk-color-text-primary, …) is used from the
 * kit directly; only the values below are flow-local.
 *
 * Each colour is exposed as `var(--nk-color-addr-<kebab>)` on every screen of this flow.
 */
export const addressColors = {
  // page + cards
  addrPage: 'var(--nk-palette-secondary-background-color)', // SelectScreen container / header / statusbar
  addrCardHeaderSelected: 'var(--nk-palette-alice-blue)', // $addressCardHeaderBackgroundColor
  addrCardBorderSelected: 'var(--nk-palette-lavender)', // $addressCardBorderColor / lavender
  addrNickname: 'var(--nk-palette-neutral-black)',
  addrTabTrack: 'var(--nk-palette-anti-flash-white)',
  addrTabText: 'var(--nk-palette-dark-navy-alpha60)',
  addrTabTextActive: 'var(--nk-palette-dark-navy-alpha92)',
  addrDistanceBg: 'var(--nk-palette-alice-blue)',
  addrCover: 'var(--nk-palette-white-alpha60)', // #FFFFFF99 loading cover

  // form
  addrFormHeader: 'var(--nk-palette-kit-gray97v2)',
  addrInputBg: 'var(--nk-palette-kit-gray97)',
  addrInputBorder: 'var(--nk-palette-secondary-background-color)',
  addrInputError: 'var(--nk-palette-deep-red-color)',
  addrTagBorder: 'var(--nk-palette-kit-gray97v3)',
  addrRequired: 'var(--nk-palette-red-color)', // $redColor
  addrDisabled: 'var(--nk-palette-gray-color)', // $grayColor
  addrNoonGrey1: 'var(--nk-palette-noon-grey1)',
  addrNoonGrey2: 'var(--nk-palette-noon-grey2)',

  // map
  addrMapBg: 'var(--nk-palette-kit-gray88)',
  addrTooltipErrorBg: 'var(--nk-palette-kit-pink95)', // AddressColors.lightRed
  addrTooltipErrorText: 'var(--nk-palette-kit-pink40)', // AddressColors.pinkText
  addrTooltipWarnBg: 'var(--nk-palette-kit-orange92)', // AddressColors.lightYellow
  addrTooltipWarnText: 'var(--nk-palette-orange800)', // AddressColors.lightOrange
  addrTooltipArrowError: 'var(--nk-palette-kit-red95)',
  addrOverlayBorder: 'var(--nk-palette-anti-flash-white)',
  addrSearchText: 'var(--nk-palette-charcoal-navy)',
  addrPrimaryText: 'var(--nk-palette-dark-navy)',
  addrLightGrayish: 'var(--nk-palette-light-grey-color)',

  // controls / delete
  addrControlText: 'var(--nk-palette-new-black)',
  addrDeleteBox: 'var(--nk-palette-blue-gray50)',
  addrHairline: 'var(--nk-palette-new-border-color)', // #0E0E0E12
  addrSuccessBg: 'var(--nk-palette-kit-gray98v2)',
  addrToastBorder: 'var(--nk-palette-white-alpha80)',
} as const;

/** Numbers used from TS (AddressOverlayStylings + component metrics). */
export const addressMetrics = {
  overlayEdge: 12, // AddressOverlayStylings.EDGE_SPACING
  fixedActionHeight: 68, // AddressOverlayStylings.FIXED_ACTION_HEIGHT
  pinLift: -12, // MapPinTooltip translateY while dragging
  pinWidth: 40,
  pinHeight: 52,
  tabWidth: 390 / 2 - 25, // TabSwitcher: screenWidth / tabs - 25
  mapZoomOverlay: 1.25, // Map scale while the form overlay is open
  mapZoomSearch: 1.2, // startZoomInAnimation
} as const;

/** Stylised map palette (Google Maps light style, drawn locally — no tiles). */
export const mapPalette = {
  land: '#F5F3EE',
  block: '#ECEAE4',
  blockStroke: '#E2DFD8',
  tower: '#E6E3DC',
  road: '#FFFFFF',
  roadCasing: '#E3E1DB',
  highway: '#FCE8A6',
  highwayCasing: '#EFCF73',
  water: '#AAD3F5',
  waterDeep: '#9CCBF2',
  park: '#CFE8C6',
  golf: '#BFE2B3',
  sand: '#F4ECD8',
  label: '#5F6368',
  labelWater: '#4A86C5',
  labelPark: '#3E7D3A',
  poi: '#8E8E93',
  metro: '#E94B3C',
  polygonStroke: 'rgba(0, 87, 255, 1)',
  polygonFillStart: 'rgba(0, 87, 255, 0.5)',
  polygonFillEnd: 'rgba(0, 87, 255, 0.2)',
} as const;

export const addressFlowTokens: TokenOverrides = {
  colors: { ...addressColors },
};
