import { defineFlow } from '../../kit/registry';
import { OrderCancelScreen } from './OrderCancelScreen';
import { OrdersListScreen } from './OrdersListScreen';
import { OrderTrackingScreen } from './OrderTrackingScreen';
import { ordersFlowTokens } from './tokens';

export const ordersFlow = defineFlow({
  id: 'orders',
  title: 'Orders',
  group: 'Post-order',
  description: 'Order list (active + history), order tracking with animated timeline, and cancel items.',
  initial: 'list',
  parent: 'account/account', // Back target when opened directly (no history)
  tokens: ordersFlowTokens,
  screens: [
    {
      id: 'list',
      title: 'My orders',
      component: OrdersListScreen,
      notes: 'Scroll: header turns white with radius + shadow and a month pill floats in. Tap stars to rate (1.25 pop). Filter chips switch sections. Tap a card to track.',
      source: 'features/o2d/screens/O2DOrdersV2Screen',
    },
    {
      id: 'tracking',
      title: 'Order tracking',
      component: OrderTrackingScreen,
      defaultParams: { orderId: 'o1' },
      notes: 'Image stack rotates every 1.9s for multi-item orders. Timeline progress animates in and the active segment pulses. Try orderId o3 (delivered → Return item) or o5 (cancelled).',
      source: 'features/o2d/screens/O2DOrderTrackingScreen, sections/O2DOrderTrackingHeroSection',
    },
    {
      id: 'cancel',
      title: 'Cancel items',
      component: OrderCancelScreen,
      defaultParams: { orderId: 'o1' },
      notes: 'Select items to expand the reason picker (spring height). Refund banner slides in with the total. Missing reasons highlight in red.',
      source: 'features/o2d/screens/O2DOrderCancelItemsScreen',
    },
  ],
});
