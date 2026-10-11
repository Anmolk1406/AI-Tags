import { AnimatePresence, motion } from 'motion/react';
import { useMemo, useState } from 'react';
import { Icon, Pill, Pressable, Text } from '../../components';
import { useNav, useParams } from '../../kit/Navigator';
import { applyFilters, countFilters, facets, searchProducts, type FacetId, type Filters } from './data';
import { plpStore } from './store';
import { plpTokens } from './tokens';
import styles from './filters.module.css';

/**
 * NoonFiltersScreenV2 + NoonFiltersV2. Title "Filters", "Search across filters" box, left sidebar
 * (active = #EFF7FF + 3px #0057FF end border), option pills (2px border, selected #0057FF / #F0F7FF),
 * footer "Clear All" (0.4) / "Show {{count}} results" (0.6), 56h r14.
 * Edits a draft; only "Show results" commits to the PLP.
 */
export function FiltersSheet() {
  const nav = useNav();
  const { facet = 'category' } = useParams<{ facet?: FacetId }>();
  const [active, setActive] = useState<FacetId>(facet);
  const [draft, setDraft] = useState<Filters>(() => structuredClone(plpStore.get().filters));
  const [q, setQ] = useState('');
  const count = useMemo(() => applyFilters(searchProducts(plpStore.get().query), draft).length, [draft]);

  const toggle = (f: FacetId, id: string) =>
    setDraft((d) => {
      const cur = d[f] ?? [];
      return { ...d, [f]: cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id] };
    });

  const current = facets.find((f) => f.id === active)!;
  const options = q ? facets.flatMap((f) => f.options.filter((o) => o.label.toLowerCase().includes(q.toLowerCase())).map((o) => ({ ...o, facet: f.id }))) : current.options.map((o) => ({ ...o, facet: current.id }));

  return (
    <div className={styles.sheet}>
      <div className={styles.titleRow}>
        <Text variant="titleSmall" color={plpTokens.filters.title}>
          Filters
        </Text>
        <Pressable onClick={nav.back} aria-label="Close" style={{ display: 'flex', color: 'var(--nk-color-text-muted)' }}>
          <Icon name="close" size={20} />
        </Pressable>
      </div>
      <div className={styles.search}>
        <Icon name="search" size={18} color="var(--nk-color-text-secondary)" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search across filters" />
      </div>
      <div className={styles.body}>
        <nav className={`nk-scroll ${styles.sidebar}`}>
          {facets.map((f) => {
            const n = draft[f.id]?.length ?? 0;
            return (
              <button key={f.id} type="button" className={styles.side} data-active={(!q && f.id === active) || undefined} onClick={() => (setQ(''), setActive(f.id))}>
                <span>{f.label}</span>
                {n > 0 && <span className={styles.dot}>{n}</span>}
              </button>
            );
          })}
        </nav>
        <div className={`nk-scroll ${styles.options}`}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={q ? 'q' : active} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.18 }} className={styles.section}>
              <div className={styles.sectionHeader}>
                <span>{q ? 'Matching filters' : current.label}</span>
              </div>
              <div className={styles.pills}>
                {options.map((o) => (
                  <Pill key={`${o.facet}-${o.id}`} variant="filter" selected={draft[o.facet]?.includes(o.id)} onPress={() => toggle(o.facet, o.id)}>
                    {o.label}
                  </Pill>
                ))}
                {!options.length && <Text color="textSecondary">No filters match “{q}”</Text>}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <div className={styles.footer}>
        <Pressable className={styles.clear} onClick={() => setDraft({})} disabled={!countFilters(draft)}>
          Clear All
        </Pressable>
        <Pressable
          className={styles.show}
          onClick={() => {
            plpStore.set({ filters: draft });
            nav.back();
          }}
        >
          <span>Show</span>
          <motion.span key={count} initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={{ display: 'inline-block' }}>
            {count}
          </motion.span>
          <span>results</span>
        </Pressable>
      </div>
    </div>
  );
}
