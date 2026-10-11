import { motion } from 'motion/react';
import { CatalogTag, ProductImage } from '../../../components';
import { useDemoStore } from '../../../kit/DemoStore';
import { useNav } from '../../../kit/Navigator';
import { currency, discountPct, formatPrice, type Product } from '../../../mocks/products';
import addPlusBlue from '../../../assets/cart/figma/add-plus-blue.svg';
import heartOutline from '../../../assets/cart/figma/heart-outline-offers.svg';
import pillExpress from '../../../assets/cart/figma/pill-express.svg';
import styles from './sections.module.css';

/**
 * Figma "Product Carousel" (10575:94169 offers · 10575:94308 wishlist): white r16 card, "Cards Header"
 * (Label2/Bold 16/20 #0E0E0E + optional "Sponsored" 12/14 500 #959595), then a row of 134px SKU cards (gap 12).
 */
export function CartCarousel({ title, sponsored, items }: { title: string; sponsored?: string; items: Product[] }) {
  if (!items.length) return null;
  return (
    <section className={styles.carousel}>
      <div className={styles.cardsHeader}>
        <h3 className={styles.cardsTitle}>{title}</h3>
        {sponsored && <span className={styles.cardsSponsored}>{sponsored}</span>}
      </div>
      <div className={`nk-hscroll ${styles.carouselRow}`}>
        {items.map((p) => (
          <SkuCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}

/**
 * Figma "SKU" (10575:94182): 134×174 Blue-Gray/300 image box (1px Blue-Gray/200, r10) with a 24px heart
 * (white 20%, full radius, p4) at 3/3, the 32px "+" (white, 1.2px Blue/600, r8, p4) at 95/135 and the catalog tag;
 * info p4 gap 8: title 14/18 500 #212121 (2 lines) · price 15/20 bold + 12/14 strike #848391 + 12/14 600 Grass/700 · express pill.
 */
function SkuCard({ product: p }: { product: Product }) {
  const nav = useNav();
  const { addToCart, toggleWishlist, wishlist } = useDemoStore();
  const pct = discountPct(p);
  const wished = wishlist.includes(p.id);
  return (
    <motion.article className={styles.sku} whileTap={{ scale: 0.98 }} onClick={() => nav.push('pdp/detail', { productId: p.id })}>
      <div className={styles.skuMedia}>
        <ProductImage product={p} width={124} height={124} style={{ background: 'transparent' }} />
        {p.tag && (
          <span className={styles.skuTag}>
            <CatalogTag>{p.tag}</CatalogTag>
          </span>
        )}
        <button
          type="button"
          className={styles.skuHeart}
          data-on={wished || undefined}
          aria-label="Wishlist"
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(p.id);
          }}
        >
          <img src={heartOutline} alt="" />
        </button>
        <motion.button
          type="button"
          className={styles.skuAdd}
          whileTap={{ scale: 0.9 }}
          aria-label="Add to cart"
          onClick={(e) => {
            e.stopPropagation();
            addToCart(p.id);
            nav.toast('Added to cart');
          }}
        >
          <img src={addPlusBlue} alt="" />
        </motion.button>
      </div>
      <div className={styles.skuInfo}>
        <span className={styles.skuTitle}>{p.title}</span>
        <span className={styles.skuPriceRow}>
          <span className={styles.skuPrice}>{`${currency}${formatPrice(p.price)}`}</span>
          {p.was && p.was > p.price ? <span className={styles.skuWas}>{formatPrice(p.was)}</span> : null}
          {pct > 0 ? <span className={styles.skuPct}>{`${pct}%`}</span> : null}
        </span>
        {p.express && <img src={pillExpress} alt="express" className={styles.skuPill} />}
      </div>
    </motion.article>
  );
}
