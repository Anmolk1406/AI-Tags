import type { TokenOverrides } from '../../foundations/tokens';

/**
 * Storefront PDP (Figma 2ldJbjmQq4RkhnrNFCfXQB · 3499:75115) flow tokens for the reviews card (3499:75703), the
 * product rails (3499:75876 / 3499:75877) and the Bottom Nav (3499:75904). Keys are prefixed `pdpSfe` (CSS `--nk-*-pdp-sfe-*`); merge into
 * pdpFlowTokens. Only values with no central token within tolerance live here.
 */
export const pdpSfEFlowTokens: TokenOverrides = {
  colors: {
    pdpSfeTopicPillShadow: 'rgba(173, 36, 219, 0.08)', // token-lint-ignore — Figma 1409:63883 topic pill drop shadow (purple/700 at 8%)
    // review-topic sheet wash, top of the sheet (Figma Or9RuyCtjXRPrnbUJFx7As · 1421:634 / 1421:729); neutral uses bg-page
    pdpSfeTopicTintPositive: '#EDFFFE', // token-lint-ignore — Figma 1421:634 sheet fill (emerald50 #EDFDFB is greener)
    pdpSfeTopicTintNegative: '#FFFAF5', // token-lint-ignore — Figma 1421:729 sheet fill
    pdpSfeRecoMediaTint: 'rgba(0, 40, 136, 0.02)', // token-lint-ignore — Product card "Image container" fill (2% cobalt; skuMediaTint is 4%)
  },
  layout: {
    pdpSfeRecoImage: 156, // Product card image square: 87.5% of the 134 × 178.67 (3:4) box
  },
  type: {
    pdpSfeTitle: { size: 15, line: 17, weight: 700 }, // card titles "Ratings & Reviews", "Photo Reviews (n)", "Similar Products"
    pdpSfeScore: { size: 22, line: 24, weight: 800 }, // rating summary score
    pdpSfeChip: { size: 11, line: 14, weight: 500 }, // review variant chips / "View product"
    pdpSfePrice: { size: 15, line: 16, weight: 700 }, // rail card selling price
    // review topics (Figma Or9RuyCtjXRPrnbUJFx7As · 1409:63152)
    pdpSfeTopicPill: { size: 14, line: 20, weight: 500 }, // B14/Medium: unselected sheet pill
    pdpSfeTopicSentiment: { size: 16, line: 22, weight: 700 }, // B16/Bold: sheet sentiment line "Great value for money" (AI-Tags 1573:20245)
    pdpSfeTopicQuote: { size: 14, line: 22, weight: 600 }, // sentiment quote (1421:521)
    pdpSfeTopicAuthor: { size: 13, line: 20, weight: 600 }, // B13/SemiBold: review card author + like count
  },
};
