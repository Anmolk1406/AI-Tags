import type { TokenOverrides } from '../../foundations/tokens';

/** Search-only values (NoonSearchSuggestionRow, NoonRecentlySearchedModule, NoonSearchPushAnimation). */
export const searchTokens = {
  recentItemWidth: Math.round(390 / 5.2), // screen ÷ 5.2
  suggestionRowHeight: 44,
  rowEnterDelay: 0.11,
  rowStagger: 0.06,
  pushSpring: { type: 'spring', stiffness: 280.6, damping: 27.14, mass: 1 },
} as const;

export const searchFlowTokens: TokenOverrides = {
  colors: { bgPage: '#FFFFFF' },
};
