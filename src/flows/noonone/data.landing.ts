import familyHeaderLottie from '../../assets/vip/vip-family-plans-header.lottie';
import foodIcon from '../../assets/switcher/food.png';
import minutesIcon from '../../assets/switcher/rocket.png';
import noonIcon from '../../assets/switcher/noon.png';
import instantIcon from '../../assets/switcher/nooninstant-compact.png';
import nownowIcon from '../../assets/switcher/noonnownow.png';
import { user } from '../../mocks/products';
import { CURRENCY } from './data';

/**
 * Landing CMS content — SERVER-DRIVEN on master: VIPService.getVIPTouchpoints('landingV2') → landingV2.cms.data
 * (VIP_* modules), landingV2.buttons / viewPlansButton / flyout / plan / bgImg. No fixtures exist in bappzaar, so
 * these are realistic UAE demo values. Real copy keys (vip-en.json / en.json) are noted inline.
 * Module shapes: features/vip/types/VIPModuleDataTypes.ts.
 */

/** I18n.t('vip_noon_one') */
export const NOON_ONE = 'noon One';

export const landingCopy = {
  /** vip_one_reminder_set */
  reminderSet: "We'll remind you 2 days before your trial ends.",
  /** vip_coupon_code_copied */
  codeCopied: 'Code copied',
  /** vip_gc_pay_with */
  payWith: 'Pay with',
  /** vip_apple_pay */
  applePay: 'Apple Pay',
  /** vip_one_landing_title / vip_one_landing_subtitle (VIPMembershipOverviewModule showDefault) */
  defaultTitle: 'Free Delivery',
  defaultSubtitle: 'On everything, anytime.',
  /** vip_manage_your_membership */
  manageYourMembership: '<b>Manage</b> your membership',
};

/** landingV2.buttons (cta '/create' → VIPSubscriptionButtonV2) + viewPlansButton */
export const stickyButtons = {
  /** title comes from the plan (buttonText) on master: '/create' button.title */
  viewPlans: { title: 'View all plans', cta: '/plan-select' },
};

/** landingV2.flyout (VIPPartnerCalloutType) — coupon variant: tap copies the code, trailing text → "Code copied" */
export const flyout = {
  text: `<p>Extra month free with code <b>ONE2026</b></p>`,
  trailingText: 'Copy code',
  couponCode: 'ONE2026',
  backgroundColor: undefined as string | undefined,
  textColor: 'var(--nk-palette-white)',
};

export interface MpBenefit {
  id: string;
  iconUrl: string;
  title: string;
  subtitle: string;
}

/** VIP_MARKETPLACE_BENEFITS_CAROUSEL_MODULE.mpBenefits (highlighted mp = noon first) */
export const mpBenefits: MpBenefit[] = [
  { id: 'noon', iconUrl: noonIcon, title: 'Free delivery on noon', subtitle: 'On all orders above AED 50, plus extra cashback on top brands' },
  { id: 'rocket', iconUrl: minutesIcon, title: 'Free delivery on Minutes', subtitle: 'Groceries in minutes, with zero delivery fees on orders above AED 25' },
  { id: 'food', iconUrl: foodIcon, title: 'Free delivery on Food', subtitle: 'From your favourite restaurants, with no delivery fee' },
  { id: 'instant', iconUrl: instantIcon, title: 'Free delivery on Instant', subtitle: 'Your daily essentials, delivered free' },
  { id: 'nownow', iconUrl: nownowIcon, title: 'Free delivery on NowNow', subtitle: 'Fast deliveries with no extra fees' },
];

export interface Benefit {
  title: string;
  description: string;
  iconUrl?: string;
  mpIcons?: string[];
  buttonText?: string;
  cta?: string;
}

