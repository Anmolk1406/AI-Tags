import { AnimatePresence, motion } from 'motion/react';
import { Fragment, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useNav } from '../../../kit/Navigator';
import { formatPrice, type Product } from '../../../mocks/products';
import { abbreviate, copy, discountPercent, money, showDiscount, type PdpContent } from '../data';
import { pdpTokens } from '../tokens';
import { leafName } from '../../../mocks/categories';
import { Asset } from './Asset';
import { nudgeIcons } from './RecoCard';
import { starTint } from './Stars';
import styles from '../pdp.module.css';

/**
 * NoonProductInfo: lightBlueInfoBg wrapper (r16) holding NoonStoreHeader and a white NoonSectionCard
 * (gap 12): title toggle + rating · price (V2 best price when SD best_price.tag_v2) · key highlights ·
 * deal tag + nudge ticker · discount tags (only without best price).
 */
export function ProductInfo({ product, content, onReviews }: { product: Product; content: PdpContent; onReviews: () => void }) {
  const nav = useNav();
  const v2 = !!content.bestPrice;
  return (
    <div className={styles.info}>
      <button type="button" className={styles.store} onClick={() => nav.push('plp/listing', { query: content.brand })}>
        <span className={styles.storeBrand}>
          {content.officialStore && <Asset name="tick" size={17} />}
          {content.brand}
        </span>
        <Asset name="rightChevron" size={20} tint="var(--nk-color-brand-blue)" flip />
      </button>

      <div className={styles.infoCard}>
        <div className={styles.descBlock}>
          <TitleToggle title={product.title} />
          <div className={styles.ratingRow}>
            <button type="button" className={styles.rating} onClick={onReviews}>
              <span className={styles.ratingScore}>
                <Asset name="ratingStar" size={11} tint={starTint(product.rating)} />
                {product.rating}
              </span>
              <span className={styles.ratingCount}>
                ({abbreviate(product.ratingCount)} {copy.ratings})
              </span>
            </button>
          </div>
        </div>

        <div className={styles.pricingMeta}>
          <div className={styles.priceContainer} data-v2={v2 || undefined}>
            {content.bestPrice && (
              <div className={styles.bestPrice}>
                <span className={styles.bestPriceValue}>{money(content.bestPrice.price)}</span>
                <button type="button" className={styles.bestPricePill} onClick={() => nav.toast('Best price details')}>
                  <Asset name="discountTagFilled" size={16} />
                  <span className={styles.bestPriceText} dangerouslySetInnerHTML={{ __html: content.bestPrice.html }} />
                  <Asset name="rightChevron" size={16} tint="var(--nk-color-best-price-ink)" flip />
                </button>
              </div>
            )}
            <PdpPrice price={product.was ?? product.price} salePrice={product.was ? product.price : undefined} v2={v2} info={content.wasPriceSource} />
          </div>

          {content.keyHighlights && (
            <div className={styles.keyHighlights}>
              <span>
                {content.keyHighlights.map((h, idx) => (
                  <Fragment key={h}>
                    {idx > 0 && (
                      <>
                        {' '}
                        <span className={styles.hlDivider}>|</span>{' '}
                      </>
                    )}
                    {h}
                  </Fragment>
                ))}
              </span>
            </div>
          )}

          {(content.dealTag || content.nudges.length > 0) && (
            <div className={styles.dealNudge}>
              {content.dealTag && <span className={styles.dealTag}>{content.dealTag}</span>}
              {content.nudges.length > 0 && (
                <div className={styles.nudgeBox}>
                  <NudgeTicker nudges={content.nudges} />
                </div>
              )}
            </div>
          )}
        </div>

        {!content.bestPrice && content.discountTags.length > 0 && (
          <div className={styles.discountTags}>
            {content.discountTags.map((d) => (
              <button key={`${d.title}${d.code ?? ''}`} type="button" className={styles.coupon} onClick={() => nav.toast(d.code ? `${d.title}, ${d.code}` : d.title)}>
                <Asset name="discountIcon" size={24} />
                <span>
                  {d.title}
                  {d.code && `, ${d.code}`}
                </span>
                <Asset name="rightChevron" size={20} flip />
              </button>
            ))}
          </div>
        )}

        {content.bestSellerTag && (
          <button type="button" className={styles.bestSellerTag} onClick={() => nav.push('plp/listing', { query: leafName(content.bestSellerTag!.categoryId) })}>
            <img alt="" src={nudgeIcons.rank} className={styles.bestSellerTagIcon} />
            <span className={styles.bestSellerTagText} dangerouslySetInnerHTML={{ __html: content.bestSellerTag.html }} />
            <Asset name="rightChevron" size={20} flip />
          </button>
        )}
      </div>
    </div>
  );
}

