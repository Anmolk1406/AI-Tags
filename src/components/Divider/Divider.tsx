import type { CSSProperties } from 'react';
import { ref } from '../../foundations/tokens';

/**
 * Solid hairline. `vertical` draws a 1px-wide bar of `length` (PLP nav-pill separator: `<Divider vertical length={24} margin="0 8px" />`).
 */
export function Divider({ color = ref.color('borderSubtle'), margin = 0, vertical, length = '100%' }: { color?: string; margin?: number | string; vertical?: boolean; length?: number | string }) {
  if (vertical) return <span style={{ width: 1, height: length, background: color, margin, flexShrink: 0 }} />;
  return <div style={{ height: 1, background: color, margin, flexShrink: 0 }} />;
}

/** Dashed separator used in account menus, cart gifting, orders (dash 4/4, #F2F3F7), drawn with a CSS gradient. */
export function DashedDivider({ color = ref.color('borderSubtle'), inset = '3.5%', margin = 0, dash = 4 }: { color?: string; inset?: string | number; margin?: number | string; dash?: number }) {
  return (
    <div
      style={{
        height: 1,
        marginInline: inset,
        marginBlock: margin,
        backgroundImage: `linear-gradient(to right, ${color} 50%, transparent 50%)`,
        backgroundSize: `${dash * 2}px 1px`,
        flexShrink: 0,
      }}
    />
  );
}

/**
 * SVG dashed line (react-native-svg `<Line strokeDasharray>`), 1:1 with bappzaar's SVG dividers:
 *   - `AddressDottedDivider`: defaults (1px tall, dash "2, 2", round caps)
 *   - `NoonAccountDivider`: `height={2} dash="4,4" cap="butt" width="93%" centered` (dash "2,2" + width 100% in notifications)
 */
export function DottedDivider({
  color = ref.palette('antiFlashWhite'),
  dash = '2, 2',
  cap = 'round',
  height = 1,
  width = '100%',
  centered,
  style,
}: {
  color?: string;
  /** stroke-dasharray */
  dash?: string;
  cap?: 'round' | 'butt';
  /** svg height; the 1px line sits at its vertical centre */
  height?: number;
  width?: string | number;
  /** wrap in a flex row that centres a narrower line */
  centered?: boolean;
  style?: CSSProperties;
}) {
  const svg = (
    <svg height={height} width={width} style={{ display: 'block', overflow: 'visible', ...style }} aria-hidden>
      <line x1="0" y1={height / 2} x2="100%" y2={height / 2} stroke={color} strokeWidth="1" strokeDasharray={dash} strokeLinecap={cap === 'round' ? 'round' : undefined} />
    </svg>
  );
  return centered ? <div style={{ display: 'flex', justifyContent: 'center' }}>{svg}</div> : svg;
}
