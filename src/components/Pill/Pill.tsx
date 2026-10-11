import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import { Icon, type IconName } from '../Icon/Icon';
import { Pressable } from '../Pressable/Pressable';
import { pill as t } from '../../foundations/tokens';
import styles from './Pill.module.css';

/**
 * PLP nav pill / filter chip / tag chip (NoonCatalogListNavPill redesign):
 * 30h, r20, 1px #EAECF0, 13/500 #475067 → selected #D6E9FF border, 13/600 #0F61FF.
 */
export function Pill({
  children,
  selected,
  onPress,
  icon,
  count,
  dropdown,
  removable,
  size = 'md',
  variant = 'nav',
}: {
  children: ReactNode;
  selected?: boolean;
  onPress?: () => void;
  icon?: IconName;
  count?: number;
  dropdown?: boolean;
  removable?: boolean;
  size?: 'sm' | 'md' | 'lg';
  /** nav = PLP pill, tag = home tag chip (r32, 14px), filter = filter-sheet option (r8, 2px border) */
  variant?: 'nav' | 'tag' | 'filter';
}) {
  return (
    <Pressable className={`${styles.pill} ${styles[variant]} ${styles[size]}`} data-selected={selected || undefined} onClick={onPress} scale={t.pressScale}>
      {icon && <Icon name={icon} size={t.iconSize} />}
      <span>{children}</span>
      {!!count && (
        <motion.span key={count} className={styles.count} initial={{ scale: 0.6 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 18 }}>
          {count}
        </motion.span>
      )}
      {dropdown && <Icon name="chevronDown" size={t.dropdownIconSize} />}
      {removable && selected && <Icon name="close" size={t.removeIconSize} />}
    </Pressable>
  );
}

export function PillRow({ children, padding = t.rowPadding }: { children: ReactNode; padding?: number }) {
  return (
    <div className="nk-hscroll" style={{ gap: t.rowGap, paddingInline: padding, alignItems: 'center' }}>
      {children}
    </div>
  );
}
