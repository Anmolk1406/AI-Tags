import { motion } from 'motion/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Divider, MarketplaceTag, Pill, Pressable, ProductCard, Screen, SearchInput, TabBar, Text } from '../../components';
import { useNav, useParams } from '../../kit/Navigator';
import { handoff } from '../../motion/presets';
import { SkeletonReveal } from '../../motion/recipes';
import { brandWidgetFor } from './brands';
import { applyFilters, applySort, countFilters, facets, isPhoneQuery, searchProducts, sortOptions, type Filters } from './data';
import { BrandWidget } from './components/BrandWidget';
import { MarketplaceStrip, type MarketplaceId } from './components/MarketplaceStrip';
import { RevealChip } from './components/NavPills';
import { SkeletonCard } from './components/SkeletonCard';
import { plpStore, usePlpStore } from './store';
import { plpTokens } from './tokens';
import styles from './plp.module.css';

const T = plpTokens.timeline;
const keyOf = (query: string, f: Filters) => `${query}|${JSON.stringify(f)}`;

/**
 * PLP (src/screens/ListingScreen → NoonCatalogList) on the Brand Widget PLP handoff (920:18788). It opens
 * "in place" from search (`results-fade`): the search bar sits where the search screen's does, so only
 * the page under it fades in. t = 0 is the page appearing:
 *   +224ms  bottom nav rises 88px on the handoff spring
 *   +480ms  chips drop 20px into place over their skeletons, 60ms apart
 *   +680ms  cards rise 16px out of their skeletons, 60ms apart; each skeleton fades 353ms after its card
 *   landed  "Shop phones by brand" opens between the chips and the grid (phone searches)
 * Filter / brand changes dissolve the cards back into skeletons and re-rise them (820ms); Sort reorders
 * with a layout animation. Header: search bar (tap = back to editing) · marketplace strip · pills.
 */
