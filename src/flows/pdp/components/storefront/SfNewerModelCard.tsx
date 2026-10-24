import { OriginIcon, Pressable, ProductImage } from '../../../../components';
import { useNav } from '../../../../kit/Navigator';
import { money, type Product } from '../../../../data';
import styles from './SfNewerModelCard.module.css';
import { sfCopy } from '../../../../data/copy/pdp';

/**
 * Storefront "OrderHistoryItems" newer-model card (Figma 3499:75229): purple → white "Newer model available" strip,
 * 55×68 thumb, 2-line title, price, round chevron button. Tap → nav.push('pdp/detail', { productId }) (push, so Back
 * returns to the old model). `newer` is the view's `newerModel`; renders nothing when there is none.
 */
export function SfNewerModelCard({ newer: next }: { newer?: Product }) {
  const nav = useNav();
  if (!next) return null;
  return (
    <Pressable scale={0.98} className={styles.card} aria-label={`${sfCopy.newerModel.viewNewer}: ${next.title}`} onClick={() => nav.push('pdp/detail', { productId: next.id })}>
      <span className={styles.strip}>
        <OriginIcon name="thunder-square" size={18} color="var(--nk-palette-deep-purple)" />
        <span className={styles.stripText}>{sfCopy.newerModel.newerModel}</span>
      </span>
      <span className={styles.body}>
        <span className={styles.thumb}>
          <ProductImage product={next} width="100%" height="100%" emojiScale={0.5} />
        </span>
        <span className={styles.info}>
          <span className={styles.title}>{next.title}</span>
          <span className={styles.price}>{money(next.price)}</span>
        </span>
        <span className={styles.go} aria-hidden>
          <OriginIcon name="chevron-right" size={14} color="var(--nk-color-text-primary)" className="pdp-flip" />
        </span>
      </span>
    </Pressable>
  );
}