/** NoonTextToggle: 2 lines; the down / up arrow shows only when the title needs more than 2 lines. */
function TitleToggle({ title }: { title: string }) {
  const [open, setOpen] = useState(false);
  const [overflows, setOverflows] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (el && !open) setOverflows(el.scrollHeight > el.clientHeight + 1);
  }, [title, open]);
  return (
    <button type="button" className={styles.titleToggle} onClick={() => setOpen((o) => !o)}>
      <span ref={ref} className={styles.title} data-clamped={!open || undefined}>
        {title}
      </span>
      {overflows && <Asset name={open ? 'upArrow' : 'downArrow'} size={20} className={styles.titleArrow} />}
    </button>
  );
}

/**
 * PriceDiscounted as configured by NoonProductInfo (isCompact, hideCurrency on the was price,
 * showDiscountInline, VAT inside the discount row). `v2` = the styles used under NoonPDPBestPriceTagV2.
 */
export function PdpPrice({ price, salePrice, v2, info }: { price: number; salePrice?: number; v2?: boolean; info?: boolean }) {
  const nav = useNav();
  const hasDiscount = showDiscount(price, salePrice);
  return (
    <div className={`${styles.price} ${v2 ? styles.priceV2 : ''}`}>
      <span className={styles.sale}>{money(salePrice ?? price)}</span>
      {hasDiscount && (
        <span className={styles.discountRow}>
          <span className={styles.was}>{formatPrice(price)}</span>
          <span className={styles.off}>{copy.off(discountPercent(price, salePrice))}</span>
          <span className={styles.vat}>{copy.vat}</span>
          {info && (
            <button type="button" className={styles.priceInfo} onClick={() => nav.toast('Price info')} aria-label="Price info">
              <Asset name="info" size={18} tint="var(--nk-color-text-secondary)" />
            </button>
          )}
        </span>
      )}
    </div>
  );
}

/**
 * NoonNudgeTag ticker: each nudge enters from +offset (400ms), holds 1s, exits to −offset (550ms); linear loop.
 */
function NudgeTicker({ nudges }: { nudges: string[] }) {
  const { nudge } = pdpTokens;
  const [idx, setIdx] = useState(0);
  const animateIt = nudges.length > 1;
  useEffect(() => {
    if (!animateIt) return;
    const t = setInterval(() => setIdx((n) => (n + 1) % nudges.length), nudge.enterMs + nudge.holdMs + nudge.exitMs);
    return () => clearInterval(t);
  }, [animateIt, nudges.length, nudge.enterMs, nudge.holdMs, nudge.exitMs]);
  return (
    <div className={styles.nudgeTicker}>
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={idx}
          className={styles.nudgeItem}
          initial={{ y: nudge.offset }}
          animate={{ y: 0, transition: { duration: nudge.enterMs / 1000, ease: 'linear' } }}
          exit={{ y: -nudge.offset, transition: { duration: nudge.exitMs / 1000, ease: 'linear' } }}
        >
          <span className={styles.nudgeText}>{nudges[idx]}</span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
