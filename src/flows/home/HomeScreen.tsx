import { useState } from 'react';
import { NeedHelpButton, Screen, Text } from '../../components';
import { useNav } from '../../kit/Navigator';
import { useStatusBar } from '../../kit/statusBar';
import { BrandAdModule } from './components/BrandAdModule';
import { CategoryGrid } from './components/CategoryGrid';
import { DepartmentTabs } from './components/DepartmentTabs';
import type { HomeTabId } from './data.tabs';
import { homeTabThemes, homeTabsTokens } from './tokens.tabs';
import { HeroBanners } from './components/HeroBanners';
import { HomeHeader } from './components/HomeHeader';
import { KeepShopping } from './components/KeepShopping';
import { LaunchModule } from './components/LaunchModule';
import { OfferTickets } from './components/OfferTickets';
import { ProductRail } from './components/ProductRail';
import { PromoTicker } from './components/PromoTicker';
import styles from './home2025.module.css';

/**
 * Home — Homepage Revamp 2025 (Figma iRE9RwO94eMAyW3j3XKNXW · 1337:5102). Custom header (switcher, address, search)
 * that collapses past 100px, the department tabs + tab CMS widget right under it (DepartmentTabs, from ashbun/noon-app;
 * it replaces "Recommended for you"), then the feed in Figma order, 28 apart. Titles are 17/22 Bold `new-black` at x=14.
 * The previous bappzaar port lives on as `home/classic` (ClassicHomeScreen).
 */
export function HomeScreen() {
  const nav = useNav();
  const [collapsed, setCollapsed] = useState(false);
  const [scrolled, setScrolled] = useState(false); // folds the "Need help?" pill into its icon
  // the department tab owns the skin above the fold: header and tab band share its gradient (noon-app tabThemes)
  const [tab, setTab] = useState<HomeTabId>('all');
  const theme = homeTabThemes[tab];
  useStatusBar(theme.statusInk); // Electronics is dark up top; Fashion keeps dark ink (noon-app statusInk)
  const skin = {
    id: tab,
    // "All" keeps the Figma header art and only blends its bottom into the band; other tabs paint their header gradient
    gradient: tab === 'all' ? undefined : `linear-gradient(180deg, ${theme.header[0]} 0%, ${theme.header[1]} 70%, ${theme.layout[0]} 100%)`,
    seam: theme.layout[0],
    ink: theme.addressInk,
    fade: homeTabsTokens.fade,
  };
  return (
    <Screen
      header={<HomeHeader collapsed={collapsed} skin={skin} />}
      background="bgSurface"
      withTabBar
      safeTop={false}
      onScroll={(y) => (setCollapsed(y >= 100), setScrolled(y > 24))}
      overlay={<NeedHelpButton collapsed={scrolled} onPress={() => nav.toast('Opening Customer happiness center')} />}
    >
      <DepartmentTabs active={tab} onChange={setTab} />
      <div className={styles.feed}>
        <PromoTicker />
        <HeroBanners />
        <Module title="Shop by category">
          <CategoryGrid />
        </Module>
        <Module title="Offers for you" gap={13}>
          <OfferTickets />
        </Module>
        <ProductRail title="Bestsellers" items="bestsellers" />
        <Module title="Keep shopping for" gap={12}>
          <KeepShopping />
        </Module>
        <BrandAdModule />
        <ProductRail title="Selling out fast" items="sellingOutFast" />
        <LaunchModule />
      </div>
    </Screen>
  );
}

/** A feed module with the 2025 section title (Figtree Bold 17/22, `new-black`, x=14); `gap` = title → content (Figma, default 8). */
export function Module({ title, gap, children }: { title: string; gap?: number; children: React.ReactNode }) {
  return (
    <section className={styles.module} style={gap === undefined ? undefined : { gap }}>
      <Text variant="heading" as="h2" color="var(--nk-palette-new-black)" className={styles.title}>
        {title}
      </Text>
      {children}
    </section>
  );
}
