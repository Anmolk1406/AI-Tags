import { AnimatePresence, motion } from 'motion/react';
import { useState, type ReactNode } from 'react';
import { OriginIcon } from '../../../../components';
import { duration, easing } from '../../../../motion/presets';
import aiStar from '@assets/pdp/new-pdp/overview-ai-star.svg';
import { Asset } from '../Asset';
import { Card } from '../Card';
import styles from './SfProductDetails.module.css';
import { copy, npcCopy, sfCopy } from '../../../../data/copy/pdp';
import type { PdpContent } from '../../../../data/views/pdp';

const collapse = { duration: duration.fast, ease: easing.out };

/** Storefront accordion: #F9F9FB r12 panel, 44-high header (p12, 14/600/18 title, 20px chevron-down rotating 180°). */
function SfAccordion({ title, children, onOpen }: { title: string; children: ReactNode; onOpen?: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={styles.panel}>
      <button type="button" className={styles.head} onClick={() => {
          if (!open) onOpen?.();
          setOpen(!open);
        }} aria-expanded={open}>
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
 * NoonAiOverviewSummary (New PDP 84:8035 "Pair"): r12 block on the persian-blue → purple 5% gradient, py 12, gap 8;
 * NoonAiOverviewTitle "Summarised by AI" 14/700 in the 90deg gradient with a white shimmer sweeping across every 2 s;
 * items 10 apart, px 12: 16 × 20 sparkle + "<b>{title}:</b> {description}" 14/20 (title 600 blue-gray/900, text blue-gray/700).
 */
function AiSummary({ items }: { items: NonNullable<PdpContent['aiOverview']> }) {
  return (
    <div className={styles.ai}>
      <span className={styles.aiTitle}>{npcCopy.aiTitle}</span>
      <div className={styles.aiItems}>
        {items.map((it, i) => (
          <div key={`${it.title}-${i}`} className={styles.aiItem}>
            <img alt="" src={aiStar} className={styles.aiStar} />
            <p className={styles.aiText}>
              <span className={styles.aiItemTitle}>{it.title}: </span>
              {it.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * New PDP "Product Overview" (Figma Af34gfmhQ1D0wstXUEHSIF · 84:8031) over bappzaar NoonProductOverview: white r16 card,
 * padding 16·12, gap 12; 15/700 title (px2); the AI summary (when the product has an `ai_overview`) then the
 * accordions 8 apart — Description (long_description), Highlights (feature bullets), Specifications — all collapsed.
 * The AI summary is `content.aiOverview`; without it the card shows the accordions only, as in the app.
 */
/** `onAccordionOpen`: NoonProductOverview → NoonProductDetails.scrollAfterAccordionOpen (page +120, 150ms). */
export function SfProductDetails({ content, onAccordionOpen }: { content: PdpContent; onAccordionOpen?: () => void }) {
  const ai = content.aiOverview;
  return (
    <Card className={styles.card} contentGap={12}>
      <h3 className={styles.title}>{sfCopy.details.title}</h3>
      {ai && <AiSummary items={ai} />}
      <div className={styles.list}>
        {content.description && (
          <SfAccordion title={sfCopy.details.overview} onOpen={onAccordionOpen}>
            <p className={styles.text}>{content.description}</p>
          </SfAccordion>
        )}
        {content.featureBullets.length > 0 && (
          <SfAccordion title={copy.highlights} onOpen={onAccordionOpen}>
            {content.featureBullets.map((f) => (
              <div key={f} className={styles.bullet}>
                <Asset name="circlePoint" width="var(--nk-space-s4)" height="var(--nk-space-s4)" className={styles.dot} />
                <span className={styles.text}>{f}</span>
              </div>
            ))}
          </SfAccordion>
        )}
        {content.specs.length > 0 && (
          <SfAccordion title={copy.specifications} onOpen={onAccordionOpen}>
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
