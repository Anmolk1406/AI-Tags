import { motion } from 'motion/react';
import { Icon, Pressable, SheetBody, SheetFooter, SheetHeader, Text } from '../../../components';
import { useNav } from '../../../kit/Navigator';
import { spring } from '../../../motion/presets';
import { Orbi } from '../components/Orbi';
import { copy, interests } from '../data';
import { resetJourney, toggleInterest, yfStore } from '../store';
import styles from './yellowFriday.module.css';

/**
 * Act 2 — "Choose your adventure". One question, six cards, up to two picks; the guess from the signals is already
 * selected, so this step can be confirmed in one tap. Origin M-BottomSheet: the navigator draws the chrome.
 */
export function InterestsSheet() {
  const nav = useNav();
  const selected = yfStore.useStore((s) => s.interests);
  const go = () => {
    const keep = selected;
    nav.back();
    // after the sheet has animated out: a fresh reveal with the chosen interests
    setTimeout(() => {
      resetJourney();
      yfStore.patch({ interests: keep });
      nav.push('yellowFriday/reveal');
    }, 260);
  };
  return (
    <>
      <SheetHeader title={copy.interestsTitle} subtitle={copy.interestsSub} />
      <SheetBody>
        <div className={styles.interestGrid} role="group" aria-label={copy.interestsHint}>
          {interests.map((it) => {
            const on = selected.includes(it.id);
            return (
              <Pressable key={it.id} className={`${styles.interest} ${on ? styles.interestOn : ''}`} onClick={() => toggleInterest(it.id)} aria-pressed={on} scale={0.97}>
                <span className={styles.interestEmoji} aria-hidden="true">
                  {it.emoji}
                </span>
                <Text variant="bodySemibold" color="textPrimary">
                  {it.label}
                </Text>
                {on && (
                  <motion.span className={styles.tick} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={spring.bouncy}>
                    <Icon name="check" size={12} strokeWidth={3} />
                  </motion.span>
                )}
              </Pressable>
            );
          })}
        </div>
        <div className={styles.talk}>
          <Orbi size={44} mood="think" />
          <Text variant="caption" color="textSecondary">
            {copy.interestsHint} · {selected.length} of 2
          </Text>
        </div>
      </SheetBody>
      <SheetFooter primary={{ label: copy.interestsCta, onPress: go }} />
    </>
  );
}
