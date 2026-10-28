import tilde from '@assets/pdp/review-topics/tilde.svg';
import { motion, useAnimate } from 'motion/react';
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { MaskIcon, OriginIcon } from '../../../../components';
import type { ReviewTopic } from '../../../../data';
import { useIsTop } from '../../../../kit/Navigator';
import { haptic } from '../../../../motion/haptics';
import { noonEase, noonSpring } from '../../../../motion/noonMotion';
import { useReduceMotion } from '../../../../motion/reducedMotion';
import { chipHintStore, replayChipHint, setChipHint, setSwitchMotion, type ChipHint, type SwitchMotion } from '../../store';
import styles from './SfReviewTopics.module.css';

type Sentiment = ReviewTopic['sentiment'];

/** Sentiment colour: success green · Blue-Gray/600 · warning orange (Figma text-n-icon/success · tertiary · warning). */
export const sentimentColor: Record<Sentiment, string> = {
  positive: 'var(--nk-color-success)',
  neutral: 'var(--nk-color-text-secondary)',
  negative: 'var(--nk-palette-sunset-orange)',
};

/** 18px trend mark: arrow-up-right-bold (positive), the Figma "Tilde" (neutral, no Origin icon for it), arrow-down-right-bold (negative). */
export function SfTopicIcon({ sentiment, color = sentimentColor[sentiment] }: { sentiment: Sentiment; color?: string }) {
  if (sentiment === 'neutral') return <MaskIcon src={tilde} size={18} color={color} />;
  return <OriginIcon name={sentiment === 'positive' ? 'arrow-up-right-bold' : 'arrow-down-right-bold'} size={18} color={color} />;
}

/** Tap-me hint, played once when the chips scroll into view (and again from the switcher's Replay). */
const HINT = {
  /** share of the chip block that has to be on screen */
  threshold: 0.6,
  /** populate: chips scale in from 80 %, 50 ms apart, on the noon spring */
  populate: { from: 0.8, step: 0.05 },
  /** pulse: one chip after another in reading order — each 1 → 1.08 → 1 over 320 ms, the next starting 90 ms later, so
   *  about three overlap and the wave crosses all eight in ≈1 s */
  pulse: { peak: 1.08, duration: 0.32, step: 0.09 },
};

/**
 * Topic "Pills" under the AI summary bullets (Figma 1409:63882): wrap, 8 apart; white r8, p6, purple 8% drop shadow,
 * trend icon + 14/20 600 Blue-Gray/900 (no caret, on request 2026-10-28). Tap opens that topic. The first time the
 * block scrolls into view the chips play the selected tap-me hint (chipHintStore: populate · pulse · off).
 */
export function SfTopicPills({ topics, onOpen }: { topics: ReviewTopic[]; onOpen: (index: number) => void }) {
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const reduce = useReduceMotion();
  const isTop = useIsTop();
  const hint = chipHintStore.useStore((s) => s.hint);
  const replay = chipHintStore.useStore((s) => s.replay);
  const testing = chipHintStore.useStore((s) => s.testing);
  const inView = useRef(false);
  const played = useRef(-1);

  // populate starts hidden, so the chips are already "away" before the block reaches the screen
  const hidden = hint === 'populate' && !reduce;

  useEffect(() => {
    const el = scope.current;
    if (!el) return;
    const chips = Array.from(el.children) as HTMLElement[];
    const play = () => {
      if (played.current === replay || reduce || hint === 'off') return;
      played.current = replay;
      chips.forEach((chip, i) => {
        if (hint === 'populate') {
          animate(
            chip,
            { opacity: [0, 1], scale: [HINT.populate.from, 1] },
            { scale: { ...noonSpring.noon, delay: i * HINT.populate.step }, opacity: { duration: 0.2, ease: noonEase.fadeIn, delay: i * HINT.populate.step } },
          );
        } else {
          const p = HINT.pulse;
          animate(chip, { scale: [1, p.peak, 1] }, { duration: p.duration, ease: noonEase.soft, delay: i * p.step });
        }
      });
    };
    // switching hint resets the chips to that hint's start, then replays once in view
    chips.forEach((chip) => {
      chip.style.opacity = hidden ? '0' : '';
      chip.style.transform = '';
    });
    if (inView.current) play();
    const io = new IntersectionObserver(
      ([entry]) => {
        inView.current = entry.isIntersecting;
        if (entry.isIntersecting) play();
      },
      { threshold: HINT.threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hint, replay, hidden, reduce, animate, scope]);

  return (
    <>
      <div ref={scope} className={styles.pills} data-topic-pills>
        {topics.map((t, i) => (
          <motion.button
            key={t.label}
            type="button"
            className={styles.pill}
            // press feedback: the chip dips while held, so it reads as a control (noon press spring)
            whileTap={reduce ? undefined : { scale: 0.94 }}
            transition={noonSpring.noon}
            onClick={() => {
              haptic('pop'); // medium-light impact (Android Chrome only)
              onOpen(i);
            }}
          >
            <span className={styles.pillLabel}>
              <SfTopicIcon sentiment={t.sentiment} />
              {t.label}
            </span>
          </motion.button>
        ))}
      </div>
      {/* test control only with ?chipHint; one, for the PDP on top (earlier PDPs stay mounted under it); in .nk-root, where the token vars live */}
      {isTop && testing && createPortal(<ChipHintSwitcher hint={hint} />, document.querySelector('.nk-root') ?? document.body)}
    </>
  );
}

const HINT_OPTIONS: { value: ChipHint; label: string }[] = [
  { value: 'populate', label: 'Stagger in' },
  { value: 'pulse', label: 'Pulse 1 by 1' },
  { value: 'off', label: 'Off' },
];

/** Prototype-only test control (outside the app UI): pick the chip hint and replay it. Not part of the design. */
function ChipHintSwitcher({ hint }: { hint: ChipHint }) {
  return (
    <div className={styles.switcher} role="group" aria-label="Chip hint test">
      <span className={styles.switcherLabel}>Chip hint</span>
      <div className={styles.switcherOptions}>
        {HINT_OPTIONS.map((o) => (
          <button key={o.value} type="button" className={styles.switcherOption} aria-pressed={hint === o.value} onClick={() => setChipHint(o.value)}>
            {o.label}
          </button>
        ))}
      </div>
      <button type="button" className={styles.switcherReplay} onClick={replayChipHint} disabled={hint === 'off'}>
        Replay
      </button>
    </div>
  );
}

const SWITCH_OPTIONS: { value: SwitchMotion; label: string }[] = [
  { value: 'draw', label: 'Draw' },
  { value: 'intro', label: 'Intro' },
];

/** Prototype-only test control in the review-topics sheet: what the mark does on a chip switch (switchMotionStore). */
export function SwitchMotionSwitcher({ mode }: { mode: SwitchMotion }) {
  return (
    <div className={styles.switcher} role="group" aria-label="Chip switch motion test">
      <span className={styles.switcherLabel}>Chip switch</span>
      <div className={styles.switcherOptions}>
        {SWITCH_OPTIONS.map((o) => (
          <button key={o.value} type="button" className={styles.switcherOption} aria-pressed={mode === o.value} onClick={() => setSwitchMotion(o.value)}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