/** VIP_BENEFITS_MODULE */
export const benefitsModule = {
  moduleHeader: { title: 'Everything you get with noon One' },
  benefits: [
    { title: 'Unlimited free delivery', description: 'Across noon, Minutes and Food with no minimum on most orders', mpIcons: [minutesIcon, foodIcon, noonIcon] },
    { title: 'Extra 5% cashback', description: 'On top brands every day, credited straight to your noon wallet', iconUrl: noonIcon },
    { title: 'Members-only deals', description: 'Early access to sales events and exclusive prices', iconUrl: foodIcon },
    { title: 'Yango Play included', description: 'Stream movies, series and music on selected plans', iconUrl: nownowIcon },
  ] as Benefit[],
};

/** VIP_FAMILY_PLAN_MODULE (non-member: '/view-sharing-plans') */
export const familyPlanModule = {
  title: 'Share noon One with your family',
  subtitle: 'Up to 5 members on one plan',
  members: [{ name: user.firstName }],
  maxNumMembers: 5,
  tags: [
    { text: 'Duo', textColor: 'var(--nk-color-text-body)', backgroundColors: ['var(--nk-palette-white)', 'var(--nk-palette-white)'] },
    { text: 'Family', textColor: 'var(--nk-color-text-body)', backgroundColors: ['var(--nk-palette-white)', 'var(--nk-palette-white)'] },
  ],
  button: { text: 'View family plans', cta: '/view-sharing-plans' },
};

/** VIP_GUIDE_STEPS_MODULE */
export const guideStepsModule = {
  moduleHeader: { title: 'How your free trial works' },
  stepUnit: 'STEP',
  rows: [
    { stepValue: '1', stepTitle: 'Start your 30-day free trial', stepSubtitle: 'Enjoy every benefit right away' },
    { stepValue: '2', stepTitle: "We'll remind you before it ends", stepSubtitle: '2 days before you get charged' },
    { stepValue: '3', stepTitle: `${CURRENCY} 25/month after the trial`, stepSubtitle: 'Cancel anytime from Manage membership' },
  ],
};

/** VIP_EXPANDABLE_TEXT_MODULE (variant grouped, rows start collapsed); title = vip_frequently_asked_questions */
export const faqModule = {
  title: 'Frequently asked questions',
  rows: [
    { header: 'What is noon One?', body: 'noon One is a membership that gives you unlimited free delivery across noon, Minutes and Food, extra cashback and members-only deals.' },
    { header: 'How does the free trial work?', body: "Your 30-day free trial starts as soon as you join. We'll remind you 2 days before it ends, and you can cancel anytime before then at no cost." },
    { header: 'Can I share my membership?', body: 'Yes. With a Duo or Family plan you can invite up to 4 members to enjoy the same benefits.' },
    { header: 'How do I cancel?', body: 'Go to Account → noon One → Manage membership and tap Cancel membership. Your benefits stay active until the end of the billing period.' },
  ],
};

/** VIP_BANNER_MODULE hero — lottie banner (ratio 100) */
export const heroBanner = { lottieUrl: familyHeaderLottie, ratio: 100 };

/**
 * member landing — VIP_MEMBERSHIP_OVERVIEW_MODULE. `lottieUrl` is a server animation drawn around the name (title sits
 * at marginTop −162 inside the 260px box); no URL is known, so the box stays empty (the full-bleed logo lottie
 * covered the name). Set a .lottie here to preview one.
 */
export const membershipOverview = {
  lottieUrl: undefined as string | undefined,
  name: `${user.firstName} ${user.lastName}`,
  message: 'Welcome to noon One',
  status: { trial: '<p><highlight>Free trial</highlight> active</p>', active: '<p><highlight>Active</highlight></p>', highlightColor: 'var(--nk-color-best-price-ink)' },
};

/** member landing — VIP_SAVINGS_BREAKDOWN_MODULE (V1, customerState 'new' → centered potential variant) */
export const savingsModule = {
  title: 'YOUR SAVINGS POTENTIAL',
  savingsText: 'Save up to {multiplier}x',
  savingsMultiplier: '5',
  subtitle: 'the cost of your membership every month',
};

export const fmtDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
