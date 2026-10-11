import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { OriginIcon, Pressable } from '../../../../components';
import { useNav } from '../../../../kit/Navigator';
import { leafName } from '../../../../mocks/categories';
import { formatPrice, type Product } from '../../../../mocks/products';
import { discountPercent, money, showDiscount, type PdpContent } from '../../data';
import { pdpTokens } from '../../tokens';
import styles from './SfMainInfo.module.css';

/** Storefront copy (Figma 3499:75133); not in data.ts `copy`. */
const sfCopy = {
  visitStore: 'Visit Store',
  reviews: (n: number) => `(${n} reviews)`,
  prepaidOnly: 'Prepaid Only',
  vat: '(incl. of VAT)',
  pct: (n: number) => `${n}%`,
  lowestPrice: 'Lowest Price in 30 days',
  bestseller: 'Bestseller',
  in: 'in',
  codeCopied: (code: string) => `${code} copied`,
  priceInfo: 'Price info',
} as const;

type Coupon = { title: string; code?: string };

/**
 * Coupon rail: SD discount_tags; when the offer has none but a best price (coupon price), one chip is derived
 * from it ("Extra 5% off"). The CODE text comes from `code` ("CODE: SALE200"); copying strips the "CODE:" prefix.
 */
function couponsFor(product: Product, content: PdpContent): Coupon[] {
  if (content.discountTags.length) return content.discountTags;
  if (content.bestPrice) {
    const pct = Math.round((1 - content.bestPrice.price / product.price) * 100);
    if (pct > 0) return [{ title: `Extra ${pct}% off` }];
  }
  return [];
}

/** "Prepaid Only" pill: derived (no SD flag in the mocks) — high-value electronics (≥ Đ 3000) are prepaid only. */
const prepaidOnly = (p: Product) => p.price >= 3000;

/**
 * Storefront PDP Main-Info (Figma 2ldJbjmQq4RkhnrNFCfXQB · 3499:75133): Accent/100 wrapper (r16, pt 10, gap 8) with the
 * brand strip (24px verified + brand 14/700, "Visit Store" 13/600 + chevron, both #0057FF) and the Info Card
 * (blue-gray/50 r16 clip; white content r-top-end 20, padding 12, gap 12): title 16/500/20 (2 lines) · rating pill +
 * "Prepaid Only" · price 22/700 + struck was + green % + "(incl. of VAT)" · deal tag + nudge · coupon rail ·
 * "Bestseller #n in {category}" row. Replaces ProductInfo: same props; Visit Store → plp/listing { query: brand },
 * rating → onReviews, coupon → copies the code (toast), bestseller row → the category PLP.
 */
