import type { Product } from '../../mocks/products';
import { productImages as img } from './assets';

/**
 * Orders content from the PDS reference (pds-noon-as.vercel.app one-flows → My Orders → "Arriving today"); see
 * MAPPING.md. Ids o3 / o4 / o5 keep their meaning for the returns and reviews flows (o3 delivered + returnable,
 * o4 delivered + return window closed, o5 cancelled).
 */
export type OrderStatus = 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'returned' | 'exchanged';

export interface OrderItem {
  product: Product;
  qty: number;
  price: number;
  /** express pill on the order-summary thumb */
  express?: boolean;
  /** blue installation badge on the thumb (washer) */
  installation?: boolean;
  /** return policy note in the order summary */
  returnPolicy?: 'available' | 'none';
  warranty?: string;
  returnable?: 'open' | 'closed';
  rating?: number;
}

export interface Order {
  id: string;
  number: string;
  status: OrderStatus;
  /** word in the card header ("Ordered", "Delivered", …) */
  statusWord: string;
  /** e.g. "Out for delivery" */
  statusLabel: string;
  /** "April 16, 2026" */
  date: string;
  /** "Arriving today" */
  eta: string;
  items: OrderItem[];
  /** item count shown in the details header ("8 items") */
  itemCount: number;
  /** listing card: count + thumb (the reference card summarises the active shipment) */
  listCount?: number;
  listThumb?: string;
  /** image-stack ring on the details page (left → right, centre card at `stackCentre`) */
  stack?: { image: string; title: string; qty?: number; installation?: boolean }[];
  stackCentre?: number;
  pin?: string;
  /** 0..3 index into trackingSteps */
  step: number;
  stepDates: string[];
  onTime?: boolean;
  window?: string;
  heatWindow?: string;
  marketplace: 'noon' | 'supermall' | 'express';
  rider?: { name: string; deliveries: string };
  address?: { label: string; line: string };
  receiver?: { name: string; phone: string; note: string };
  /** history card extras */
  refundChip?: string;
  warrantyChip?: string;
  refundCredited?: { date: string; card: string };
  /** the exchanged order opens the iPhone 16 review (reviews README "Order kinds") */
  reviewProduct?: 'iphone16';
  total: number;
  paidWith: string;
  bill?: Bill;
}

export interface Bill {
  method: 'applePay';
  methodLabel: string;
  subtotal: number;
  subtotalWas: number;
  delivery: number;
  coupon: number;
  total: number;
  saved: number;
  cashback: number;
  note: string;
}

/** a mock `Product` for an order line (the PDS items are not in src/mocks/products.ts) */
const pds = (id: string, title: string, image: string, price: number): Product => ({
  id,
  brand: '',
  title,
  price,
  rating: 0,
  ratingCount: 0,
  emoji: '📦',
  tint: 'var(--nk-color-bg-subtle)',
  image,
  express: true,
  delivery: '',
  category: 'orders',
});

export const pdsProducts = {
  fridge: pds('pds-fridge', 'Gross 60L/Net 45L Single Door Refrigerator Minibar Fridge RR60D4ASU, Adjustable Thermostat, Big Door Balcony, Separate Chiller, Low Noise RR60D4ASU Silver', img.fridge, 328),
  jaguar: pds('pds-jaguar', 'Classic Black EDT For Men 100ml', img.jaguar, 328),
  washer: pds('pds-washer', 'Samsung 8KG Washer With 6KG Dryer, Eco Bubble, Air Wash, Hygiene Steam With Digital Inverter', img.washer, 23.99),
  bottle: pds('pds-bottle', 'Milton 1000ml Stainless Steel Water Bottle, Single-Walled, BPA-Free, Leak-Proof, Durable', img.bottle, 23.99),
  airpods: pds('pds-airpods-case', 'Samsung 8KG Washer With 6KG Dryer, Eco Bubble, Air Wash, Hygiene Steam With Digital Inverter', img.airpodsCase, 23.99),
  iphone: pds('pds-iphone', 'Apple iPhone 16 128GB Ultramarine 5G With FaceTime - International Version', img.iphone, 23.99),
  storage: pds('pds-storage', 'Generic Household Clothes Storage Bag Quilt Storage Box Moving Bedroom Storage Bag', img.storage, 23.99),
};

