import { defineFlow } from '../../kit/registry';
import { lazyScreen } from '../../kit/lazyScreen';
import { yellowFridayFlowTokens } from './tokens';

// screens load on demand (only what a page shows is in its first download)
const LandingScreen = lazyScreen(() => import('./screens/LandingScreen'), 'LandingScreen');
const InterestsSheet = lazyScreen(() => import('./screens/InterestsSheet'), 'InterestsSheet');
const RevealScreen = lazyScreen(() => import('./screens/RevealScreen'), 'RevealScreen');
const BuildScreen = lazyScreen(() => import('./screens/BuildScreen'), 'BuildScreen');
const SwapSheet = lazyScreen(() => import('./screens/BuildScreen'), 'SwapSheet');
const PayoffScreen = lazyScreen(() => import('./screens/PayoffScreen'), 'PayoffScreen');

const SRC = 'reference: Yellow Friday personalized shopping brief (yellow_friday_personalized_shopping.md) + Mobbin research in DESIGN.md';

/**
 * Yellow Friday × Orbi: a personalised deal journey instead of a sale catalogue. Orbi, noon's assistant, hosts
 * four acts — we know you → choose your path → the unexpected find → your personal haul — each one a screen that
 * either discovers something relevant, helps a decision, or moves closer to purchase.
 */
export const yellowFridayFlow = defineFlow({
  id: 'yellowFriday',
  title: 'Yellow Friday',
  group: 'Discovery',
  description: 'Personalised Yellow Friday journey hosted by Orbi: a signal-led hook, one interest question, picks revealed one at a time with their reason, a budget-aware bundle builder and the lineup payoff with a real saving and a bonus.',
  initial: 'landing',
  parent: 'home/home',
  tokens: yellowFridayFlowTokens,
  preload: ['pdp/detail', 'cart/cart'],
  screens: [
    {
      id: 'landing',
      title: 'Your Yellow Friday, decoded',
      component: LandingScreen,
      path: ['yellow-friday', 'yf'],
      notes: 'Orbi greets you with the signal the picks come from ("Based on iPhone 17 Pro · Not me?") and a refresh countdown. "Discover my deals" asks the one interest question; "Skip to my picks" goes straight to the reveal. Below: why these picks (the three signals) and the picks rail at Yellow Friday prices.',
      source: SRC,
      truth: 'reference',
    },
    {
      id: 'interests',
      title: 'What are you into lately?',
      component: InterestsSheet,
      presentation: 'sheet',
      notes: 'Six interest cards, up to two selected; "Tech upgrades" is pre-selected from the signals so one tap confirms. "Show my picks" closes the sheet and opens the reveal.',
      source: SRC,
      truth: 'reference',
    },
    {
      id: 'reveal',
      title: 'We connected the dots',
      component: RevealScreen,
      notes: 'One pick at a time with its reason chip and what it fits. Swipe right / tap the heart to save, swipe left / tap × to skip, "Watch price" keeps a skipped pick on Orbi’s list (toast). The tray totals the saved picks; "Build my find" continues. Tap a card for its PDP.',
      source: SRC,
      truth: 'reference',
    },
    {
      id: 'build',
      title: 'Make it yours',
      component: BuildScreen,
      notes: 'Budget segment (the line under it says over / within). Rows: Swap (sheet with alternatives), × to drop. "Surprise me" swaps one pick for a better-value match. "Complete the set" adds the next pick. The footer total, reference and saving update live.',
      source: SRC,
      truth: 'reference',
    },
    {
      id: 'swap',
      title: 'Swap this pick',
      component: SwapSheet,
      presentation: 'sheet',
      defaultParams: { pickId: 'home-airpods-pro-2' },
      notes: 'The pick and its comparable alternatives as radio rows; "Use this one" swaps it in the lineup (Undo on the row restores the original).',
      source: SRC,
      truth: 'reference',
    },
    {
      id: 'payoff',
      title: 'Your Yellow Friday lineup is ready',
      component: PayoffScreen,
      transition: 'fade-up',
      notes: 'Confetti, the haul card (picks, total counting up, reference price, the saving), the bonus card (free express delivery at three picks, progress until then), share the lineup, then "Add all to cart" (toast with View cart) or "Save picks for later" (wishlist).',
      source: SRC,
      truth: 'reference',
    },
  ],
});
