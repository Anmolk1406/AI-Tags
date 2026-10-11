import type { ReactNode } from 'react';
import { Pressable, type PressableProps } from '../Pressable/Pressable';
import { Icon, type IconName } from '../Icon/Icon';
import { Spinner, type SpinnerProps } from '../Spinner/Spinner';
import { button as t } from '../../foundations/tokens';
import styles from './Button.module.css';

export type ButtonVariant =
  | 'primary' // #3866DF — Add to cart, View cart
  | 'checkout' // #0057FF — cart Checkout, Cancel selected
  | 'bright' // #0F7EFF — Create pill, View cart floating
  | 'dark' // #0E0E0E — Login, Continue shopping
  | 'outline' // white + #3866DF border — Buy now
  | 'secondary' // white + #EAECF0 border — Cancel, Clear all
  | 'soft' // #EBF4FF + #0F61FF text — wishlist ATC, View options
  | 'danger' // #DE1C1C — Yes, sign out
  | 'ghost' // text only
  // bappzaar marketplaces/noon/components/NoonButton presets (r12, padding 14/24, 16/600):
  | 'noon' // variant primary: #0076FF / white; disabled #0E0E0E0A / #0E0E0E3D
  | 'noonSecondary' // variant secondary: white, #0076FF text + 1px border; disabled grey text + border
  | 'noonGhost' // type ghost (primary): transparent, no padding, #0076FF text
  | 'noonGhostSecondary' // type ghost, variant secondary: newTextPrimary text
  | 'noonDotted'; // type dotted: no padding, newTextPrimary text over a 0.5/3 round-dotted SVG line

const NOON = new Set<ButtonVariant>(['noon', 'noonSecondary', 'noonGhost', 'noonGhostSecondary', 'noonDotted']);

/** NoonButton.toTitleCase — capitalises every word except the minor ones (skipped in RTL by the caller). */
const MINOR_WORDS = ['a', 'an', 'the', 'to', 'for', 'in', 'on', 'at', 'by', 'and', 'or', 'but', 'nor', 'with', 'from', 'of'];
export const toTitleCase = (s: string) =>
  s
    .toLowerCase()
    .split(' ')
    .map((w, i) => (!w ? '' : i > 0 && MINOR_WORDS.includes(w) ? w : w[0].toUpperCase() + w.slice(1)))
    .join(' ');

export interface ButtonProps extends Omit<PressableProps, 'children'> {
  variant?: ButtonVariant;
  /** kit variants only — noon variants always use the NoonButton metrics */
  size?: 'sm' | 'md' | 'lg';
  icon?: IconName;
  iconRight?: IconName;
  block?: boolean;
  /**
   * Kit variants: the spinner replaces the label. Noon variants (NoonButton `isLoading`): the label stays in place
   * at opacity 0 and the loader is centred over the button, so the width never jumps.
   */
  loading?: boolean;
  /** loader overrides (default: white on `noon`, #0076FF otherwise, size 24 — NoonButton `loaderColor`/`loaderSize`) */
  spinner?: SpinnerProps;
  /** NoonButton `!skipTitleCase`: title-case a string label */
  titleCase?: boolean;
  /** NoonButton `renderBefore` / `renderAfter` */
  before?: ReactNode;
  after?: ReactNode;
  /** noonDotted: line colour (NoonButton `dottedColor`, default newTextPrimary) */
  dottedColor?: string;
  children?: ReactNode;
}

/**
 * Central button. Kit variants are the noon app's filled/outline CTAs; `noon*` variants are 1:1 with bappzaar's
 * NoonButton presets (`variant` primary/secondary × `type` default/ghost/dotted, `isLoading`, `renderBefore/After`,
 * title-casing). Noon presets press like NoonButton (opacity 0.95 + scale 0.98, 200ms; ghost: none); override with
 * `whileTap` / `transition`. Their rules are zero-specificity, so a caller `className` can restyle metrics.
 */
export function Button({ variant = 'primary', size = 'md', icon, iconRight, block, loading, spinner, titleCase, before, after, dottedColor, disabled, children, className, ...rest }: ButtonProps) {
  const iconSize = t[`${size}IconSize`];
  if (NOON.has(variant)) {
    const ghost = variant === 'noonGhost' || variant === 'noonGhostSecondary' || variant === 'noonDotted';
    const label = titleCase && typeof children === 'string' ? toTitleCase(children) : children;
    const text = (
      <span className={styles.noonLabel} style={loading ? { visibility: 'hidden' } : undefined}>
        {label}
      </span>
    );
    return (
      <Pressable
        className={[styles.noonBase, styles[variant], block && styles.block, className].filter(Boolean).join(' ')}
        disabled={disabled || loading}
        data-disabled={disabled || undefined}
        scale={ghost ? 1 : t.noonPressScale}
        whileTap={ghost ? undefined : { scale: t.noonPressScale, opacity: t.noonPressOpacity }}
        transition={{ duration: t.noonPressDuration / 1000 }}
        {...rest}
      >
        {before}
        {variant === 'noonDotted' ? (
          <span className={styles.noonDottedInner}>
            {text}
            <svg height="1" width="100%" className={styles.noonDottedLine} aria-hidden>
              <line x1="0" y1="0.5" x2="100%" y2="0.5" stroke={disabled ? t.noonDottedLineDisabled : (dottedColor ?? t.noonDottedLine)} strokeWidth="1" strokeDasharray={t.noonDottedDash} strokeLinecap="round" />
            </svg>
          </span>
        ) : (
          text
        )}
        {loading && (
          <span className={styles.noonLoader}>
            <Spinner color={variant === 'noon' ? t.noonLoader : t.noonSecondaryLoader} size={t.noonLoaderSize} {...spinner} />
          </span>
        )}
        {after}
      </Pressable>
    );
  }
  return (
    <Pressable
      className={[styles.btn, styles[variant], styles[size], block && styles.block, className].filter(Boolean).join(' ')}
      disabled={disabled || loading}
      data-disabled={disabled || undefined}
      {...rest}
    >
      {loading ? (
        <Spinner size={t.spinnerSize} gap="right" duration={t.spinnerDuration / 1000} {...spinner} />
      ) : (
        <>
          {icon && <Icon name={icon} size={iconSize} />}
          {children}
          {iconRight && <Icon name={iconRight} size={iconSize} flipRtl />}
        </>
      )}
    </Pressable>
  );
}
