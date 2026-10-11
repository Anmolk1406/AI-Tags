import { AnimatePresence, motion } from 'motion/react';
import { ProductImage, Pressable } from '../../../components';
import type { CartLine } from '../../../kit/DemoStore';
import { useNav } from '../../../kit/Navigator';
import { wishlistTokens } from '../tokens';
import styles from '../wishlist.module.css';

/** Floating "View Cart" pill — slides up from the bottom (spring damping 16, stiffness 120, mass 0.7). */
export function ViewCartPill({ visible, lines, count }: { visible: boolean; lines: CartLine[]; count: number }) {
  const nav = useNav();
  const last = lines.at(-1);
  return (
    <AnimatePresence>
      {visible && last && (
        <motion.div className={styles.viewCartWrap} initial={{ y: 140 }} animate={{ y: 0 }} exit={{ y: 140 }} transition={wishlistTokens.viewCart.spring}>
          <Pressable className={styles.viewCart} style={{ background: wishlistTokens.viewCart.bg }} onClick={() => nav.push('cart/cart')}>
            <motion.span key={last.product.id} initial={{ scale: 0.6, rotate: -8 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 400, damping: 14 }} style={{ display: 'flex' }}>
              <ProductImage product={last.product} width={32} height={42} radius={6} emojiScale={0.6} />
            </motion.span>
            <span className={styles.viewCartText}>
              <span className={styles.viewCartTitle}>View Cart</span>
              <motion.span key={count} className={styles.viewCartCount} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
                {count === 1 ? '1 item' : `${count} items`}
              </motion.span>
            </span>
          </Pressable>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
