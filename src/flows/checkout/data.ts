import { currency, user } from '../../mocks/products';

/**
 * Shared checkout mock content. Strings come from bappzaar origin/master translations
 * (marketplaces/noon/locale/translations/noon-en.json, src/locale/translations/en.json,
 * features/payment/locale/translations/payment-en.json). Session copy that the API sends
 * (promise messages, payment method names, invoice rows) is marked `server:` — it is not in the
 * translation files, so it mirrors what the live checkout API returns.
 *
 * Area-specific copy lives next to it: data.payment.ts, data.delivery.ts, data.rewards.ts, data.postorder.ts.
 */

/** PaymentMethods (src/constants/CheckoutStates.ts) */
export type PaymentCode = 'cc_noonpay' | 'cod' | 'apple_pay' | 'tabby' | 'tamara' | 'nopayment';

export type CardType = 'VISA' | 'MASTERCARD' | 'AMEX' | 'MADA';

/** NoonCheckoutPaymentMethodCardType (+ EMI plans) */
export interface CheckoutEmiPlan {
  id: string;
  bank: string;
  tenure: string;
  fee: string;
  installment: string;
  isDisabled?: boolean;
  disabledMessage?: string;
}

export interface CheckoutCard {
  id: number;
  type: CardType;
  /** last 4 */
  mask: string;
  expiry: string; // MM/YY
  nickname: string | null;
  holder?: string;
  isDefault?: boolean;
  /** NoonCheckoutPaymentCard `infoMessage` (html: <highlight>, <green>, <red>, <orange>) */
  infoMessage?: string | null;
  emiCalloutMessage?: string;
  emiPlans?: CheckoutEmiPlan[];
}

export const initialCards: CheckoutCard[] = [
  { id: 9101, type: 'VISA', mask: '4242', expiry: '08/28', nickname: 'Personal', holder: `${user.firstName} ${user.lastName}`, isDefault: true, infoMessage: null },
  { id: 9102, type: 'MASTERCARD', mask: '5100', expiry: '11/27', nickname: null, holder: `${user.firstName} ${user.lastName}`, infoMessage: null },
];

/** demo: a card with this last-4 makes the payment fail (NoonCheckoutPaymentFailureScreen). */
export const FAILING_CARD_LAST4 = '0002';

/** shared translations */
export const t = {
  noon_checkout_header: 'Checkout',
  noon_take_action: 'Take Action',
  noon_checkout_shipment_number: (n: number) => `Shipment ${n}`,
  /** en.json "item" plural */
  item: (count: number) => (count === 1 ? `${count} Item` : `${count} Items`),
  noon_checkout_slide_to_order: 'Slide to Order',
  noon_place_order_button: 'Place Order',
  noon_checkout_enter_cvv_cta: 'Enter CVV',
  noon_checkout_select_payment_method_cta: 'Select Payment',
  noon_free: 'FREE',
  noon_checkout_not_returnable: 'non-returnable',
  noon_checkout_installation_callout: 'Other available slots',
  noon_address_v2_changed_default_address_toast_message: 'Address updated',
  noon_other_label: 'Other',
  order_summary: 'Order Summary',
  subtotal: 'Subtotal',
  shipping: 'Shipping Fee',
  total: 'Total',
  vat_message: '(Incl. VAT)',
  noon_credits: 'noon Credits',
  today: 'Today',
  tomorrow: 'Tomorrow',
} as const;

export const ORDER_ID_PREFIX = 'NAEH';
export const makeOrderId = () => `${ORDER_ID_PREFIX}${Math.floor(10000000 + Math.random() * 89999999)}`;

/** whoami wallet balance */
export const walletAmount = user.credits;

/* ───────────────────────── Figma "🚧 Checkout 2.0" copy (zURu7GI7sq77fjdXKrouvo · 14288:183972) ───────────────────────── */

/** UI labels as shown in the Figma frame (FIGMA-MAPPING.md). Data (items, prices, totals) stays cart-driven. */
export const tf = {
  deliveringTo: (label: string) => `Delivering to ${label}`,
  shipment: (n: number) => `Shipment ${n}`,
  getIt: 'Get it',
  extendedWarranty: (price: string) => `With extended warranty of ${price}`,
  comboItem: 'Combo item',
  discount: (amount: string) => `Discount ${amount}`,
  percentOff: (pct: number) => `${pct}% OFF`,
  qtyX: 'x',
  pointsTitle: 'Points & Vouchers',
  pointsSubtitle: 'Need credits? Top up now!',
  linkedAccount: (phone: string) => `${phone} linked account`,
  newBadge: 'NEW',
  payWith: 'Pay With',
  useCredits: 'Use my',
  noonCredits: 'noon credits',
  coverRemaining: 'Select another method to cover the remaining',
  creditsSufficient: 'Your credits balance is sufficient for the order',
  addChange: 'Add/Change',
  addNew: 'Add New',
  installmentsAvailable: 'Installments Available',
  perMonth: '/mo',
  selectInstallment: 'Select an installment starting',
  selectedPlan: (installment: string, tenure: string) => `Selected plan: ${installment}/mo for ${tenure}`,
  applyNow: 'Apply Now',
  cvv: 'CVV',
  paymentSummary: 'Payment summary',
  subtotal: 'Subtotal',
  deliveryFee: 'Delivery fee',
  freeWith: 'Free with',
  free: 'Free',
  couponDiscount: 'Coupon discount',
  total: 'Total',
  aedPrefix: currency, // dirham sign (U+E001, Noontree) — was 'AED'
  couponCashback: 'Coupon Cashback',
  noonOneCardCashback: 'noon one credit card',
  cashbackInfo: 'cashback will be credited to the primary cardholder’s account',
} as const;

/** demo: products sold as part of a combo (Figma "Combo item" chip). */
export const COMBO_PRODUCT_IDS = ['p1', 'p6'];

/**
 * demo (server-side on the live API): cashback estimates for the Figma savings strip and the noon One
 * Credit Card upsell row — derived from the live totals so they move with the cart.
 */
export const cashback = {
  /** coupon cashback = 2% of the subtotal, only while a coupon is applied */
  coupon: (subtotal: number, hasCoupon: boolean) => (hasCoupon ? Math.round(subtotal * 0.02) : 0),
  /** noon One Credit Card cashback = 5% of what the card would be charged */
  noonOneCard: (orderPaymentAmount: number) => Math.round(orderPaymentAmount * 0.05 * 100) / 100,
};
