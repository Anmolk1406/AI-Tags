import type { TokenOverrides } from '../../foundations/tokens';

/**
 * Home-only tokens. Anything here is applied only to Home screens (via flow.tokens),
 * and is also exported for direct use in this flow's components.
 * The header backgrounds are CMS-driven in the app — these are demo stand-ins.
 */
export const homeTokens = {
  headerBg: {
    noon: 'linear-gradient(180deg, #FEEE00 0%, #FFF7A6 70%, #FFFFFF 100%)',
    supermall: 'linear-gradient(180deg, #1D2539 0%, #3A2C6E 70%, #FFFFFF 100%)',
  },
  heroCardWidth: 244,
  heroCardHeight: 366,
  heroGap: 12,
  heroInterval: 4000,
  carouselCardWidth: 156, // screen ÷ 2.5
} as const;

/** ExperienceSwitcher constants (src/constants/ExperienceSwitcher.ts) at the 390pt demo width: item = 390 / 5. */
const switcherItem = 390 / 5;
export const switcherMetrics = {
  itemWidth: switcherItem,
  itemHeight: switcherItem,
  collapsedItemHeight: switcherItem / 2.2,
  itemPadding: 20,
  collapsedItemPadding: 12,
  gap: 8,
  bottomMargin: 8,
  topOffset: 5, // homeSwitcherTopOffset: status bar + 5 (iOS)
  duration: 0.3,
} as const;

export const homeFlowTokens: TokenOverrides = {
  colors: { bgPage: '#FFFFFF' },
  // one-off type combos (token lint cleanup)
  type: {
    homeText11SemiboldLh1: { size: 11, line: '1', weight: 600 }, // DealTimer pill
    homeText14ExtraboldLh1: { size: 14, line: '1', weight: 800 }, // switch knob
  },
};
