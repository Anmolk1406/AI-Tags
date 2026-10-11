import { Icon, MarketplaceTag, MarketplaceWordmark, type IconName } from '../../../components';
import type { Order } from '../data';
import { ordersTokens } from '../tokens';
import { ref } from '../../../foundations/tokens';

const icons: Record<Order['status'], IconName> = {
  processing: 'clock',
  shipped: 'truck',
  out_for_delivery: 'truck',
  delivered: 'packageCheck',
  cancelled: 'close',
  returned: 'returns',
};

/** Card header status tag — 16px icon + 13/600 label in the (API-provided) status colour + 13/500 date. */
export function StatusTag({ order }: { order: Order }) {
  const color = ordersTokens.statusColors[order.status];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, font: ref.type('text13SemiboldLh16'), color }}>
      <Icon name={icons[order.status]} size={16} />
      {order.statusLabel}
      <span style={{ color: 'var(--nk-color-text-primary)', fontWeight: 500 }}>· {order.date}</span>
    </span>
  );
}

export function MarketplaceLogo({ kind }: { kind: Order['marketplace'] }) {
  if (kind === 'supermall') return <MarketplaceWordmark kind="supermall" height={12} />;
  if (kind === 'express') return <MarketplaceTag kind="express" height={18} />;
  return <MarketplaceWordmark kind="noon" height={12} />;
}
