import { animate, motion, useMotionValue, useTransform } from 'motion/react';
import { useEffect, useState } from 'react';
import { Pressable } from '../../../components';
import { easing } from '../../../motion/presets';
import { AccountIconImg } from '../icons';
import { accountTokens } from '../tokens';
import { palette } from '../../../foundations/palette';

type Phase = 'idle' | 'filling' | 'reverting';

/**
 * Edit-profile button with the profile-completion ring (NoonAccountProfileHeader):
 * after 1100ms the pencil scales out (300ms back-in), the ring turns orange and fills to `percent`
 * over 1200ms (ease-out cubic) with a "NN%" counter, holds 800ms, then reverts (400ms back-out).
 */
export function EditRing({ percent, onPress, replayKey }: { percent: number; onPress?: () => void; replayKey?: number }) {
  const [phase, setPhase] = useState<Phase>('idle');
  const count = useMotionValue(0);
  const label = useTransform(count, (v) => `${Math.round(v)}%`);
  const { ring } = accountTokens;

  useEffect(() => {
    setPhase('idle');
    count.set(0);
    const t1 = setTimeout(() => {
      setPhase('filling');
      animate(count, percent, { duration: 1.2, ease: easing.out });
    }, 1100);
    const t2 = setTimeout(() => setPhase('reverting'), 1100 + 1200 + 800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [percent, count, replayKey]);

  const active = phase === 'filling';
  const size = 36;
  const r = 17;

  return (
    <Pressable
      onClick={(e) => {
        e.stopPropagation();
        onPress?.();
      }}
      aria-label="Edit profile"
      style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}
    >
      <motion.span
        animate={{ background: active ? ring.bg : palette.secondaryBackgroundColor, borderColor: active ? ring.border : palette.lightGreyColor }}
        transition={{ duration: 0.3 }}
        style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1px solid', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <motion.span
          animate={{ scale: active ? 0 : 1 }}
          transition={active ? { duration: 0.3, ease: [0.36, 0, 0.66, -0.56] } : { duration: 0.4, ease: easing.backOut }}
          style={{ display: 'flex' }}
        >
          <AccountIconImg name="editProfile" size={16} />
        </motion.span>
        <motion.span
          initial={false}
          animate={{ opacity: active ? 1 : 0, scale: active ? 1 : 0.8 }}
          transition={{ duration: 0.3 }}
          style={{ position: 'absolute', font: 'var(--nk-type-acct-text11-bold-lh1)', color: ring.counter }}
        >
          {label}
        </motion.span>
      </motion.span>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)', pointerEvents: 'none' }}>
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={2}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: active ? percent / 100 : phase === 'reverting' ? 0 : 0, stroke: active ? ring.fill : ring.idle }}
          transition={active ? { pathLength: { duration: 1.2, ease: easing.out } } : { duration: 0.4, ease: easing.backOut }}
        />
      </svg>
    </Pressable>
  );
}
