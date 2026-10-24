import { getProduct, user, type Product } from '../../data';

/**
 * Copy and the personalisation fixtures for the Yellow Friday journey. The engine behind it (signals → ranked picks)
 * is mocked here as one persona: the brief's "Rahul, the tech upgrader", played by the demo user.
 */
export type Budget = 'u300' | 'u600' | 'none';

export interface Interest {
  id: string;
  emoji: string;
  label: string;
}

export interface Pick {
  /** product id in src/data */
  id: string;
  /** Yellow Friday price */
  yf: number;
  /** the reference price the saving is measured against (today's noon price) */
  ref: number;
  /** why it is shown, in one line — every pick has one */
  reason: string;
  /** what it works with, from the known device (signal 1) */
  compat: string;
  /** the interest cluster it belongs to */
  interest: string;
}

export const copy = {
  eyebrow: 'Your Yellow Friday, decoded',
  hello: `Hey ${user.firstName}, your next great find starts here.`,
  sub: "You've been upgrading your everyday tech. Let's find what makes it even better.",
  cta: 'Discover my deals',
  skip: 'Skip to my picks',
  refresh: 'Picks refresh in',
  basedOn: 'Based on',
  notMe: 'Not me?',
  signalsTitle: 'Why these picks',
  railTitle: 'Picked for you',
  interestsTitle: 'What are you into lately?',
  interestsSub: 'We guessed one from your recent buys. Keep it, change it, or add one more.',
  interestsHint: 'Pick up to two',
  interestsCta: 'Show my picks',
  revealTitle: 'We connected the dots',
  revealBubble: 'Your new phone deserves these. Save what you like, skip the rest.',
  revealEmpty: "That's all five. Build your find from what you saved.",
  save: 'Save',
  skipPick: 'Skip',
  watch: 'Watch price',
  watched: "Orbi's watching it. You'll hear when the price drops.",
  buildTitle: 'Make it yours',
  buildSub: 'Add, swap or drop. The total and your real saving update as you go.',
  surprise: 'Surprise me',
  surprised: 'Swapped one pick for a better-value match.',
  surpriseNone: 'Already the best value in your budget.',
  complete: 'Complete the set',
  review: 'Review my lineup',
  payoffTitle: 'Your Yellow Friday lineup is ready',
  payoffSub: 'Every pick has a reason. Every saving is against today’s noon price.',
  reference: 'Reference price',
  bonusTag: 'Bonus unlocked',
  bonusTitle: 'Free express delivery on this lineup',
  bonusProgress: (n: number, of: number) => `${n} of ${of} picks · ${of - n} more for free express delivery`,
  bonusDone: 'Qualifies for bundle shipping',
  share: 'Share my lineup',
  shared: 'Lineup link copied. Share it with a friend.',
  addAll: 'Add all to cart',
  added: 'Your lineup is in the cart.',
  saveLater: 'Save picks for later',
  savedLater: 'Saved to your wishlist. Prices hold till Sunday.',
};

/** The bought device the journey starts from (signal 1). */
export const boughtId = 'N70211681V';
export const boughtLabel = 'iPhone 17 Pro · 12 days ago';
export const deviceName = 'iPhone 17 Pro';

export const interests: Interest[] = [
  { id: 'tech', emoji: '📱', label: 'Tech upgrades' },
  { id: 'fitness', emoji: '🏋️', label: 'Fitness' },
  { id: 'creator', emoji: '🎙️', label: 'Creator setup' },
  { id: 'home', emoji: '🏠', label: 'Home essentials' },
  { id: 'travel', emoji: '✈️', label: 'Travel' },
  { id: 'beauty', emoji: '💄', label: 'Beauty' },
];

/** The signals the picks are built from, shown to the customer (the brief: personalisation is visible). */
export const signals = [
  { icon: 'package' as const, title: 'What you bought', body: `${deviceName}, 12 days ago` },
  { icon: 'search' as const, title: 'What you keep exploring', body: 'Earbuds and chargers, 3 visits this week' },
  { icon: 'zap' as const, title: 'What you might need next', body: 'Protection and power, the first-fortnight buys' },
];

/** Five high-confidence picks (phase 1 of the brief: three to five). Order = rank. */
export const picks: Pick[] = [
  { id: 'Z4E7C13D1C7101937B8CEZ', yf: 19, ref: 29, reason: `Because you bought ${deviceName}`, compat: `Fits ${deviceName}`, interest: 'tech' },
  { id: 'ZF1A24406870D3964331CZ', yf: 79, ref: 109.99, reason: 'Phone buyers add this within two weeks', compat: `Fits ${deviceName}`, interest: 'tech' },
  { id: 'home-airpods-pro-2', yf: 749, ref: 899, reason: 'You looked at earbuds three times this week', compat: `Pairs with ${deviceName}`, interest: 'tech' },
  { id: 'p11', yf: 29, ref: 39, reason: 'Completes your charging setup', compat: 'USB-C · 100W', interest: 'tech' },
  { id: 'Z49C27F88DD3370F190CAZ', yf: 1399, ref: 1729, reason: 'Top pick for tech upgraders this week', compat: `Pairs with ${deviceName}`, interest: 'creator' },
];

/** Comparable alternatives a pick can be swapped for (same job, different price point). */
export const alternatives: Record<string, Pick[]> = {
  Z4E7C13D1C7101937B8CEZ: [{ id: 'Z7D7DFFC169EA7DE817A2Z', yf: 17, ref: 24.94, reason: 'Same fit, lighter finish', compat: `Fits ${deviceName}`, interest: 'tech' }],
  'home-airpods-pro-2': [{ id: 'p1', yf: 699, ref: 799, reason: 'Last generation, same noise cancelling', compat: `Pairs with ${deviceName}`, interest: 'tech' }],
  Z49C27F88DD3370F190CAZ: [{ id: 'home-airpods-pro-2', yf: 749, ref: 899, reason: 'In-ear, half the price', compat: `Pairs with ${deviceName}`, interest: 'tech' }],
};

export const productOf = (p: Pick): Product => getProduct(p.id) ?? ({ id: p.id, brand: 'noon', title: p.id, price: p.ref, rating: 0, ratingCount: 0, emoji: '🛍️', tint: 'var(--nk-color-bg-muted)', delivery: '', category: '' } as Product);

export const savingOf = (p: Pick) => Math.max(0, p.ref - p.yf);
