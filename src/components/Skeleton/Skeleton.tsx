import type { CSSProperties } from 'react';
import { radius as r, ref } from '../../foundations/tokens';

const base = ref.palette('shimmerGray');

/** Shimmer block (NewLoadingState / ShimmerBackground). */
export function Skeleton({ width = '100%', height = 14, radius = r.r6, style }: { width?: number | string; height?: number | string; radius?: number; style?: CSSProperties }) {
  return (
    <span
      style={{
        display: 'block',
        width,
        height,
        borderRadius: radius,
        background: `linear-gradient(90deg, ${base} 0px, ${ref.palette('skeletonGray')} 60px, ${base} 120px) ${base}`,
        backgroundSize: '400px 100%',
        animation: 'nk-shimmer 1.2s linear infinite',
        ...style,
      }}
    />
  );
}
