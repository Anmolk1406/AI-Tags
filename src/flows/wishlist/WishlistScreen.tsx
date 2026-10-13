import { AnimatePresence, motion } from 'motion/react';
import { useRef, useState } from 'react';
import { ProductCard, Screen } from '../../components';
import { useDemoStore } from '../../kit/DemoStore';
import { productById } from '../../data';
import { CollectionTile } from './components/CollectionTile';
import { EmptyState } from './components/EmptyState';
import { ViewCartPill } from './components/ViewCartPill';
import { WishlistAtc } from './components/WishlistAtc';
import { WishlistHeader } from './components/WishlistHeader';
import { collections } from './data';
import styles from './wishlist.module.css';

/**
 * Wishlist V2 (NoonWishlistV2Screen): header with scroll title swap, collections row,
 * "All Saved Items" 2-col grid with soft ATC → stepper, floating View Cart pill.
 */
export function WishlistScreen() {
  const { wishlist, cart } = useDemoStore();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [swapped, setSwapped] = useState(false);

  const items = wishlist.map(productById);
  const wishInCart = cart.filter((l) => wishlist.includes(l.product.id));
  const count = cart.reduce((n, l) => n + l.qty, 0);

  const onScroll = (y: number) => {
    const h = headingRef.current;
    if (!h) return;
    // swap once the heading's bottom passes under the header (±8px window)
    const bottom = h.offsetTop + h.offsetHeight;
    setSwapped(y > bottom - 8);
  };

  if (!items.length) {
    return (
      <Screen header={<WishlistHeader showCreate={false} />} background="bgSurface">
        <EmptyState />
      </Screen>
    );
  }

  return (
    // wrapper so the floating pill is positioned against the viewport, not the scroll content
    <div className={styles.stage}>
    <Screen header={<WishlistHeader swapped={swapped} />} background="bgSurface" onScroll={onScroll}>
      <div className={styles.listHeader}>
        <div className="nk-hscroll" style={{ gap: 12, padding: '0 12px', marginBottom: 32 }}>
          {collections.map((c, i) => (
            <CollectionTile key={c.id} name={c.name} items={c.items} index={i} />
          ))}
        </div>
        <h3 ref={headingRef} className={styles.sectionTitle}>
          All Saved Items
        </h3>
      </div>
      <motion.div className={styles.grid} layout>
        <AnimatePresence initial={false}>
          {items.map((p, i) => (
            <motion.div
              key={p.id}
              layout
              className={styles.cell}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0, transition: { type: 'spring', stiffness: 380, damping: 39, delay: Math.min(i, 8) * 0.035 } }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            >
              <ProductCard product={p} quickAdd={false} compact />
              <WishlistAtc productId={p.id} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </Screen>
    <ViewCartPill visible={wishInCart.length > 0} lines={wishInCart} count={count} />
    </div>
  );
}
