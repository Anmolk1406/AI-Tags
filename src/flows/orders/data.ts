import { productById, type Product } from '../../mocks/products';

export type OrderStatus = 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'returned';

export interface OrderItem {
  product: Product;
  qty: number;
  price: number;
  returnable?: 'open' | 'closed';
  rating?: number;
}

export interface Order {
  id: string;
  number: string;
  status: OrderStatus;
  statusLabel: string;
  date: string;
  month: string;
  eta: string;
  etaShort: string;
  items: OrderItem[];
  pin?: string;
  alert?: { title: string; subtitle: string; cta: string };
  /** 0..4 index into trackingSteps */
  step: number;
  onTime?: boolean;
  total: number;
  paidWith: string;
  marketplace: 'noon' | 'supermall' | 'express';
}

export const trackingSteps = [
  { id: 'placed', label: 'Ordered', emoji: '🧾' },
  { id: 'shipped', label: 'Shipped', emoji: '📦' },
  { id: 'out', label: 'Out for delivery', emoji: '🛵' },
  { id: 'delivered', label: 'Delivered', emoji: '🏠' },
];

const item = (id: string, qty = 1, extra: Partial<OrderItem> = {}): OrderItem => {
  const product = productById(id);
  return { product, qty, price: product.price, ...extra };
};

export const orders: Order[] = [
  {
    id: 'o1',
    number: 'NAEH40021588532',
    status: 'out_for_delivery',
    statusLabel: 'Out for delivery',
    date: 'Oct 9',
    month: 'October 2026',
    eta: 'Arriving today by 6 PM',
    etaShort: 'Today',
    items: [item('p1'), item('p6')],
    pin: '4821',
    step: 2,
    onTime: true,
    total: 2398,
    paidWith: 'Visa •••• 4242',
    marketplace: 'express',
  },
  {
    id: 'o2',
    number: 'NAEH40021588107',
    status: 'shipped',
    statusLabel: 'Shipped',
    date: 'Oct 8',
    month: 'October 2026',
    eta: 'Arriving Mon, Oct 13',
    etaShort: 'Mon, Oct 13',
    items: [item('p3')],
    step: 1,
    onTime: true,
    total: 389,
    paidWith: 'Apple Pay',
    marketplace: 'noon',
    alert: { title: 'Complete verification', subtitle: 'Verify that you ordered this', cta: 'Verify' },
  },
  {
    id: 'o3',
    number: 'NAEH40021571220',
    status: 'delivered',
    statusLabel: 'Delivered',
    date: 'Oct 2',
    month: 'October 2026',
    eta: 'Delivered on Thu, Oct 2',
    etaShort: 'Oct 2',
    items: [item('p5', 1, { returnable: 'open' })],
    step: 3,
    total: 1699,
    paidWith: 'Mastercard •••• 8890',
    marketplace: 'noon',
  },
  {
    id: 'o4',
    number: 'NAEH40021544019',
    status: 'delivered',
    statusLabel: 'Delivered',
    date: 'Sep 21',
    month: 'September 2026',
    eta: 'Delivered on Sun, Sep 21',
    etaShort: 'Sep 21',
    items: [item('p7', 1, { returnable: 'closed', rating: 5 })],
    step: 3,
    total: 489,
    paidWith: 'Cash on delivery',
    marketplace: 'noon',
  },
  {
    id: 'o5',
    number: 'NAEH40021530778',
    status: 'cancelled',
    statusLabel: 'Cancelled',
    date: 'Sep 12',
    month: 'September 2026',
    eta: 'Cancelled on Sep 12',
    etaShort: 'Sep 12',
    items: [item('p8')],
    step: 0,
    total: 899,
    paidWith: 'Visa •••• 4242',
    marketplace: 'noon',
  },
  {
    id: 'o6',
    number: 'NAEH40021499310',
    status: 'delivered',
    statusLabel: 'Delivered',
    date: 'Aug 30',
    month: 'August 2026',
    eta: 'Delivered on Sat, Aug 30',
    etaShort: 'Aug 30',
    items: [item('p9', 1, { returnable: 'closed' }), item('p10', 1, { returnable: 'closed' })],
    step: 3,
    total: 4448,
    paidWith: 'Visa •••• 4242',
    marketplace: 'noon',
  },
];

export const orderById = (id?: unknown) => orders.find((o) => o.id === id) ?? orders[0];
export const activeOrders = orders.filter((o) => o.status === 'processing' || o.status === 'shipped' || o.status === 'out_for_delivery');
export const historyOrders = orders.filter((o) => !activeOrders.includes(o));

export const orderFilters = [
  { id: 'all', label: 'All', icon: 'package' as const },
  { id: 'active', label: 'Active', icon: 'truck' as const },
  { id: 'delivered', label: 'Delivered', icon: 'packageCheck' as const },
  { id: 'returns', label: 'Returns', icon: 'returns' as const },
  { id: 'cancelled', label: 'Cancelled', icon: 'close' as const },
];

export const cancelReasons = [
  'I ordered by mistake',
  'Found a better price elsewhere',
  'Delivery is taking too long',
  'I want to change the delivery address',
  'Other',
];
