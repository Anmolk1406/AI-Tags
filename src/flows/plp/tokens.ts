import type { TokenOverrides } from '../../foundations/tokens';

/** PLP-only values from NoonCatalogListHeader, NoonCatalogListNavPill, NoonPLPLoadingMotion and NoonFiltersV2. */
export const plpTokens = {
  headerBg: 'rgba(255, 255, 255, 0.95)',
  pillDivider: 'var(--nk-color-border)',
  chipReveal: { delay: 0.2, stagger: 0.05, spring: { type: 'spring', stiffness: 280.6, damping: 27.14, mass: 1 } },
  cardRise: { y: 16, stagger: 0.035, spring: { type: 'spring', stiffness: 380, damping: 39 }, animateFirst: 8 },
  loadingMs: 650,
  filters: {
    sidebarWidth: 116,
    sidebarText: '#5D5D5D',
    sidebarActiveBg: '#EFF7FF',
    sectionBg: '#F4F6FA',
    title: '#475067',
  },
} as const;

export const plpFlowTokens: TokenOverrides = {
  colors: { bgPage: '#FFFFFF' },
  // one-off type combos (token lint cleanup)
  type: {
    plpText18SemiboldLh1: { size: 18, line: '1', weight: 600 }, // filters Clear / Show
  },
};
