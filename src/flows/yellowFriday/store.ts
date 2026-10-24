import { createStore } from '../../kit/createStore';
import { alternatives, picks, type Budget, type Pick } from './data';

/** Journey state shared by the landing, the sheets and the pushed screens (separate stack entries). */
export interface YellowFridayState {
  interests: string[];
  /** index of the pick on top of the reveal stack */
  index: number;
  /** pick ids the customer saved, in order */
  saved: string[];
  skipped: string[];
  /** skipped picks Orbi is watching for a price drop */
  watched: string[];
  budget: Budget;
  /** pick id → the alternative that replaced it */
  swaps: Record<string, string>;
}

const initial: YellowFridayState = { interests: ['tech'], index: 0, saved: [], skipped: [], watched: [], budget: 'u600', swaps: {} };

export const yfStore = createStore<YellowFridayState>(initial);

export const resetJourney = () => yfStore.set(initial);

export const toggleInterest = (id: string) =>
  yfStore.patch((s) => {
    if (s.interests.includes(id)) return { interests: s.interests.filter((x) => x !== id) };
    if (s.interests.length >= 2) return { interests: [s.interests[1], id] };
    return { interests: [...s.interests, id] };
  });

export const savePick = (id: string) => yfStore.patch((s) => ({ saved: s.saved.includes(id) ? s.saved : [...s.saved, id], index: s.index + 1 }));
export const skipPick = (id: string) => yfStore.patch((s) => ({ skipped: [...s.skipped, id], index: s.index + 1 }));
export const watchPick = (id: string) => yfStore.patch((s) => ({ watched: s.watched.includes(id) ? s.watched : [...s.watched, id] }));
export const removePick = (id: string) => yfStore.patch((s) => ({ saved: s.saved.filter((x) => x !== id) }));
export const addPick = (id: string) => yfStore.patch((s) => ({ saved: s.saved.includes(id) ? s.saved : [...s.saved, id], skipped: s.skipped.filter((x) => x !== id) }));
export const setBudget = (budget: Budget) => yfStore.patch({ budget });
export const swapPick = (pickId: string, altId: string | null) =>
  yfStore.patch((s) => {
    const swaps = { ...s.swaps };
    if (altId) swaps[pickId] = altId;
    else delete swaps[pickId];
    return { swaps };
  });

/** The pick as it stands in the lineup: the original, or the alternative it was swapped for. */
export const resolvePick = (pickId: string, swaps: Record<string, string>): Pick => {
  const base = picks.find((p) => p.id === pickId)!;
  const altId = swaps[pickId];
  return (altId && alternatives[pickId]?.find((a) => a.id === altId)) || base;
};

export const lineup = (s: YellowFridayState) => s.saved.map((id) => ({ pickId: id, pick: resolvePick(id, s.swaps) }));
export const lineupTotals = (s: YellowFridayState) => {
  const items = lineup(s);
  const total = items.reduce((n, i) => n + i.pick.yf, 0);
  const reference = items.reduce((n, i) => n + i.pick.ref, 0);
  return { items, total, reference, saving: reference - total };
};

/**
 * `?seed=demo` on a pushed screen opened directly (playground, screenshots, the Figma capture): a journey already in
 * progress — the first three picks saved, the reveal on its third card. Idempotent; never touches a live journey.
 */
export const seedFromParams = (params: Record<string, unknown>) => {
  if (params.seed !== 'demo') return;
  const s = yfStore.get();
  if (s.saved.length) return;
  yfStore.set({ ...initial, saved: picks.slice(0, 3).map((p) => p.id), index: 2 });
};
