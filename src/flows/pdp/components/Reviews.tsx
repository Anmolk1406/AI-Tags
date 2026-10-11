import { Fragment, useLayoutEffect, useRef, useState } from 'react';
import { useNav } from '../../../kit/Navigator';
import type { Product } from '../../../mocks/products';
import { abbreviate, copy, score, type PdpContent } from '../data';
import { Asset } from './Asset';
import { RecoCard } from './RecoCard';
import { Stars } from './Stars';
import styles from '../pdp.module.css';

/**
 * NoonCustomerReviews inside a padding-0 NoonSectionCard: title + NoonRatingsOverview (24/800 score, 20px stars,
 * 12/14 note) · NoonReviewsList ("All reviews (n)", items split by 1px antiFlashWhite) · "All customer reviews".
 */
export function ReviewsCard({ product, content }: { product: Product; content: PdpContent }) {
  const nav = useNav();
  return (
    <section className={`${styles.card} ${styles.reviews}`}>
      <div className={styles.reviewsInner}>
        <div className={styles.reviewsOverview}>
          <span className={styles.cardTitle}>{copy.reviewsTitle}</span>
          <div className={styles.ratingsOverview}>
            <div className={styles.ratingsBig}>
              {score(product.rating)}
              <Stars rating={Number(score(product.rating))} size={20} />
            </div>
            <span className={styles.ratingsNote}>{copy.avgRating(abbreviate(product.ratingCount))} </span>
          </div>
          {content.aiSummary && content.aiSummary.length > 0 && <AiSummary items={content.aiSummary} count={abbreviate(content.commentCount)} />}
        </div>

        <div className={styles.reviewList}>
          <div>
            <div className={styles.reviewListHeader}>
              {copy.allReviews}
              {content.commentCount > 0 ? ` (${abbreviate(content.commentCount)})` : ''}
            </div>
            {content.reviews.map((r, i) => (
              <Fragment key={r.name}>
                {i > 0 && <div className={styles.reviewSep} />}
                <ReviewItem review={r} />
              </Fragment>
            ))}
          </div>
        </div>

        {content.commentCount > 3 && (
          <button type="button" className={styles.viewMore} onClick={() => nav.toast(copy.allCustomerReviews)}>
            {copy.allCustomerReviews}
            <Asset name="reviewChevron" size={12} tint="var(--nk-color-brand-blue)" flip />
          </button>
        )}
      </div>
    </section>
  );
}

/** NoonCustomerReviewItem: name + Verified Purchase chip · 16px stars + "• time" · variant chips · title · comment (more/less) · Helpful. */
function ReviewItem({ review }: { review: PdpContent['reviews'][number] }) {
  const [voted, setVoted] = useState(false);
  const [open, setOpen] = useState(false);
  const [overflows, setOverflows] = useState(false);
  const ref = useRef<HTMLParagraphElement>(null);
  useLayoutEffect(() => {
    if (ref.current && !open) setOverflows(ref.current.scrollHeight > ref.current.clientHeight + 1);
  }, [open, review.body]);
  return (
    <div className={styles.review}>
      <div className={styles.reviewHead}>
        <div className={styles.reviewTitleRow}>
          <span className={styles.reviewName}>{review.name}</span>
          {review.verified && (
            <span className={styles.verified}>
              <Asset name="verifiedPurchase" size={12} />
              {copy.verifiedPurchase}
            </span>
          )}
        </div>
        <div className={styles.reviewMeta}>
          <Stars rating={review.rating} size={16} />
          {!review.verified && <span>{`• ${copy.fromTrustedSources}`}</span>}
          <span>{`• ${review.ago}`}</span>
        </div>
      </div>
      <div className={styles.reviewBody}>
        {(review.variants ?? (review.variant ? [review.variant] : [])).length > 0 && (
          <div className={styles.reviewVariants}>
            {(review.variants ?? [review.variant!]).map((v) => (
              <span key={v} className={styles.reviewVariant}>
                {v}
              </span>
            ))}
          </div>
        )}
        <div className={styles.reviewContent}>
          <span className={styles.reviewTitle}>{review.title}</span>
          <p ref={ref} className={styles.reviewComment} data-clamped={!open || undefined}>
            {review.body}
          </p>
          {(overflows || open) && (
            <button type="button" className={styles.moreLess} onClick={() => setOpen((o) => !o)}>
              {open ? copy.showLess : `...${copy.showMore}`}
            </button>
          )}
        </div>
        {review.images && review.images.length > 0 && (
          <div className={styles.reviewImages}>
            {review.images.map((src) => (
              <img key={src} alt="" src={src} className={styles.reviewImage} />
            ))}
          </div>
        )}
      </div>
      <div>
        <button type="button" className={styles.helpful} data-voted={voted || undefined} onClick={() => setVoted((v) => !v)}>
          <Asset name="thumbUp" size={12} tint={voted ? 'var(--nk-color-brand-blue)' : 'var(--nk-color-text-ink)'} />
          {`${copy.helpful}${review.helpful + (voted ? 1 : 0) ? ` (${review.helpful + (voted ? 1 : 0)})` : ''}`}
        </button>
      </div>
    </div>
  );
}

/** NoonRecommendations: white section, 18/700 title (12 12 8), product boxes 144 wide (productBoxCarouselWidth(2.5)), ml 8, list padding 4 / 12. */
export function Recommendations({ title, items }: { title: string; items: Product[] }) {
  if (items.length === 0) return null;
  return (
    <section className={styles.recs}>
      <h3 className={styles.recsTitle}>{title}</h3>
      <div className={styles.recsList}>
        {items.map((p) => (
          <div key={p.id} className={styles.recsItem}>
            <RecoCard product={p} />
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * NoonAiProductReviewsSummary: 4% indigo → violet card (r12, py12, gap 12); gradient title with a moving shimmer
 * band (2s linear loop) + 16px sparkle; 1px white separator; 6px blueGray900 bullets, 14/18 text.
 */
function AiSummary({ items, count }: { items: string[]; count: string }) {
  return (
    <div className={styles.aiSummary}>
      <div className={styles.aiSummaryHeader}>
        <span className={styles.aiSummaryTitle}>{copy.aiSummary(count)}</span>
        <Asset name="aiSummarySparkle" size={16} />
      </div>
      <div className={styles.aiSummarySep} />
      <div className={styles.aiSummaryBody}>
        {items.map((t) => (
          <div key={t} className={styles.aiSummaryItem}>
            <span className={styles.aiSummaryBullet} />
            <span className={styles.aiSummaryText}>{t}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
