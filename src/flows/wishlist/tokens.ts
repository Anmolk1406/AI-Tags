import type { TokenOverrides } from '../../foundations/tokens';

/** Wishlist V2 tokens (bappzaar NoonWishlistV2* styles). */
export const wishlistTokens = {
  createPill: '#0F7EFF',
  tile: { width: 126, height: 152, bg: '#F9F9FB', border: '#F2F3F7', tab: '#D0D4DD', stack: 67, rotate: 8, sideScale: 0.88 },
  atc: { bg: '#EBF4FF', border: '#BDDBFF', ink: '#0F61FF', height: 38 },
  viewCart: { bg: '#0F7EFF', spring: { type: 'spring', damping: 16, stiffness: 120, mass: 0.7 } as const },
  empty: { title: '#101628', body: '#475067', cta: '#0F61FF' },
} as const;

export const wishlistFlowTokens: TokenOverrides = {
  colors: { bgPage: '#FFFFFF' },
  // one-off type combos (token lint cleanup)
  type: {
    wishlistText15RegularLh21: { size: 15, line: 21, weight: 400 }, // empty-state body
  },
};
