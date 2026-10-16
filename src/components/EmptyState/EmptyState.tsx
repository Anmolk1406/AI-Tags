import type { ReactNode } from 'react';
import searchNoMatch from '@assets/shared/illustrations/search-no-match.svg';
import searchFilters from '@assets/shared/illustrations/search-filters.svg';
import ordersEmpty from '@assets/shared/illustrations/orders-empty.svg';
import supermallNoon from '@assets/shared/illustrations/supermall-noon.svg';
import cartEmpty from '@assets/shared/illustrations/cart-empty.svg';
import boxesHearts from '@assets/shared/illustrations/boxes-hearts.svg';
import returnsClipboard from '@assets/shared/illustrations/returns-clipboard.svg';
import vouchers from '@assets/shared/illustrations/vouchers.svg';
import calendarAlert from '@assets/shared/illustrations/calendar-alert.svg';
import { Button } from '../Button/Button';
import styles from './EmptyState.module.css';

/**
 * The noon illustration family (Figma Visual Library `4L1MFeexnspo7AmmOx4prT` · "From the Family" 427:32867, plus the
 * two screen-sized cuts from My orders 353:148295 / 353:147847). Flat, isometric, blue only (#0076FF accent, #194584
 * navy, #7FB9FF mid, #C3E2FF light, #E9F4FF tint, white faces). `width` is the display width the screens use.
 */
export const illustrations = {
  /** glossy magnifier — a search with no match (My orders search, 353:148675) */
  searchNoMatch: { src: searchNoMatch, width: 247, height: 200 },
  /** magnifier between two dismissible filter chips — no results with filters on (736:23869) */
  searchFilters: { src: searchFilters, width: 280, height: 138 },
  /** Supermall bag + noon box, screen cut — nothing placed yet across noon & Supermall (353:148191) */
  ordersEmpty: { src: ordersEmpty, width: 280, height: 280 },
  /** Supermall bag + noon box, library cut (427:32934) */
  supermallNoon: { src: supermallNoon, width: 173, height: 96 },
  /** shopping cart with a spark — empty cart (427:32979) */
  cartEmpty: { src: cartEmpty, width: 110, height: 120 },
  /** boxes with broken hearts — nothing saved / a let-down (427:33039) */
  boxesHearts: { src: boxesHearts, width: 181, height: 114 },
  /** clipboard with a return arrow — returns (427:33080) */
  returnsClipboard: { src: returnsClipboard, width: 107, height: 116 },
  /** two coupons — no vouchers / offers (427:32868) */
  vouchers: { src: vouchers, width: 90, height: 90 },
  /** desk calendar with "!" — a missed date / slot unavailable (427:32903) */
  calendarAlert: { src: calendarAlert, width: 152, height: 76 },
} as const;
export type IllustrationName = keyof typeof illustrations;

export interface EmptyStateProps {
  illustration: IllustrationName;
  /** override the catalogue display width (height follows the art's ratio) */
  width?: number;
  title: ReactNode;
  body?: ReactNode;
  /**
   * `compact` (default): the search no-match layout (353:148295): art, 24 below it B16 Bold title + B12 Regular body,
   * gap 4. `full`: the empty-page layout (353:147847): art, gap 8, H18 Bold title + B14 Medium body (gap 4, 12 under),
   * then a full-width Field primary button.
   */
  size?: 'compact' | 'full';
  /** the way forward: a Field primary button in `full`, a Field text button in `compact` */
  action?: { label: string; onPress: () => void };
}

/** Empty / no-result state from the noon Visual Library: one illustration, a title, one line of help, one action. */
export function EmptyState({ illustration, width, title, body, size = 'compact', action }: EmptyStateProps) {
  const art = illustrations[illustration];
  const w = width ?? art.width;
  return (
    <div className={styles.root} data-size={size} role="status">
      <img className={styles.art} src={art.src} alt="" width={w} height={Math.round((w * art.height) / art.width)} />
      <div className={styles.copy}>
        <p className={styles.title}>{title}</p>
        {body && <p className={styles.body}>{body}</p>}
      </div>
      {action &&
        (size === 'full' ? (
          <Button variant="fieldPrimary" fieldSize="H48" block onClick={action.onPress}>
            {action.label}
          </Button>
        ) : (
          <Button variant="fieldText" fieldSize="A14" onClick={action.onPress}>
            {action.label}
          </Button>
        ))}
    </div>
  );
}
