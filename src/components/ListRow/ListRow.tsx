import type { ReactNode } from 'react';
import { Icon, type IconName } from '../Icon/Icon';
import { Pressable } from '../Pressable/Pressable';
import { DashedDivider } from '../Divider/Divider';
import { radius, ref, spacing } from '../../foundations/tokens';

/** NoonAccountSectionItem: padding 18/16, 20px icon, 15/500 #1D2539 title, chevron. */
export function ListRow({
  icon,
  iconNode,
  title,
  subtitle,
  right,
  chevron = true,
  onPress,
  danger,
  paddingY = spacing.s18,
}: {
  icon?: IconName;
  iconNode?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  right?: ReactNode;
  chevron?: boolean;
  onPress?: () => void;
  danger?: boolean;
  paddingY?: number;
}) {
  return (
    <Pressable
      onClick={onPress}
      asDiv={!onPress}
      scale={onPress ? 0.98 : 1}
      style={{ display: 'flex', alignItems: 'center', width: '100%', padding: `${paddingY}px ${spacing.s16}px`, gap: spacing.s14, color: danger ? ref.color('danger') : ref.color('textPrimary') }}
    >
      {iconNode ?? (icon && <Icon name={icon} size={20} strokeWidth={1.7} />)}
      <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: spacing.s4 }}>
        <span style={{ font: ref.type('text15MediumLh18') }}>{title}</span>
        {subtitle && <span style={{ font: ref.type('text13RegularLh16'), color: ref.palette('blueGray500') }}>{subtitle}</span>}
      </span>
      {right}
      {chevron && <Icon name="chevronRight" size={18} color={ref.color('textSecondary')} flipRtl />}
    </Pressable>
  );
}

/** White r14 card of ListRows separated by dashed lines. */
export function ListGroup({ children, margin = `0 ${spacing.s15}px` }: { children: ReactNode[] | ReactNode; margin?: string | number }) {
  const items = (Array.isArray(children) ? children : [children]).filter(Boolean);
  return (
    <div style={{ background: ref.color('bgSurface'), borderRadius: radius.r14, margin, overflow: 'hidden' }}>
      {items.map((c, i) => (
        <div key={i}>
          {i > 0 && <DashedDivider />}
          {c}
        </div>
      ))}
    </div>
  );
}