export function SfMainInfo({ product, content, onReviews }: { product: Product; content: PdpContent; onReviews: () => void }) {
  const nav = useNav();
  const price = product.was ?? product.price;
  const sale = product.was ? product.price : undefined;
  const hasDiscount = showDiscount(price, sale);
  const nudges = content.nudges.length ? content.nudges : product.was ? [sfCopy.lowestPrice] : [];
  const coupons = couponsFor(product, content);
  const rank = content.bestSellerTag ? (product.rank ?? rankFromHtml(content.bestSellerTag.html)) : undefined;
  const rankCategory = content.bestSellerTag ? leafName(content.bestSellerTag.categoryId) : undefined;

  const copyCode = (c: Coupon) => {
    const code = c.code?.replace(/^CODE:\s*/i, '');
    if (code) void navigator.clipboard?.writeText(code).catch(() => undefined);
    nav.toast(code ? sfCopy.codeCopied(code) : c.title, { icon: <OriginIcon name="copy" size={18} color="var(--nk-color-text-inverse)" /> });
  };

  return (
    <div className={styles.wrap}>
      <Pressable className={styles.strip} scale={1} onClick={() => nav.push('plp/listing', { query: content.brand })}>
        <span className={styles.brand}>
          {content.officialStore && <OriginIcon name="verified" filled size={24} color="var(--nk-color-brand-blue)" />}
          <span className={styles.brandName}>{content.brand}</span>
        </span>
        <span className={styles.visit}>
          {sfCopy.visitStore}
          <OriginIcon name="chevron-right" size={16} color="var(--nk-color-brand-blue)" />
        </span>
      </Pressable>

      <div className={styles.card}>
        <div className={styles.content}>
          <div className={styles.desc}>
            <TitleToggle title={product.title} />
            <div className={styles.pills}>
              <button type="button" className={styles.pill} onClick={onReviews}>
                <span className={styles.pillInner} data-rating>
                  <OriginIcon name="star" filled size={16} color="var(--nk-palette-irish-green)" />
                  <span className={styles.score}>{product.rating}</span>
                  <span className={styles.count}>{sfCopy.reviews(product.ratingCount)}</span>
                </span>
              </button>
              {prepaidOnly(product) && (
                <span className={styles.pill} data-tone="prepaid">
                  <span className={styles.pillInner}>
                    <OriginIcon name="payment-card-big" size={16} color="var(--nk-color-text-strong)" />
                    <span className={styles.prepaid}>{sfCopy.prepaidOnly}</span>
                  </span>
                </span>
              )}
            </div>
          </div>

          <div className={styles.pricing}>
            <div className={styles.priceRow}>
              <span className={styles.sale}>{money(sale ?? price)}</span>
              {hasDiscount && (
                <span className={styles.meta}>
                  <span className={styles.was}>{formatPrice(price)}</span>
                  <span className={styles.off}>{sfCopy.pct(discountPercent(price, sale))}</span>
                  <span className={styles.vat}>{sfCopy.vat}</span>
                  {content.wasPriceSource && (
                    <button type="button" className={styles.priceInfo} onClick={() => nav.toast(sfCopy.priceInfo)} aria-label={sfCopy.priceInfo}>
                      <OriginIcon name="info-circle" size={16} color="var(--nk-color-text-secondary)" />
                    </button>
                  )}
                </span>
              )}
            </div>

            {(content.dealTag || nudges.length > 0) && (
              <div className={styles.dealRow}>
                {content.dealTag && <span className={styles.deal}>{content.dealTag}</span>}
                {nudges.length > 0 && (
                  <span className={styles.nudge}>
                    <OriginIcon name="arrow-down-square" filled size={16} color="var(--nk-color-pdp-sfa-low-price)" />
                    <NudgeTicker nudges={nudges} />
                  </span>
                )}
              </div>
            )}
          </div>

          {coupons.length > 0 && (
            <div className={styles.coupons}>
              {coupons.map((c, idx) => (
                <Pressable key={`${c.title}${c.code ?? ''}${idx}`} className={styles.coupon} onClick={() => copyCode(c)}>
                  <OriginIcon name="coupon-discount-star" filled size={24} color="var(--nk-palette-emerald-green700)" />
                  <span className={styles.couponText}>
                    <span>{c.title}</span>
                    {c.code && <span>{c.code}</span>}
                  </span>
                  {c.code && <OriginIcon name="chevron-right" size={16} color="var(--nk-color-text-primary)" />}
                </Pressable>
              ))}
            </div>
          )}

          {content.bestSellerTag && (
            <Pressable className={styles.bestseller} scale={1} onClick={() => nav.push('plp/listing', { query: rankCategory })}>
              <span className={styles.bestsellerStart}>
                <OriginIcon name="medal" filled size={24} color="var(--nk-color-best-seller-tag)" />
                <span className={styles.bestsellerText}>
                  {sfCopy.bestseller}
                  {rank !== undefined && ` #${rank}`} {sfCopy.in} <span className={styles.bestsellerCat}>{rankCategory}</span>
                </span>
              </span>
              <OriginIcon name="chevron-right" size={20} color="var(--nk-color-text-primary)" />
            </Pressable>
          )}
        </div>
      </div>
    </div>
  );
}

/** "<b>#38</b> in <a>Smartphones</a>" → 38 (fallback when the product has no `rank`). */
function rankFromHtml(html: string) {
  const m = /#(\d+)/.exec(html);
  return m ? Number(m[1]) : undefined;
}

/** NoonTextToggle: 2 lines; the down / up chevron shows only when the title needs more than 2 lines. */
function TitleToggle({ title }: { title: string }) {
  const [open, setOpen] = useState(false);
  const [overflows, setOverflows] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (el && !open) setOverflows(el.scrollHeight > el.clientHeight + 1);
  }, [title, open]);
  return (
    <button type="button" className={styles.titleToggle} onClick={() => setOpen((o) => !o)} aria-expanded={overflows ? open : undefined}>
      <span ref={ref} className={styles.title} data-clamped={!open || undefined}>
        {title}
      </span>
      {overflows && <OriginIcon name={open ? 'chevron-up' : 'chevron-down'} size={20} color="var(--nk-color-text-primary)" className={styles.titleArrow} />}
    </button>
  );
}

/** NoonNudgeTag ticker (same timings as ProductInfo): enter from +offset (400ms), hold 1s, exit to −offset (550ms). */
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
    <span className={styles.ticker}>
      <AnimatePresence initial={false} mode="wait">
        <motion.span
          key={idx}
          className={styles.tickerItem}
          initial={animateIt ? { y: nudge.offset } : false}
          animate={{ y: 0, transition: { duration: nudge.enterMs / 1000, ease: 'linear' } }}
          exit={{ y: -nudge.offset, transition: { duration: nudge.exitMs / 1000, ease: 'linear' } }}
        >
          {nudges[idx % nudges.length]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
