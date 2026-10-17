import type { TokenOverrides } from '../../foundations/tokens';

/**
 * noon Credits (wallet) flow tokens. Values from bappzaar origin/master `features/wallet/**` styles.ts and
 * `features/wallet/theme/WalletColors.ts` (see MAPPING.md). Colours that already exist in the kit are used from the kit
 * (`--nk-color-*` / `--nk-palette-*`); only the wallet's own values are defined here.
 *
 * CSS: colours → `var(--nk-color-credits-<kebab>)`, type → `var(--nk-type-credits-<kebab>)`.
 * RN Text without lineHeight → line 'normal' (Figtree's default leading).
 */
const colors = {
  creditsPage: '#FAFAFC', // WalletScreen options statusBar / ScreenView bg rgb(250,250,252)
  creditsGap: '#ECEDF1', // success container (10px gap under the top view)
  creditsSheetGrey: '#F5F6F8', // WalletTransactionDetailsScreen root
  creditsGreen: '#008200', // amountText <green>
  creditsWarning: '#A35900', // <warning>, expiring pill text, banner chevron
  creditsWarningDark: '#8C4A00', // expiry lot <warning>
  creditsLight: '#DDDDDD', // subtitle <light> separator
  creditsExpiringBg: '#FEFEEB', // WalletLabels/WalletBalance EXPIRING
  creditsNegative: '#5A0C0C', // WalletTotalBalance negative tint
  creditsDanger: '#8C1717', // banner <danger>
  creditsDangerPill: 'rgba(254, 202, 202, 0.5)', // banner NEGATIVE_BALANCE pill #FECACA80
  creditsDangerRim: '#FFEDED', // banner NEGATIVE_BALANCE rim end
  creditsWarningPill: 'rgba(253, 246, 155, 0.5)', // banner EXPIRING pill #FDF69B80
  creditsWarningRim: 'rgba(255, 250, 186, 0.5)', // banner EXPIRING rim end #FFFABA80
  creditsLogosPill: '#313131', // top-up logos pill rgb(49,49,49)
  creditsHairline: 'rgba(14, 14, 14, 0.04)', // #0E0E0E0A icon box border / Default pill bg
  creditsIconBorder: 'rgba(14, 14, 14, 0.07)', // #0E0E0E12 details header icon border
  creditsChipActive: 'rgba(14, 14, 14, 0.25)', // #0E0E0E3F active chip border
  creditsMuted: 'rgba(14, 14, 14, 0.655)', // #0E0E0EA7 history title / <black> subtitle
  creditsWithdrawBg: '#F4F9FF', // WalletBankWithdraw pill
  creditsWithdrawBorder: '#DCECFF',
  creditsCalendarRange: '#E8F0FE', // period between start / end
  creditsCalendarRangeText: '#0937A5',
  creditsCalendarSingle: '#CFD9E7', // rgb(207,217,231) start only
  creditsCalendarWeekday: '#9AA0A6', // textSectionTitleColor
  creditsCalendarToday: '#1A73E8', // todayTextColor
  creditsCalendarDisabled: '#D0D7DE', // textDisabledColor
  creditsDateLabelFilled: '#939393', // From / To label when a date is set
  creditsGiftInputBorder: '#ECEEF4', // GiftCardRedeemScreen inputs
  creditsLegacyLightBlue: '#F1F4FD', // $lightBlueColor (OTP input underline)
  creditsCampaignFrom: '#7B2FF7', // campaign.gradient (server; demo values)
  creditsCampaignTo: '#F107A3',
} as const;

