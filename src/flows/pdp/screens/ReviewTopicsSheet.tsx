import { animate, motion, useAnimate, type AnimationPlaybackControls } from 'motion/react';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal, flushSync } from 'react-dom';
import { DashedDivider, OriginIcon, SheetBody, Skeleton } from '../../../components';
import { productById, type ReviewTopic } from '../../../data';
import { radius } from '../../../foundations/tokens';
import { copy, sfCopy } from '../../../data/copy/pdp';
import { pdpView } from '../../../data/views/pdp';
import { useIsTop } from '../../../kit/Navigator';
import type { ScreenProps } from '../../../kit/types';
import { haptic } from '../../../motion/haptics';
import { noonEase, noonSpring, noonStagger, noonTravel } from '../../../motion/noonMotion';
import { useReduceMotion } from '../../../motion/reducedMotion';
import { SfTopicIcon, SwitchMotionSwitcher, sentimentColor } from '../components/storefront/SfReviewTopics';
import { switchMotionStore } from '../store';
import styles from './ReviewTopicsSheet.module.css';

type Params = { productId: string; topic?: number };

/** opening: the chips start this long after the sheet opens (Field springLight is ≈90 % there by 250 ms) */
const INTRO_MS = 300;

/** the chips stagger in first, 50 ms apart */
const CHIPS = { stepS: 0.05, riseY: 8, inS: 0.45 };

/**
 * Opening reads top to bottom: chips → the topic. The first topic comes in 230 ms after the first chip starts (the
 * first chips are in by then), so it never lands before the chips.
 */
const OPEN_CARD_AFTER_INTRO_MS = 230;

/** selected-chip outline: revealed in place on the chip's own border (fade in), the old one fades out — no travel */
const OUTLINE = { inS: 0.2, outS: 0.15 };

/**
 * Chip-selection spring: the noon standard one made ~30 % stiffer, damping scaled with √stiffness so each keeps its
 * damping ratio (same overshoot, quicker settle). Tune here.
 */
const topicSpring = {
  /** chip row re-centring · was noonSpring.noon 280.6 / 27.14 · ζ 0.81 */
  follow: { type: 'spring', stiffness: 365, damping: 30.95, mass: 1 },
} as const;

/**
 * Topic change, measured from the reference recording (Airbnb review topics, 60 fps): the old content fades out fast,
 * the stage stays blank while the "request" is in flight, then the new content fades in on an ease-out. No sliding.
 */
const SWAP = {
  /** old topic out · measured ≈150 ms */
  outS: 0.15,
  /** blank hold covering the API call · measured ≈420 ms */
  holdMs: 420,
  /** new topic in · measured ≈400 ms, ~80 % of it in the first 250 ms */
  inS: 0.4,
  /** …while rising this far into place (noonTravel.card) */
  riseY: noonTravel.card,
};

/** the sentiment wash: up with the topic as it fades in, then (after `holdMs`) faded out to the plain white → grey sheet */
const TINT = { inS: 0.6, holdMs: 1000, outS: 0.45 };

/** mock loading: after the blank hold, a topic not seen yet shows a skeleton this long before its reviews */
const LOAD_MIN_MS = 1000;
const LOAD_MAX_MS = 1500;

/**
 * "Customers frequently talked about" (Figma Or9RuyCtjXRPrnbUJFx7As · 1421:486, sentiment line AI-Tags
 * 74N3uH2E094EX3hWw7FDVd · 1573:20235): Origin sheet, white → Blue-Gray/200 fill with a sentiment wash on top; a pill
 * row with the selected topic outlined; the topic's sentiment (mark + "Great value for money", quote) centred; then its
 * review cards.
 *
 * Opening: the chips stagger in, then the topic fades in (rising 16 px) and its mark plays the Reveal intro
 * (MARK_MOTION.reveal; the only mark motion since 2026-10-28 — Shrink, Throw and Circle were removed). Selection: tap a
 * pill → its outline fades in on its own border, the pill row re-centres, the topic swaps in place (SWAP: fade out →
 * blank hold → fade in) with its mark and title already in place. A topic seen for the first time shows a 1–1.5 s
 * skeleton before its reviews rise in (noonStagger.in). Reduced motion swaps at once.
 */
