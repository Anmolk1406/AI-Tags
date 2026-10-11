import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { Pill, Screen, SearchInput, Text } from '../../components';
import { useNav } from '../../kit/Navigator';
import { easing } from '../../motion/presets';
import { RecentSearches } from './components/RecentSearches';
import { SuggestionRow } from './components/SuggestionRow';
import { recentSearches, suggest, trending } from './data';
import { searchTokens } from './tokens';
import { ref } from '../../foundations/tokens';

/**
 * NoonSearchScreen. Empty query → presearch (recent searches + trending chips).
 * Typing → presearch sinks 20px & fades (189ms), suggestion rows drop in from -20px, 60ms apart.
 */
export function SearchScreen() {
  const nav = useNav();
  const [q, setQ] = useState('');
  const [recents, setRecents] = useState(recentSearches);
  const [editing, setEditing] = useState(false);
  const results = suggest(q);
  const go = (query: string) => query.trim() && nav.push('plp/listing', { query: query.trim() });

  const header = (
    <div style={{ background: ref.color('bgSurface'), padding: 'calc(var(--nk-inset-top) + 4px) 16px 12px' }}>
      <SearchInput value={q} onChange={setQ} onBack={nav.back} autoFocus onSubmit={go} />
    </div>
  );

  return (
    <Screen header={header} background="bgSurface">
      <AnimatePresence mode="wait" initial={false}>
        {!q.trim() ? (
          <motion.div
            key="presearch"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.189, ease: easing.inOut, delay: 0.124 } }}
            exit={{ opacity: 0, y: 20, transition: { duration: 0.189, ease: easing.inOut } }}
            style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingTop: 8 }}
          >
            <RecentSearches items={recents} editing={editing} onToggleEdit={() => setEditing((e) => !e)} onRemove={(id) => setRecents((r) => r.filter((x) => x.id !== id))} onPress={go} />
            <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Text variant="section" color="textStrong" style={{ padding: '0 16px' }}>
                Trending searches
              </Text>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: '0 16px' }}>
                {trending.map((t) => (
                  <Pill key={t} variant="tag" icon="flame" onPress={() => go(t)}>
                    {t}
                  </Pill>
                ))}
              </div>
            </section>
          </motion.div>
        ) : (
          <motion.div key="suggestions" exit={{ opacity: 0, transition: { duration: 0.13 } }} style={{ padding: '4px 12px' }}>
            <AnimatePresence initial={true}>
              {results.map((r, i) => (
                <motion.div
                  key={r.text}
                  layout="position"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0, transition: { opacity: { duration: 0.183, ease: easing.out, delay: searchTokens.rowEnterDelay + i * searchTokens.rowStagger }, y: { ...searchTokens.pushSpring, delay: searchTokens.rowEnterDelay + i * searchTokens.rowStagger } } }}
                  exit={{ opacity: 0, y: -12, transition: { duration: 0.15, delay: i * 0.025 } }}
                  transition={{ layout: { duration: 0.18, ease: easing.out } }}
                  style={{ marginBottom: 8 }}
                >
                  <SuggestionRow text={r.text} query={q} product={r.product} category={r.category} onPress={() => go(r.text)} onFill={() => setQ(r.text + ' ')} />
                </motion.div>
              ))}
            </AnimatePresence>
            {!results.length && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '24px 4px' }}>
                <SuggestionRow text={`Search for "${q.trim()}"`} query="" onPress={() => go(q)} onFill={() => undefined} />
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </Screen>
  );
}