export const trackingSteps = [
  { id: 'placed', label: 'Placed', icon: 'check-circle-filled', size: 24 },
  /** taped box / storefront glyphs are not in the Origin set — PDS SVGs, tinted with MaskIcon */
  { id: 'packed', label: 'Packed', art: 'stepPacked', w: 18, h: 18 },
  { id: 'dispatched', label: 'Dispatched', art: 'stepDispatched', w: 21, h: 17 },
  { id: 'delivered', label: 'Delivered', icon: 'location-filled', size: 24 },
] as const;

const DATE = 'April 16, 2026';

export const orders: Order[] = [
  {
    id: 'o1',
    number: '032983823 - 1',
    status: 'out_for_delivery',
    statusWord: 'Ordered',
    statusLabel: 'Out for delivery',
    date: DATE,
    eta: 'Arriving today',
    items: [
      { product: pdsProducts.fridge, qty: 1, price: 328, express: true, returnPolicy: 'available', warranty: '1-year warranty' },
      { product: pdsProducts.jaguar, qty: 1, price: 328, express: true, returnPolicy: 'none' },
    ],
    itemCount: 8,
    listCount: 1,
    listThumb: img.perfumeJaguarSm,
    stack: [
      { image: img.perfumeBlue, title: 'Perfume' },
      { image: img.jaguar, title: 'Classic Black EDT For Men 100ml' },
      { image: img.fridge, title: 'Single Door Refrigerator' },
      { image: img.bottle, title: 'Milton 1000ml Water Bottle' },
      { image: img.airpodsCase, title: 'AirPods Pro 3 case' },
      { image: img.washer, title: 'Samsung 8KG Washer', installation: true },
      { image: img.storage, title: 'Clothes Storage Bag', qty: 2 },
      { image: img.iphone, title: 'Apple iPhone 16' },
    ],
    stackCentre: 2,
    pin: '124500',
    step: 2,
    stepDates: ['Apr 26', 'Apr 28', 'Apr 29', ''],
    onTime: true,
    window: 'Likely to arrive between 1 pm - 6 pm',
    heatWindow: 'Expected today between 11 am - 5 pm',
    marketplace: 'express',
    rider: { name: 'Ahmed M. Mohammed', deliveries: '3,000+ perfect deliveries' },
    address: { label: 'Home', line: '676D, Downtown, Dubai' },
    receiver: { name: 'Anurag', phone: '+971 (0) 412 3456', note: 'Rider will contact this number if needed' },
    total: 50.6,
    paidWith: 'Apple Pay',
    bill: { method: 'applePay', methodLabel: 'Apple Pay', subtotal: 45.6, subtotalWas: 80.6, delivery: 7, coupon: 2, total: 50.6, saved: 2, cashback: 2.53, note: 'Cashback credits to the primary cardholder' },
  },
  {
    id: 'o3',
    number: '032983711 - 1',
    status: 'delivered',
    statusWord: 'Delivered',
    statusLabel: 'Delivered',
    date: DATE,
    eta: 'Delivered on April 16',
    items: [{ product: pdsProducts.washer, qty: 1, price: 23.99, express: true, installation: true, returnable: 'open', returnPolicy: 'available' }],
    itemCount: 1,
    step: 3,
    stepDates: ['Apr 12', 'Apr 13', 'Apr 14', 'Apr 16'],
    marketplace: 'express',
    total: 23.99,
    paidWith: 'Apple Pay',
  },
  {
    id: 'o4',
    number: '032983655 - 1',
    status: 'delivered',
    statusWord: 'Delivered',
    statusLabel: 'Delivered',
    date: DATE,
    eta: 'Delivered on April 16',
    items: [{ product: pdsProducts.bottle, qty: 1, price: 23.99, express: true, returnable: 'closed', returnPolicy: 'none' }],
    itemCount: 1,
    step: 3,
    stepDates: ['Apr 12', 'Apr 13', 'Apr 14', 'Apr 16'],
    marketplace: 'express',
    total: 23.99,
    paidWith: 'Apple Pay',
  },
  {
    id: 'o7',
    number: '032983540 - 1',
    status: 'returned',
    statusWord: 'Return completed',
    statusLabel: 'Return completed',
    date: DATE,
    eta: 'Returned on April 16',
    items: [{ product: pdsProducts.airpods, qty: 1, price: 23.99, express: true }],
    itemCount: 1,
    step: 3,
    stepDates: ['Apr 2', 'Apr 3', 'Apr 4', 'Apr 6'],
    marketplace: 'express',
    refundChip: 'Refund triggered on April 21',
    total: 23.99,
    paidWith: 'Apple Pay',
  },
  {
    id: 'o8',
    number: '032983402 - 1',
    status: 'exchanged',
    statusWord: 'Exchanged',
    statusLabel: 'Exchanged',
    date: DATE,
    eta: 'Exchanged on April 16',
    items: [{ product: pdsProducts.iphone, qty: 1, price: 23.99, express: true, warranty: '1-year warranty' }],
    itemCount: 1,
    step: 3,
    stepDates: ['Apr 2', 'Apr 3', 'Apr 4', 'Apr 6'],
    marketplace: 'express',
    warrantyChip: 'Warranty valid till April 22, 2027',
    reviewProduct: 'iphone16',
    total: 23.99,
    paidWith: 'Apple Pay',
  },
  {
    id: 'o5',
    number: '032981007 - 1',
    status: 'cancelled',
    statusWord: 'Cancelled',
    statusLabel: 'Cancelled',
    date: 'Feb 16, 2026',
    eta: 'Cancelled on Feb 16',
    items: [{ product: pdsProducts.storage, qty: 2, price: 23.99, express: true }],
    itemCount: 2,
    step: 0,
    stepDates: ['Feb 16', '', '', ''],
    marketplace: 'express',
    refundCredited: { date: 'Feb 22, 2026', card: 'XX 5832' },
    total: 47.98,
    paidWith: 'Mastercard XX 5832',
  },
];

