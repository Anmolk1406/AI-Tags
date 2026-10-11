import { motion } from 'motion/react';
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
import styles from './TabBar.module.css';

/**
 * Bottom tabs, as NoonApp.getTabScreens on bappzaar master: Home · Categories · dynamic tab · Account · Cart.
 * The dynamic tab is CMS-driven (whoami tabConfig.dynamicTab → title / icon / linkUrl); it falls back to
 * "Deals" + discount-badge. Live config (Oct 2026): "Deals" with the deals-box icon → /noon-deals-ae.
 * Icons are the app's tabbar webps at native size (static 32pt, dynamic 25pt); labels 14/600,
 * inactive charcoalGrey #404553, selected sapphire #1155CB, badge accent.
 */
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
  return (
    <nav className={styles.bar}>
      {tabs.map((t) => {
        const on = t.id === active;
        return (
          <motion.button key={t.id} type="button" className={styles.tab} data-active={on || undefined} onClick={() => nav.switchTab(t.id)} whileTap={{ scale: tb.pressScale }} aria-label={t.label} aria-current={on ? 'page' : undefined}>
            <span className={styles.iconWrap}>
              <img src={on ? t.selected : t.icon} alt="" width={t.size} height={t.size} draggable={false} />
              {t.id === 'cart' && cartCount > 0 && (
                <motion.span key={cartCount} className={styles.badge} initial={{ scale: 0.4 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 14 }}>
                  {cartCount}
                </motion.span>
              )}
            </span>
            <span className={styles.label}>{t.label}</span>
          </motion.button>
        );
      })}
    </nav>
  );
}
