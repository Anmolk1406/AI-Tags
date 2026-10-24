import { HtmlText, Pressable } from '../../../../components';
import { useNav } from '../../../../kit/Navigator';
import { Card } from '../Card';
import styles from './SfPaymentOffers.module.css';
import type { PdpContent } from '../../../../data/views/pdp';
import { sfCopy } from '../../../../data/copy/pdp';


const plain = (html: string) => html.replace(/<[^>]+>/g, '');

/**
 * Storefront "Offers for you" (Figma 3499:75412): white r16 card, py12, gap 12; 15/700 title (px14); a scroll row (px12,
 * gap 8) of 253 × 64 offer cards (1px blue-gray/200, r10, p8) with a 60 × 40 logo box and 12/14 rich text
 * (<b> bold, <a> 600 brand blue): `content.payments.items` — noon's bank offers (a cover-fitted card image, 63 × 42 in a
 * 60 × 40 r6 box) then the product's own (tabby / tamara logos).
 */
export function SfPaymentOffers({ content }: { content: PdpContent }) {
  const nav = useNav();
  if (!content.payments) return null;
  return (
    <Card className={styles.card} contentGap={12}>
      <h3 className={styles.title}>{sfCopy.payments.title}</h3>
      <div className={styles.row}>
        {content.payments.items.map((o) => (
          <Pressable key={o.html} className={styles.offer} onClick={() => nav.toast(plain(o.html))}>
            <span className={styles.logo} data-cover={o.cover || undefined}>
              <img alt="" src={o.logo} />
            </span>
            <HtmlText value={o.html} lines={3} className={styles.text} />
          </Pressable>
        ))}
      </div>
    </Card>
  );
}
