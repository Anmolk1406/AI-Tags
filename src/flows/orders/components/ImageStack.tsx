import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { ProductImage } from '../../../components';
import type { OrderItem } from '../data';
import styles from '../orders.module.css';
import { ref } from '../../../foundations/tokens';
import { palette } from '../../../foundations/palette';

const slots = [
  { w: 81, h: 108, top: 0, x: -40, z: 3, border: palette.white, radius: 10 },
  { w: 69, h: 92, top: 8, x: 18, z: 2, border: palette.brightGreyColor, radius: 9 },
  { w: 57, h: 76, top: 16, x: 66, z: 1, border: palette.grayColor, radius: 8 },
];

/** O2DOrderTrackingHeroSection image stack — rotates every 1900ms, moves 520ms cubic-out. */
export function ImageStack({ items, dim }: { items: OrderItem[]; dim?: boolean }) {
  const pool = items.length >= 3 ? items : [...items, ...items, ...items].slice(0, 3);
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    if (items.length < 2) return;
    const t = setInterval(() => setOffset((o) => (o + 1) % pool.length), 1900);
    return () => clearInterval(t);
  }, [items.length, pool.length]);
  const single = items.length === 1;
  return (
    <div className={styles.stack} style={{ opacity: dim ? 0.5 : 1 }}>
      {pool.map((it, i) => {
        const slot = single ? slots[0] : slots[(i - offset + pool.length) % pool.length];
        if (single && i > 0) return null;
        return (
          <motion.div
            key={i}
            className={styles.stackCard}
            initial={false}
            animate={{ width: slot.w, height: slot.h, top: slot.top, x: single ? -slot.w / 2 : slot.x - slot.w / 2, borderColor: slot.border, borderRadius: slot.radius, zIndex: slot.z }}
            transition={{ duration: 0.52, ease: [0.215, 0.61, 0.355, 1] }}
            style={{ boxShadow: `0 2px 8px ${ref.palette('blackAlpha6')}` }}
          >
            <ProductImage product={it.product} height="100%" emojiScale={0.5} />
          </motion.div>
        );
      })}
    </div>
  );
}
