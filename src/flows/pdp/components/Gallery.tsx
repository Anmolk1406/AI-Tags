import { animate, motion, useMotionValue, useTransform, type MotionValue, type PanInfo } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { ProductImage } from '../../../components';
import { layout } from '../../../foundations/tokens';
import type { Product } from '../../../mocks/products';
import { gallerySlides } from '../data';
import { pdpTokens } from '../tokens';
import styles from '../pdp.module.css';

const { dots } = pdpTokens;

/**
 * NoonGallery: full width, height = width × 1.2, swipeable slider. The gallery is pinned while the page
 * scrolls (translateY = scrollY) and shrinks 1 → 0.9 (NoonProductUtil.scaleGallery). Pull-down scales to 1.1.
 * Footer 30px from the bottom: NoonTag (catalog_tag) on the left, NoonMediaPageController centred,
 * a 10px #F9F9FB fade at the bottom edge.
 */
export function Gallery({ product, scrollY }: { product: Product; scrollY: MotionValue<number> }) {
  const slides = gallerySlides(product);
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState<number>(layout.deviceWidth);
  const [i, setI] = useState(0);
  const x = useMotionValue(0);
  const h = Math.round(w * pdpTokens.galleryRatio);

  useEffect(() => {
    if (ref.current) setW(ref.current.offsetWidth);
  }, []);

  const y = useTransform(scrollY, [0, h], [0, h], { clamp: true });
  const scale = useTransform(
    scrollY,
    [pdpTokens.parallax.pullPx, ...pdpTokens.parallax.stops.map((f) => f * h)],
    [...pdpTokens.parallax.scale],
  );

  const goTo = (n: number) => {
    const next = Math.max(0, Math.min(slides.length - 1, n));
    setI(next);
    animate(x, -next * w, { type: 'spring', stiffness: 300, damping: 34 });
  };

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const dir = info.offset.x < -w * 0.18 || info.velocity.x < -400 ? 1 : info.offset.x > w * 0.18 || info.velocity.x > 400 ? -1 : 0;
    goTo(i + dir);
  };

  return (
    <div ref={ref} className={styles.gallerySection} style={{ height: h }}>
      <motion.div className={styles.gallery} style={{ height: h, y, scale }}>
        <motion.div className={styles.galleryTrack} drag="x" style={{ x }} dragConstraints={{ left: -(slides.length - 1) * w, right: 0 }} dragElastic={0.15} onDragEnd={onDragEnd}>
          {slides.map((s, idx) => (
            <div key={idx} className={styles.slide} style={{ width: w }}>
              <ProductImage product={s} width="100%" height={h} emojiScale={s.emojiScale} />
              <span className={styles.slideOverlay} />
            </div>
          ))}
        </motion.div>
        <div className={styles.galleryFade} />
        {slides.length > 1 && <PageController count={slides.length} active={i} onSelect={goTo} />}
        <div className={styles.galleryFooter}>
          <div>{product.tag && <span className={styles.galleryTag}>{product.tag}</span>}</div>
        </div>
      </motion.div>
    </div>
  );
}

/**
 * NoonMediaPageController: white 40% pill (2·6 padding, r20), 12px square slots (active 14),
 * dot = max(4, 6 − distance) px, active widens to 12 and turns black (150ms ease-out). Max 5 slots visible,
 * the strip scrolls to keep the active dot centred.
 */
function PageController({ count, active, onSelect }: { count: number; active: number; onSelect: (i: number) => void }) {
  const visible = Math.min(dots.visible, count);
  const viewport = dots.container * visible;
  const total = dots.container * (count - 1) + dots.containerActive;
  const offset = active === 0 ? 0 : Math.max(0, Math.min(total - viewport, active * dots.container + dots.containerActive / 2 - viewport / 2));
  return (
    <div className={styles.pageControl}>
      <div className={styles.dotsPill} style={{ width: `calc(${viewport}px + 2 * var(--nk-space-s6))` }}>
        <motion.div className={styles.dotsRow} animate={{ x: -offset }} transition={{ duration: dots.ms / 1000, ease: 'easeOut' }}>
          {Array.from({ length: count }).map((_, idx) => {
            const isActive = idx === active;
            const size = Math.max(dots.min, dots.max - Math.abs(idx - active) * dots.step);
            return (
              <button key={idx} type="button" className={styles.dotBox} style={{ width: isActive ? dots.containerActive : dots.container }} onClick={() => onSelect(idx)} aria-label={`Image ${idx + 1}`}>
                <motion.span
                  className={styles.dot}
                  data-active={isActive || undefined}
                  initial={false}
                  animate={{ width: isActive ? dots.activeWidth : size, height: size, borderRadius: size / 2 }}
                  transition={{ duration: dots.ms / 1000, ease: 'easeOut' }}
                />
              </button>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
