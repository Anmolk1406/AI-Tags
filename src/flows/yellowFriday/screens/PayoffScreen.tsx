import { useEffect, useState } from 'react';
import { Button, Header, Icon, Pressable, ProductImage, Screen, Text } from '../../../components';
import { useNav } from '../../../kit/Navigator';
import { useDemoStore } from '../../../kit/DemoStore';
import { currency, formatPrice } from '../../../data';
import { Confetti, CountUp, FadeIn, Pop, Stagger } from '../../../motion/recipes';
import { Orbi } from '../components/Orbi';
import { copy, productOf } from '../data';
import { lineupTotals, yfStore , seedFromParams } from '../store';
import { yellowFridayTokens } from '../tokens';
import styles from './yellowFriday.module.css';

/**
 * Act 4 — "Your personal haul". The lineup in one card: picks, total against the reference price, the saving, the
 * bonus (free express delivery once three picks are in), a shareable lineup, and the two ways out: add everything
 * to the cart, or keep the picks on the wishlist.
 */
export function PayoffScreen({ params }: { params: { seed?: string } }) {
  seedFromParams(params);
  const nav = useNav();
  const demo = useDemoStore();
  const state = yfStore.useStore();
  const { items, total, reference, saving } = lineupTotals(state);
  const need = yellowFridayTokens.bonusPicks;
  const unlocked = items.length >= need;
  const [fire, setFire] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setFire(1), 350);
    return () => clearTimeout(t);
  }, []);

  const addAll = () => {
    items.forEach(({ pick }) => demo.addToCart(pick.id));
    nav.toast(copy.added, { type: 'success', action: { label: 'View cart', onPress: () => nav.push('cart/cart') } });
  };
  const saveLater = () => {
    items.forEach(({ pick }) => !demo.isWishlisted(pick.id) && demo.toggleWishlist(pick.id));
    nav.toast(copy.savedLater, { type: 'dark', icon: <Icon name="heart" size={18} /> });
  };

  const footer = (
    <div className={styles.footer}>
      <Button variant="noon" block disabled={items.length === 0} onClick={addAll}>
        {copy.addAll} · {currency}
        {formatPrice(total)}
      </Button>
      <Button variant="noonGhost" block onClick={saveLater} disabled={items.length === 0}>
        {copy.saveLater}
      </Button>
    </div>
  );

  return (
    <Screen header={<Header title="" right={<Pressable className={styles.textBtn} onClick={() => nav.popToRoot()}>Close</Pressable>} />} footer={footer} background="bgSurface">
      <Confetti fireKey={fire} />
      <FadeIn>
        <div className={styles.payHead}>
          <Pop>
            <Orbi size={88} mood="happy" />
          </Pop>
          <Text as="h1" variant="titleLarge" color="textStrong" align="center">
            {copy.payoffTitle}
          </Text>
          <Text variant="body" color="textMuted" align="center">
            {copy.payoffSub}
          </Text>
        </div>
      </FadeIn>

      <section className={styles.haul}>
        <Stagger className={styles.haulImages}>
          {items.map(({ pick }) => (
            <ProductImage key={pick.id} product={productOf(pick)} width="100%" height={88} radius={14} />
          ))}
        </Stagger>
        <div className={styles.haulRows}>
          {items.map(({ pick }) => (
            <div key={pick.id} className={styles.haulRow}>
              <Text variant="caption" color="textMuted" lines={1}>
                {productOf(pick).brand} · {productOf(pick).title}
              </Text>
              <Text variant="captionBold" color="textPrimary">
                {currency}
                {formatPrice(pick.yf)}
              </Text>
            </div>
          ))}
        </div>
        <div className={styles.haulTotals}>
          <div>
            <Text variant="micro" color="textSecondary" as="p">
              Total
            </Text>
            <Text variant="title" color="textStrong">
              {currency}
              <CountUp to={total} durationS={0.8} />
            </Text>
          </div>
          <div className={styles.haulRight}>
            <Text variant="micro" color="textSecondary" as="p">
              {copy.reference}
            </Text>
            <Text variant="bodySemibold" color="priceOld" strike>
              {currency}
              {formatPrice(reference)}
            </Text>
          </div>
        </div>
        <div className={styles.savingLine}>
          <Icon name="tag" size={16} />
          <Text variant="captionBold" color="success">
            You save {currency}
            {formatPrice(saving)} against today’s noon prices
          </Text>
        </div>
      </section>

      <section className={`${styles.bonus} ${unlocked ? '' : styles.bonusLocked}`}>
        <div className={styles.bonusText}>
          <span className={styles.bonusTag}>{unlocked ? copy.bonusTag : 'Bonus'}</span>
          <Text variant="bodySemibold" color="textPrimary">
            {copy.bonusTitle}
          </Text>
          <span className={styles.progress} role="progressbar" aria-valuemin={0} aria-valuemax={need} aria-valuenow={Math.min(items.length, need)}>
            <i style={{ width: `${Math.min(100, (items.length / need) * 100)}%` }} />
          </span>
          <Text variant="micro" color="textPrimary">
            {unlocked ? `${items.length} of ${need} picks · ${copy.bonusDone}` : copy.bonusProgress(items.length, need)}
          </Text>
        </div>
        <span className={styles.bonusIcon}>
          <Icon name="truck" size={30} />
        </span>
      </section>

      <Pressable className={styles.share} onClick={() => nav.toast(copy.shared, { type: 'dark' })}>
        <Icon name="share" size={18} />
        <span className={styles.rowText}>
          <Text variant="captionBold" color="textPrimary">
            {copy.share}
          </Text>
          <Text variant="micro" color="textSecondary">
            A friend who opens it sees your picks at Yellow Friday prices
          </Text>
        </span>
        <Icon name="chevronRight" size={16} />
      </Pressable>
    </Screen>
  );
}
