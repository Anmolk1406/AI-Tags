import { motion, useAnimationControls } from 'motion/react';
import { useState } from 'react';
import { ProductImage } from '../../components';
import { useDemoStore } from '../../kit/DemoStore';
import { useNav } from '../../kit/Navigator';
import type { ScreenProps } from '../../kit/types';
import { currency, formatPrice, productById } from '../../mocks/products';
import { Asset } from './components/Asset';
import { copy, discountPercent, showDiscount, storageStep } from './data';
import styles from './pdp.module.css';

/**
 * NoonVariantsOverlayScreen: header (80px 3:4 image, brand + title 14/18 slateGray, PriceDiscounted 16/700,
 * delivery 32h) · 90% separator · NoonProductSizeVariantSelection (SIZE 12/500 tracking 1, NoonProductCartSelectionItem chips) ·
 * footer NoonOfferAddToCartQuantity: 48px QTY square + 48px "ADD TO CART" (r8, accentColor).
 * `sizeMissing` (from PDP ATC without a size): "PLEASE SELECT THE SIZE" + chip shake (NoonShakingWrapper).
 */
export function VariantsSheet({ params }: ScreenProps<{ productId: string; sizeMissing?: boolean }>) {
  const nav = useNav();
  const { addToCart } = useDemoStore();
  const product = productById(params.productId);
  const sizes = product.sizes ?? [];
  const [size, setSize] = useState<number>(params.sizeMissing ? -1 : 0);
  const [warn, setWarn] = useState(false);
  const [qty, setQty] = useState(1);
  const shake = useAnimationControls();
  const step = size > 0 ? size * storageStep : 0;
  const sale = product.price + step;
  const was = product.was ? product.was + step : undefined;

  const add = () => {
    if (sizes.length > 0 && size < 0) {
      setWarn(true);
      shake.start({ x: [0, -8, 8, -6, 6, -3, 3, 0], transition: { duration: 0.4 } });
      return;
    }
    addToCart(product.id, qty);
    nav.replace('pdp/added', { productId: product.id, qty }, { presentation: 'sheet' });
  };

  return (
    <div className={styles.variantsSheet}>
      <div className={styles.variantsScroll}>
        <div className={styles.variantsHeader}>
          <div className={styles.variantsImage}>
            <ProductImage product={product} width="100%" aspect={3 / 4} emojiScale={0.5} />
            <span className={styles.variantsImageOverlay} />
          </div>
          <div className={styles.variantsInfo}>
            <span className={styles.variantsName}>
              {product.brand} {product.title}
            </span>
            <span className={styles.variantsPrice}>
              <span className={styles.variantsSale}>
                <span className={styles.variantsCur}>{currency}&nbsp;</span>
                {formatPrice(sale)}
              </span>
              {was && showDiscount(was, sale) && (
                <span className={styles.variantsDiscountRow}>
                  <span className={styles.variantsWas}>{formatPrice(was)}</span>
                  <span className={styles.variantsOff}>{copy.off(discountPercent(was, sale))}</span>
                </span>
              )}
            </span>
            <span className={styles.variantsDelivery}>
              <Asset name="expressPdp" width="var(--nk-layout-pdp-express-w)" height="var(--nk-layout-pdp-express-h)" />
              <span dangerouslySetInnerHTML={{ __html: product.delivery }} />
            </span>
          </div>
        </div>
        <div className={styles.variantsSep} />
        {sizes.length > 0 && (
          <div className={styles.variantsBody}>
            <div className={styles.sizeSection}>
              <div className={styles.sizeSectionTitleRow}>
                <span className={styles.sizeSectionTitle} data-warning={warn || undefined}>
                  {warn ? copy.sizeMissing : copy.size}
                </span>
              </div>
              <motion.div className={styles.cartChips} animate={shake}>
                {sizes.map((s, i) => (
                  <button
                    key={s}
                    type="button"
                    className={styles.cartChip}
                    data-selected={i === size || undefined}
                    onClick={() => {
                      setSize(i);
                      setWarn(false);
                    }}
                  >
                    <span className={styles.cartChipText}>{s}</span>
                  </button>
                ))}
              </motion.div>
            </div>
          </div>
        )}
      </div>
      <div className={styles.variantsFooter}>
        <button type="button" className={styles.squareQty} onClick={() => setQty((q) => (q >= 5 ? 1 : q + 1))} aria-label={copy.quantity}>
          <span className={styles.squareQtyLabel}>{copy.qty}</span>
          <span className={styles.squareQtyValue}>{qty}</span>
        </button>
        <button type="button" className={styles.squareAtc} onClick={add}>
          {copy.addToCartCaps}
        </button>
      </div>
    </div>
  );
}