export function ListingScreen() {
  const nav = useNav();
  const { query = 'Best sellers' } = useParams<{ query?: string }>();
  const store = usePlpStore();
  // the store still holds the previous listing's sort / filters until the reset below: render as reset
  const ready = useRef(false);
  const { sort, filters } = ready.current ? store : { sort: 'recommended' as const, filters: {} as Filters };
  const [scrolled, setScrolled] = useState(false);
  const [landed, setLanded] = useState(false);
  const [searching, setSearching] = useState(true);

  useEffect(() => {
    plpStore.reset();
    plpStore.set({ query });
    ready.current = true;
    setLanded(false);
    setSearching(true);
    const a = setTimeout(() => setSearching(false), T.cardsAt * 1000);
    // the on-screen cards (rows 1–2) have risen into place: the brand widget keys off this
    const b = setTimeout(() => setLanded(true), (T.cardsAt + 3 * handoff.stagger.in + 0.5) * 1000);
    return () => (clearTimeout(a), clearTimeout(b));
  }, [query]);

  const list = useMemo(() => applySort(applyFilters(searchProducts(query), filters), sort), [query, filters, sort]);
  const widget = useMemo(() => brandWidgetFor(isPhoneQuery(query), searchProducts(query)), [query]);
  const brand = filters.brand?.length === 1 && widget?.cards.some((c) => c.brand === filters.brand![0]) ? filters.brand[0] : undefined;

  // what the grid shows: a sort change reorders in place, a filter change swaps through the skeletons
  const [shown, setShown] = useState({ list, key: keyOf(query, filters), epoch: 0 });
  const [reloading, setReloading] = useState(false);
  const latest = useRef(list);
  latest.current = list;
  useEffect(() => {
    const key = keyOf(query, filters);
    if (key === shown.key) {
      setShown((s) => ({ ...s, list }));
      return;
    }
    setReloading(true);
    const t = setTimeout(() => {
      setShown((s) => ({ list: latest.current, key, epoch: s.epoch + 1 }));
      setReloading(false);
    }, plpTokens.swap.revealAt * 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list]);

  const nFilters = countFilters(filters);
  const sortLabel = sort === 'recommended' ? 'Sort' : `Sort by : ${sortOptions.find((s) => s.id === sort)!.label}`;
  const express = !!filters.delivery?.includes('express');
  const setExpress = (on: boolean) => plpStore.set({ filters: { ...filters, delivery: on ? ['express'] : [] } });
  const setBrand = (b?: string) => plpStore.set({ filters: { ...filters, brand: b ? [b] : [] } });

  // tapping the bar goes back to editing: pop to the search page it came from, or open one on this query
  const at = nav.stack.map((e) => e.route).lastIndexOf(nav.route);
  const editQuery = () => (nav.stack[at - 1]?.route.startsWith('search/') ? nav.back() : nav.push('search/search', { q: query }));
  const onMarketplace = (id: MarketplaceId) => {
    if (id === 'noon' || id === 'express') setExpress(id === 'express');
    else nav.toast(`${plpTokens.marketplaces[id].a} — not in this demo`);
  };

  let chip = 0;
  const header = (
    <div className={styles.header} data-scrolled={scrolled || undefined}>
      <div className={styles.barRow}>
        <SearchInput value={query} onChange={() => undefined} onBack={nav.back} onFieldPress={editQuery} />
      </div>
      <MarketplaceStrip active={express ? 'express' : 'noon'} onSelect={onMarketplace} />
      <div className={`nk-hscroll ${styles.pills}`}>
        <RevealChip index={chip++}>
          <Pill icon="filter" selected={nFilters > 0} count={nFilters} onPress={() => nav.sheet('plp/filters')}>
            Filter
          </Pill>
        </RevealChip>
        <RevealChip index={chip++}>
          <Pill icon="sort" selected={sort !== 'recommended'} onPress={() => nav.sheet('plp/sort')}>
            {sortLabel}
          </Pill>
        </RevealChip>
        <RevealChip index={chip++} skeleton={false}>
          <Divider vertical length={24} margin="0 8px" color={plpTokens.pillDivider} />
        </RevealChip>
        <RevealChip index={chip++}>
          <Pill selected={express} removable onPress={() => setExpress(!express)}>
            <MarketplaceTag kind="express" height={16} />
          </Pill>
        </RevealChip>
        {facets
          .filter((f) => f.id !== 'delivery')
          .map((f) => {
            const n = filters[f.id]?.length ?? 0;
            return (
              <RevealChip key={f.id} index={chip++}>
                <Pill dropdown selected={n > 0} count={n} onPress={() => nav.sheet('plp/filters', { facet: f.id })}>
                  {f.label}
                </Pill>
              </RevealChip>
            );
          })}
      </div>
    </div>
  );

  const footer = (
    <motion.div className={styles.navDock} initial={{ y: T.navRise }} animate={{ y: 0 }} transition={{ ...handoff.spring, delay: T.navAt }}>
      <TabBar active="home" />
    </motion.div>
  );

  const first = shown.epoch === 0;
  return (
    <Screen header={header} footer={footer} background="bgSurface" onScroll={(y) => setScrolled(y > 4)}>
      <div className={styles.meta}>
        <Text variant="caption" color="textSecondary">
          {searching ? 'Searching…' : `${list.length} results for`} <b style={{ color: 'var(--nk-color-text-primary)' }}>“{query}”</b>
        </Text>
      </div>
      <BrandWidget key={query} config={widget} selected={brand} landed={landed} onSelect={setBrand} onClear={() => setBrand()}>
        <div className={styles.grid}>
          {shown.list.map((p, i) => {
            const rises = i < T.animateFirst;
            return (
              <motion.div key={`${shown.epoch}-${p.id}`} layout="position" transition={{ layout: { duration: 0.36, ease: [0.4, 0, 0.2, 1] } }}>
                <SkeletonReveal
                  skeleton={<SkeletonCard />}
                  animateIn={rises}
                  loading={reloading && rises}
                  delay={(first ? T.cardsAt : 0) + i * handoff.stagger.in}
                  rise={T.cardRise}
                  skeletonAfter={T.skeletonOutAfter}
                >
                  <ProductCard product={p} />
                </SkeletonReveal>
              </motion.div>
            );
          })}
        </div>
        {!reloading && shown.list.length === 0 && (
          <div className={styles.empty}>
            <span style={{ fontSize: 48 }}>🔍</span>
            <Text variant="section">No results match your filters</Text>
            <Pressable onClick={() => plpStore.set({ filters: {} })} style={{ color: 'var(--nk-color-brand-blue)', font: 'var(--nk-type-body-semibold)' }}>
              Clear all filters
            </Pressable>
          </div>
        )}
      </BrandWidget>
      <div className={styles.tabSpace} />
    </Screen>
  );
}
