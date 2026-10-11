import type { ReactNode } from 'react';
import { useNav } from '../../kit/Navigator';
import { Icon, type IconName } from '../Icon/Icon';
import { Pressable } from '../Pressable/Pressable';
import { iconButton } from '../../foundations/tokens';
import styles from './Header.module.css';

/** 40px circular icon button — back, share, search, more (bappzaar NoonBackButton). */
export function IconButton({
  icon,
  onPress,
  size = iconButton.size,
  iconSize = iconButton.iconSize,
  variant = 'outline',
  badge,
  label,
}: {
  icon: IconName;
  onPress?: () => void;
  size?: number;
  iconSize?: number;
  variant?: 'outline' | 'glass' | 'plain' | 'subtle';
  badge?: number;
  label?: string;
}) {
  return (
    <Pressable className={`${styles.iconBtn} ${styles[variant]}`} style={{ width: size, height: size }} onClick={onPress} aria-label={label ?? icon}>
      <Icon name={icon} size={iconSize} flipRtl={icon === 'back' || icon === 'chevronRight'} />
      {!!badge && <span className={styles.badge}>{badge}</span>}
    </Pressable>
  );
}

export interface HeaderProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  /** show back button (default: when there is something to go back to) */
  back?: boolean;
  onBack?: () => void;
  right?: ReactNode;
  /** centered title (checkout/cancel style) vs left aligned (wishlist style) */
  align?: 'center' | 'left';
  variant?: 'surface' | 'transparent' | 'page';
  bordered?: boolean;
  children?: ReactNode;
}

/** Top bar used by most pushed screens. Includes the top safe-area inset. */
export function Header({ title, subtitle, back, onBack, right, align = 'center', variant = 'surface', bordered, children }: HeaderProps) {
  const nav = useNav();
  const showBack = back ?? nav.canGoBack;
  return (
    <div className={`${styles.header} ${styles[variant]} ${bordered ? styles.bordered : ''}`}>
      <div className={styles.row} data-align={align}>
        <div className={styles.side}>{showBack && <IconButton icon="back" onPress={onBack ?? nav.back} label="Back" />}</div>
        <div className={styles.titleWrap}>
          {typeof title === 'string' ? <span className={styles.title}>{title}</span> : title}
          {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
        </div>
        <div className={`${styles.side} ${styles.right}`}>{right}</div>
      </div>
      {children}
    </div>
  );
}
