import type { CSSProperties, ReactNode } from 'react';
import { HtmlText, OriginIcon, Pressable, Skeleton } from '../../../components';
import { creditsAssets as a } from '../assets';
import { t, type WalletTransaction } from '../data';
import type { pendingHeader, WalletProvider } from '../data';
import styles from './wallet.module.css';

/** PrimaryButton / Button as the wallet styles them: black r12 (primary) or white with a #DFDFDF border (secondary). */
export function WalletButton({ children, onPress, kind = 'primary', height, pad, disabled, style }: { children: ReactNode; onPress?: () => void; kind?: 'primary' | 'secondary'; height?: 50; pad?: 12; disabled?: boolean; style?: CSSProperties }) {
  return (
    <Pressable className={`${styles.button} ${styles[kind]}`} data-height={height} data-pad={pad} scale={1} whileTap={disabled ? undefined : { opacity: 0.2 }} onClick={onPress} disabled={disabled} style={style}>
      {children}
    </Pressable>
  );
}

/** components/WalletError: image, 18/700 title, 13/18 subtitle, optional black button (h50 r12). */
export function WalletError({ image, width, height, title, subtitle, button, onPress, style }: { image?: string; width?: number; height?: number; title: string; subtitle?: string; button?: string; onPress?: () => void; style?: CSSProperties }) {
  return (
    <div className={styles.error} style={style}>
      <div className={styles.errorInner}>
        {image && <img className={styles.errorImage} src={image} width={width} height={height} alt="" />}
        <span className={styles.errorTitle}>{title}</span>
        {subtitle && <span className={styles.errorSubtitle}>{subtitle}</span>}
        {button && (
          <div className={styles.errorButton}>
            <WalletButton height={50} onPress={onPress}>
              {button}
            </WalletButton>
          </div>
        )}
      </div>
    </div>
  );
}

/** components/WalletTransaction: 56 high row, 40 icon box, 14/600 title + amount html, subtitle html. */
export function TransactionRow({ tx, onPress, last }: { tx: WalletTransaction; onPress: () => void; last?: boolean }) {
  return (
    <Pressable className={styles.row} scale={1} onClick={onPress} data-code={tx.code} data-last={last || undefined}>
      <span className={styles.rowIcon}>
        <OriginIcon name={tx.icon} size={24} />
      </span>
      <span className={styles.rowContent}>
        <span className={styles.rowTitleRow}>
          <span className={styles.rowTitle}>{tx.title}</span>
          <HtmlText base value={tx.amountText} className={`${styles.html} ${styles.rowAmount}`} />
        </span>
        {tx.subtitle && <HtmlText base value={tx.subtitle} className={`${styles.html} ${styles.rowSubtitle}`} />}
      </span>
    </Pressable>
  );
}

/** WalletHeading/WalletButtonView: the pending credits card (frosted bar image, icon stack, (N), amount, chevron). */
export function PendingCard({ header, onPress }: { header: typeof pendingHeader; onPress: () => void }) {
  const n = header.icons.length;
  return (
    <div className={styles.buttonView} style={{ backgroundImage: `url(${a.pendingBg})` }}>
      <Pressable className={styles.buttonViewInner} scale={1} onClick={onPress}>
        <span className={styles.buttonViewLeft}>
          {n > 0 && (
            <span className={styles.headerIcons} style={{ width: n * 25 - (n - 1) * 8 }}>
              {header.icons.map((icon, i) => (
                <span key={icon} className={styles.headerIcon} style={{ insetInlineStart: i * 17 }}>
                  <OriginIcon name={icon} size={16} />
                </span>
              ))}
            </span>
          )}
          <span className={styles.buttonViewTitle}>{header.title}</span>
          <span className={styles.buttonViewCount}>({header.transactionsCount})</span>
        </span>
        <span className={styles.buttonViewRight}>
          <HtmlText base value={header.amountText} className={styles.buttonViewAmount} />
          <img className={styles.flip} src={a.pendingChevron} width={7} height={13} alt="" />
        </span>
      </Pressable>
    </div>
  );
}

