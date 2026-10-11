import { animate, motion, useMotionValue, useTransform, type MotionValue, type PanInfo } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { MaskIcon, Pressable, ProductImage } from '../../../../components';
import { layout } from '../../../../foundations/tokens';
import { useNav } from '../../../../kit/Navigator';
import type { Product } from '../../../../mocks/products';
import rotate360 from '../../../../assets/pdp/storefront/a/rotate-360.svg';
import { gallerySlides } from '../../data';
import { pdpTokens } from '../../tokens';
import { pdpSfATokens } from '../../tokens.sfA';
import styles from './SfGallery.module.css';

const { dots } = pdpSfATokens;

/**
 * Storefront PDP gallery (Figma 2ldJbjmQq4RkhnrNFCfXQB · 3499:75117 / 3499:75118 "product-image"): full width,
 * 375 × 512 (ratio 1.365), starting 40 below the frame top under the overlay header. Footer row 12 from the sides:
 * catalog tag ("noon's exclusive": 24h, r8, #666 → black, 1px #4C4C4C, 14/600 light gradient text) at the start,
 * 40px 360° pill button (white, 1px navy 15%, 22px rotate glyph) at the end; Carousel Indicator centred 20 from
 * the bottom (6px black-10% dots, active 14 × 6 black pill, gap 6).
 * Replaces Gallery: same props, same swipe pager and the same scroll-linked pin + shrink (pdpTokens.parallax).
 */
export function SfGallery({ product, scrollY }: { product: Product; scrollY: MotionValue<number> }) {
  const nav = useNav();
  const slides = gallerySlides(product);
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState<number>(layout.deviceWidth);
  const [i, setI] = useState(0);
  const x = useMotionValue(0);
  const h = Math.round(w * pdpSfATokens.galleryRatio);

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
    animate(x, -next * w, pdpSfATokens.pager);
  };

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const dir = info.offset.x < -w * 0.18 || info.velocity.x < -400 ? 1 : info.offset.x > w * 0.18 || info.velocity.x > 400 ? -1 : 0;
    goTo(i + dir);
  };

  return (
    <div className={styles.section}>
      <div ref={ref} className={styles.frame} style={{ height: h }}>
        <motion.div className={styles.gallery} style={{ height: h, y, scale }}>
          <motion.div className={styles.track} drag="x" style={{ x }} dragConstraints={{ left: -(slides.length - 1) * w, right: 0 }} dragElastic={0.15} onDragEnd={onDragEnd}>
            {slides.map((s, idx) => (
              <div key={idx} className={styles.slide} style={{ width: w }}>
                <ProductImage product={s} width="100%" height={h} emojiScale={s.emojiScale} />
              </div>
            ))}
          </motion.div>
          {slides.length > 1 && <Indicator count={slides.length} active={i} onSelect={goTo} />}
          <div className={styles.footer}>
            {product.tag ? (
              <span className={styles.tag}>
                <span className={styles.tagText}>{product.tag}</span>
              </span>
            ) : (
              <span />
            )}
            <Pressable className={styles.spin} aria-label="360° view" onClick={() => nav.toast('360° view')}>
              <MaskIcon src={rotate360} size={22} color="var(--nk-color-text-ink)" />
            </Pressable>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/**
 * Carousel Indicator: 6px dots (black 10%), active = 14 × 6 black pill (150ms ease-out), 6 apart.
 * At most 5 slots are visible; the strip scrolls to keep the active dot centred (same logic as Gallery's PageController).
 */
function Indicator({ count, active, onSelect }: { count: number; active: number; onSelect: (i: number) => void }) {
  const visible = Math.min(dots.visible, count);
  const viewport = dots.slot * (visible - 1) + dots.slotActive;
  const total = dots.slot * (count - 1) + dots.slotActive;
  const offset = active === 0 ? 0 : Math.max(0, Math.min(total - viewport, active * dots.slot + dots.slotActive / 2 - viewport / 2));
  return (
    <div className={styles.indicator}>
      <div className={styles.dotsViewport} style={{ width: viewport }}>
        <motion.div className={styles.dotsRow} animate={{ x: -offset }} transition={{ duration: dots.ms / 1000, ease: 'easeOut' }}>
          {Array.from({ length: count }).map((_, idx) => {
            const on = idx === active;
            return (
              <button key={idx} type="button" className={styles.dotBox} style={{ width: on ? dots.slotActive : dots.slot }} onClick={() => onSelect(idx)} aria-label={`Image ${idx + 1}`} aria-current={on || undefined}>
                <span className={styles.dot} data-active={on || undefined} style={{ transitionDuration: `${dots.ms}ms` }} />
              </button>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
