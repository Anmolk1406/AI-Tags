import type { TokenOverrides } from '../../foundations/tokens';

/**
 * Yellow Friday flow tokens. The campaign surfaces are noon yellow on white; everything else is the central palette.
 * Values with no central token live here (gradients, the journey's own measurements).
 */
export const yellowFridayTokens = {
  /** hero: yellow fading into the page surface */
  heroGradient: 'linear-gradient(180deg, var(--nk-color-brand) 0%, var(--nk-color-noon-one-surface) 55%, var(--nk-color-bg-surface) 100%)',
  /** swipe distance (px) past which a dragged pick counts as saved / skipped */
  swipeThreshold: 90,
  /** reveal card image box height */
  cardImage: 236,
  /** interest card height in the 2 × 3 grid */
  interestCard: 108,
  /** budget caps for the segment, dirhams */
  budgets: { u300: 300, u600: 600, none: Infinity } as Record<'u300' | 'u600' | 'none', number>,
  /** picks needed for the bonus (free express delivery) */
  bonusPicks: 3,
} as const;

export const yellowFridayFlowTokens: TokenOverrides = {
  colors: {
    bgPage: 'var(--nk-palette-white)',
    /** dark fills: active dot, pick tick, bonus tag, progress bar, countdown tiles (the text-primary ink as a surface) */
    yfSurfaceDark: 'var(--nk-palette-blue-gray900)',
  },
};
