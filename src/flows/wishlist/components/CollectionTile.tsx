import { motion } from 'motion/react';
import { ProductImage, Pressable } from '../../../components';
import { useNav } from '../../../kit/Navigator';
import { productById } from '../../../mocks/products';
import { wishlistTokens } from '../tokens';
import styles from '../wishlist.module.css';

/** Collection tile 126×152 with a fanned image stack (side cards ±8°, scale 0.88). */
export function CollectionTile({ name, items, index }: { name: string; items: string[]; index: number }) {
  const nav = useNav();
  const t = wishlistTokens.tile;
  const imgs = items.slice(0, 3).map(productById);
  // center card on top; others fanned left/right
  const order = imgs.length === 1 ? [0] : imgs.length === 2 ? [1, 0] : [1, 2, 0];
  const pose = (slot: number, count: number) => {
    if (count === 1 || slot === 0) return { rotate: 0, x: 0, scale: 1, z: 3 };
    const side = slot === 1 ? -1 : 1;
    return { rotate: side * t.rotate, x: side * 18, scale: t.sideScale, z: 1 };
  };
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 380, damping: 32, delay: 0.05 * index }}>
      <Pressable className={styles.tile} onClick={() => nav.toast(`${name} — collection screen not in this demo`)}>
        <span className={styles.tileTab} />
        <span className={styles.stack} style={{ height: t.stack }}>
          {order.map((slot, i) => {
            const p = pose(slot === 0 ? 0 : slot, imgs.length);
            const prod = imgs[i];
            return (
              <motion.span
                key={prod.id}
                className={styles.stackCard}
                initial={{ rotate: 0, x: 0, scale: 0.9 }}
                animate={{ rotate: p.rotate, x: p.x, scale: p.scale, opacity: p.z === 3 ? 1 : 0.95 }}
                transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.15 + 0.05 * index }}
                style={{ zIndex: p.z }}
              >
                <ProductImage product={prod} width={46} height={62} emojiScale={0.5} />
              </motion.span>
            );
          })}
        </span>
        <span className={styles.tileName}>{name}</span>
        <span className={styles.tileCount}>{items.length === 1 ? '1 item' : `${items.length} items`}</span>
      </Pressable>
    </motion.div>
  );
}
