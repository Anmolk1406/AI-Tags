import { OriginIcon, type OriginIconName } from '../../../../components';
import { useNav } from '../../../../kit/Navigator';
import { copy, type PdpContent } from '../../data';
import { Card } from '../Sections';
import styles from './SfAdditionalInfo.module.css';

/** additional[].icon → Origin icon (Figma rows "Warranty" / "returns" / "Product as described"). */
const rowIcons: Record<PdpContent['additional'][number]['icon'], { name: OriginIconName; filled?: boolean }> = {
  warranty: { name: 'check-shield' },
  returnable: { name: 'rewind-square', filled: true },
  verified: { name: 'verified', filled: true },
};

/**
 * Storefront "Additional Information" (Figma 3499:75536, layer "Trustmarker"): white r16 card, p12, gap 12; 15/700
 * title; rows 8 apart — #F9F9FB r8, 44 high, padding 8·10, 24px blue icon + 14/500/18 text, 20px chevron-right.
 * Rows come from the SD shipping items (`content.additional`) and toast their text, as before. Replaces
 * AdditionalInfoCard.
 */
export function SfAdditionalInfo({ content }: { content: PdpContent }) {
  const nav = useNav();
  if (!content.additional.length) return null;
  return (
    <Card contentGap={12}>
      <h3 className={styles.title}>{copy.additionalInfo}</h3>
      <div className={styles.list}>
        {content.additional.map((a) => (
          <button key={a.text} type="button" className={styles.row} onClick={() => nav.toast(a.text)}>
            <OriginIcon name={rowIcons[a.icon].name} filled={rowIcons[a.icon].filled} size={24} color="var(--nk-color-pdp-sfc-trust-icon)" />
            <span className={styles.text}>{a.text}</span>
            <OriginIcon name="chevron-right" size={20} color="var(--nk-color-text-primary)" className="pdp-flip" />
          </button>
        ))}
      </div>
    </Card>
  );
}
