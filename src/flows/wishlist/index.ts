import { defineFlow } from '../../kit/registry';
import { wishlistFlowTokens } from './tokens';
import { lazyScreen } from '../../kit/lazyScreen';

const EmptyWishlistScreen = lazyScreen(() => import('./EmptyWishlistScreen'), 'EmptyWishlistScreen');
const WishlistScreen = lazyScreen(() => import('./WishlistScreen'), 'WishlistScreen');

export const wishlistFlow = defineFlow({
  id: 'wishlist',
  title: 'Wishlist',
  group: 'Profile',
  description: 'Pushed from the home header heart (not a tab). Wishlist V2: collections, saved items grid with add-to-cart steppers, floating View Cart pill and empty state.',
  initial: 'wishlist',
  tokens: wishlistFlowTokens,
  screens: [
    {
      id: 'wishlist',
      title: 'Wishlist',
      component: WishlistScreen,
      notes: 'Scroll: the header title swaps "Wishlist" → "All Saved Items" and the Create pill fades. Tap "Add to cart" — it morphs into a stepper and the View Cart pill springs up. Un-heart every item to see the inline empty state.',
      source: 'marketplaces/noon/screens/NoonWishlistV2Screen, components/NoonWishlistV2*, NoonProductBoxWishlistAddToCart',
    },
    {
      id: 'empty',
      title: 'Empty wishlist',
      component: EmptyWishlistScreen,
      notes: 'Floating hearts stand in for the looping noonWishlistV2EmptyLottie. "Start adding items" opens Search.',
      source: 'components/NoonWishlistV2Empty',
    },
  ],
});
