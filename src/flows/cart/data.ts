/**
 * Cart copy + mock "server" content.
 *
 * Static UI strings are copied from origin/master translations (noon-en.json / en.json); the key is noted
 * next to each. Everything in `cartItemExtras`, payment callouts, updates and group colours is what the
 * cart API returns on master (HTML messages rendered via <HtmlView>) — those strings are NOT in the
 * translation files, so they are authored here to match the shapes in marketplaces/noon/types/NoonCartType.ts.
 */
import cashbackIcon from '../../assets/cart/cashback-icon.webp';
import mastercardIcon from '../../assets/shared/payment/card-mastercard.webp';
import noonOneIcon from '../../assets/noonone/entry/noon-one.webp';
import fouponIcon from '../../assets/cart/checkout-foupon.webp';
import type { CartGroupType } from '../../kit/DemoStore';

export const t = {
  couponTitle: 'Got a coupon?', // noon_coupon_input_title
  couponPlaceholder: 'Enter your coupon code here', // noon_coupon_input_placeholder
  apply: 'APPLY', // noon_apply
  remove: 'Remove', // noon_remove
  availableOffers: 'View available coupons & offers', // noon_view_more_available_offers
  cartUpdated: 'Your cart’s been updated', // noon_cart_updated_message
  cartUpdatedAction: 'Tap to review', // noon_cart_updated_action
  cartUpdatesTitle: 'Cart Updates', // noon_cart_updates_header_title
  emptyHeader: 'Your cart is empty', // noon_empty_cart_header
  emptyMessage: 'Be sure to fill your cart with something you like', // noon_empty_cart_message
  checkout: 'Checkout', // noon_checkout
  selectItems: 'Select items', // noon_select_items
  add: 'Add', // noon_add
  text: 'Text', // noon_text
  edit: 'Edit', // noon_edit
  customSaved: 'Changes have been saved successfully', // noon_product_custom_save_toast_msg
  movedToPrefix: 'Item moved to ', // noon_wishlist_v2_item_moved_to_prefix
  wishlist: 'Wishlist', // noon_wishlist
  discountDetails: 'Discount Details', // noon_discount_details
  applied: 'Applied', // noon_applied
  applyCommon: 'Apply', // noon_apply_common
  copied: 'Copied!', // noon_cart_v2_copied
  copyCode: 'Copy Code', // noon_copy_coupon_code
  eligibleItems: 'Eligible items for this discount', // noon_cart_v2_discount_eligible_items
  viewAll: 'View all', // noon_view_all
  paymentOffers: 'Payment offers', // noon_cart_callouts_section_title
  orderSummary: 'Order Summary', // noon_order_summary
  subtotal: 'Subtotal', // noon_subtotal
  shippingFee: 'Shipping Fee', // shipping (en.json)
  free: 'FREE', // noon_free
  total: 'Total', // total (en.json)
  inclVat: '(Incl. VAT)', // vat_message (en.json)
  recommended: 'Customers Also Viewed', // noon_recommended_products_pdp
  bundleTotal: 'Total', // noon_bundle_total
  bundleSaving: 'You are saving', // noon_bundle_you_are_saving
  bundleComboTotal: 'Combo Total', // noon_bundle_combo_total
  findSimilar: 'Find Similar', // noon_find_similar
  // Figma Cart 2.0 sections the master cart has no copy for (kit mock copy)
  noonOneLead: 'Save with noon One.',
  noonOneBody: 'Try it now for',
  noonOneCta: 'Free',
  offersTitle: 'Don’t miss out on these offers',
  sponsored: 'Sponsored',
  wishlistTitle: 'From your wishlist',
  freeGiftsTitle: 'Free gifts for you',
  leftToUnlock: 'left to unlock',
};

/** NoonCartResponseCouponType.message / .error (server HTML) for the evaluated coupon */
export function couponFeedback(state: { code: string; state: 'success' | 'invalid'; amount: number } | null | undefined, currency: string, fmt: (n: number) => string): { tone: 'success' | 'error'; html: string } | null {
  if (!state) return null;
  return state.state === 'success'
    ? { tone: 'success', html: `Coupon applied! You saved <b>${currency} ${fmt(state.amount)}</b>` }
    : { tone: 'error', html: `The coupon code <b>${state.code}</b> is not valid. Please check the code and try again` };
}

/* ───────────────────────── server-shaped types ───────────────────────── */

export type CalloutAction = 'variants_switch' | 'vbundle' | 'ew' | 'remove_ew' | 'cms' | 'webview';

/** NoonSalesCalloutType (marketplaces/noon/types/NoonSalesType.ts) */
export interface SalesCallout {
  message: string;
  icon?: { url: string; isLeft?: boolean } | null;
  background?: { colors?: string[]; border?: string; underline?: string } | null;
  button?: {
    type: 'hyperlink' | 'icon' | 'message';
    action: CalloutAction;
    message?: string;
    icon?: { url: string; isLeft?: boolean };
    position?: 'nl' | null;
    params?: Record<string, string>;
  } | null;
  /** callout deeplink (handleDeepLink) — '/noon-one' opens the noon One landing; hidden for members (server stops sending it) */
  link?: string;
}

