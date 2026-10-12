import { Icon } from '../Icon/Icon';
import { fontWeight, radius, ref, spacing } from '../../foundations/tokens';

/** NoonReviewUtil.noonReviewColorV2: ≤1.9 orange, ≤2.9 amber, ≤3.9 green, else dark green */
export const starColor = (r: number) => ref.color(r < 2 ? 'starLow' : r < 3 ? 'starMid' : r < 4 ? 'starGood' : 'starGreat');
export const compact = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K` : String(n));

/** NoonProductRating pill: #F7F8FA, r6, star tinted by score, 12/600 score + (1.2K) count. */
export function RatingPill({ rating, count, size = 'sm' }: { rating: number; count?: number; size?: 'sm' | 'lg' }) {
  const lg = size === 'lg';
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: spacing.s4,
        background: ref.color('bgPill'),
        borderRadius: radius.r6,
        padding: lg ? `0 ${spacing.s6}px` : `${spacing.s2}px ${spacing.s6}px`,
        height: lg ? 26 : undefined,
        font: ref.type(lg ? 'text14SemiboldLh16' : 'captionBold'),
        color: ref.color('textStrong'),
        width: 'fit-content',
      }}
    >
      <span style={{ fontWeight: lg ? fontWeight.bold : fontWeight.semibold }}>{rating.toFixed(1)}</span>
      <Icon name="star" size={11} color={starColor(rating)} fill={starColor(rating)} strokeWidth={0} />
      {count !== undefined && (
        <span style={{ fontWeight: lg ? fontWeight.semibold : fontWeight.regular, color: lg ? ref.color('textBody') : ref.color('textSecondary') }}>
          {lg ? `${compact(count)} ratings` : `(${compact(count)})`}
        </span>
      )}
    </span>
  );
}

/** Row of 5 stars (reviews, order rating) */
export function Stars({ value, size = 16, onChange }: { value: number; size?: number; onChange?: (v: number) => void }) {
  return (
    <span style={{ display: 'inline-flex', gap: spacing.s4 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} onClick={onChange ? () => onChange(i) : undefined} style={{ cursor: onChange ? 'pointer' : undefined, display: 'flex' }}>
          <Icon name="star" size={size} strokeWidth={i <= value ? 0 : 1.5} color={i <= value ? ref.color('starMid') : ref.color('borderStrong')} fill={i <= value ? ref.color('starMid') : 'none'} />
        </span>
      ))}
    </span>
  );
}
