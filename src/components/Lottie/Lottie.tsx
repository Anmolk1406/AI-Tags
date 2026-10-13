import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import type { CSSProperties } from 'react';
import atcCheck from '@assets/lotties/atc-check.lottie';
import boxAnim from '@assets/lotties/box-anim.lottie';
import favourite from '@assets/lotties/favouriteAnimatedV2.lottie';
import orderConf from '@assets/lotties/order-conf-lottie.lottie';
import orderConfirmedCheck from '@assets/lotties/order-confirmed-checkmark.lottie';
import reviewCheck from '@assets/lotties/noon-review-check-mark-animation.lottie';
import sliderArrow from '@assets/lotties/slider-arrow-animation-en.lottie';
import starLoading from '@assets/lotties/star-loading.lottie';

/** Lottie files copied from bappzaar `marketplaces/noon/theme/assets`. Drop more .lottie files in src/assets/lotties and add them here. */
export const lotties = {
  atcCheck,
  boxAnim,
  favourite,
  orderConf,
  orderConfirmedCheck,
  reviewCheck,
  sliderArrow,
  starLoading,
} as const;

export type LottieName = keyof typeof lotties;

/** `onLoad` fires once the animation data has loaded (playback starts then when autoplay); `onComplete` when a non-looping play ends. */
export function Lottie({ name, src, loop = false, autoplay = true, size, style, speed = 1, onComplete, onLoad }: { name?: LottieName; src?: string; loop?: boolean; autoplay?: boolean; size?: number; style?: CSSProperties; speed?: number; onComplete?: () => void; onLoad?: () => void }) {
  return (
    <DotLottieReact
      src={src ?? (name ? lotties[name] : undefined)}
      loop={loop}
      autoplay={autoplay}
      speed={speed}
      style={{ width: size, height: size, ...style }}
      dotLottieRefCallback={(d) => {
        if (d && onComplete) d.addEventListener('complete', onComplete);
        if (d && onLoad) d.addEventListener('load', onLoad);
      }}
    />
  );
}
