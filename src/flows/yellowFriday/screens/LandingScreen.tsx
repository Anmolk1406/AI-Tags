import { Button, Header, Icon, IconButton, Pill, Pressable, Screen, SkuCard, Text } from '../../../components';
import { useNav } from '../../../kit/Navigator';
import { FadeIn, Float, Stagger } from '../../../motion/recipes';
import { Countdown } from '../components/Countdown';
import { Orbi } from '../components/Orbi';
import { boughtId, boughtLabel, copy, picks, productOf, signals } from '../data';
import { getProduct } from '../../../data';
import { resetJourney, yfStore } from '../store';
import { yellowFridayTokens } from '../tokens';
import styles from './yellowFriday.module.css';

/**
 * Act 1 — "We know you". The Yellow Friday entry: Orbi greets the customer with the signal the picks are built on
 * (and a way to correct it), the refresh countdown, and one CTA. Strong signals: "Skip to my picks" goes straight
 * to the reveal; otherwise "Discover my deals" asks the one question first (interests sheet).
 */
export function LandingScreen() {
  const nav = useNav();
  const bought = getProduct(boughtId);
  const saved = yfStore.useStore((s) => s.saved.length);

  return (
    <Screen
      header={<Header title="Yellow Friday" right={<IconButton icon="share" variant="plain" label="Share" onPress={() => nav.toast(copy.shared, { type: 'dark' })} />} />}
      background="bgSurface"
    >
      <FadeIn>
        <section className={styles.hero} style={{ background: yellowFridayTokens.heroGradient }}>
          <Text variant="captionBold" color="textPrimary" className={styles.eyebrow}>
            {copy.eyebrow}
          </Text>
          <Float amplitude={5} durationS={3.2}>
            <Orbi size={112} mood="happy" />
          </Float>
          <Text as="h1" variant="titleLarge" color="textStrong" align="center" className={styles.h1}>
            {copy.hello}
          </Text>
          <Text variant="body" color="textMuted" align="center" className={styles.sub}>
            {copy.sub}
          </Text>

          <Pressable className={styles.signal} onClick={() => nav.push('account/account')} aria-label={`${copy.basedOn} ${boughtLabel}. ${copy.notMe}`}>
            <Text variant="caption" color="textSecondary">
              {copy.basedOn}
            </Text>
            {bought?.image && <img className={styles.signalImg} src={bought.image} alt="" />}
            <Text variant="captionBold" color="textPrimary" lines={1} className={styles.signalText}>
              {boughtLabel}
            </Text>
            <Text variant="captionBold" color="primary">
              {copy.notMe}
            </Text>
          </Pressable>

          <Countdown label={copy.refresh} />

          <div className={styles.heroActions}>
            <Button variant="noon" block onClick={() => nav.sheet('yellowFriday/interests')}>
              {copy.cta}
            </Button>
            <Button
              variant="noonGhost"
              block
              onClick={() => {
                if (saved === 0) resetJourney();
                nav.push('yellowFriday/reveal');
              }}
            >
              {copy.skip}
            </Button>
          </div>
        </section>
      </FadeIn>

      <section className={styles.module}>
        <Text variant="section" color="textStrong" className={styles.moduleTitle}>
          {copy.signalsTitle}
        </Text>
        <Stagger className={styles.signals}>
          {signals.map((s) => (
            <div key={s.title} className={styles.signalCard}>
              <span className={styles.signalIcon}>
                <Icon name={s.icon} size={18} />
              </span>
              <Text variant="captionBold" color="textPrimary">
                {s.title}
              </Text>
              <Text variant="caption" color="textSecondary">
                {s.body}
              </Text>
            </div>
          ))}
        </Stagger>
      </section>

      <section className={styles.module}>
        <div className={styles.moduleHeader}>
          <Text variant="section" color="textStrong">
            {copy.railTitle}
          </Text>
          <Pill variant="tag" size="sm" icon="sparkles">
            Yellow Friday prices
          </Pill>
        </div>
        <div className={`nk-hscroll ${styles.rail}`}>
          {picks.map((p) => (
            <SkuCard key={p.id} product={{ ...productOf(p), price: p.yf, was: p.ref }} badge={null} />
          ))}
        </div>
      </section>
    </Screen>
  );
}
