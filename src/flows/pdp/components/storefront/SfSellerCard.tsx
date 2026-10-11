import { DashedDivider, OriginIcon, type OriginIconName } from '../../../../components';
import { useNav } from '../../../../kit/Navigator';
import { copy, money, type PdpContent } from '../../data';
import { Card } from '../Sections';
import { starTint } from '../Stars';
import styles from './SfSellerCard.module.css';

type Seller = PdpContent['seller'];
type Metric = Seller['metrics'][number];
/** Optional Storefront fields the lead may add to PdpContent['seller'] (read defensively until then). */
type SfSellerExtras = { subtitle?: string; offerCount?: number; offerFrom?: number };

/** Storefront copy not in data.ts `copy` (Figma 3499:75647). */
const sfCopy = {
  positiveLabel: 'Positive',
  offersFrom: (n: number) => `${n} ${n === 1 ? 'offer' : 'offers'} from other sellers from`,
} as const;

/** Trust-chip glyph by metric (Figma layers "returns low", "Group 1686557364" thumb, "Partner", "Product as described"). */
function metricIcon(m: Metric): OriginIconName {
  if (m.kind === 'years') return 'partners';
  if (/return/i.test(m.title)) return 'delivery-box-return';
  if (/rating/i.test(m.title)) return 'thumbs-up';
  if (m.kind === 'percent' || /described|shown/i.test(m.title)) return 'delivery-box-check-circle';
  return 'verified';
}

/** "{n} offers from other sellers from Đ{min}": seller.offerCount / offerFrom, else the buying options; null → generic copy. */
function offersSummary(content: PdpContent): { count: number; from: number } | null {
  const s = content.seller as Seller & SfSellerExtras;
  if (s.offerCount && s.offerFrom !== undefined) return { count: s.offerCount, from: s.offerFrom };
  const opts = content.buyingOptions ?? [];
  if (opts.length === 0) return null;
  return { count: opts.length, from: Math.min(...opts.map((o) => o.price)) };
}

/**
 * Storefront seller widget (Figma 3499:75647): 48px store box + "Sold by {name}" ›, rating pill "4.3 (128)" and
 * "74% Positive Seller Ratings"; wrapping trust chips (r18); brand subtitle row; dashed divider; alice-blue offers row.
 * Replaces SellerCard (same props): the seller block toasts the seller name, the offers row calls `onOffers`.
 */
export function SfSellerCard({ content, onOffers }: { content: PdpContent; onOffers: () => void }) {
  const nav = useNav();
  const s = content.seller as Seller & SfSellerExtras;
  const subtitle = s.subtitle ?? (content.officialStore ? `Official ${content.brand} partner on noon` : undefined);
  const offers = offersSummary(content);
  return (
    <Card className={styles.root} contentGap={16}>
      <div className={styles.top}>
        <button type="button" className={styles.head} onClick={() => nav.toast(`${copy.soldBy} ${s.name}`)}>
          <span className={styles.logo}>
            <OriginIcon name="shop" filled size={30} color="var(--nk-color-text-body)" />
          </span>
          <span className={styles.headText}>
            <span className={styles.nameRow}>
              <span className={styles.soldBy}>{copy.soldBy}</span>
              <span className={styles.name}>{s.name}</span>
              <OriginIcon name="chevron-right" size={16} color="var(--nk-color-text-primary)" />
            </span>
            <span className={styles.pills}>
              <span className={styles.rating}>
                <OriginIcon name="star" filled size={12} color={starTint(s.rating)} />
                <span className={styles.ratingText}>
                  <span className={styles.ratingScore}>{s.rating.toFixed(1)}</span>
                  {s.ratingCount !== undefined && <span className={styles.ratingCount}> ({s.ratingCount})</span>}
                </span>
              </span>
              <span className={styles.positive}>
                <span className={styles.positivePct}>{copy.percent(s.positive)}</span>{' '}
                <span className={styles.positiveWord}>{sfCopy.positiveLabel}</span> {copy.sellerRatings}
              </span>
            </span>
          </span>
        </button>
        <div className={styles.trust}>
          {s.metrics.length > 0 && (
            <div className={styles.chips}>
              {s.metrics.map((m) => (
                <span key={m.title} className={styles.chip}>
                  <OriginIcon name={metricIcon(m)} filled size={16} color="var(--nk-color-text-muted)" />
                  <span className={styles.chipText}>
                    {m.title}
                    {m.kind === 'years' && m.value !== undefined && <> {copy.partnerSince(m.value)}</>}
                    {m.kind === 'percent' && m.value !== undefined && (
                      <>
                        {' '}
                        <span className={styles.chipValue}>{copy.percent(m.value)}</span>
                      </>
                    )}
                  </span>
                </span>
              ))}
            </div>
          )}
          {subtitle && (
            <div className={styles.subtitle}>
              <span className={styles.subtitleText}>{subtitle}</span>
            </div>
          )}
        </div>
      </div>
      <DashedDivider inset={0} color="var(--nk-color-border-subtle)" />
      <div className={styles.offersWrap}>
        <button type="button" className={styles.offers} onClick={onOffers}>
          <OriginIcon name="shop" filled size={16} color="var(--nk-color-text-body)" />
          <span className={styles.offersText}>
            {offers ? (
              <>
                {sfCopy.offersFrom(offers.count)} <span className={styles.offersPrice}>{money(offers.from)}</span>
              </>
            ) : (
              copy.moreOffers
            )}
          </span>
          <OriginIcon name="chevron-right" size={20} color="var(--nk-color-text-primary)" />
        </button>
      </div>
    </Card>
  );
}
