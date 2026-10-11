import { AnimatePresence, motion, useDragControls, type PanInfo } from 'motion/react';
import { useLayoutEffect, useRef, useState } from 'react';
import type { CartLine, CartTotals } from '../../../kit/DemoStore';
import { currency, formatPrice } from '../../../mocks/products';
import { t } from '../data';
import { buildDynamicInvoice } from '../invoice';
import { cartTokens } from '../tokens';
import { CartWave } from './CartWave';
import { DynamicInvoice } from './DynamicInvoice';
import { HtmlText } from '../../../components';
import html from './html.module.css';
import styles from './footer.module.css';

const INV = cartTokens.invoice;

/**
 * NoonCartScreen sticky bar: footer savings tab (patch + callout + NoonCartWave) riding above the footer,
 * the invoice sheet that slides from behind the footer (translateY 400 → 12, 300ms; backdrop 0 → .5 in 200ms;
 * swipe down > 50px closes), and the footer (r12 top, nudges on the left toggle the invoice, Checkout CTA).
 */
export function CartFooter({ totals, cart, isTabRoot, disabled, onCheckout, onHeightChange }: { totals: CartTotals; cart: CartLine[]; isTabRoot: boolean; disabled?: boolean; onCheckout: () => void; onHeightChange?: (h: number) => void }) {
  const [open, setOpen] = useState(false);
  const [locked, setLocked] = useState(false);
  const footerRef = useRef<HTMLDivElement>(null);
  const savingsRef = useRef<HTMLDivElement>(null);
  const [savingsH, setSavingsH] = useState(0);
  const drag = useDragControls();

  useLayoutEffect(() => {
    const ro = new ResizeObserver(() => {
      setSavingsH(savingsRef.current?.offsetHeight ?? 0);
      onHeightChange?.((savingsRef.current?.offsetHeight ?? 0) + (footerRef.current?.offsetHeight ?? 0));
    });
    if (footerRef.current) ro.observe(footerRef.current);
    if (savingsRef.current) ro.observe(savingsRef.current);
    return () => ro.disconnect();
  }, [onHeightChange]);

  const press = () => {
    if (disabled || locked) return;
    setLocked(true);
    onCheckout();
    window.setTimeout(() => setLocked(false), 1750);
  };

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 50) setOpen(false);
  };

  const sections = buildDynamicInvoice(totals, cart);
  const savingsMsg = totals.totalSavings > 0 ? `You’re saving <b>${currency} ${formatPrice(totals.totalSavings)}</b> on this order` : null;
  // Figma footer "Color waves 🌊" savings tab fill (#E7FBF3)
  const savingsColor = 'var(--nk-color-cart-savings-wave)';

  return (
    <div className={styles.stickyBar} data-tab={isTabRoot || undefined}>
      {/* backdrop (zIndex 2 under the sticky bar) */}
      <AnimatePresence>
        {open && <motion.div className={styles.backdrop} initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} transition={{ duration: INV.backdropMs / 1000 }} onClick={() => setOpen(false)} />}
      </AnimatePresence>

      {/* footer savings */}
      <AnimatePresence>
        {savingsMsg && (
          <motion.div
            ref={savingsRef}
            className={styles.savings}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: open ? 0 : 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <span className={styles.savingsPatch} style={{ background: savingsColor, height: savingsH + 16 }} />
            <span className={styles.savingsCallout} style={{ background: savingsColor }}>
              <HtmlText base value={savingsMsg} className={`${html.savings} ${styles.savingsText}`} />
            </span>
            <span className={styles.savingsWave}>
              <CartWave color={savingsColor} height={savingsH + 16} />
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* invoice — anchored to the footer top, slides from behind it */}
      <div className={styles.invoiceAnchor}>
        <motion.div
          className={styles.invoice}
          initial={false}
          animate={{ y: open ? INV.openTranslateY : INV.closedTranslateY + 200, visibility: open ? 'visible' : 'hidden' }}
          transition={{ y: { duration: INV.slideMs / 1000, ease: [0.25, 0.1, 0.25, 1] }, visibility: { delay: open ? 0 : 0.4 } }}
          drag="y"
          dragControls={drag}
          dragListener={false}
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0, bottom: 0.6 }}
          onDragEnd={onDragEnd}
          onPointerDown={(e) => drag.start(e)}
        >
          <div className={styles.invoiceScroll}>
            <DynamicInvoice sections={sections} />
          </div>
        </motion.div>
      </div>

      <motion.div ref={footerRef} className={styles.footer} data-open={open || undefined}>
        <div className={styles.footerContent}>
          <button type="button" className={styles.nudges} onClick={() => setOpen((v) => !v)} aria-expanded={open}>
            <span className={styles.totalLabel}>{`${t.total} · ${totals.itemCount} ${totals.itemCount === 1 ? 'item' : 'items'}`}</span>
            <span className={styles.totalPrice}>{`${currency} ${formatPrice(totals.total)}`}</span>
          </button>
          <motion.button type="button" className={`${styles.cta} ${disabled ? styles.ctaDisabled : ''}`} whileTap={{ opacity: 0.6 }} onClick={press} disabled={disabled}>
            {t.checkout}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
