import { Screen } from '../../components';
import { EmptyState } from './components/EmptyState';
import { WishlistHeader } from './components/WishlistHeader';

/** Empty wishlist — always empty, regardless of the demo store, for presenting the state on its own. */
export function EmptyWishlistScreen() {
  return (
    <Screen header={<WishlistHeader showCreate={false} />} background="bgSurface">
      <EmptyState />
    </Screen>
  );
}
