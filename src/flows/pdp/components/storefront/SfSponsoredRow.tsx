import { Badge, MarketplaceTag, Pressable, ProductImage } from '../../../../components';
import { useNav } from '../../../../kit/Navigator';
import { productById, products, type Product } from '../../../../mocks/products';
import { money, type PdpContent } from '../../data';
import styles from './SfSponsoredRow.module.css';

/**
 * Sponsored accessory (derived; no SD ad slot in the mocks): the first frequently-bought-together item that isn't
 * this product, else the first express product from another category.
 */
export function sponsoredFor(product: Product, content?: PdpContent): Product | undefined {
  const fbt = content?.fbt?.find((id) => id !== product.id);
  if (fbt) return productById(fbt);
  return products.find((p) => p.id !== product.id && p.express && p.category !== product.category);
}

/**
 * Storefront PDP sponsored product row "Ads" (Figma 2ldJbjmQq4RkhnrNFCfXQB · 3499:75228): 351 × 35 white r8, inner 1px
 * #F5F5F5 r6; 34px thumb on blue-gray/50 (image multiplied), gap 8; title 12/14 #404553 one line (175 wide);
 * price 16/700/20 #404553 + express pill 53 × 16; "Ad" tag in the bottom-end corner (#F0F2F7, top-start r4, 11/12 #7E859B).
 * Tap opens that product's PDP. New (no bappzaar equivalent on pdp/detail).
 */
export function SfSponsoredRow({ product, content, item }: { product: Product; content?: PdpContent; item?: Product }) {
  const nav = useNav();
  const ad = item ?? sponsoredFor(product, content);
  if (!ad) return null;
  return (
    <div className={styles.outer}>
      <Pressable className={styles.row} scale={0.98} onClick={() => nav.push('pdp/detail', { productId: ad.id })} aria-label={`Sponsored: ${ad.title}`}>
        <span className={styles.start}>
          <span className={styles.thumb}>
            <ProductImage product={ad} width="100%" height="100%" emojiScale={0.6} style={{ mixBlendMode: 'multiply' }} />
          </span>
          <span className={styles.title}>{ad.title}</span>
        </span>
        <span className={styles.end}>
          <span className={styles.priceGroup}>
            <span className={styles.price}>{money(ad.price)}</span>
            {ad.express !== false && <MarketplaceTag kind="express" height={16} />}
          </span>
          <Badge bg="var(--nk-palette-border-color)" color="var(--nk-color-price-old)" style={{ alignSelf: 'flex-end', height: 'var(--nk-layout-pdp-sfa-ad-tag-height)', padding: 'var(--nk-space-pdp-s3)', borderRadius: 'var(--nk-radius-r4) 0 0 0', font: 'var(--nk-type-pdp-sfa-text11-lh12)' }}>
            Ad
          </Badge>
        </span>
      </Pressable>
    </div>
  );
}
