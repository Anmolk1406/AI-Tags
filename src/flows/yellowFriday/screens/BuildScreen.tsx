import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { Button, Header, Icon, Pressable, Price, ProductImage, Screen, Segmented, SheetBody, SheetFooter, SheetHeader, Text } from '../../../components';
import { useNav } from '../../../kit/Navigator';
import { currency, formatPrice } from '../../../data';
import { spring } from '../../../motion/presets';
import { FadeIn } from '../../../motion/recipes';
import { Orbi } from '../components/Orbi';
import { alternatives, copy, picks, productOf, type Budget, type Pick } from '../data';
import { addPick, lineupTotals, removePick, resolvePick, setBudget, swapPick, yfStore , seedFromParams } from '../store';
import { yellowFridayTokens } from '../tokens';
import styles from './yellowFriday.module.css';

const budgetOptions: { value: Budget; label: string }[] = [
  { value: 'u300', label: 'Under 300' },
  { value: 'u600', label: 'Under 600' },
  { value: 'none', label: 'No limit' },
];

/**
 * Step 4 — "Make it yours". The bundle builder: a budget segment, the saved picks as rows with Swap and remove,
 * "Surprise me" (one swap to a better-value match inside the budget), one complete-the-set suggestion, and a footer
 * that shows the total against the reference price and the real saving.
 */
export function BuildScreen({ params }: { params: { seed?: string } }) {
  seedFromParams(params);
  const nav = useNav();
  const state = yfStore.useStore();
  const { items, total, reference, saving } = lineupTotals(state);
  const cap = yellowFridayTokens.budgets[state.budget];
  const over = total - cap;
  const suggestion = picks.find((p) => !state.saved.includes(p.id));
  const stepDots = <span className={styles.dots}>{[0, 1, 2].map((i) => <i key={i} className={styles.dotOn} />)}</span>;

  const surprise = () => {
    // the first saved pick with a cheaper alternative gets swapped; nothing to swap → say so
    const target = state.saved.find((id) => !state.swaps[id] && alternatives[id]?.some((a) => a.yf < resolvePick(id, state.swaps).yf));
    if (!target) return nav.toast(copy.surpriseNone, { type: 'dark' });
    const alt = alternatives[target].find((a) => a.yf < resolvePick(target, state.swaps).yf)!;
    swapPick(target, alt.id);
    nav.toast(copy.surprised, { type: 'success' });
  };

  const footer = (
    <div className={styles.footer}>
      <div className={styles.totals}>
        <div>
          <Text variant="micro" color="textSecondary" as="p">
            Total · {items.length} {items.length === 1 ? 'item' : 'items'}
          </Text>
          <span className={styles.totalRow}>
            <Text variant="title" color="textStrong">
              {currency}
              {formatPrice(total)}
            </Text>
            <Text variant="caption" color="priceOld" strike>
              {currency}
              {formatPrice(reference)}
            </Text>
          </span>
        </div>
        <motion.span key={saving} className={styles.savePill} initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={spring.bouncy}>
          You save {currency}
          {formatPrice(saving)}
        </motion.span>
      </div>
      <Button variant="noon" block disabled={items.length === 0} onClick={() => nav.push('yellowFriday/payoff', {}, { transition: 'fade-up' })}>
        {copy.review}
      </Button>
    </div>
  );

  return (
    <Screen header={<Header title={<span className={styles.stepTitle}>Step 3 of 3 {stepDots}</span>} right={<Pressable className={styles.textBtn} onClick={() => nav.push('yellowFriday/payoff', {}, { transition: 'fade-up' })}>Skip</Pressable>} />} footer={footer} background="bgSurface">
      <FadeIn>
        <div className={styles.pageHead}>
          <Text as="h1" variant="titleLarge" color="textStrong">
            {copy.buildTitle}
          </Text>
          <Text variant="body" color="textMuted">
            {copy.buildSub}
          </Text>
        </div>
      </FadeIn>

      <div className={styles.budget}>
        <Segmented variant="field" size={40} width={312} options={budgetOptions} value={state.budget} onChange={setBudget} />
        <Text variant="caption" color={over > 0 ? 'danger' : 'success'} align="center" as="p">
          {state.budget === 'none' ? 'No budget set' : over > 0 ? `${currency}${formatPrice(over)} over your budget · try Surprise me` : `Within budget · ${currency}${formatPrice(-over)} to spare`}
        </Text>
      </div>

      <div className={styles.list}>
        <AnimatePresence initial={false}>
          {items.map(({ pickId, pick }) => (
            <BundleRow key={pickId} pickId={pickId} pick={pick} swapped={!!state.swaps[pickId]} onSwap={() => nav.sheet('yellowFriday/swap', { pickId })} onRemove={() => removePick(pickId)} />
          ))}
        </AnimatePresence>
        {items.length === 0 && (
          <div className={styles.listEmpty}>
            <Text variant="bodySemibold" color="textPrimary">
              Nothing in your find yet
            </Text>
            <Text variant="caption" color="textSecondary">
              Add the suggestion below or go back and save a pick.
            </Text>
          </div>
        )}
      </div>

      <div className={styles.rowActions}>
        <Button variant="noonSecondary" before={<Icon name="sparkles" size={16} />} onClick={surprise} disabled={items.length === 0}>
          {copy.surprise}
        </Button>
      </div>

      {suggestion && (
        <Pressable className={styles.suggest} onClick={() => addPick(suggestion.id)} aria-label={`${copy.complete}: add ${productOf(suggestion).title}`}>
          <span className={styles.suggestImg}>
            <ProductImage product={productOf(suggestion)} width={40} height={40} radius={8} />
          </span>
          <span className={styles.suggestText}>
            <Text variant="captionBold" color="textPrimary">
              {copy.complete}: {productOf(suggestion).brand} {productOf(suggestion).title.split(' ').slice(0, 4).join(' ')}
            </Text>
            <Text variant="micro" color="textSecondary">
              {suggestion.reason} · +{currency}
              {formatPrice(suggestion.yf)}
            </Text>
          </span>
          <span className={styles.suggestAdd}>
            <Icon name="plus" size={18} strokeWidth={2.4} />
          </span>
        </Pressable>
      )}

      <div className={styles.talk}>
        <Orbi size={44} mood="idle" />
        <div className={styles.bubble}>
          <Text variant="caption" color="textSecondary">
            {items.length >= 2 ? 'These work together. Nothing here is padding.' : 'Save two or more and the bundle shipping bonus kicks in.'}
          </Text>
        </div>
      </div>
    </Screen>
  );
}

