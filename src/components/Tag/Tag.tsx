import type { CSSProperties, ReactNode } from 'react';
import { Icon, type IconName } from '../Icon/Icon';
import { MarketplaceTag } from './MarketplaceTag';
import { radius, ref, spacing } from '../../foundations/tokens';

/** NoonCatalogTagV2 — "Best Seller": 20h, #0A4F4A, bottom-end radius 10 only, 12/600 white. */
export function CatalogTag({ children, bg = ref.color('bestSellerTag'), color = ref.color('textInverse') }: { children: ReactNode; bg?: string; color?: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', height: 20, padding: `0 ${spacing.s8}px`, background: bg, color, borderEndEndRadius: radius.r10, font: ref.type('text12SemiboldLh14'), whiteSpace: 'nowrap' }}>
      {children}
    </span>
  );
}

/** noon express badge — Figma MarketplaceTagsPills/express (60×18), scaled to `height`. */
export function ExpressBadge({ height = 18 }: { height?: number }) {
  return <MarketplaceTag kind="express" height={height} />;
}

/** NoonDiscountTags coupon: 24h, r4, 1px dashed #BBE0DE, #E9FBF9, 12/600 #0A4F4A. */
export function CouponTag({ children }: { children: ReactNode }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing.s4, height: 24, padding: `0 ${spacing.s8}px`, borderRadius: radius.r4, border: `1px dashed ${ref.color('couponBorder')}`, background: ref.color('couponSurface'), color: ref.color('bestSellerTag'), font: ref.type('text12SemiboldLh1'), maxWidth: '100%', whiteSpace: 'nowrap', overflow: 'hidden' }}>
      <Icon name="tag" size={12} />
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{children}</span>
    </span>
  );
}

/** status chip fill: tint → white */
const fade = (from: string) => `linear-gradient(90deg, ${from}, ${ref.color('bgSurface')})`;

const tones = {
  success: { bg: fade(ref.color('successSurface')), fg: ref.color('success') },
  neutral: { bg: fade(ref.palette('antiFlashWhite')), fg: ref.color('textSecondary') },
  info: { bg: fade(ref.color('bgInfo')), fg: ref.color('primary') },
  warning: { bg: fade(ref.color('warningSurface')), fg: ref.palette('sunsetOrange') },
  danger: { bg: fade(ref.palette('red100')), fg: ref.palette('dangerRed') },
  plain: { bg: ref.color('bgMuted'), fg: ref.color('textPrimary') },
} as const;
export type Tone = keyof typeof tones;

/** Status / highlight chip (O2D history highlights, return statuses). */
export function StatusChip({ tone = 'neutral', icon, children, style }: { tone?: Tone; icon?: IconName; children: ReactNode; style?: CSSProperties }) {
  const t = tones[tone];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing.s4, padding: `${spacing.s4}px ${spacing.s6}px`, borderRadius: radius.r8, background: t.bg, color: t.fg, font: ref.type('text13SemiboldLh16'), width: 'fit-content', ...style }}>
      {icon && <Icon name={icon} size={16} />}
      {children}
    </span>
  );
}

/** Generic small badge (counts, "member", sponsored) */
export function Badge({ children, bg = ref.palette('whiteAlpha70'), color = ref.color('textMuted'), style }: { children: ReactNode; bg?: string; color?: string; style?: CSSProperties }) {
  return <span style={{ display: 'inline-flex', alignItems: 'center', padding: `${spacing.s2}px ${spacing.s4}px`, borderRadius: radius.r4, background: bg, color, font: ref.type('text10MediumLh12'), ...style }}>{children}</span>;
}
