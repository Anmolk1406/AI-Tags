import { AnimatePresence, motion } from 'motion/react';
import { Icon, IconButton, Pressable } from '../../../components';
import { useNav } from '../../../kit/Navigator';
import { wishlistTokens } from '../tokens';
import styles from '../wishlist.module.css';

/**
 * NoonWishlistV2Header. When the list scrolls past the "All Saved Items" heading, "Wishlist" fades out
 * and moves up 4px while "All Saved Items" fades in from +4px in the same spot; the Create pill fades out.
 */
export function WishlistHeader({ swapped = false, showCreate = true }: { swapped?: boolean; showCreate?: boolean }) {
  const nav = useNav();
  return (
    <div className={styles.header}>
      <div className={styles.headerRow}>
        {nav.canGoBack && <IconButton icon="back" onPress={nav.back} label="Back" />}
        <span className={styles.titleSlot}>
          <AnimatePresence initial={false} mode="popLayout">
            <motion.span
              key={swapped ? 'all' : 'wishlist'}
              className={styles.title}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18 }}
            >
              {swapped ? 'All Saved Items' : 'Wishlist'}
            </motion.span>
          </AnimatePresence>
        </span>
        {showCreate && (
          <motion.span animate={{ opacity: swapped ? 0 : 1, scale: swapped ? 0.9 : 1 }} transition={{ duration: 0.18 }} style={{ pointerEvents: swapped ? 'none' : 'auto' }}>
            <Pressable className={styles.createPill} style={{ background: wishlistTokens.createPill }} onClick={() => nav.toast('Create collection — add a naming sheet in flows/wishlist')}>
              <Icon name="plus" size={14} strokeWidth={2.6} />
              Create
            </Pressable>
          </motion.span>
        )}
      </div>
    </div>
  );
}
