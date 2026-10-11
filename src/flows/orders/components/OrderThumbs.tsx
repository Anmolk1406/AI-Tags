import { ProductImage } from '../../../components';
import type { OrderItem } from '../data';
import { ref } from '../../../foundations/tokens';

/** 57×76 r8 thumbnail cell (#F9F9FB); multi-item orders show a 2px-gap grid with a qty badge. */
export function OrderThumbs({ items, width = 57, height = 76, dim }: { items: OrderItem[]; width?: number; height?: number; dim?: boolean }) {
  const multi = items.length > 1;
  return (
    <div style={{ position: 'relative', width, height, borderRadius: 8, overflow: 'hidden', background: ref.color('bgSubtle'), display: 'grid', gridTemplateColumns: multi ? '1fr 1fr' : '1fr', gap: 2, flexShrink: 0, opacity: dim ? 0.5 : 1 }}>
      {items.slice(0, multi ? 2 : 1).map((it) => (
        <ProductImage key={it.product.id} product={it.product} height={height} emojiScale={multi ? 0.3 : 0.45} />
      ))}
      {items.length > 1 && (
        <span style={{ position: 'absolute', right: 3, bottom: 3, background: ref.color('bgSurface'), borderRadius: 6, padding: '1px 5px', font: ref.type('text12BoldLh16'), color: 'var(--nk-color-text-primary)' }}>×{items.length}</span>
      )}
    </div>
  );
}