export function ReviewTopicsSheet({ params }: ScreenProps<Params>) {
  const product = productById(params.productId);
  const topics = (product && pdpView(product).aiTopics) ?? [];
  const clamp = (i: number) => Math.min(Math.max(i, 0), Math.max(topics.length - 1, 0));
  const [active, setActive] = useState(() => clamp(params.topic ?? 0));
  /** the topic the stage shows: trails `active` by the swap's fade out + hold */
  const [shown, setShown] = useState(active);
  /** topics whose reviews have "loaded" this time the sheet is open */
  const [loaded, setLoaded] = useState<ReadonlySet<string>>(() => new Set());
  const reduce = useReduceMotion();
  // the chips come in once the sheet has risen; reduced motion shows them at once
  const [introIn, setIntroIn] = useState(reduce);
  useEffect(() => {
    if (introIn) return;
    const t = window.setTimeout(() => setIntroIn(true), INTRO_MS);
    return () => window.clearTimeout(t);
  }, [introIn]);
  /** the shown topic is fading in / in (its mark plays its intro then) */
  const [entered, setEntered] = useState(false);
  /** the sentiment wash is up (with the topic, for TINT.holdMs) */
  const [tintOn, setTintOn] = useState(false);
  const pillRow = useRef<HTMLDivElement>(null);
  const [stage, animateStage] = useAnimate<HTMLDivElement>();
  const pillGlide = useRef<AnimationPlaybackControls | null>(null);
  /** bumps on every tap, so a quicker second tap wins over a swap still in flight */
  const swapId = useRef(0);
  const holdTimer = useRef(0);
  const tintTimer = useRef(0);

  const centrePill = useCallback((i: number, instant: boolean) => {
    const row = pillRow.current;
    const pill = row?.children[i] as HTMLElement | undefined;
    if (!row || !pill) return;
    // offsetLeft (the row is the offset parent), so a pressed pill's scale doesn't skew it
    const to = Math.max(0, Math.min(pill.offsetLeft - (row.clientWidth - pill.offsetWidth) / 2, row.scrollWidth - row.clientWidth));
    pillGlide.current?.stop();
    if (instant) row.scrollLeft = to;
    else pillGlide.current = animate(row.scrollLeft, to, { ...topicSpring.follow, onUpdate: (v) => (row.scrollLeft = v) });
  }, []);

  /** the new topic in: fade in while rising into place, the wash up for a beat */
  const reveal = useCallback(() => {
    if (!stage.current) return;
    animateStage(stage.current, { opacity: 1, y: [SWAP.riseY, 0] }, { opacity: { duration: SWAP.inS, ease: noonEase.fadeIn }, y: noonSpring.card });
    setTintOn(true);
    setEntered(true);
    window.clearTimeout(tintTimer.current);
    tintTimer.current = window.setTimeout(() => setTintOn(false), TINT.holdMs);
  }, [animateStage, stage]);

  // open on the param's topic, its pill centred; the topic stays hidden and comes in (like a switch) after the chips
  useLayoutEffect(() => {
    centrePill(active, true);
    // again once the sheet has laid out and the pill font has loaded (the first pass can measure the row too early)
    const frame = requestAnimationFrame(() => centrePill(active, true));
    void document.fonts?.ready.then(() => centrePill(active, true));
    if (reduce || !stage.current) return () => cancelAnimationFrame(frame);
    stage.current.style.opacity = '0';
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // first topic in: OPEN_CARD_AFTER_INTRO_MS after the chips start (a chip tap before then takes over)
  const openRevealed = useRef(reduce);
  /** the mark's intro plays once, when the sheet opens; chip switches just fade the content in */
  const [intro, setIntro] = useState(true);
  useEffect(() => {
    if (!introIn || openRevealed.current) return;
    openRevealed.current = true;
    holdTimer.current = window.setTimeout(reveal, OPEN_CARD_AFTER_INTRO_MS);
  }, [introIn, reveal]);

  useEffect(
    () => () => {
      pillGlide.current?.stop();
      window.clearTimeout(holdTimer.current);
      window.clearTimeout(tintTimer.current);
    },
    [],
  );

  const select = async (i: number) => {
    // medium-light impact on every chip tap (navigator.vibrate: Android Chrome only; iOS Safari ignores it)
    haptic('pop');
    if (i === active) return;
    setActive(i);
    centrePill(i, reduce);
    openRevealed.current = true;
    const id = ++swapId.current;
    window.clearTimeout(holdTimer.current);
    window.clearTimeout(tintTimer.current);
    // the mark on a switch: draws on in place, or (the `intro` variant) the same motion as opening the sheet — set as
    // the new topic mounts, so the outgoing one keeps its mark and title while it fades out
    const withIntro = switchMotionStore.get().mode === 'intro';
    if (reduce || !stage.current) {
      setIntro(withIntro);
      setShown(i);
      return;
    }
    // the wash leaves with the old topic
    setTintOn(false);
    setEntered(false);
    await animateStage(stage.current, { opacity: 0 }, { duration: SWAP.outS, ease: noonEase.fadeOut });
    if (id !== swapId.current) return;
    holdTimer.current = window.setTimeout(() => {
      if (id !== swapId.current || !stage.current) return;
      setIntro(withIntro);
      setShown(i);
      reveal();
    }, SWAP.holdMs);
  };

  const isTop = useIsTop();
  const switchMode = switchMotionStore.useStore((s) => s.mode);
  const markLoaded = useCallback((label: string) => setLoaded((s) => new Set(s).add(label)), []);

  if (topics.length === 0) return null;
  const topic = topics[shown];

  return (
    <SheetBody inset={false} className={styles.sheet}>
      {/* sentiment wash over the sheet's white → grey fill (green / grey / warm): up with the topic, then faded out */}
      <motion.span
        className={styles.tint}
        data-sentiment={topic.sentiment}
        aria-hidden
        initial={false}
        animate={{ opacity: tintOn ? 1 : 0 }}
        transition={reduce ? { duration: 0 } : tintOn ? { duration: TINT.inS, ease: noonEase.fadeIn } : { duration: entered ? TINT.outS : SWAP.outS, ease: noonEase.fadeOut }}
      />

      <div ref={pillRow} className={styles.pills} role="tablist" aria-label={sfCopy.reviews.topicsTitle.replace('\n', ' ')}>
        {topics.map((t, i) => (
          <motion.button
            key={t.label}
            type="button"
            role="tab"
            aria-selected={i === active}
            className={styles.pill}
            data-active={i === active || undefined}
            onClick={() => select(i)}
            whileTap={reduce ? undefined : { scale: 0.96 }}
            // entrance: hidden until the sheet has risen, then one after another (CHIPS); press stays on the noon spring
            initial={false}
            animate={introIn ? { opacity: 1, y: 0 } : { opacity: 0, y: CHIPS.riseY }}
            transition={
              reduce
                ? { duration: 0 }
                : {
                    opacity: { duration: CHIPS.inS * 0.6, ease: noonEase.fadeIn, delay: i * CHIPS.stepS },
                    y: { duration: CHIPS.inS, ease: noonEase.soft, delay: i * CHIPS.stepS },
                    scale: noonSpring.noon,
                  }
            }
          >
            {/* every chip has its own outline on its border; the selected one fades in, the previous one fades out (no travel) */}
            <motion.span
              className={styles.pillOutline}
              aria-hidden
              initial={false}
              animate={{ opacity: i === active ? 1 : 0 }}
              transition={reduce ? { duration: 0 } : i === active ? { duration: OUTLINE.inS, ease: noonEase.fadeIn } : { duration: OUTLINE.outS, ease: noonEase.fadeOut }}
            />
            {/* only the open chip's mark carries its sentiment colour; the rest are Blue-Gray/600 (1421:494 / 1421:497) */}
            <SfTopicIcon sentiment={t.sentiment} color={i === active ? undefined : 'var(--nk-color-text-secondary)'} />
            {/* the bold copy reserves the selected width, so neighbours don't shift when the weight changes */}
            <span className={styles.pillLabel} data-label={t.label}>
              {t.label}
            </span>
          </motion.button>
        ))}
      </div>

      <div ref={stage} className={styles.stage} role="tabpanel">
        <TopicBody key={topic.label} topic={topic} entered={entered} intro={intro} loaded={loaded.has(topic.label)} onLoaded={markLoaded} reduce={reduce} />
      </div>
      {isTop && createPortal(<SwitchMotionSwitcher mode={switchMode} />, document.querySelector('.nk-root') ?? document.body)}
    </SheetBody>
  );
}

/** the sheet's sentiment line: emerald green (Figma 1421:520 #13645F) for positive, otherwise the chip colours */
const headColor: Record<ReviewTopic['sentiment'], string> = { ...sentimentColor, positive: 'var(--nk-palette-emerald-green)' };

/** the inline mark's size (Figma AI-Tags 1573:20244: 20 px icon before the B16 label) */
const MARK_PX = 20;

/**
 * The mark's motion. Reveal (no layout shift): the topic opens in its final layout. As it appears the mark pops in at
 * the centre of the sentiment line, `fromScale` × its size, and springs down to its size (`pop`) while its strokes draw
 * on (`draw`, trim path: the shaft from its tail, then the arms from the tip; the tilde left to right); `moveAtS` in it
 * slides left to its slot (`move`) and the title is uncovered behind it on the same spring: the window's clear edge
 * rides the mark's right side and its right edge opens outward from where the mark started, both soft over
 * `featherPx`, while the title drifts `shiftPx` right into place; at the end of the slide the window covers the whole
 * title, so the mask comes off without a visible change.
 */
const MARK_MOTION = {
  /** on a chip switch the mark draws on in place (trim path, `draw`) from `atS` into the content's fade-in,
   *  and, from `popAtS` (once the content is mostly in, so the bounce is seen), growing from `fromScale` on a springy
   *  spring (ζ 0.4): it overshoots to ≈ 112 % and settles */
  switchDraw: {
    atS: 0.1,
    /** its own, slower draw (so it reads as the stroke being drawn, not a scale): the shaft, then the arms; the tilde */
    draw: { shaftS: 0.5, armsAtS: 0.34, armsS: 0.42, tildeS: 0.7 },
    drawEase: [0.45, 0, 0.25, 1] as [number, number, number, number],
    popAtS: 0.2,
    fromScale: 0.5,
    bounce: { type: 'spring', stiffness: 400, damping: 16, mass: 1 } as const,
  },
  reveal: {
    fromScale: 2.2,
    popAtS: 0.12,
    // slowed a third (on request, 2026-10-28): stiffness 320 → 180 at the same ζ 0.56 (≈1.33× longer)
    pop: { type: 'spring', stiffness: 180, damping: 15, mass: 1 } as const,
    moveAtS: 0.66,
    move: noonSpring.card,
    /** the mark draws on (trim path) during the pop, from `popAtS`: shaft, then the arms `armsAtS` in; the tilde in one go */
    draw: { shaftS: 0.24, armsAtS: 0.14, armsS: 0.22, tildeS: 0.35 },
    /** the window's soft edges, in px: each fades along a smoothstep (featherRamp), not a straight ramp that reads as an edge */
    featherPx: 18,
    /** from `featherOutAtP` of the slide (the mark still moving, so it blends into the slide) the left feather's faint
     *  end rises to opaque over `featherOutS`, in-out, so the last letters settle in instead of popping */
    featherOutAtP: 0.85,
    featherOutS: 0.5,
    featherOutEase: noonEase.fadeOut,
    /** the title drifts this far right into place as it is uncovered */
    shiftPx: 6,
  },
};

/**
 * The marks as strokes, so they can be trimmed (pathLength / pathOffset). Arrows (24 px grid, drawn at 18 px): the
 * centrelines of Origin arrow-up-right-bold / arrow-down-right-bold, 2 units wide with round caps — the shaft from its
 * tail to the head's inner corner, and the head as two arms that start together at the middle of the rounded corner.
 * Tilde (18 px grid): the centreline of the Figma "Tilde" outline (src/assets/pdp/review-topics/tilde.svg, 1421:708),
 * sampled midway between its edges, at the outline's 1.12 px width. At rest each matches its icon; drawn as strokes on
 * request (trim-path animation, 2026-10-27).
 */
const MARK_STROKES = {
  positive: { shaft: 'M7 17L15.6 8.4', arms: ['M16.41 7.59A2 2 0 0 0 15 7H9', 'M16.41 7.59A2 2 0 0 1 17 9V15'] },
  negative: { shaft: 'M7 7L15.6 15.6', arms: ['M16.41 16.41A2 2 0 0 1 15 17H9', 'M16.41 16.41A2 2 0 0 0 17 15V9'] },
  tilde: {
    d: 'M2.81 9.17C2.91 9.07 3.20 8.71 3.39 8.52C3.58 8.33 3.75 8.18 3.93 8.03C4.11 7.89 4.29 7.77 4.47 7.67C4.65 7.57 4.83 7.50 5.00 7.44C5.18 7.38 5.31 7.34 5.51 7.33C5.71 7.32 5.98 7.32 6.22 7.36C6.45 7.40 6.69 7.48 6.93 7.58C7.16 7.68 7.39 7.82 7.62 7.96C7.84 8.10 8.06 8.26 8.29 8.44C8.52 8.61 8.77 8.82 9.00 9.00C9.22 9.18 9.43 9.35 9.64 9.52C9.86 9.68 10.07 9.85 10.29 9.99C10.51 10.13 10.72 10.26 10.95 10.37C11.18 10.47 11.42 10.57 11.67 10.63C11.93 10.68 12.26 10.69 12.49 10.67C12.72 10.66 12.88 10.61 13.06 10.54C13.25 10.48 13.42 10.40 13.60 10.29C13.78 10.19 13.95 10.06 14.13 9.92C14.31 9.77 14.50 9.59 14.68 9.41C14.85 9.23 15.10 8.93 15.19 8.83',
    width: 1.12,
  },
};

/**
 * Trim a stroke: the visible part runs from `offset` to `offset + length` along it (0–1). Set by hand rather than with
 * motion's pathLength, whose dash pattern repeats every 1 — with round caps that leaves a dot at the path's far end
 * while it is part-drawn, and dots at both ends when "hidden". Here the gap (2) is longer than the path, and a stroke
 * with nothing left is hidden outright.
 */
function setTrim(path: SVGPathElement, length: number, offset: number) {
  path.setAttribute('pathLength', '1');
  path.setAttribute('stroke-dasharray', `${Math.max(length, 0)} 2`);
  path.setAttribute('stroke-dashoffset', String(-offset));
  path.style.opacity = length < 0.002 ? '0' : '1';
}

/** animate a stroke's trim from [length, offset] to [length, offset] */
const animateTrim = (path: SVGPathElement, from: [number, number], to: [number, number], transition: { duration: number; delay?: number; ease: readonly number[] }) => {
  const [x1, y1, x2, y2] = transition.ease;
  return animate(0 as number, 1, {
    duration: transition.duration,
    delay: transition.delay ?? 0,
    ease: [x1, y1, x2, y2],
    onUpdate: (t: number) => setTrim(path, from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t),
  });
};

/**
 * Mask stops for a soft edge, clear at `from` px to opaque `ink` at `to` px (either direction), along a smoothstep — a
 * long, gentle fade with no visible start or end, instead of a straight ramp that reads as a hard edge. `floor` lifts the
 * clear end's opacity (0 → 1 fades the whole edge in).
 */
function featherRamp(ink: string, from: number, to: number, floor = 0) {
  const stops = [0, 0.1, 0.25, 0.4, 0.5, 0.6, 0.75, 0.9, 1].map((t) => {
    const a = floor + (1 - floor) * t * t * (3 - 2 * t);
    return `color-mix(in srgb, ${ink} ${(a * 100).toFixed(1)}%, transparent) ${(from + (to - from) * t).toFixed(2)}px`;
  });
  return (from <= to ? stops : stops.reverse()).join(', ');
}

/** where each mark's stroke starts, as a transform origin in its box: the arrow's tail (grid 7,17 · 7,7 of 24) and the
 *  tilde's left end (2.81,9.17 of 18) — the switch's bounce grows out of it */
const MARK_START: Record<ReviewTopic['sentiment'], string> = { positive: '29% 71%', negative: '29% 29%', neutral: '16% 51%' };

/** The mark's strokes, found in its element. */
function markParts(el: HTMLElement) {
  return {
    shaft: el.querySelector<SVGPathElement>('[data-part="shaft"]'),
    arms: Array.from(el.querySelectorAll<SVGPathElement>('[data-part="arm"]')),
    tilde: el.querySelector<SVGPathElement>('[data-part="tilde"]'),
  };
}

/** One topic: sentiment (mark + title, quote) centred over its review cards. */
function TopicBody({
  topic,
  entered,
  intro,
  loaded,
  onLoaded,
  reduce,
}: {
  topic: ReviewTopic;
  entered: boolean;
  /** play the mark's intro (sheet opening) or just show it (a chip switch) */
  intro: boolean;
  loaded: boolean;
  onLoaded: (label: string) => void;
  reduce: boolean;
}) {
  const [markScope] = useAnimate<HTMLSpanElement>();
  /**
   * The mark pops in at the centre of the sentiment line (scaled up) while it draws on, then slides left to its slot
   * while the title is revealed behind it (MARK_MOTION.reveal). Nothing in the layout moves.
   */
  const revealIn = useCallback((el: HTMLElement) => {
    const r = MARK_MOTION.reveal;
    const slot = el.closest<HTMLElement>(`.${styles.mark}`);
    const row = slot?.parentElement;
    // the title box sits right after the mark's slot
    const label = slot?.nextElementSibling as HTMLElement | null;
    if (!slot || !row || !label?.hasAttribute('data-reveal-title')) return;
    const { shaft, arms, tilde } = markParts(el);
    // the strokes start trimmed away and draw on as the mark pops (r.draw)
    [shaft, ...arms, tilde].forEach((q) => q && setTrim(q, 0, 0));
    // it starts at the line's centre (the slot is the line's first MARK_PX): the offset sits on the wrapper round the mark,
    // so it never competes with the mark's own scale
    const wrap = el.parentElement;
    if (!wrap) return;
    const dx = row.getBoundingClientRect().width / 2 - MARK_PX / 2;
    wrap.style.transform = `translateX(${dx}px)`;
    el.style.transformOrigin = '50% 50%';
    animate(el, { scale: r.fromScale, rotate: 0, x: 0, opacity: 0 }, { duration: 0 });
    animate(el, { opacity: [0, 1] }, { duration: 0.08, delay: r.popAtS, ease: noonEase.fadeIn });
    animate(el, { scale: [r.fromScale, 1] }, { ...r.pop, delay: r.popAtS });
    // trim path on the pop: the arrow's shaft draws from its tail, then the head's arms draw out from the tip; the tilde
    // draws left to right
    const d = r.draw;
    if (shaft) animateTrim(shaft, [0, 0], [1, 0], { duration: d.shaftS, delay: r.popAtS, ease: noonEase.soft });
    arms.forEach((q) => animateTrim(q, [0, 0], [1, 0], { duration: d.armsS, delay: r.popAtS + d.armsAtS, ease: noonEase.soft }));
    if (tilde) animateTrim(tilde, [0, 0], [1, 0], { duration: d.tildeS, delay: r.popAtS, ease: noonEase.soft });
    // the title is uncovered behind the sliding mark, on the slide's own spring (one driver, so they can't drift apart).
    // The window's left edge is the mark's right side, measured every frame in the title's own (drifted) box, its
    // feather on the inside so no text shows under the mark; its right edge opens from where the mark started to the
    // title's end at the same pace. At p = 1 the window's solid part covers the whole title.
    const F = r.featherPx;
    const ink = 'var(--nk-color-bg-surface)';
    const clear = () => {
      for (const k of ['maskImage', 'webkitMaskImage'] as const) label.style[k] = '';
      label.style.transform = '';
    };
    let W = 0;
    let from = 0;
    let q = 0;
    // `out`: as the mark comes home, the left feather's faint end rises to opaque (0 → 1), so the first letters fade in
    // through it instead of being cut; the clear edge itself never leaves the mark's right side
    let out = 0;
    const setWindow = () => {
      const drift = r.shiftPx * (1 - q);
      label.style.transform = `translateX(${-drift}px)`;
      const markRight = el.getBoundingClientRect().right - label.getBoundingClientRect().left;
      if (!W) {
        W = label.offsetWidth;
        from = markRight;
      }
      // the clear edge rides the mark's right side (no text is ever drawn under the mark), the full feather after it
      const left = Math.max(0, markRight);
      const right = from + F + (W - from) * q;
      // (`transparent` up to the clear edge first: a gradient extends its first stop outward, and the raised floor must
      // never reach under the mark)
      const m = `linear-gradient(90deg, transparent ${left}px, ${featherRamp(ink, left, left + F, out)}, ${featherRamp(ink, right + F, right)})`;
      Object.assign(label.style, { maskImage: m, webkitMaskImage: m });
    };
    let slid = false;
    let finished = false;
    const finish = () =>
      animate(0 as number, 1, {
        duration: r.featherOutS,
        ease: r.featherOutEase,
        onUpdate: (v: number) => {
          out = v;
          setWindow();
        },
        onComplete: () => {
          finished = true;
          if (slid) clear();
        },
      });
    window.setTimeout(() => {
      if (!el.isConnected) return;
      setWindow();
      label.style.opacity = '1';
      let started = false;
      animate(0 as number, 1, {
        ...r.move,
        onUpdate: (p: number) => {
          wrap.style.transform = `translateX(${dx * (1 - p)}px)`;
          q = Math.min(1, Math.max(0, p));
          setWindow();
          // the mark is nearly home: start settling the feather while it still moves
          if (!started && p >= r.featherOutAtP) {
            started = true;
            finish();
          }
        },
        onComplete: () => {
          wrap.style.transform = '';
          slid = true;
          q = 1;
          if (!started) {
            started = true;
            finish();
          } else if (finished) clear();
          else setWindow();
        },
      });
    }, r.moveAtS * 1000);
  }, []);

  // the intro plays on the sheet's first topic; on a chip switch the mark draws on in its slot as the content fades in;
  // with reduced motion it simply sits there
  useEffect(() => {
    const el = markScope.current;
    if (!el) return;
    const { shaft, arms, tilde } = markParts(el);
    const strokes = [shaft, ...arms, tilde].filter((p): p is SVGPathElement => !!p);
    if (reduce) {
      strokes.forEach((p) => setTrim(p, 1, 0));
      animate(el, { opacity: 1, scale: 1 }, { duration: 0 });
      return;
    }
    if (!intro) {
      // a chip switch: the mark sits in its slot and draws on (trim path) as the content fades in — the arrow's shaft
      // from its tail, then the head's arms; the tilde left to right (MARK_MOTION.switchDraw)
      animate(el, { opacity: 1, scale: 1 }, { duration: 0 });
      if (!entered) return;
      const w = MARK_MOTION.switchDraw;
      const d = w.draw;
      strokes.forEach((p) => setTrim(p, 0, 0));
      // …with a small bounce: it grows from `fromScale` and overshoots a touch before it settles — out of the point the
      // stroke starts from (the arrow's tail, the tilde's left end), not its centre, so it reads as drawn from that end
      el.style.transformOrigin = MARK_START[topic.sentiment];
      animate(el, { scale: w.fromScale }, { duration: 0 });
      animate(el, { scale: [w.fromScale, 1] }, { ...w.bounce, delay: w.popAtS });
      if (shaft) animateTrim(shaft, [0, 0], [1, 0], { duration: d.shaftS, delay: w.atS, ease: w.drawEase });
      arms.forEach((q) => animateTrim(q, [0, 0], [1, 0], { duration: d.armsS, delay: w.atS + d.armsAtS, ease: w.drawEase }));
      if (tilde) animateTrim(tilde, [0, 0], [1, 0], { duration: d.tildeS, delay: w.atS, ease: w.drawEase });
      return;
    }
    if (entered) revealIn(el);
  }, [entered, intro, reduce, markScope, revealIn, topic.sentiment]);

  const [scope, animateRows] = useAnimate<HTMLDivElement>();
  // a topic not seen yet: the skeleton stays a little longer than the swap's hold (mock fetch)
  const [ready, setReady] = useState(loaded);
  useEffect(() => {
    if (ready) return;
    const t = window.setTimeout(
      () => {
        setReady(true);
        onLoaded(topic.label);
      },
      LOAD_MIN_MS + Math.random() * (LOAD_MAX_MS - LOAD_MIN_MS),
    );
    return () => window.clearTimeout(t);
  }, [ready, onLoaded, topic.label]);

  // reviews in: they rise in, one after another
  useEffect(() => {
    if (!ready || reduce || !scope.current) return;
    const rows = Array.from(scope.current.querySelectorAll<HTMLElement>('[data-row]'));
    rows.forEach((row, i) =>
      animateRows(
        row,
        { opacity: [0, 1], y: [12, 0] },
        { y: { ...noonSpring.card, delay: i * noonStagger.in }, opacity: { duration: 0.24, ease: noonEase.fadeIn, delay: i * noonStagger.in } },
      ),
    );
  }, [ready, reduce, animateRows, scope]);

  return (
    // the whole topic scrolls — sentiment, quote and reviews together
    <article className={`nk-scroll ${styles.topic}`}>
      <div className={styles.topicHead}>
        <div className={styles.sentiment} data-sentiment={topic.sentiment} style={{ color: headColor[topic.sentiment] }}>
          {/* the mark's MARK_PX slot; drawn as strokes (MARK_STROKES) so it can draw on with a trim path */}
          <span className={styles.mark}>
            {/* the wrapper the slide's offset is applied to, so it never competes with the mark's own scale */}
            <span className={styles.markSlide}>
              <span ref={markScope} className={styles.markIcon} style={reduce || !intro ? undefined : MARK_HIDDEN}>
                {topic.sentiment === 'neutral' ? (
                  <svg width={MARK_PX} height={MARK_PX} viewBox="0 0 18 18" fill="none" aria-hidden>
                    <path
                      data-part="tilde"
                      d={MARK_STROKES.tilde.d}
                      stroke={headColor.neutral}
                      strokeWidth={MARK_STROKES.tilde.width}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <svg
                    width={MARK_PX}
                    height={MARK_PX}
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden
                    stroke={headColor[topic.sentiment]}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path data-part="shaft" d={MARK_STROKES[topic.sentiment].shaft} />
                    {MARK_STROKES[topic.sentiment].arms.map((d) => (
                      <path key={d} data-part="arm" d={d} />
                    ))}
                  </svg>
                )}
              </span>
            </span>
          </span>
          {/* hidden until the mark slides away from it — on a plain span, so renders never re-apply it */}
          <span className={styles.titleBox} data-reveal-title style={intro && !reduce ? REVEAL_HIDDEN : undefined}>
            {sfCopy.reviews.sentiment[topic.sentiment](topic.label)}
          </span>
        </div>
        <p className={styles.quote}>{topic.quote}</p>
      </div>
      <div ref={scope} className={styles.reviews} aria-busy={!ready || undefined}>
        {!ready &&
          topic.reviews.map((_, i) => (
            // same box as a review card: stars + date, title, two body lines · author
            <div key={`skeleton-${i}`} className={styles.review}>
              <div className={styles.reviewMain}>
                <Skeleton width={128} height={16} radius={radius.r4} />
                <Skeleton width="55%" height={16} radius={radius.r4} />
                <span className={styles.skeletonBody}>
                  <Skeleton height={14} radius={radius.r4} />
                  <Skeleton width="75%" height={14} radius={radius.r4} />
                </span>
              </div>
              <DashedDivider />
              <div className={styles.reviewFoot}>
                <Skeleton width={96} height={14} radius={radius.r4} />
              </div>
            </div>
          ))}
        {ready && topic.reviews.map((r, i) => <ReviewCard key={`${r.title}-${i}`} review={r} reduce={reduce} />)}
      </div>
    </article>
  );
}

/** the mark and the title before the intro (constants, so re-renders never reset what the animation has set) */
const MARK_HIDDEN = { opacity: 0 };
const REVEAL_HIDDEN = { opacity: 0 };

/**
 * Review card (Figma 1421:463): white r16; stars + date and Verified Buy, title, body clamped to two lines with "more";
 * dashed divider; author and the like button. Tapping a truncated review opens it to full height (and back).
 */
/** a review's photos between the small stack and the large row: the noon spring (ζ 0.81, a barely-there 1.3 % settle) */
const PHOTO_SPRING = noonSpring.noon;

function ReviewCard({ review, reduce }: { review: ReviewTopic['reviews'][number]; reduce: boolean }) {
  const [open, setOpen] = useState(false);
  const [truncated, setTruncated] = useState(false);
  const [liked, setLiked] = useState(false);
  const titleRef = useRef<HTMLSpanElement>(null);
  const bodyRef = useRef<HTMLParagraphElement>(null);
  const [textBox, animateText] = useAnimate<HTMLDivElement>();
  const clampedHeight = useRef(0);

  useLayoutEffect(() => {
    const t = titleRef.current;
    const b = bodyRef.current;
    if (t && b) setTruncated(t.scrollWidth > t.clientWidth + 1 || b.scrollHeight > b.clientHeight + 1);
  }, [review]);

  const photos = review.photos;
  /** the photos' state (Figma AI-Tags 1566:109645): the small fanned stack, or the large row. It flips at the start of
   *  a tap, so the photos and the text move together (the text keeps `open` until it has shrunk back) */
  const [bigPhotos, setBigPhotos] = useState(false);
  const photoRow = useRef<HTMLDivElement>(null);

  const toggle = async () => {
    const box = textBox.current;
    if (!truncated && !open && !photos) return;
    if (photos) {
      setBigPhotos(!open);
      // collapsing: bring the scrolled row back to its start on the same spring as the photos
      const row = photoRow.current;
      if (open && row && row.scrollLeft > 0) animate(row.scrollLeft, 0, { ...(reduce ? { duration: 0 } : PHOTO_SPRING), onUpdate: (v: number) => (row.scrollLeft = v) });
    }
    if (!box || reduce || (!truncated && !open)) {
      setOpen((o) => !o);
      return;
    }
    if (!truncated) {
      setOpen(false);
      return;
    }
    const from = box.offsetHeight;
    if (!open) {
      // unclamp, measure the full height, then grow to it from the clamped height (kept to come back to)
      clampedHeight.current = from;
      flushSync(() => setOpen(true));
      box.style.height = 'auto';
      const to = box.offsetHeight;
      box.style.height = `${from}px`;
      await animateText(box, { height: [from, to] }, noonSpring.detail);
      box.style.height = 'auto';
    } else {
      // shrink back to the clamped height, then clamp the text again
      await animateText(box, { height: [from, clampedHeight.current] }, noonSpring.detail);
      flushSync(() => setOpen(false));
      box.style.height = 'auto';
    }
  };

  const expandable = truncated || open || !!photos;
  return (
    // a tap anywhere on the card opens / closes it (the like button keeps its own tap); keyboard focus stays on the body
    <div className={styles.review} data-row data-expandable={expandable || undefined} onClick={toggle}>
      <div
        className={styles.reviewMain}
        role={expandable ? 'button' : undefined}
        tabIndex={expandable ? 0 : undefined}
        aria-expanded={expandable ? open : undefined}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggle();
          }
        }}
      >
        <span className={styles.rating}>
          <span className={styles.stars} aria-label={`Rated ${review.rating} out of 5`}>
            {Array.from({ length: review.rating }).map((_, s) => (
              <OriginIcon key={s} name="star-filled" size={16} color="var(--nk-palette-emerald-green)" />
            ))}
          </span>
          <span className={styles.ago}>• {review.ago}</span>
          <span className={styles.verified}>
            <OriginIcon name="verified" filled size={12} color="var(--nk-palette-emerald-green)" />
            {sfCopy.reviews.verifiedBuy}
          </span>
        </span>
        <div ref={textBox} className={styles.reviewText} data-open={open || undefined}>
          <span ref={titleRef} className={styles.reviewTitle}>
            {review.title}
          </span>
          <p ref={bodyRef} className={styles.reviewBody}>
            {review.body}
            {truncated && !open && (
              <span className={styles.more} aria-hidden>
                {copy.showMore}
              </span>
            )}
            {truncated && open && (
              <span className={styles.less} aria-hidden>
                {' '}
                {sfCopy.reviews.less}
              </span>
            )}
          </p>
        </div>
        {photos && (
          // small: 40 px r8 tiles with a 1.5 px white edge, each 30 px under the one before (the first on top);
          // large: 80 px r16 tiles 6 apart, a row that scrolls out to the card's edge. Every tile springs between the two
          // (size, corner, edge and overlap), the fan opening from its first photo and closing back onto it
          <div ref={photoRow} className={styles.photos} data-big={bigPhotos || undefined}>
            {photos.map((src, i) => {
              const last = i === photos.length - 1;
              return (
                <motion.span
                  key={src}
                  className={styles.photo}
                  style={{ zIndex: photos.length - i }}
                  initial={false}
                  animate={
                    bigPhotos
                      ? { width: 80, height: 80, borderRadius: 16, borderWidth: 0, marginRight: last ? 0 : 6 }
                      : { width: 40, height: 40, borderRadius: 8, borderWidth: 1.5, marginRight: last ? 0 : -30 }
                  }
                  transition={reduce ? { duration: 0 } : { ...PHOTO_SPRING, delay: (bigPhotos ? i : photos.length - 1 - i) * noonStagger.micro }}
                >
                  <img src={src} alt="" draggable={false} />
                </motion.span>
              );
            })}
          </div>
        )}
      </div>
      <DashedDivider />
      <div className={styles.reviewFoot}>
        <span className={styles.author}>{review.name}</span>
        <button
          type="button"
          className={styles.like}
          aria-pressed={liked}
          onClick={(e) => {
            e.stopPropagation();
            haptic('pop');
            setLiked((l) => !l);
          }}
        >
          <OriginIcon name="thumbs-up" filled={liked} size={16} color="var(--nk-color-text-primary)" />
          {review.helpful + (liked ? 1 : 0)}
        </button>
      </div>
    </div>
  );
}
