import { createStore } from '../../kit/createStore';

/**
 * How the review-topic chips under the AI summary ask to be tapped when the section scrolls into view. Off by default
 * (decided 2026-10-26); the other variants stay testable with `?chipHint=populate|pulse`, which also shows the
 * floating ChipHintSwitcher:
 * - `populate`: the chips start hidden and scale in one after another
 * - `pulse`: the chips are already there and scale up and back down, one after another (overlapping)
 * - `off`: no hint
 */
export type ChipHint = 'populate' | 'pulse' | 'off';

const KEY = 'nk-pdp-chip-hint';

const isHint = (v: string | null): v is ChipHint => v === 'populate' || v === 'pulse' || v === 'off';

/** the URL param (if any) and the hint to start with: off unless the param asks for one */
function initial(): { hint: ChipHint; testing: boolean } {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get('chipHint');
    if (isHint(fromUrl)) return { hint: fromUrl, testing: true };
    if (fromUrl !== null) {
      // ?chipHint (any value) opens the test control on the last variant picked there
      const saved = window.localStorage.getItem(KEY);
      return { hint: isHint(saved) ? saved : 'off', testing: true };
    }
  } catch {
    // storage blocked (private mode, previews): fall back to the default
  }
  return { hint: 'off', testing: false };
}

const start = initial();

/** `replay` bumps to play the hint again on chips already in view; `testing` shows the switcher */
export const chipHintStore = createStore<{ hint: ChipHint; replay: number; testing: boolean }>({ hint: start.hint, replay: 0, testing: start.testing });

export function setChipHint(hint: ChipHint) {
  chipHintStore.patch((s) => ({ hint, replay: s.replay + 1 }));
  try {
    window.localStorage.setItem(KEY, hint);
  } catch {
    // not persisted; the toggle still works for this session
  }
}

export const replayChipHint = () => chipHintStore.patch((s) => ({ replay: s.replay + 1 }));

/**
 * What the review-topics sheet's sentiment mark does on a chip switch (the sheet's opening always plays the full intro).
 * Pick with the sheet's floating "Chip switch" control or `?switch=draw|intro`:
 * - `draw`: the mark draws on in place (trim path) with a small bounce as the new topic fades in
 * - `intro`: the same motion as opening the sheet — the mark pops in at the line's centre, slides to its slot and the
 *   title is uncovered behind it
 */
export type SwitchMotion = 'draw' | 'intro';

const SWITCH_KEY = 'nk-pdp-switch-motion';
const isSwitch = (v: string | null): v is SwitchMotion => v === 'draw' || v === 'intro';

function initialSwitch(): SwitchMotion {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get('switch');
    if (isSwitch(fromUrl)) return fromUrl;
    const saved = window.localStorage.getItem(SWITCH_KEY);
    if (isSwitch(saved)) return saved;
  } catch {
    // storage blocked: fall back to the default
  }
  return 'draw';
}

export const switchMotionStore = createStore<{ mode: SwitchMotion }>({ mode: initialSwitch() });

export function setSwitchMotion(mode: SwitchMotion) {
  switchMotionStore.patch(() => ({ mode }));
  try {
    window.localStorage.setItem(SWITCH_KEY, mode);
  } catch {
    // not persisted; the toggle still works for this session
  }
}
