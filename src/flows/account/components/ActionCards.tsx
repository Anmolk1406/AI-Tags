import { ProductImage, Pressable } from '../../../components';
import { useDemoStore } from '../../../kit/DemoStore';
import { useNav } from '../../../kit/Navigator';
import { productById, products, type Product } from '../../../mocks/products';
import { AccountIconImg, type AccountIcon } from '../icons';
import styles from '../account.module.css';

/** "My Orders" / "My Wishlist" cards with 4 overlapping 48×68 thumbnails (r9, white border, -5 overlap). */
export function ActionCards() {
  const nav = useNav();
  const { wishlist } = useDemoStore();
  const orderThumbs = [products[2], products[4], products[7], products[8]];
  const wishThumbs = wishlist.slice(0, 4).map(productById);
  return (
    <div className={styles.actionRow}>
      <ActionCard title="My Orders" items={orderThumbs} placeholders={['ordersLeft', 'ordersCenter', 'ordersRight']} onPress={() => nav.push('orders/list')} />
      <ActionCard title="My Wishlist" items={wishThumbs} placeholders={['wishlistLeft', 'wishlistCenter', 'wishlistRight']} onPress={() => nav.push('wishlist/wishlist')} />
    </div>
  );
}

function ActionCard({ title, items, placeholders, onPress }: { title: string; items: Product[]; placeholders: AccountIcon[]; onPress: () => void }) {
  return (
    <Pressable className={styles.actionCard} onClick={onPress} scale={0.97}>
      <span className={styles.actionTitle}>{title}</span>
      <span className={styles.thumbs}>
        {items.length
          ? items.map((p, i) => (
              <span key={p.id + i} className={styles.thumb} style={{ borderWidth: 3, zIndex: 4 - i }}>
                <ProductImage product={p} width={42} height={62} emojiScale={0.5} />
              </span>
            ))
          : placeholders.map((ic, i) => (
              <span key={ic} className={styles.thumb} style={{ borderWidth: 2, zIndex: 3 - i }}>
                <AccountIconImg name={ic} size={24} />
              </span>
            ))}
      </span>
    </Pressable>
  );
}
