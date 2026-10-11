import { AnimatePresence, motion } from 'motion/react';
import { useState, type ReactNode } from 'react';
import { OriginIcon } from '../../../../components';
import { duration, easing } from '../../../../motion/presets';
import { copy, type PdpContent } from '../../data';
import { Asset } from '../Asset';
import { Card } from '../Sections';
import styles from './SfProductDetails.module.css';

export const sfDetailsCopy = {
  title: 'Product Details', // Figma I3499:75478;3430:5070
  overview: 'Overview', // Figma I3499:75478;5887:70228
};

const collapse = { duration: duration.fast, ease: easing.out };

/** Storefront accordion: #F9F9FB r12 panel, 44-high header (p12, 14/600/18 title, 20px chevron-down rotating 180°). */
function SfAccordion({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={styles.panel}>
      <button type="button" className={styles.head} onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span className={styles.headTitle}>{title}</span>
        <motion.span className={styles.chevron} initial={false} animate={{ rotate: open ? 180 : 0 }} transition={collapse}>
          <OriginIcon name="chevron-down" size={20} color="var(--nk-color-text-primary)" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div key="body" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={collapse} style={{ overflow: 'hidden' }}>
            <div className={styles.body}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Storefront "Product Details" (Figma 3499:75478): white r16 card, padding 16·12, gap 12; 15/700 title (px2);
 * accordions 8 apart — Overview (description), Highlights (feature bullets), Specifications (spec rows), all
 * collapsed by default. Replaces OverviewCard (same content and toggles).
 */
export function SfProductDetails({ content }: { content: PdpContent }) {
  return (
    <Card className={styles.card} contentGap={12}>
      <h3 className={styles.title}>{sfDetailsCopy.title}</h3>
      <div className={styles.list}>
        <SfAccordion title={sfDetailsCopy.overview}>
          <p className={styles.text}>{content.description}</p>
        </SfAccordion>
        {content.featureBullets.length > 0 && (
          <SfAccordion title={copy.highlights}>
            {content.featureBullets.map((f) => (
              <div key={f} className={styles.bullet}>
                <Asset name="circlePoint" width="var(--nk-space-s4)" height="var(--nk-space-s4)" className={styles.dot} />
                <span className={styles.text}>{f}</span>
              </div>
            ))}
          </SfAccordion>
        )}
        {content.specs.length > 0 && (
          <SfAccordion title={copy.specifications}>
            {content.specs.map(([k, v]) => (
              <div key={k} className={styles.spec}>
                <span className={styles.specName}>{k}</span>
                <span className={styles.specValue}>{v}</span>
              </div>
            ))}
          </SfAccordion>
        )}
      </div>
    </Card>
  );
}