/** WalletHeading/WalletDefaultView: title + "N Transactions" and the amount pill (sheet: 16 bold title, mt 25). */
export function DefaultView({ title, count, amountText, type, sheet }: { title: string; count: number; amountText: string; type?: 'PENDING' | 'EXPIRING'; sheet?: boolean }) {
  if (count <= 0) return null;
  return (
    <div className={styles.defaultView} data-sheet={sheet || undefined}>
      <div>
        <div className={styles.defaultTitle}>{title}</div>
        <div className={styles.defaultCount}>{t.count(count)}</div>
      </div>
      <AmountPill amountText={amountText} type={type} />
    </div>
  );
}

/** WalletLabels/WalletBalance: the amount pill; grey on the landing, green (PENDING) or amber (EXPIRING) in the sheets */
export function AmountPill({ amountText, type }: { amountText: string; type?: 'PENDING' | 'EXPIRING' }) {
  return (
    <span className={styles.balancePill} data-type={type}>
      <HtmlText value={amountText} />
    </span>
  );
}

/** WalletExpiringSeparator / the expiring sheet note: wallet-note icon + 13px #5D5D5D. */
export function NoteBox({ children, separator, sheet }: { children: ReactNode; separator?: boolean; sheet?: boolean }) {
  return (
    <>
      {separator && <div className={styles.separatorLine} />}
      <div className={styles.noteBox} data-sheet={sheet || undefined}>
        <img className={styles.noteIcon} src={a.note} alt="" />
        <span className={styles.noteText}>{children}</span>
      </div>
    </>
  );
}

/** WalletTransaction/WalletLoading: 45 square r12, two 20px bars, 40×15 amount. */
export function SkeletonRows({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={styles.skeletonRow}>
          <Skeleton width={45} height={45} radius={12} />
          <div className={styles.skeletonLines}>
            <Skeleton height={20} radius={12} />
            <Skeleton width="50%" height={20} radius={12} />
          </div>
          <Skeleton width={40} height={15} radius={6} />
        </div>
      ))}
    </>
  );
}

/** Filters / Sort sheet header: 18/700 title + 36px #F2F3F7 close circle. */
export function SheetTitleRow({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className={styles.sheetTitleRow}>
      <span className={styles.sheetTitle}>{title}</span>
      <Pressable className={styles.closeCircle} scale={1} onClick={onClose} aria-label="Close">
        <img src={a.sheetClose} width={10} height={11} alt="" />
      </Pressable>
    </div>
  );
}

/** WalletSortSection / WalletStatusSection row (getFilterButtonStyle): radio, 16px label, "Default" pill when selected. */
export function RadioRow({ label, selected, isDefault, onPress, tight, disabled }: { label: string; selected: boolean; isDefault?: boolean; onPress: () => void; tight?: boolean; disabled?: boolean }) {
  return (
    <Pressable className={styles.radioRow} data-selected={selected || undefined} data-tight={tight || undefined} scale={1} onClick={onPress} disabled={disabled} role="radio" aria-checked={selected}>
      <span className={styles.radioLeft}>
        <img className={styles.radioIcon} src={selected ? a.radioSelected : a.radioUnselected} alt="" />
        <span className={styles.radioLabel}>{label}</span>
      </span>
      {selected && isDefault && <span className={styles.defaultPill}>{t.default}</span>}
    </Pressable>
  );
}

/** Stand-in for the provider's remote logo image (`icons.rounded` 30 round / `icons.wallet` 45 square). */
export function ProviderMark({ provider, size, round, style }: { provider: WalletProvider; size: number; round?: boolean; style?: CSSProperties }) {
  return (
    <span aria-hidden className={styles.logo} style={{ width: size, height: size, borderRadius: round ? size / 2 : undefined, background: provider.color, color: provider.ink, fontSize: Math.round(size * 0.45), ...style }}>
      {provider.mark}
    </span>
  );
}