const type = {
  creditsTitle18Bold: { size: 18, line: 'normal', weight: 700 }, // header / sheet titles
  creditsText16Bold: { size: 16, line: 'normal', weight: 700 }, // "Transactions", default-view title
  creditsText16Semibold: { size: 16, line: 'normal', weight: 600 }, // filter section titles, buttons
  creditsText16: { size: 16, line: 'normal', weight: 400 }, // filter row labels
  creditsText14Semibold: { size: 14, line: 'normal', weight: 600 }, // row titles, chips (active), top-up label
  creditsText14Medium: { size: 14, line: 'normal', weight: 500 }, // history titles, order nr
  creditsText14: { size: 14, line: 'normal', weight: 400 }, // chips (inactive), descriptions
  creditsText13Semibold: { size: 13, line: 'normal', weight: 600 }, // header pill, View Order Details
  creditsText13: { size: 13, line: 'normal', weight: 400 }, // base Text (HtmlView root)
  creditsText13Lh16: { size: 13, line: 16, weight: 400 }, // expiring sheet note
  creditsText13Lh18: { size: 13, line: 18, weight: 400 }, // WalletError subtitle
  creditsText13Lh20: { size: 13, line: 20, weight: 400 }, // banner <normal>
  creditsText10Bold: { size: 10, line: 'normal', weight: 700 }, // calendar weekday names
  creditsBalance40: { size: 40, line: 50, weight: 700 }, // WalletTotalBalance integer (minHeight 50)
  creditsBalanceSign: { size: 32, line: 50, weight: 500 }, // "-" when negative
  creditsBalanceCurrency: { size: 28, line: 50, weight: 600 },
  creditsBalanceDecimal: { size: 30, line: 50, weight: 700 }, // ".XX"
  creditsText18Semibold: { size: 18, line: 'normal', weight: 600 }, // Filters footer button
  // legacy bank-transfer / gift-card screens (src theme: $appFontSubhead 15, $appFontBody 17, $appFontTitleMedium 22 …)
  creditsLegacy12: { size: 12, line: 'normal', weight: 400 },
  creditsLegacy12Bold: { size: 12, line: 'normal', weight: 700 },
  creditsLegacy13Bold: { size: 13, line: 'normal', weight: 700 },
  creditsLegacy13Medium: { size: 13, line: 'normal', weight: 500 },
  creditsLegacy14Lh21: { size: 14, line: 21, weight: 400 },
  creditsLegacy15: { size: 15, line: 'normal', weight: 400 },
  creditsLegacy15Bold: { size: 15, line: 'normal', weight: 700 },
  creditsLegacy17Bold: { size: 17, line: 'normal', weight: 700 },
  creditsLegacy19Semibold: { size: 19, line: 'normal', weight: 600 },
  creditsLegacy20Bold: { size: 20, line: 'normal', weight: 700 },
  creditsLegacy22Bold: { size: 22, line: 'normal', weight: 700 },
  creditsLegacy28Bold: { size: 28, line: 'normal', weight: 700 },
} as const;

export const creditsFlowTokens: TokenOverrides = { colors, type };

/**
 * Top-up providers (get-provider-list-v2: burn.loyalty, then burn.voucher). Codes match checkout's provider-burn
 * sheets. The app shows remote logos (`icons.wallet` 45×45, `icons.rounded` 30×30); the kit draws the brand colour and
 * the wordmark's initial, like checkout's ProviderLogo stand-ins.
 */
export const creditsProviders = [
  { code: 'share', title: 'SHARE points', isVoucher: false, color: '#7B2CBF', ink: 'var(--nk-palette-white)', mark: 'S' },
  { code: 'skywards', title: 'Skywards Miles', isVoucher: false, color: '#1D1D1B', ink: '#C9A86A', mark: 'S' },
  { code: 'yougotagift', title: 'YOUGotaGift', isVoucher: true, color: '#E5195E', ink: 'var(--nk-palette-white)', mark: 'Y' },
  { code: 'flexvoucher', title: 'Flex voucher', isVoucher: true, color: '#0F61FF', ink: 'var(--nk-palette-white)', mark: 'f' },
] as const;

/** JS-side values (geometry the screens compute, timings, demo latency). */
export const creditsTokens = {
  /** WalletScreen top view height: 80 + banner 30 + top-up 70 (+5 with both) + campaign 30 */
  topBase: 80,
  topBanner: 30,
  topTopup: 70,
  topBannerAndTopup: 5,
  topCampaign: 30,
  /** translateY of the white panel = top view + this gap */
  panelGap: 10,
  /** top-up logos pill: 30px logos overlapping by 15 */
  logoSize: 30,
  logoStep: 15,
  /** demo latency of the wallet APIs (main + transactions) and of a filter preview fetch */
  loadDelay: 900,
  previewDelay: 450,
  /** sheet snap points (gorhom) */
  detailsHeight: 500,
  pendingHeight: 300,
  expiringHeight: 450,
  filtersHeight: '60%',
} as const;
