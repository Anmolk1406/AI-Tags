import type { TokenOverrides } from '../../foundations/tokens';

/** Orders (O2D) tokens — from features/o2d/theme/O2DColors.ts & O2DMetrics.ts. */
export const ordersTokens = {
  gutter: 15,
  cardGap: 16,
  trackingBg: 'linear-gradient(180deg, #EAECF0 0%, #F2F3F7 320px)',
  progressGreen: 'linear-gradient(90deg, #ADF0D5, #77DBAA)',
  progressGray: 'linear-gradient(90deg, #D0D4DD, #989FB3)',
  eyeReached: '#108757',
  onTime: '#0F8857',
  late: '#DE1C1C',
  alertSurface: '#FEEBEB',
  alertInk: '#D92626',
  refundSurface: '#EDFDFB',
  refundInk: '#26732C',
  statusColors: {
    shipped: '#0F61FF',
    out_for_delivery: '#0F8857',
    processing: '#E5641A',
    delivered: '#0F8857',
    cancelled: '#D92626',
    returned: '#666D85',
  },
} as const;

export const ordersFlowTokens: TokenOverrides = {
  colors: { bgPage: '#F2F3F7' },
  // one-off type combos (token lint cleanup)
  type: {
    ordersText12BoldLh24: { size: 12, line: 24, weight: 700 }, // PIN digit
    ordersText32BoldLh40: { size: 32, line: 40, weight: 700 }, // headline
    ordersText13BoldLh18: { size: 13, line: 18, weight: 700 }, // cancel price
  },
};
