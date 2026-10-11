import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { useDemoStore } from '../../../kit/DemoStore';
import { useNav } from '../../../kit/Navigator';
import { currency, formatPrice } from '../../../mocks/products';
import { couponFeedback, t } from '../data';
import { CartIcon } from './CartIcon';
import { HtmlText, Spinner } from '../../../components';
import couponChevron from '../../../assets/cart/figma/coupon-chevron.svg';
import couponDivider from '../../../assets/cart/figma/coupon-divider-dashed.png';
import percentBadge from '../../../assets/cart/figma/coupon-percent-badge.svg';
import html from './html.module.css';
import styles from './coupon.module.css';

/**
 * NoonCouponInput (parentScreen="cart"), Figma "Coupons" (10575:94148): white r16 card (py 10) — title 16/20 bold, 56px input box
 * (#F9F9FB, 1px #F2F3F7, r12; border/text tint per coupon state) with APPLY/Remove, HTML feedback, then the
 * "View available coupons & offers" row. Apply/remove are locked while the request runs (useNoonSalesActionLock).
 */
export function CouponInput() {
  const nav = useNav();
  const { coupon, cartTotals, applyCoupon, removeCoupon } = useDemoStore();
  const state = coupon ? cartTotals.coupon : null;
  const [text, setText] = useState(coupon ?? '');
  const [busy, setBusy] = useState(false);
  const [shake, setShake] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const applied = !!coupon;

  useEffect(() => {
    setText(coupon ?? '');
  }, [coupon]);

  const onPress = () => {
    if (busy) return;
    if (applied) {
      setBusy(true);
      window.setTimeout(() => {
        removeCoupon();
        setBusy(false);
      }, 500);
      return;
    }
    if (!text) return;
    inputRef.current?.blur();
    setBusy(true);
    window.setTimeout(() => {
      const r = applyCoupon(text);
      if (r.state === 'invalid') setShake((n) => n + 1);
      setBusy(false);
    }, 650);
  };

  const fb = couponFeedback(state, currency, formatPrice);
  const tone = fb?.tone ?? null;
  const feedback = fb?.html ?? null;

  return (
    <div className={styles.outer}>
      <div className={styles.container}>
        <div className={styles.title}>{t.couponTitle}</div>
        <div className={styles.tray}>
        <motion.div key={shake} className={`${styles.row} ${tone ? styles[tone] : ''}`} animate={shake ? { x: [0, -6, 6, -4, 4, 0] } : undefined} transition={{ duration: 0.35 }}>
          <div className={styles.inner}>
            <AnimatePresence initial={false}>
              {applied && (
                <motion.span className={styles.appliedIcon} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} transition={{ type: 'spring', stiffness: 400, damping: 18 }}>
                  <CartIcon name="appliedCoupon" size={16} color={tone === 'error' ? 'var(--nk-color-cart-coupon-error)' : 'var(--nk-color-cart-emerald)'} />
                </motion.span>
              )}
            </AnimatePresence>
            <input
              ref={inputRef}
              className={styles.input}
              value={text}
              onChange={(e) => setText(e.target.value.toUpperCase())}
              placeholder={t.couponPlaceholder}
              readOnly={applied}
              autoCapitalize="characters"
              onKeyDown={(e) => e.key === 'Enter' && text && onPress()}
            />
          </div>
          <button type="button" className={`${styles.apply} ${!text ? styles.applyDisabled : ''}`} onClick={onPress} disabled={!text}>
            {busy ? <Spinner size={14} thickness={14 / 9} duration={0.7} color="var(--nk-color-text-ink)" /> : applied ? t.remove : t.apply}
          </button>
        </motion.div>
        <AnimatePresence initial={false}>
          {feedback && (
            <motion.div key={feedback} className={styles.feedback} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}>
              <HtmlText base value={feedback} className={html[tone === 'success' ? 'couponSuccess' : 'couponError']} />
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </div>
      <img src={couponDivider} alt="" className={styles.divider} />
      <button type="button" className={styles.offers} onClick={() => nav.toast('Coupon tray (NoonSalesCouponTrayOverlayScreen) is not part of the cart port')}>
        <span className={styles.offersContent}>
          <span className={styles.offersBadge}>
            <img src={percentBadge} alt="" />
          </span>
          <span className={styles.offersText}>{t.availableOffers}</span>
        </span>
        <img src={couponChevron} alt="" className={`${styles.offersChevron} nk-flip-rtl`} />
      </button>
    </div>
  );
}
