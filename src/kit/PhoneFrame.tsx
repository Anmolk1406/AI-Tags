import type { CSSProperties, ReactNode } from 'react';
import { layout } from '../foundations/tokens';
import { squirclePath } from './squircle';
import styles from './PhoneFrame.module.css';

const screenClip = `path('${squirclePath(layout.deviceWidth, layout.deviceHeight, layout.screenRadius, layout.screenSmoothing)}')`;

/**
 * iPhone-style screen (390×844) with status bar + home indicator: no bezel, no island, corners clipped to a
 * smoothed squircle (layout.screenRadius, layout.screenSmoothing). `frameless` renders the bare viewport.
 */
export function PhoneFrame({ children, statusBar = 'dark', frameless, scale = 1, time = '9:41' }: { children: ReactNode; statusBar?: 'dark' | 'light'; frameless?: boolean; scale?: number; time?: string }) {
  const vars = {
    '--nk-inset-top': `${layout.statusBar}px`,
    '--nk-inset-bottom': `${layout.homeIndicator}px`,
    width: layout.deviceWidth,
    height: layout.deviceHeight,
    clipPath: frameless ? undefined : screenClip,
  } as CSSProperties;
  return (
    <div className={frameless ? styles.frameless : styles.device} style={{ transform: scale !== 1 ? `scale(${scale})` : undefined }}>
      <div className={styles.viewport} style={vars}>
        {children}
        <div className={styles.statusBar} data-tone={statusBar}>
          <span className={styles.time}>{time}</span>
          <span className={styles.sysIcons}>
            {/* Figma iOS status bar (Cellular 19.2 × 12.23, Wifi 17.14 × 12.33, Battery 27.33 × 13), snapped to whole pixels so
                the edges stay crisp: every box is 13 high and starts on a pixel, every straight edge sits on a pixel or half pixel */}
            <svg width="18" height="13" viewBox="0 0 18 13" fill="currentColor" aria-hidden><rect x="0" y="9" width="3" height="4" rx="1" /><rect x="5" y="7" width="3" height="6" rx="1" /><rect x="10" y="4" width="3" height="9" rx="1" /><rect x="15" y="1" width="3" height="12" rx="1" /></svg>
            <svg width="17" height="13" viewBox="0 -0.5 15.27 11.97" fill="currentColor" aria-hidden><path d="M7.63 2.3c2.2 0 4.33.85 5.93 2.36.12.12.31.12.43 0l1.15-1.17a.32.32 0 0 0 0-.45 10.07 10.07 0 0 0-15.03 0 .32.32 0 0 0 0 .45l1.15 1.17c.12.12.31.12.43 0A8.55 8.55 0 0 1 7.63 2.3Zm0 3.81c1.2 0 2.37.45 3.26 1.26.12.12.31.11.43 0l1.15-1.17a.32.32 0 0 0 0-.46 6.61 6.61 0 0 0-9.68 0 .32.32 0 0 0 0 .46l1.15 1.17c.12.11.31.12.43 0a4.84 4.84 0 0 1 3.26-1.26Zm2.3 2.73a.31.31 0 0 0 0-.46 3.5 3.5 0 0 0-4.6 0 .31.31 0 0 0 0 .46l1.99 2a.32.32 0 0 0 .45 0l2.16-2Z" /></svg>
            <svg width="27" height="13" viewBox="0 0 27 13" fill="none" aria-hidden><rect x=".5" y=".5" width="24" height="12" rx="3.8" stroke="currentColor" opacity=".35" /><rect x="2" y="2" width="21" height="9" rx="2.5" fill="currentColor" /><path d="M25.5 4.5v4c.9-.3 1.5-1.1 1.5-2s-.6-1.7-1.5-2Z" fill="currentColor" opacity=".4" /></svg>
          </span>
        </div>
        <div className={styles.homeIndicator} data-tone={statusBar} />
      </div>
    </div>
  );
}
