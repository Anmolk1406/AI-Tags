import { AnimatePresence, motion, useMotionValue, useTransform } from 'motion/react';
import { useState } from 'react';
import { Button, Header, Icon, Pill, Pressable, Price, ProductImage, Text } from '../../../components';
import { Screen } from '../../../components';
import { useNav } from '../../../kit/Navigator';
import { currency, formatPrice } from '../../../data';
import { spring, tween } from '../../../motion/presets';
import { FadeIn } from '../../../motion/recipes';
import { Orbi, type OrbiMood } from '../components/Orbi';
import { copy, picks, productOf, type Pick } from '../data';
import { lineupTotals, savePick, skipPick, watchPick, yfStore , seedFromParams } from '../store';
import { yellowFridayTokens } from '../tokens';
import styles from './yellowFriday.module.css';

/**
 * Act 3 — "The unexpected find". One pick at a time, each with its reason and what it fits. Swipe right or tap Save;
 * swipe left or tap Skip; "Watch price" keeps a skipped pick on Orbi's list. Orbi reacts: save = happy, skip = idle,
 * a quick run of skips = think. The saved tray totals up under the stack and hands off to the bundle builder.
 */
export function RevealScreen({ params }: { params: { seed?: string } }) {
  seedFromParams(params);
  const nav = useNav();
  const state = yfStore.useStore();
  const { index, saved, watched } = state;
  const current: Pick | undefined = picks[index];
  const next = picks[index + 1];
  const [mood, setMood] = useState<OrbiMood>('happy');
  const totals = lineupTotals(state);
  const stepDots = <span className={styles.dots}>{[0, 1, 2].map((i) => <i key={i} className={i <= 1 ? styles.dotOn : ''} />)}</span>;

  const onSave = (p: Pick) => {
    savePick(p.id);
    setMood('happy');
  };
  const onSkip = (p: Pick) => {
    skipPick(p.id);
    setMood('idle');
  };
  const onWatch = (p: Pick) => {
    watchPick(p.id);
    nav.toast(copy.watched, { type: 'dark', icon: <Icon name="bell" size={18} /> });
  };

  const footer = (
    <div className={styles.footer}>
      <div className={styles.tray}>
        <Text variant="caption" color="textSecondary">
          Saved so far
        </Text>
        <div className={styles.trayThumbs}>
          <AnimatePresence>
            {totals.items.map(({ pick }) => (
              <motion.span key={pick.id} layout initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={spring.bouncy} className={styles.trayThumb}>
                <ProductImage product={productOf(pick)} width={32} height={32} radius={8} />
              </motion.span>
            ))}
          </AnimatePresence>
          {totals.items.length === 0 && <span className={styles.trayEmpty} />}
        </div>
        <Text variant="bodyBold" color="textPrimary">
          {currency}
          {formatPrice(totals.total)}
        </Text>
      </div>
      <Button variant="noon" block disabled={saved.length === 0} onClick={() => nav.push('yellowFriday/build')}>
        {saved.length ? `Build my find · ${saved.length} saved` : 'Save a pick to continue'}
      </Button>
    </div>
  );

  return (
    <Screen header={<Header title={<span className={styles.stepTitle}>Step 2 of 3 {stepDots}</span>} right={<Pressable className={styles.textBtn} onClick={() => nav.push('yellowFriday/build')}>Skip</Pressable>} />} footer={footer} background="bgSurface">
      <FadeIn>
        <div className={styles.talk}>
          <Orbi size={56} mood={mood} />
          <div className={styles.bubble}>
            <Text variant="bodySemibold" color="textPrimary">
              {copy.revealTitle}
            </Text>
            <Text variant="caption" color="textSecondary">
              {current ? copy.revealBubble : copy.revealEmpty}
            </Text>
          </div>
        </div>
      </FadeIn>

      <div className={styles.stack} style={{ height: yellowFridayTokens.cardImage + 168 }}>
        {next && <div className={`${styles.card} ${styles.cardBehind}`} aria-hidden="true" />}
        <AnimatePresence>
          {current && <SwipeCard key={current.id} pick={current} onSave={() => onSave(current)} onSkip={() => onSkip(current)} />}
        </AnimatePresence>
        {!current && (
          <FadeIn className={styles.stackEmpty}>
            <Orbi size={72} mood="happy" />
            <Text variant="bodySemibold" color="textPrimary" align="center">
              {saved.length ? `${saved.length} saved · ${watched.length} on watch` : 'Nothing saved yet'}
            </Text>
            <Text variant="caption" color="textSecondary" align="center">
              {saved.length ? copy.revealEmpty : 'Go back a step or head to all Yellow Friday deals.'}
            </Text>
          </FadeIn>
        )}
      </div>

      {current && (
        <div className={styles.acts}>
          <Pressable className={styles.roundBtn} onClick={() => onSkip(current)} aria-label={copy.skipPick}>
            <Icon name="close" size={22} strokeWidth={2.4} />
          </Pressable>
          <div className={styles.actsMid}>
            <Text variant="captionBold" color="textSecondary">
              {index + 1} of {picks.length}
            </Text>
            <Pressable className={styles.watchBtn} onClick={() => onWatch(current)} aria-pressed={watched.includes(current.id)}>
              <Icon name="bell" size={14} />
              {watched.includes(current.id) ? 'Watching' : copy.watch}
            </Pressable>
          </div>
          <Pressable className={`${styles.roundBtn} ${styles.roundBtnSave}`} onClick={() => onSave(current)} aria-label={copy.save}>
            <Icon name="heart" size={22} strokeWidth={2.2} />
          </Pressable>
        </div>
      )}
      {current && (
        <Text variant="micro" color="textTertiary" align="center" as="p" className={styles.hint}>
          Swipe right to save · left to skip · tap the card for details
        </Text>
      )}
    </Screen>
  );
}

