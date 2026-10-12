import type { ScreenDef } from '../../kit/types';
import { lazyScreen } from '../../kit/lazyScreen';

const LandingScreen = lazyScreen(() => import('./screens/LandingScreen'), 'LandingScreen');

const V = 'features/vip';
const SRC = `${V}/screens/VIPLandingScreen (+ ${V}/components/VIPModules/{VIPBannerModule, VIPMarketplaceBenefitsCarouselModule, VIPBenefitsModule, VIPFamilyPlanModule, VIPGuideStepsModule, VIPExpandableTextModule, VIPMembershipOverviewModule, VIPSavingsOverviewModule}, VIPSubscriptionButtonV2, VIPButton, VIPDashedBorder, VIPSlider, VIPPlanMembers, VIPStatusIndicator, VIPSkeletonLoader, VIPTransitionAnim)`;

/** landing screens — owned by the landing area (see MAPPING.md). */
export const landingScreens: ScreenDef[] = [
  {
    id: 'landing',
    title: 'noon One',
    component: LandingScreen,
    path: ['noon-one', 'noonvip'],
    statusBar: 'dark',
    source: SRC,
    notes:
      'Shimmer lottie (VIPSkeletonLoader) while landingV2 loads, then the CMS modules: lottie hero banner, marketplace benefits carousel (autoplays every 3.5s, swipe it), benefits, family plan card → Family plans, how-it-works steps, FAQ (tap to expand) and payment terms. Scroll: header fades in white with "noon One". Sticky footer: coupon flyout (tap copies the code), "Start free trial" — first tap opens the plan-details sheet, after that it quick-subscribes with the saved card ("Pay with ••••4242" row → payment screen) — and the dotted "View all plans" link. After subscribing the success animation plays and the landing switches to the member view (membership overview + savings; manage → membership/manage).',
  },
  {
    id: 'success',
    title: 'Subscribed (success animation)',
    component: LandingScreen,
    defaultParams: { demo: 'success' },
    statusBar: 'dark',
    source: `${V}/components/VIPTransitionAnim (VIPLandingScreen VIPEventEmitter.onVipMembershipChanged → showSuccessAnimation), ${V}/components/VIPModules/VIPMembershipOverviewModule, VIPSavingsOverviewModule`,
    notes:
      'Subscribes the demo user (monthly, 30-day trial) and plays vip-landing-success-animation: "Welcome to noon One" / trial copy rise in at 70% / 72.5% of 4s, the overlay fades, the member landing springs back up. Every noon One entry point now shows its subscribed state.',
  },
];
