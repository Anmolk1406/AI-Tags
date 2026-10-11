import { motion } from 'motion/react';
import { useLayoutEffect, useRef, useState } from 'react';
import { Icon } from '../../../components';
import { useDemoStore } from '../../../kit/DemoStore';
import { useNav } from '../../../kit/Navigator';
import type { Product } from '../../../mocks/products';
import { spring } from '../../../motion/presets';
import { copy } from '../data';
import { pdpTokens } from '../tokens';
import { Asset } from './Asset';
import styles from '../pdp.module.css';

/**
 * NoonScreenWithDrawBehindHeader (PDP: header 55 / inner 50) with
 * back (NoonPressableIcon, whiteAlpha .9) · NoonExpandableSearch (collapsed pill → full width when the header turns white) ·
 * NoonPDPHeaderRightContent (favourite + share, onSearch=false).
 * The background fades 0 → white over 200ms once scrollY > headerChangeAfter − headerHeight (100px).
 */
export function PdpHeader({ product, solid }: { product: Product; solid: boolean }) {
  const nav = useNav();
  const wrapRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLButtonElement>(null);
  const [w, setW] = useState<{ full: number; collapsed: number } | null>(null);

  useLayoutEffect(() => {
    if (wrapRef.current && pillRef.current && !w) setW({ full: wrapRef.current.offsetWidth, collapsed: pillRef.current.offsetWidth });
  }, [w]);

  return (
    <motion.div
      className={styles.header}
      data-solid={solid || undefined}
      initial={false}
      animate={{ backgroundColor: solid ? 'var(--nk-color-bg-surface)' : 'var(--nk-palette-white-alpha0)' }}
      transition={{ duration: pdpTokens.headerFadeMs / 1000, ease: pdpTokens.headerEase }}
    >
      <div className={styles.headerInner}>
        <div className={styles.headerLeft}>
          <button type="button" className={`${styles.iconBtn} ${styles.backBtn}`} onClick={nav.back} aria-label="Back">
            <Asset name="back" size={20} tint="var(--nk-color-text-ink)" flip />
          </button>
          <div ref={wrapRef} className={styles.searchWrap}>
            <motion.button
              ref={pillRef}
              type="button"
              className={styles.search}
              onClick={() => nav.push('search/search')}
              aria-label={copy.search}
              initial={false}
              animate={w ? { width: solid ? w.full : w.collapsed } : undefined}
              transition={{ type: 'spring', ...pdpTokens.searchSpring }}
            >
              <span className={styles.searchIcon}>
                <Asset name="searchBar" size={20} />
              </span>
              <span className={styles.searchText}>{copy.search}</span>
            </motion.button>
          </div>
        </div>
        <div className={styles.headerRight}>
          <HeaderHeart productId={product.id} />
          <button type="button" className={styles.iconBtn} aria-label="Share" onClick={() => nav.toast(copy.linkCopied, { icon: <Icon name="copy" size={18} /> })}>
            <Asset name="arrowUpTray" size={20} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/** NoonFavourite in the PDP header: 32px favourite.webp in a 40px whiteAlpha .9 circle; active = favourite-active-v2 with a pop. */
function HeaderHeart({ productId }: { productId: string }) {
  const { isWishlisted, toggleWishlist } = useDemoStore();
  const nav = useNav();
  const on = isWishlisted(productId);
  return (
    <motion.button
      type="button"
      className={styles.iconBtn}
      aria-label={on ? 'Remove from wishlist' : 'Add to wishlist'}
      onClick={() => {
        const added = toggleWishlist(productId);
        nav.toast(added ? copy.addedToWishlist : copy.removedFromWishlist);
      }}
    >
      <motion.span key={on ? 'on' : 'off'} initial={{ scale: on ? 0.6 : 1 }} animate={{ scale: 1 }} transition={spring.bouncy} style={{ display: 'flex' }}>
        {on ? <Asset name="favouriteActive" size={24} /> : <Asset name="favourite" width="var(--nk-layout-pdp-heart)" height="var(--nk-layout-pdp-heart)" />}
      </motion.span>
    </motion.button>
  );
}