/** NoonCartDiscountTagType */
export interface DiscountTag {
  id: string;
  code: string;
  tag: string;
  title: string;
  terms: string[];
  showButton: boolean;
  /** catalog url for "Eligible items" (null = no product widget) */
  url: string | null;
  productsLimit: number | null;
  /** demo: which kit products appear in the eligible-items carousel */
  eligibleProductIds?: string[];
}

/** NoonCartItemType extras the cart API returns per offer */
export interface CartItemExtras {
  catalogTag?: string;
  deliveryInfo?: { icon?: 'express' | null; message: string; expiryMessage?: string; colors?: string[] };
  callouts?: SalesCallout[];
  bottomCallouts?: SalesCallout[];
  discountTags?: DiscountTag[];
  usps?: string[];
  /** Figma "USPs Urgency" pill (e.g. "Lowest Price in 30 days") */
  urgency?: string;
  /** Figma "item points" row (warranty / returns / payment / delivery attributes) */
  points?: ItemPointKind[];
  specifications?: string[];
  notes?: string[];
  foupon?: { message: string; appliedMessage: string };
  /** NoonCartCustomizationAnswerType questions offered by the customize overlay */
  customizationQuestions?: Array<{ code: string; question: string; placeholder: string; charLimit: number }>;
  quantityMax?: number;
}

export type ItemPointKind = 'warranty' | 'nonReturnable' | 'refund' | 'prepaid' | 'fasterDelivery';
/** Figma Cart 2.0 item-point labels */
export const itemPoints: Record<ItemPointKind, string> = {
  warranty: '1 year warranty',
  nonReturnable: 'non-returnable',
  refund: '2x Refund',
  prepaid: 'Prepaid only',
  fasterDelivery: 'Faster Delivery at checkout',
};

/* ───────────────────────── groups (NoonCartGroup colors / header) ───────────────────────── */

export const groupMeta: Record<CartGroupType, { title: string; serviceMode: string }> = {
  express: { title: 'express', serviceMode: 'express' },
  marketplace: { title: 'market', serviceMode: 'mp' },
  xborder: { title: 'global', serviceMode: 'global' },
};

/** NoonCartGroup callouts (delivery estimate row under the items) */
export const groupCallouts: Record<CartGroupType, string> = {
  express: 'Get it by <highlight>Tomorrow</highlight> if you order in <b>5 hrs 12 mins</b>',
  marketplace: 'Ships from seller warehouses · delivery in <highlight>3-4 days</highlight>',
  xborder: 'Shipped from abroad · delivery in <highlight>6-8 days</highlight>',
};

/** NoonCartGroupProgressBarType.message (server HTML) */
export function progressMessage(remaining: number, currency: string, fmt: (n: number) => string) {
  return remaining > 0
    ? `Add <highlight>${currency} ${fmt(remaining)}</highlight> more to get <b>FREE delivery</b>`
    : `Yay! You get <highlight>FREE delivery</highlight> on this shipment`;
}

/* ───────────────────────── per-item extras ───────────────────────── */

const noon10: DiscountTag = {
  id: 'dt-noon10',
  code: 'NOON10',
  tag: 'Extra 10% off with code NOON10',
  title: 'Get extra 10% off up to  150 on electronics & accessories',
  terms: ['Valid on selected electronics & accessories', 'Maximum discount of  150 per order', 'Cannot be combined with other coupons'],
  showButton: true,
  url: '/electronics-deals',
  productsLimit: 8,
  eligibleProductIds: ['p1', 'p2', 'p5', 'p6', 'p9', 'p11'],
};

const save50: DiscountTag = {
  id: 'dt-save50',
  code: 'SAVE50',
  tag: ' 50 off with code SAVE50',
  title: 'Save  50 on home appliances above  300',
  terms: ['Minimum cart value of  300', 'Valid once per customer'],
  showButton: true,
  url: '/home-appliances',
  productsLimit: 8,
  eligibleProductIds: ['p4', 'p8', 'p10', 'p12'],
};

