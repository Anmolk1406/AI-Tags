import type { TokenOverrides } from '../../foundations/tokens';

/**
 * PLP-only values from NoonCatalogListHeader, NoonCatalogListNavPill and NoonFiltersV2, and the results
 * timeline + brand widget of the Brand Widget PLP handoff (github.com/saswata2002/Brand-Widget-PLP app.js
 * "Results (PLP 920:18788)" / "Brand widget (1214:145919)"); shared curves live in `handoff`
 * (src/motion/presets.ts). Times in seconds from the page appearing (= the end of the suggestions' exit).
 */
export const plpTokens = {
  headerBg: 'rgba(255, 255, 255, 0.95)',
  pillDivider: 'var(--nk-color-border)',
  /** results timeline */
  timeline: {
    /** bottom nav rises 88px on the handoff spring */
    navAt: 0.224,
    navRise: 88,
    /** chips drop 20px into place, 60ms apart (spring + S-curve fade); their skeletons fade with them */
    chipsAt: 0.48,
    chipDrop: 20,
    /** cards rise 16px into place, 60ms apart (spring + ease-out fade); each skeleton fades 353ms after its card */
    cardsAt: 0.68,
    cardRise: 16,
    skeletonOutAfter: 0.353,
    /** only the first cards play the rise; the rest are below the fold */
    animateFirst: 8,
  },
  /** a filter / brand change: cards dissolve into skeletons, hold ~half a shimmer pass, then rise again */
  swap: { outS: 0.18, revealAt: 0.82 },
  /** marketplace strip ticker (A → B → A every 7.2s, 140ms apart per tab, from 1.2s) */
  ticker: { period: 7.2, lag: 0.14, start: 1.2, row: 20 },
  /** marketplace strip (Legacy→new PLP 82:17411): tab subtitle lines and their colours */
  marketplaces: {
    noon: { a: 'Everything on noon', b: 'in one place', colorA: 'var(--nk-color-brand-ink)', colorB: 'var(--nk-color-brand-ink)' },
    supermall: { a: 'Direct from brands', b: 'in 60 Mins', colorA: 'var(--nk-color-text-primary)', colorB: 'var(--nk-palette-rocket-blue-sapphire)' },
    express: { a: 'Get Everything', b: 'in 1-2 days', colorA: 'var(--nk-color-text-legacy)', colorB: 'var(--nk-color-text-legacy)' },
    global: { a: 'Sourced Globally', b: 'Priced Locally', colorA: 'var(--nk-color-text-muted)', colorB: '#7F2BC2' },
    minutes: { a: 'Groceries & more', b: 'in ⚡️15 Mins', colorA: '#D22D29', colorB: '#D22D29' },
  },
  brandWidget: {
    /** box heights (2 + 450 panel + 9 gap − the grid's 2px top padding) / selected (2 + 60 + 15 − 2) */
    box: 459,
    boxSelected: 75,
    bar: 450,
    barSelected: 60,
    /** rail paging step: 204 card + 10 gap */
    step: 214,
    reveal: { cardRise: 20, cardScale: 0.9, headRise: 10, cardFadeAt: 0.017, headAt: 0.033, headFadeAt: 0.05 },
    /** brand cards rising into the panel (first 3, on screen): 16px, +3% scale, blur 4 → 0, 40ms apart */
    cards: { at: 0.08, stagger: 0.04, rise: 16, scale: 0.97, blur: 4, fade: 0.34, onScreen: 3 },
    /** "Shop phones by brand" glides into the "{brand} selected" slot */
    title: { dx: 58 - 14, dy: 13.5 - 16, k: 14 / 17 },
    /** the coin pops up once the panel is mostly closed; its mark 60ms later */
    popAt: 0.15,
    markLag: 0.06,
  },
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
    plpText17BoldLh20: { size: 17, line: 20, weight: 700 }, // brand card price
    plpText11SemiboldLh14: { size: 11, line: 14, weight: 600 }, // brand card "% off"
    plpText8BoldLh11: { size: 8, line: 11, weight: 700 }, // brand letter badge
    plpText11MediumLh16: { size: 11, line: 16, weight: 500 }, // marketplace ticker
  },
};
