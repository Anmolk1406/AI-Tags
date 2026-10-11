import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { useDemoStore } from '../../kit/DemoStore';
import { useNav } from '../../kit/Navigator';
import type { Product } from '../../mocks/products';
import { spring } from '../../motion/presets';
import { Icon } from '../Icon/Icon';
import { Price } from '../Price/Price';
import { ProductImage } from '../ProductImage/ProductImage';
import { QuantityStepper } from '../QuantityStepper/QuantityStepper';
import { RatingPill } from '../Rating/Rating';
import { CatalogTag, CouponTag, ExpressBadge } from '../Tag/Tag';
import { Text } from '../Text/Text';
import { WishlistHeart } from '../WishlistHeart/WishlistHeart';
import { quickAdd as t, spacing } from '../../foundations/tokens';
import styles from './ProductCard.module.css';

/**
 * NoonProductBoxVertical — the PLP / carousel product card.
 * Anatomy: image (≈0.8 aspect, contain) · Best Seller tag top-left · heart top-right ·
 * quick-ATC bottom-right · title 14/500 2 lines · rating pill · price row · coupon · express + delivery.
 */
export function ProductCard({
  product,
  onPress,
  quickAdd = true,
  compact,
  width,
}: {
  product: Product;
  onPress?: () => void;
  quickAdd?: boolean;
  /** carousel variant: no coupon / delivery rows */
  compact?: boolean;
  width?: number | string;
}) {
  const nav = useNav();
  const open = onPress ?? (() => nav.push('pdp/detail', { productId: product.id }));
  return (
    <motion.article className={styles.card} style={{ width, flexShrink: width !== undefined ? 0 : undefined }} onClick={open} whileTap={{ scale: 0.98 }} transition={spring.press}>
      <div className={styles.media}>
        <ProductImage product={product} aspect={0.8} />
        {product.tag && (
          <span className={styles.tag}>
            <CatalogTag>{product.tag}</CatalogTag>
          </span>
        )}
        <span className={styles.heart}>
          <WishlistHeart productId={product.id} />
        </span>
        {quickAdd && (
          <span className={styles.quick}>
            <QuickAdd productId={product.id} />
          </span>
        )}
      </div>
      <div className={styles.info}>
        <Text variant="productTitle" color="textProduct" lines={2} style={{ marginInlineEnd: spacing.s4 }}>
          {product.title}
        </Text>
        <RatingPill rating={product.rating} count={product.ratingCount} />
        <Price price={product.price} was={product.was} />
        {!compact && product.coupon && <CouponTag>{product.coupon}</CouponTag>}
      </div>
      {!compact && (
        <div className={styles.delivery}>
          {product.express && <ExpressBadge />}
          <Text variant="caption" color="textStrong" lines={1} html={product.delivery} />
        </div>
      )}
    </motion.article>
  );
}

/**
 * NoonProductBoxAddToCart: 36×36 white "+" → (tap) adds 1 and expands into a 76×36 #3866DF stepper
 * → collapses to a filled count badge after 2.5s idle.
 */
export function QuickAdd({ productId }: { productId: string }) {
  const { cart, addToCart, setQty } = useDemoStore();
  const nav = useNav();
  const qty = cart.find((l) => l.product.id === productId)?.qty ?? 0;
  const [expanded, setExpanded] = useState(false);
  const [timer, setTimer] = useState<number>();

  const bump = () => {
    clearTimeout(timer);
    setExpanded(true);
    setTimer(window.setTimeout(() => setExpanded(false), 2500));
  };

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <AnimatePresence mode="popLayout" initial={false}>
        {expanded && qty > 0 ? (
          <motion.div key="stepper" initial={{ width: t.size, opacity: 0.6 }} animate={{ width: t.expandedWidth, opacity: 1 }} exit={{ width: t.size, opacity: 0 }} transition={spring.gentle} style={{ overflow: 'hidden', borderRadius: t.radius }}>
            <QuantityStepper
              variant="filled"
              value={qty}
              onChange={(v) => {
                setQty(productId, v);
                bump();
              }}
            />
          </motion.div>
        ) : (
          <motion.button
            key="btn"
            type="button"
            className={qty ? styles.quickFilled : styles.quickBtn}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            whileTap={{ scale: t.pressScale }}
            transition={spring.bouncy}
            onClick={() => {
              if (!qty) {
                addToCart(productId);
                nav.toast('Added to cart', { icon: <Icon name="checkCircle" size={20} />, tone: 'default' });
              }
              bump();
            }}
            aria-label="Add to cart"
          >
            {qty ? <span className={styles.qty}>{qty}</span> : <Icon name="plus" size={t.iconSize} color={t.icon} />}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
