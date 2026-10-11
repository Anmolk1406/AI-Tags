import { motion, type Transition } from 'motion/react';
import type { CSSProperties } from 'react';
import styles from './Switch.module.css';
import { ref } from '../../foundations/tokens';
import { easing } from '../../motion/presets';

export interface SwitchProps {
  value: boolean;
  /** omit when the switch sits inside another button (`as="span"`) */
  onChange?: (value: boolean) => void;
  label?: string;
  /** track width (default 37 = react-native-switch barHeight 20 × 1.85 + insets) */
  width?: number;
  /** track height (default 20) */
  height?: number;
  /** knob diameter (default 16) */
  knob?: number;
  /** knob inset from the track edge (default 2) */
  inset?: number;
  onColor?: string;
  offColor?: string;
  knobColor?: string;
  /** knob slide transition (motion) */
  transition?: Transition;
  /** track colour transition (CSS `transition` value) */
  colorTransition?: string;
  /** `span` = purely visual, for a switch inside a larger pressable row */
  as?: 'button' | 'span';
  className?: string;
  style?: CSSProperties;
}

/**
 * Toggle switch: bappzaar `react-native-switch` / `components/PaymentSwitchV2`. Mirrors itself in RTL.
 *
 * Configurations in use (pass the props, values are 1:1 with the RN configs):
 *   - account (react-native-switch circle 16, bar 20, ×2.3, inset 2): defaults
 *     `onColor="var(--nk-color-text-primary)" offColor="#EAECF0"`
 *   - cards PaymentSwitchV2 md/dark: `width={34} onColor="#0E0E0E" offColor="#CCCCCC"`, 150ms easeInOutQuad
 *   - checkout credits (circle 15, ×2.5): `width={37.5} knob={15}`, `#0076FF` / `#CED1DA`, spring.press
 */
export function Switch({
  value,
  onChange,
  label,
  width = 37,
  height = 20,
  knob = 16,
  inset = 2,
  onColor = ref.color('textPrimary'),
  offColor = ref.color('border'),
  knobColor = ref.color('bgSurface'),
  transition = { duration: 0.2, ease: easing.out },
  colorTransition = 'background-color 0.2s',
  as = 'button',
  className,
  style,
}: SwitchProps) {
  const track: CSSProperties = { width, height, borderRadius: height / 2, background: value ? onColor : offColor, transition: colorTransition, ...style };
  const handle = (
    <motion.span
      className={styles.knob}
      style={{ top: (height - knob) / 2, left: inset, width: knob, height: knob, background: knobColor }}
      initial={false}
      animate={{ x: value ? width - knob - inset * 2 : 0 }}
      transition={transition}
    />
  );
  const cls = [styles.track, className].filter(Boolean).join(' ');
  if (as === 'span') {
    return (
      <span className={cls} style={track} aria-hidden>
        {handle}
      </span>
    );
  }
  return (
    <button type="button" role="switch" aria-checked={value} aria-label={label} className={cls} style={track} onClick={() => onChange?.(!value)}>
      {handle}
    </button>
  );
}
