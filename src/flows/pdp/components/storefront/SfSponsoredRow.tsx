import { Badge, MarketplaceTag, Pressable, ProductImage } from '../../../../components';
import { useNav } from '../../../../kit/Navigator';
import { discountPercent, money, type Product } from '../../../../data';
import styles from './SfSponsoredRow.module.css';
import { copy } from '../../../../data/copy/pdp';

/**
 * New PDP sponsored product "Ads" / Big Ad (Figma Af34gfmhQ1D0wstXUEHSIF · 64:5589): 351 wide white r14 card, inner 1px
 * gray/200 frame, padding 4 (end 12), gap 12; 51 × 70 r9 thumb on 3% cobalt (image multiplied, inset 3.4 / 4.7);
 * 14/500/18 #212121 two-line title; 16/700 price + struck was 12 + "% OFF" 12/600 irish green + express 47 × 14;
 * "Ad" tag 6 from the bottom-end corner (#F0F2F7, top-start r4, 11/12 #7E859B). Tap opens that product's PDP.
 */
export function SfSponsoredRow({ item: ad }: { item?: Product }) {
  const nav = useNav();
  if (!ad) return null;
  const off = ad.was && ad.was > ad.price ? discountPercent(ad.was, ad.price) : 0;
  return (
    <Pressable className={styles.outer} scale={0.98} onClick={() => nav.push('pdp/detail', { productId: ad.id })} aria-label={`Sponsored: ${ad.title}`}>
      <span className={styles.row}>
        <span className={styles.thumb}>
          <span className={styles.thumbImage}>
            <ProductImage product={ad} width="100%" height="100%" emojiScale={0.6} style={{ mixBlendMode: 'multiply', background: 'transparent' }} />
          </span>
        </span>
        <span className={styles.info}>
          <span className={styles.title}>{ad.title}</span>
          <span className={styles.priceRow}>
            <span className={styles.price}>{money(ad.price)}</span>
            {off > 0 && (
              <span className={styles.discount}>
                <span className={styles.was}>{money(ad.was!)}</span>
                <span className={styles.off}>{copy.off(off)}</span>
              </span>
            )}
            {ad.express !== false && (
              <span className={styles.express}>
                <MarketplaceTag kind="express" height={14} />
              </span>
            )}
          </span>
        </span>
      </span>
      <Badge bg="var(--nk-palette-border-color)" color="var(--nk-color-price-old)" style={{ position: 'absolute', right: 'var(--nk-space-s6)', bottom: 'var(--nk-space-s6)', height: 'var(--nk-space-s16)', padding: 'var(--nk-space-pdp-s3)', borderRadius: 'var(--nk-radius-r4) 0 0 0', font: 'var(--nk-type-pdp-sfa-text11-lh12)', letterSpacing: '-0.12px' }}>
        Ad
      </Badge>
    </Pressable>
  );
}