function BundleRow({ pickId, pick, swapped, onSwap, onRemove }: { pickId: string; pick: Pick; swapped: boolean; onSwap: () => void; onRemove: () => void }) {
  const product = productOf(pick);
  const canSwap = (alternatives[pickId]?.length ?? 0) > 0 || swapped;
  return (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0, marginBottom: 0 }} transition={spring.gentle} className={styles.row}>
      <ProductImage product={product} width={56} height={56} radius={12} />
      <div className={styles.rowText}>
        <Text variant="captionBold" color="textPrimary" lines={1}>
          {product.brand} · {product.title}
        </Text>
        <Price price={pick.yf} was={pick.ref} size="sm" offSuffix={false} />
        {swapped && (
          <Text variant="micro" color="success">
            Swapped · {pick.reason}
          </Text>
        )}
      </div>
      {canSwap && (
        <Pressable className={styles.swapBtn} onClick={onSwap}>
          {swapped ? 'Undo' : 'Swap'}
        </Pressable>
      )}
      <Pressable className={styles.removeBtn} onClick={onRemove} aria-label="Remove from your find">
        <Icon name="close" size={14} strokeWidth={2.4} />
      </Pressable>
    </motion.div>
  );
}

/** Swap sheet: the comparable alternatives for one pick (same job, another price point), plus the original. */
export function SwapSheet({ params }: { params: { pickId?: string } }) {
  const nav = useNav();
  const pickId = params.pickId ?? '';
  const swaps = yfStore.useStore((s) => s.swaps);
  const base = picks.find((p) => p.id === pickId);
  const options: Pick[] = base ? [base, ...(alternatives[pickId] ?? [])] : [];
  const [choice, setChoice] = useState<string>(swaps[pickId] ?? pickId);
  const apply = () => {
    swapPick(pickId, choice === pickId ? null : choice);
    nav.back();
  };
  return (
    <>
      <SheetHeader title="Swap this pick" subtitle="Same job, different price point. The saving updates as you choose." />
      <SheetBody>
        <div className={styles.swapList} role="radiogroup">
          {options.map((o) => {
            const p = productOf(o);
            const on = choice === o.id;
            return (
              <Pressable key={o.id} className={`${styles.swapOption} ${on ? styles.swapOptionOn : ''}`} onClick={() => setChoice(o.id)} role="radio" aria-checked={on}>
                <ProductImage product={p} width={48} height={48} radius={10} />
                <span className={styles.rowText}>
                  <Text variant="captionBold" color="textPrimary" lines={1}>
                    {p.brand} · {p.title}
                  </Text>
                  <Text variant="micro" color="textSecondary">
                    {o.id === pickId ? 'Your pick' : o.reason}
                  </Text>
                  <Price price={o.yf} was={o.ref} size="sm" offSuffix={false} />
                </span>
                <span className={`${styles.radio} ${on ? styles.radioOn : ''}`} />
              </Pressable>
            );
          })}
        </div>
      </SheetBody>
      <SheetFooter primary={{ label: 'Use this one', onPress: apply }} />
    </>
  );
}
