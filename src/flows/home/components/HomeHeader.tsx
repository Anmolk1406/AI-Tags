import { AnimatePresence, motion } from 'motion/react';
import { Pressable, SearchBarButton } from '../../../components';
import { useNav } from '../../../kit/Navigator';
import { tween } from '../../../motion/presets';
import homeIcon from '../../../assets/home/2025/header/address-home.svg';
import chevronIcon from '../../../assets/home/2025/header/address-chevron.svg';
import heartIcon from '../../../assets/home/2025/header/wishlist-heart.svg';
import stars from '../../../assets/home/2025/header/stars.svg';
import glow from '../../../assets/home/2025/header/bg-glow.svg';
import swoosh from '../../../assets/home/2025/header/bg-swoosh.svg';
import searchIcon from '../../../assets/home/2025/header/search.svg';
import cameraIcon from '../../../assets/home/2025/header/camera.svg';
import dividerLine from '../../../assets/home/2025/header/divider.svg';
import { addressRow, searchBrands, searchPrefix } from '../data.header';
import { switcherMetrics } from '../tokens';
import { ExperienceSwitcher } from './ExperienceSwitcher';
import styles from './HomeHeader.module.css';

/**
 * Homepage Revamp 2025 header (Figma 1337:6688): light-blue radial gradient with a cyan glow, a white swoosh and
 * star dots, r12 bottom corners. Rows: experience switcher → address + wishlist → search.
 * The experience switcher is the existing app one (`ExperienceSwitcher`, `switcherMetrics`), unchanged — same
 * absolute placement, header padding and collapse as ClassicHomeScreen; it is not restyled to the Figma tiles.
 * Past 100px of scroll (`collapsed`) the switcher compacts and the address row folds away; the search bar stays.
 */
/**
 * Optional tab skin (DepartmentTabs below the header, ashbun/noon-app tabThemes): `gradient` cross-fades over the
 * artwork (omit it to keep the Figma art), `seam` is the band's top colour the header's bottom blends into, `ink`
 * flips the address row for dark skins. With a skin the bottom corners square off so header and band read as one.
 */
export interface HeaderSkin {
  id: string;
  gradient?: string;
  seam: string;
  ink?: 'dark' | 'light';
  fade: { duration: number; ease: [number, number, number, number] };
}

export function HomeHeader({ collapsed, skin }: { collapsed: boolean; skin?: HeaderSkin }) {
  const nav = useNav();
  const fold = tween('medium', 'out');
  const { itemHeight, collapsedItemHeight, bottomMargin, topOffset, duration } = switcherMetrics;
  return (
    <motion.header
      className={styles.header}
      data-joined={skin ? true : undefined}
      data-ink={skin?.ink === 'light' ? 'light' : undefined}
      initial={false}
      animate={{ paddingTop: `calc(var(--nk-inset-top) + ${topOffset + (collapsed ? collapsedItemHeight : itemHeight) + bottomMargin}px)` }}
      transition={{ duration, ease: [0.5, 1, 0.89, 1] }}
    >
      <div className={styles.decor} aria-hidden>
        <div className={styles.glowBox}>
          <div className={styles.glowShape}>
            <div className={styles.glowPad}>
              <img src={glow} alt="" />
            </div>
          </div>
        </div>
        <div className={styles.swoosh}>
          <img src={swoosh} alt="" />
        </div>
        <img className={styles.stars} src={stars} alt="" />
      </div>
      <div className={styles.fade} aria-hidden />
      {skin && (
        <AnimatePresence initial={false}>
          <motion.span
            key={skin.id}
            aria-hidden
            className={styles.skin}
            style={{ backgroundImage: skin.gradient ?? `linear-gradient(180deg, transparent 0%, transparent calc(100% - 64px), ${skin.seam} 100%)` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={skin.fade}
          />
        </AnimatePresence>
      )}
      <ExperienceSwitcher expanded={!collapsed} />

      <div className={styles.content}>
        <motion.div initial={false} animate={collapsed ? { height: 0, opacity: 0 } : { height: 'auto', opacity: 1 }} transition={fold} style={{ overflow: 'hidden' }}>
          <div className={styles.addressRow}>
            <Pressable className={styles.address} onClick={() => nav.toast('Address picker — add your own sheet in flows/home')} scale={0.98}>
              <span className={styles.addressLine1}>
                <img src={homeIcon} alt="" className={styles.homeIcon} />
                <span className={styles.addressLabel}>{addressRow.label}</span>
                <img src={chevronIcon} alt="" className={styles.chevron} />
              </span>
              <span className={styles.addressLine2}>{addressRow.line}</span>
            </Pressable>
            <Pressable className={styles.wishlist} onClick={() => nav.push('wishlist/wishlist')} aria-label="Wishlist">
              <img src={heartIcon} alt="" width={18} height={16} />
            </Pressable>
          </div>
        </motion.div>
        <div className={styles.searchRow}>
          <SearchBarButton
            variant="2025"
            height={48}
            icons={{ search: searchIcon, camera: cameraIcon, divider: dividerLine }}
            rotatingPrefix={searchPrefix}
            rotatingWords={searchBrands}
            onPress={() => nav.push('search/search')}
          />
        </div>
      </div>
    </motion.header>
  );
}