export const orderById = (id?: unknown) => orders.find((o) => o.id === id) ?? orders[0];
export const isActive = (o: Order) => o.status === 'processing' || o.status === 'shipped' || o.status === 'out_for_delivery';
export const activeOrders = orders.filter(isActive);
export const historyOrders = orders.filter((o) => !isActive(o));

/** filter chips, left → right as in the reference (Filter opens the full filter sheet — a toast in the demo) */
export const orderFilters = [
  { id: 'delivered', label: 'Delivered' },
  { id: 'cancelled', label: 'Cancelled' },
  { id: 'returns', label: 'Returns' },
  { id: 'supermall', label: 'supermall' },
  { id: 'express', label: 'express' },
] as const;
export type OrderFilter = (typeof orderFilters)[number]['id'] | null;

export const matchesFilter = (o: Order, f: OrderFilter) => {
  if (!f) return true;
  if (f === 'delivered') return o.status === 'delivered' || o.status === 'exchanged';
  if (f === 'cancelled') return o.status === 'cancelled';
  if (f === 'returns') return o.status === 'returned';
  return o.marketplace === f;
};

/** time-window / heat variants of the details hero (reference tabs V1–V4) */
export type HeroVariant = 1 | 2 | 3 | 4;
export const heroVariant = (v: unknown): HeroVariant => {
  const n = Number(String(v ?? '1').replace(/^v/i, ''));
  return n === 2 || n === 3 || n === 4 ? n : 1;
};
export const heatAdvice = { lead: "It'll be very hot this afternoon.", rest: 'Do offer your rider a glass of water.' };

/** 2-decimal amounts ("328.00", "2.53"); whole savings stay whole ("2 saved") */
export const money2 = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const money = (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: 2 });

export const cancelReasons = [
  'I ordered by mistake',
  'Found a better price elsewhere',
  'Delivery is taking too long',
  'I want to change the delivery address',
  'Other',
];
