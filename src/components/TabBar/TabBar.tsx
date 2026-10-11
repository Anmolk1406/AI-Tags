import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { useDemoStore } from '../../kit/DemoStore';
import { useNav } from '../../kit/Navigator';
import type { TabId } from '../../kit/types';
import home from '../../assets/tabbar/home.webp';
import homeSelected from '../../assets/tabbar/home-selected.webp';
import categories from '../../assets/tabbar/categories.webp';
import categoriesSelected from '../../assets/tabbar/categories-selected.webp';
import deals from '../../assets/tabbar/deals-box.webp';
import dealsSelected from '../../assets/tabbar/deals-box-selected.webp';
import account from '../../assets/tabbar/account.webp';
import accountSelected from '../../assets/tabbar/account-selected.webp';
import cart from '../../assets/tabbar/cart.webp';
import cartSelected from '../../assets/tabbar/cart-selected.webp';
import { tabBar as tb } from '../../foundations/tokens';
import { spring, tween } from '../../motion/presets';
import styles from './TabBar.module.css';

/**
 * Bottom tabs, as NoonApp.getTabScreens on bappzaar master: Home · Categories · dynamic tab · Account · Cart.
 * The dynamic tab is CMS-driven (whoami tabConfig.dynamicTab → title / icon / linkUrl); live config (Oct 2026):
 * "Deals" → /noon-deals-ae.
 * Visuals follow the 2025 bottom nav (Figma iRE9RwO94eMAyW3j3XKNXW · 1337:6801): a 43×4 `tabActive` indicator bar
 * on top of the active tab, 8 gap, a 32 icon slot, labels 12/20 tracking −0.16 — active Bold `tabActive`,
 * inactive Medium `textMuted`. Icons stay the app's tabbar webps, with separate selected / unselected files, at their
 * native size (static 32pt, dynamic deals tab 25pt) centred in the slot.
 *
 * Motion: every tab screen mounts its own TabBar (`nav.switchTab` resets the stack), so the bar remembers the tab
 * that was active before (`lastActive`) and animates from it: the indicator slides across (`tween('base', 'out')`),
 * the new tab's selected icon cross-fades in with a `spring.bouncy` pop and its label lifts in (`tween('fast')`),
 * and the previous tab's icon cross-fades back to its unselected file. The cart badge pops on `spring.bouncy`.
 * Reduced motion comes from `<NoonPrototype reducedMotion>` (MotionConfig).
 */
let lastActive: TabId | undefined;
const tabs: { id: TabId; label: string; icon: string; selected: string; size: number }[] = [
  { id: 'home', label: 'Home', icon: home, selected: homeSelected, size: 32 },
  { id: 'categories', label: 'Categories', icon: categories, selected: categoriesSelected, size: 32 },
  { id: 'deals', label: 'Deals', icon: deals, selected: dealsSelected, size: 25 },
  { id: 'account', label: 'Account', icon: account, selected: accountSelected, size: 32 },
  { id: 'cart', label: 'Cart', icon: cart, selected: cartSelected, size: 32 },
];

export function TabBar({ active }: { active: TabId }) {
  const nav = useNav();
  const { cartCount } = useDemoStore();
  // The tab that was active when this bar mounted (undefined on first load → no entrance animation).
  const [from] = useState(() => (lastActive && lastActive !== active ? lastActive : undefined));
  useEffect(() => {
    lastActive = active;
  }, [active]);
  const index = tabs.findIndex((t) => t.id === active);
  const fromIndex = from ? tabs.findIndex((t) => t.id === from) : index;

  return (
    <nav className={styles.bar}>
      <motion.span
        className={styles.indicatorTrack}
        style={{ width: `${100 / tabs.length}%` }}
        initial={{ x: `${fromIndex * 100}%` }}
        animate={{ x: `${index * 100}%` }}
        transition={tween('base', 'out')}
        aria-hidden
      >
        <span className={styles.indicator} />
      </motion.span>
      {tabs.map((t) => {
        const on = t.id === active;
        const entering = on && from !== undefined; // just became active
        const leaving = t.id === from; // was active a moment ago
        return (
          <motion.button key={t.id} type="button" className={styles.tab} data-active={on || undefined} onClick={() => nav.switchTab(t.id)} whileTap={{ scale: tb.pressScale }} aria-label={t.label} aria-current={on ? 'page' : undefined}>
            <span className={styles.indicatorSpace} aria-hidden />
            <motion.span className={styles.iconWrap} initial={entering ? { scale: 0.8, y: 2 } : false} animate={{ scale: 1, y: 0 }} transition={spring.bouncy}>
              <motion.img src={t.icon} alt="" width={t.size} height={t.size} draggable={false} className={styles.icon} initial={{ opacity: entering ? 1 : leaving ? 0 : on ? 0 : 1 }} animate={{ opacity: on ? 0 : 1 }} transition={tween('fast', 'out')} />
              <motion.img src={t.selected} alt="" width={t.size} height={t.size} draggable={false} className={styles.icon} initial={{ opacity: entering ? 0 : leaving ? 1 : on ? 1 : 0 }} animate={{ opacity: on ? 1 : 0 }} transition={tween('fast', 'out')} />
              {t.id === 'cart' && cartCount > 0 && (
                <motion.span key={cartCount} className={styles.badge} initial={{ scale: 0.4 }} animate={{ scale: 1 }} transition={spring.bouncy}>
                  {cartCount}
                </motion.span>
              )}
            </motion.span>
            <motion.span className={styles.label} initial={entering ? { y: 3, opacity: 0.4 } : false} animate={{ y: 0, opacity: 1 }} transition={tween('fast', 'out')}>
              {t.label}
            </motion.span>
          </motion.button>
        );
      })}
    </nav>
  );
}