function SwipeCard({ pick, onSave, onSkip }: { pick: Pick; onSave: () => void; onSkip: () => void }) {
  const nav = useNav();
  const product = productOf(pick);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-8, 8]);
  const saveOpacity = useTransform(x, [20, 100], [0, 1]);
  const skipOpacity = useTransform(x, [-100, -20], [1, 0]);
  const t = yellowFridayTokens.swipeThreshold;
  const off = Math.round(pick.ref > 0 ? ((pick.ref - pick.yf) / pick.ref) * 100 : 0);
  return (
    <motion.div
      className={styles.card}
      style={{ x, rotate }}
      drag="x"
      dragSnapToOrigin
      dragElastic={0.6}
      onDragEnd={(_, info) => {
        if (info.offset.x > t || info.velocity.x > 600) onSave();
        else if (info.offset.x < -t || info.velocity.x < -600) onSkip();
      }}
      initial={{ scale: 0.96, opacity: 0, y: 8 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ x: x.get() >= 0 ? 420 : -420, opacity: 0, transition: tween('medium', 'in') }}
      transition={spring.gentle}
      onClick={() => nav.push('pdp/detail', { productId: product.id })}
    >
      <div className={styles.cardImage} style={{ height: yellowFridayTokens.cardImage }}>
        <ProductImage product={product} width="100%" height="100%" />
        <span className={styles.offBadge}>-{off}%</span>
        <motion.span className={`${styles.stamp} ${styles.stampSave}`} style={{ opacity: saveOpacity }}>
          Saved
        </motion.span>
        <motion.span className={`${styles.stamp} ${styles.stampSkip}`} style={{ opacity: skipOpacity }}>
          Skip
        </motion.span>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.chips}>
          <Pill variant="nav" size="sm" selected icon="sparkles">
            {pick.reason}
          </Pill>
          <Pill variant="nav" size="sm" icon="check">
            {pick.compat}
          </Pill>
        </div>
        <Text variant="productTitle" color="textStrong" lines={2}>
          {product.title}
        </Text>
        <div className={styles.priceRow}>
          <Price price={pick.yf} was={pick.ref} size="lg" />
          <Text variant="captionBold" color="success">
            Yellow Friday price
          </Text>
        </div>
      </div>
    </motion.div>
  );
}
