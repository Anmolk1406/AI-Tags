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
import styles from './TabBar.module.css';

/**
 * Bottom tabs, as NoonApp.getTabScreens on bappzaar master: Home · Categories · dynamic tab · Account · Cart.
 * The dynamic tab is CMS-driven (whoami tabConfig.dynamicTab → title / icon / linkUrl); live config (Oct 2026):
 * "Deals" → /noon-deals-ae.
 * Look = the app's native bar (NoonApp.getTab + getTabOptions → react-native-navigation UITabBar), 1:1: opaque white
 * with the 0.08 / 4 shadow, no indicator; each tab the tabbar webp at its native size (static 32pt, dynamic deals tab
 * 25pt; bappzaar's own @3x files) with iconInsets top 3, and the label in primaryFont semibold 14 — charcoalGreyColor
 * #404553, selected sapphire #1155CB. Selecting a tab swaps the icon and colour instantly, as UIKit does. The cart count
 * is BottomTabsCartIndicator → the native badge (accentColor #3866DF capsule, 18 high, 13pt white system text).
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
          <button key={t.id} type="button" className={styles.tab} data-active={on || undefined} onClick={() => nav.switchTab(t.id)} aria-label={t.label} aria-current={on ? 'page' : undefined}>
            <span className={styles.iconWrap}>
              <img src={on ? t.selected : t.icon} alt="" width={t.size} height={t.size} draggable={false} className={styles.icon} />
              {t.id === 'cart' && cartCount > 0 && <span className={styles.badge}>{cartCount}</span>}
            </span>
            <span className={styles.label}>{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