export const cartItemExtras: Record<string, CartItemExtras> = {
  p1: {
    catalogTag: 'Best Seller',
    deliveryInfo: { icon: 'express', message: 'Get it by <highlight>Tomorrow</highlight>', expiryMessage: '<steel>Order in 5 h 12 m</steel>' },
    discountTags: [noon10],
    urgency: 'Lowest Price in 30 days',
    points: ['refund', 'nonReturnable'],
    customizationQuestions: [{ code: 'engraving', question: 'Engraving text', placeholder: 'Add your text', charLimit: 20 }],
    foupon: { message: '<b>Save  15</b> with this free coupon', appliedMessage: '<highlight> 15 coupon applied</highlight>' },
    quantityMax: 3,
  },
  p6: {
    deliveryInfo: { icon: 'express', message: 'Get it by <highlight>Tomorrow</highlight>', expiryMessage: '<steel>Order in 5 h 12 m</steel>' },
    callouts: [
      {
        message: 'Size: <b>{variant}</b>',
        background: { colors: ['var(--nk-color-bg-pill)'] },
        button: { type: 'icon', action: 'variants_switch', icon: { url: 'chevron' } },
      },
    ],
    discountTags: [noon10],
    urgency: 'Lowest Price in 30 days',
    points: ['warranty', 'nonReturnable', 'prepaid'],
    usps: ['Free returns within 15 days', 'Pay in 4 interest-free payments'],
    quantityMax: 2,
  },
  p8: {
    deliveryInfo: { message: 'Get it by <highlight>Thu, Oct 16</highlight>' },
    callouts: [
      {
        message: '<highlight>Bundle & save  60</highlight>',
        background: { border: 'var(--nk-color-coupon-border)', colors: ['var(--nk-color-coupon-surface)'] },
        button: { type: 'hyperlink', action: 'vbundle', message: 'View' },
      },
    ],
    discountTags: [save50, noon10],
    points: ['prepaid', 'fasterDelivery'],
    specifications: ['Stainless steel', '1350 W', '15 bar pump'],
    bottomCallouts: [
      {
        message: 'Protect it with <b>Extended Warranty</b> from <highlight> 59</highlight>',
        icon: { url: 'shield', isLeft: true },
        background: { colors: ['var(--nk-color-bg-chip)', 'var(--nk-color-bg-surface)'], border: 'var(--nk-color-bg-store-strip)' },
        button: { type: 'hyperlink', action: 'ew', message: 'Add' },
      },
    ],
    quantityMax: 5,
  },
  p11: {
    deliveryInfo: { message: 'Get it by <highlight>Sun, Oct 19</highlight>' },
    urgency: 'Lowest Price in 30 days',
    points: ['warranty', 'nonReturnable', 'prepaid', 'fasterDelivery'],
    notes: ['<steel>Sold by</steel> <b>Global Gadgets</b>'],
    quantityMax: 10,
  },
  p12: {
    deliveryInfo: { message: 'Get it by <highlight>Sun, Oct 19</highlight>' },
    callouts: [
      {
        message: 'Colour: <b>{variant}</b>',
        background: { colors: ['var(--nk-color-bg-pill)'] },
        button: { type: 'icon', action: 'variants_switch', icon: { url: 'chevron' } },
      },
    ],
  },
};

/** Figma "Free gifts for you" (OOS style freebies) — demo freebie unlocked at a cart total (AED) */
export const freeGift = { productId: 'p5', unlockAt: 5000 };

/** NoonCartItemFoupon icon */
export const fouponImage = fouponIcon;

/* ───────────────────────── screen sections ───────────────────────── */

/** NoonCartCalloutsType (order: horizontal) → "Payment offers" */
export const paymentCallouts: SalesCallout[] = [
  { message: 'Get <highlight>10% cashback</highlight> with noon One Mastercard. T&Cs apply', icon: { url: mastercardIcon, isLeft: true }, background: { border: 'var(--nk-color-border)' } },
  { message: 'Earn up to <highlight>5% cashback</highlight> as noon credits on this order', icon: { url: cashbackIcon, isLeft: true }, background: { border: 'var(--nk-color-border)' } },
  { message: 'Join <highlight>noon One</highlight> for free delivery & extra savings', icon: { url: noonOneIcon, isLeft: true }, background: { border: 'var(--nk-color-border)' }, link: '/noon-one' },
];

/** NoonCartUpdateType[] (NoonCartUpdatesOverlayScreen) */
export interface CartUpdate {
  productId: string;
  messages: string[];
  quantity: number;
  alertType: string[];
}
export const cartUpdates: CartUpdate[] = [
  { productId: 'p8', quantity: 1, messages: ['Price decreased from <strike> 949</strike> to <b> 899</b>'], alertType: ['price_drop'] },
  { productId: 'p7', quantity: 1, messages: ['This item is currently <b>out of stock</b> and has been moved to unavailable items'], alertType: ['oos'] },
];

/** NoonCartSecondaryGroupHeaderType for the inactive group */
// server: secondary_groups[inactive].header + isCollapsed / shouldShowToggle (NoonCartSecondaryGroupType)
export const inactiveHeader = { title: 'Unavailable items', titleColor: 'var(--nk-palette-dark-red)', colors: ['var(--nk-color-danger-surface)', 'var(--nk-color-bg-surface)'], isCollapsed: false, shouldShowToggle: true };
export const inactiveCallout = 'Out of stock'; // noon_out_of_stock_item
