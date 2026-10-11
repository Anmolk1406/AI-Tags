import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import atcLoader from '../../../assets/cart/atc-loader-animation.lottie';
import { Lottie } from '../../../components';
import { layout } from '../../../foundations/tokens';
import { useDemoStore } from '../../../kit/DemoStore';
import { useNav } from '../../../kit/Navigator';
import type { Product } from '../../../mocks/products';
import { spring } from '../../../motion/presets';
import { copy } from '../data';
import { pdpTokens } from '../tokens';
import { Asset } from './Asset';
import styles from '../pdp.module.css';

/**
 * Sticky bar: NoonBackToTop (48px above, scrollY > screen height) · NoonInCartLabel (yellow strip) ·
 * NoonAddToCartQuantity: white r16 wrapper (shadow 0 −2 6 .08) with QTY · Buy Now (white, accentColor border) ·
 * Add to cart (accentColor, r10). ATC shows the grey loading state + atc loader lottie, then opens the quick cart.
 * QTY opens NoonQuantitySelector above the buttons (hides back-to-top / in-cart).
 */
export function AtcBar({ product, showBackToTop, onBackToTop, interceptAdd }: { product: Product; showBackToTop: boolean; onBackToTop: () => void; /** e.g. size not picked yet → open the variants sheet instead */ interceptAdd?: () => void }) {
  const nav = useNav();
  const { cart, addToCart } = useDemoStore();
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const inCart = cart.find((l) => l.product.id === product.id)?.qty ?? 0;

  const add = () => {
    if (loading) return;
    setSelectorOpen(false);
    if (interceptAdd) return interceptAdd();
    setLoading(true);
    setTimeout(() => {
      addToCart(product.id, qty);
      setLoading(false);
      setQty(1);
      nav.sheet('pdp/added', { productId: product.id, qty });
    }, pdpTokens.atcLoadingMs);
  };

  return (
    <div className={styles.sticky}>
      <AnimatePresence>
        {showBackToTop && !selectorOpen && (
          <motion.div key="btt" className={styles.backToTopWrap} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} transition={spring.press}>
            <button type="button" className={styles.backToTop} onClick={onBackToTop}>
              <Asset name="chevronUpWhite" size={16} className={styles.backToTopIcon} />
              {copy.backToTop}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {inCart > 0 && !selectorOpen && (
          <motion.div key="incart" className={styles.inCart} initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={spring.gentle}>
            <div className={styles.inCartInner}>
              <Asset name="inYourCart" size={20} />
              <motion.span key={inCart} initial={{ scale: 1.4 }} animate={{ scale: 1 }} transition={spring.bouncy}>
                {inCart}
              </motion.span>
              <span>{copy.addedInCart}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={styles.atcWrapper}>
        <QuantitySelector open={selectorOpen} selected={qty} onClose={() => setSelectorOpen(false)} onSelect={(q) => { setQty(q); setSelectorOpen(false); }} />
        <div className={styles.atcRow}>
          <button type="button" className={styles.qtyBtn} onClick={() => setSelectorOpen((o) => !o)} aria-label={copy.quantity}>
            <span className={styles.qtyLabel}>{copy.qty}</span>
            <span className={styles.qtyValue}>{qty}</span>
          </button>
          <button type="button" className={styles.buyNow} onClick={() => nav.push('checkout/checkout')}>
            {copy.buyNow}
          </button>
          <button type="button" className={styles.atc} data-loading={loading || undefined} onClick={add}>
            <span className={loading ? styles.atcLabelHidden : undefined}>{copy.addToCart}</span>
            {loading && (
              <span className={styles.atcLoader}>
                <Lottie src={atcLoader} loop style={{ width: 'var(--nk-layout-pdp-atc-loader)', height: 'var(--nk-layout-pdp-atc-loader)' }} />
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/** NoonQuantitySelector (Collapsible): "Quantity" + close, chips (width = (screen − 24) / min(n, 4.5) − 12). */
function QuantitySelector({ open, selected, onClose, onSelect }: { open: boolean; selected: number; onClose: () => void; onSelect: (q: number) => void }) {
  const { sectionPad, gap, maxVisible, max } = pdpTokens.qty;
  const items = Array.from({ length: max }, (_, i) => i + 1);
  const full = layout.deviceWidth - 2 * sectionPad;
  const itemWidth = full / (items.length <= 4 ? items.length : maxVisible) - gap;
  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div key="qty" className={styles.qtySelector} initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={spring.gentle}>
          <div className={styles.qtySelectorInner}>
            <div className={styles.qtyHeader}>
              <span className={styles.qtyHeaderText}>{copy.quantity} </span>
              <button type="button" className={styles.qtyClose} onClick={onClose} aria-label="Close">
                <Asset name="closeQuantity" size={10} tint="var(--nk-color-text-muted)" />
              </button>
            </div>
            <div className={styles.qtyItems}>
              {items.map((q) => (
                <button key={q} type="button" className={styles.qtyItem} data-selected={q === selected || undefined} style={{ width: itemWidth }} onClick={() => onSelect(q)}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
