import { forwardRef, type CSSProperties, type ReactNode } from 'react';
import styles from './Screen.module.css';
import { ref as tok, spacing } from '../../foundations/tokens';

/**
 * Every screen starts with <Screen>. It owns the scroll container, safe-area insets and page
 * background, and leaves slots for a fixed `header` and sticky `footer`.
 */
export interface ScreenLayoutProps {
  header?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
  /** CSS colour or token name, e.g. 'bgPage' (default) | 'bgSurface' | 'bgPdp' */
  background?: string;
  /** add top safe-area padding to the scroll content (set false when the header handles it or content is edge-to-edge) */
  safeTop?: boolean;
  /** header floats over content (e.g. PDP gallery) */
  overlayHeader?: boolean;
  /** allow content to scroll under the tab bar */
  withTabBar?: boolean;
  padded?: boolean;
  gap?: number;
  onScroll?: (y: number) => void;
  contentStyle?: CSSProperties;
  /** floats over the content, above the footer (e.g. NeedHelpButton); the layer itself lets taps through */
  overlay?: ReactNode;
}

export const Screen = forwardRef<HTMLDivElement, ScreenLayoutProps>(function Screen(
  { header, footer, children, background = 'bgPage', safeTop = !header, overlayHeader, withTabBar, padded, gap, onScroll, contentStyle, overlay },
  ref,
) {
  const bg = /^[a-z][a-zA-Z0-9]*$/.test(background) ? `var(--nk-color-${background.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()})` : background;
  return (
    <div className={styles.screen} style={{ background: bg }}>
      {header && <div className={overlayHeader ? styles.overlayHeader : styles.header}>{header}</div>}
      <div
        ref={ref}
        className={`nk-scroll ${styles.content}`}
        onScroll={onScroll ? (e) => onScroll(e.currentTarget.scrollTop) : undefined}
        style={{
          paddingTop: safeTop ? 'var(--nk-inset-top)' : undefined,
          paddingBottom: footer ? spacing.s16 : withTabBar ? `calc(${tok.layout('tabBar')} + var(--nk-inset-bottom) + ${tok.space('s16')})` : `calc(var(--nk-inset-bottom) + ${tok.space('s16')})`,
          paddingInline: padded ? spacing.s12 : undefined,
          gap,
          display: gap !== undefined ? 'flex' : undefined,
          flexDirection: gap !== undefined ? 'column' : undefined,
          ...contentStyle,
        }}
      >
        {children}
      </div>
      {footer && <div className={styles.footer}>{footer}</div>}
      {overlay && <div className={styles.overlay}>{overlay}</div>}
    </div>
  );
});
