import { motion } from 'motion/react';
import { useId } from 'react';
import { radius, ref, spacing } from '../../foundations/tokens';
import { duration, easing } from '../../motion/presets';

/** Language toggle style segmented control (126×40, #F9F9FB, white sliding thumb, 250ms ease-out-cubic). */
export function Segmented<T extends string>({ options, value, onChange, width }: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void; width?: number }) {
  const id = useId();
  return (
    <div style={{ display: 'flex', padding: spacing.s4, borderRadius: radius.full, background: ref.color('bgSubtle'), width, border: `1px solid ${ref.color('borderSubtle')}` }}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange(o.value);
            }}
            style={{ position: 'relative', flex: 1, height: 32, border: 0, background: 'none', cursor: 'pointer', padding: `0 ${spacing.s10}px`, font: ref.type(on ? 'text12SemiboldLh1' : 'text14MediumLh1'), color: on ? ref.color('textPrimary') : ref.color('textSecondary'), whiteSpace: 'nowrap' }}
          >
            {on && <motion.span layoutId={`seg-${id}`} transition={{ duration: duration.base, ease: easing.out }} style={{ position: 'absolute', inset: 0, background: ref.color('bgSurface'), borderRadius: radius.full, boxShadow: ref.shadow('thumb') }} />}
            <span style={{ position: 'relative' }}>{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}
