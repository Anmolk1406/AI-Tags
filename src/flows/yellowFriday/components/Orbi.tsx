import type { CSSProperties } from 'react';
import { ref } from '../../../foundations/tokens';

export type OrbiMood = 'idle' | 'happy' | 'think';

/**
 * Orbi, noon's assistant, as a flat vector stand-in for the 3D bot (github.com/saswata2002/3D-noon-bot):
 * lacquer ball, yellow helmet with the noon wordmark, pill eyes. Three faces: idle, happy (greeting), think (working).
 * Colours are tokens; the shapes are geometry.
 */
export function Orbi({ size = 80, mood = 'idle', style }: { size?: number; mood?: OrbiMood; style?: CSSProperties }) {
  const ink = ref.color('textPrimary');
  const id = `orbi-${size}-${mood}`;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" aria-hidden="true" style={style}>
      <defs>
        <radialGradient id={id} cx="38%" cy="32%" r="70%">
          <stop offset="0" style={{ stopColor: ref.palette('white') }} />
          <stop offset="0.55" style={{ stopColor: ref.palette('antiFlashWhite') }} />
          <stop offset="1" style={{ stopColor: ref.palette('lightGrey') }} />
        </radialGradient>
      </defs>
      <ellipse cx="50" cy="96" rx="26" ry="3.5" style={{ fill: ink }} opacity="0.12" />
      <circle cx="50" cy="56" r="38" fill={`url(#${id})`} />
      <path d="M12 50 A38 38 0 0 1 88 50 L88 56 Q50 44 12 56 Z" style={{ fill: ref.color('brand'), stroke: ink }} strokeWidth="3" strokeLinejoin="round" />
      <path d="M14 56 Q50 46 86 56" style={{ stroke: ink }} strokeWidth="3" strokeLinecap="round" />
      <path d="M30 30 Q50 20 70 30" style={{ stroke: ref.palette('white') }} strokeWidth="3" strokeLinecap="round" opacity="0.8" />
      <text x="50" y="42" textAnchor="middle" style={{ fill: ink, font: 'var(--nk-type-text12-bold-lh1)' }}>
        noon
      </text>
      {mood === 'idle' && (
        <>
          <rect x="36" y="56" width="9" height="20" rx="4.5" style={{ fill: ink }} />
          <rect x="55" y="56" width="9" height="20" rx="4.5" style={{ fill: ink }} />
        </>
      )}
      {mood === 'think' && (
        <>
          <rect x="36" y="58" width="9" height="16" rx="4.5" style={{ fill: ink }} />
          <rect x="55" y="54" width="9" height="20" rx="4.5" style={{ fill: ink }} />
        </>
      )}
      {mood === 'happy' && (
        <>
          <path d="M34 68q6-9 12 0" style={{ stroke: ink }} strokeWidth="5" strokeLinecap="round" />
          <path d="M54 68q6-9 12 0" style={{ stroke: ink }} strokeWidth="5" strokeLinecap="round" />
          <path d="M44 78q6 5 12 0" style={{ stroke: ink }} strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="30" cy="74" r="4" style={{ fill: ref.palette('pink600') }} opacity="0.35" />
          <circle cx="70" cy="74" r="4" style={{ fill: ref.palette('pink600') }} opacity="0.35" />
        </>
      )}
    </svg>
  );
}
