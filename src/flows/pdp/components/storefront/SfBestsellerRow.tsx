import { OriginIcon, Pressable } from '../../../../components';
import { useNav } from '../../../../kit/Navigator';
import { leafName } from '../../../../mocks/categories';
import type { PdpContent } from '../../data';
import styles from './SfBestsellerRow.module.css';

export const sfBestsellerCopy = {
  bestseller: (rank?: number) => (rank ? `Bestseller #${rank}` : 'Bestseller'), // Figma 3499:75642
  in: 'in', // 3499:75643
  explore: 'Explore other bestsellers', // 3499:75645 (Figma typo "bestellers")
};

/** "#38" from the SD best_seller_tag html (`<b>#38</b> in <a>…</a>`), when there is one. */
const rankOf = (html?: string) => {
  const m = html?.match(/#(\d+)/);
  return m ? Number(m[1]) : undefined;
};

/**
 * Storefront Bestseller row (Figma 3499:75632): r16 card (1px white border, white → emerald/50 gradient), padding
 * 6 · 8 · 6 · 12; 40px medal, "Bestseller #N" 14/700 + "in" 14 secondary + category 14/600 dark green teal, sub line
 * 12/14 secondary, 20px chevron-right. Opens the category PLP like CategoryBestSellerCta, which it replaces.
 */
export function SfBestsellerRow({ content }: { content: PdpContent }) {
  const nav = useNav();
  const cta = content.bestSellerCta;
  if (!cta) return null;
  const category = leafName(cta.categoryId);
  return (
    <Pressable className={styles.row} scale={0.98} onClick={() => nav.push('plp/listing', { query: category })}>
      <span className={styles.main}>
        <OriginIcon name="medal" filled size={40} color="var(--nk-color-best-seller-tag)" />
        <span className={styles.text}>
          <span className={styles.headline}>
            <span className={styles.rank}>{sfBestsellerCopy.bestseller(rankOf(content.bestSellerTag?.html))}</span>
            {category && (
              <>
                <span className={styles.in}>{sfBestsellerCopy.in}</span>
                <span className={styles.category}>{category}</span>
              </>
            )}
          </span>
          <span className={styles.sub}>{cta.subText ?? sfBestsellerCopy.explore}</span>
        </span>
      </span>
      <OriginIcon name="chevron-right" size={20} color="var(--nk-color-text-primary)" className="pdp-flip" />
    </Pressable>
  );
}
