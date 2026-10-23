import type { TokenOverrides } from '../../foundations/tokens';

/**
 * Saved cards (payment V2) tokens — features/payment/theme/{PaymentColors,PaymentMetrics}.ts and the
 * per-component styles.ts files on bappzaar origin/master. Values that already exist as kit tokens are
 * referenced through CSS vars in the modules; only payment-specific values live here.
 *
 * Exposed to CSS as --nk-color-cards-* (see `cardsFlowTokens`).
 */
export const cardsColors = {
  darkNavy: 'var(--nk-palette-dark-navy)', // PaymentColors.darkNavy — header icons, outline button text
  newBlack: 'var(--nk-palette-new-black)', // PaymentColors.newBlack — action button labels
  cardBackground: 'var(--nk-palette-kit-gray76)', // PaymentColors.cardBackground — card art placeholder / inner shadow
  tintedIcon: 'var(--nk-palette-kit-sky58)', // PaymentColors.tintedIconColor(noon)
  inputBg: 'var(--nk-palette-kit-gray97)', // PaymentTextInputV2 input
  inputBorder: 'var(--nk-palette-secondary-background-color)',
  inputText: 'var(--nk-palette-charcoal-navy)',
  inputError: 'var(--nk-palette-deep-red-color)',
  disabledBg: 'var(--nk-palette-disabled-background-color)', // PaymentColors.disabledBackgroundColor
  disabledText: 'var(--nk-palette-neutral-black-hex3-f)', // PaymentColors.disabledTextColor
  switchOff: 'var(--nk-palette-filter-checkbox-border)', // PaymentSwitchV2 off track
  lightSilver: 'var(--nk-palette-white-smoke)', // success gradient start
  scanButtonBg: 'var(--nk-palette-white-alpha64)', // PaymentScanOptionButton
  red: 'var(--nk-palette-red-color)', // PaymentColors.redColor — nickname error
  headerBtnDarkBg: 'var(--nk-palette-black-alpha60)', // PaymentScreenHeaderButton transparent
  headerBtnDarkBorder: 'var(--nk-palette-bright-grey-color-alpha40)', // brightGreyColor(0.4)
  cardTitleBg: 'var(--nk-palette-black-alpha60)', // PaymentAnimatedListCard title chip
  cardTitleBorder: 'var(--nk-palette-white-alpha16)',
  cardSelectedBorder: 'var(--nk-palette-white-alpha28)',
  successTitleBg: 'var(--nk-palette-black-alpha50)', // PaymentCardAdditionSuccessScreen title chip
  listScrim: 'var(--nk-palette-black-alpha90)', // usePaymentAnimatedBackgroundStyle final colour
  dashedBorder: 'var(--nk-palette-dashed-border-default)', // NoonTokens.colors.dashedBorderDefault (NoonDashedBorder between scan options)
} as const;

/** PaymentMetrics + PaymentAnimationConfig, resolved for the kit's 390 × 844 device (status bar 54, home indicator 34). */
export const cardsMetrics = {
  contentWidth: 390,
  statusBar: 54,
  safeBottom: 34,
  cardAspect: 853 / 538, // CARD_ASPECT_RATIO
  cardHorizontalMargin: 40,
  cardOffsetMultiplier: -0.7,
  headerContentHeight: 68, // HEADER_CONTENT_HEIGHT
  headerButtonSize: 36,
  sectionTitleHeight: 36,
  sectionSpacing: 34,
  actionsOverlayHeight: 170,
  editNicknameOverlayHeight: 134,
  edgeSpacing: 12,
  scanOptionsTitleHeight: 40,
  get cardWidth() {
    return this.contentWidth - this.cardHorizontalMargin; // 350
  },
  get cardHeight() {
    return this.cardWidth / this.cardAspect; // ≈ 220.75
  },
  get cardOffset() {
    return this.cardHeight * this.cardOffsetMultiplier; // ≈ -154.5 (stacked overlap)
  },
  get headerHeight() {
    return this.statusBar + this.headerContentHeight; // 122
  },
  get overlayBottomSpacing() {
    return this.safeBottom === 0 ? 18 : this.safeBottom + 8; // 42
  },
  get manualEntryHeight() {
    return this.scanOptionsTitleHeight + this.edgeSpacing * 2 + 48; // 112
  },
};

/** PaymentAnimationTimings (ms). */
export const cardsTimings = {
  overscrollRelease: 400,
  overscrollThrow: 100,
  firstRound: 160,
  waitBetweenRounds: 40,
  secondRound: 170,
  get full() {
    return this.firstRound + this.waitBetweenRounds + this.secondRound; // 370
  },
  actions: 200,
  shimmerDelay: 1000,
  bounceStagger: 120,
  shimmerFade: 100,
};

/** reanimated withTiming default easing = Easing.inOut(Easing.quad); Easing.out(Easing.quad). */
export const cardsEasing = {
  inOutQuad: [0.455, 0.03, 0.515, 0.955] as [number, number, number, number],
  outQuad: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
  inQuad: [0.55, 0.085, 0.68, 0.53] as [number, number, number, number],
  outEase: [0.42, 0, 0.58, 1] as [number, number, number, number],
};

/** withSpring configs used across the payment feature. */
export const cardsSprings = {
  press: { type: 'spring', stiffness: 300, damping: 20, mass: 0.5 } as const, // PaymentButtonV2 / AdditionOption
  form: { type: 'spring', stiffness: 300, damping: 28, mass: 1 } as const, // ManualAddition calculateAnimationTimingFunction
};

export const cardsFlowTokens: TokenOverrides = {
  colors: {
    ...Object.fromEntries(Object.entries(cardsColors).map(([k, v]) => [`cards${k[0].toUpperCase()}${k.slice(1)}`, v])),
  },
  // one-off type combos (token lint cleanup)
  type: {
    cardsText12LightLh18: { size: 12, line: 18, weight: 300 },
    cardsText16RegularLh24: { size: 16, line: 24, weight: 400 },
    cardsText30ExtraboldLh38: { size: 30, line: 38, weight: 800 },
    cardsText15RegularLh24: { size: 15, line: 24, weight: 400 },
  },
};
