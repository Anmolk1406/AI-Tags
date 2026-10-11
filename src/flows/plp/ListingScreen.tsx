import { motion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import { Divider, Icon, IconButton, MarketplaceTag, Pill, Pressable, ProductCard, Screen, Text } from '../../components';
import { useNav, useParams } from '../../kit/Navigator';
import { applyFilters, applySort, countFilters, facets, searchProducts, sortOptions } from './data';
import { RevealChip } from './components/NavPills';
import { SkeletonCard } from './components/SkeletonCard';
import { plpStore, usePlpStore } from './store';
import { plpTokens } from './tokens';
import styles from './plp.module.css';

/**
 * PLP (src/screens/ListingScreen → NoonCatalogList). Header: back + search pill, then the
 * Filter / Sort action pills | divider | facet pills. Grid: 2 cols, gap 12, NoonProductBoxVertical cards.
 * Loading: skeleton → cards rise 16px with a 35ms stagger (first 8 only). Sorting reorders with layout animation.
 */
export function ListingScreen() {
  const nav = useNav();
  const { query = 'Best sellers' } = useParams<{ query?: string }>();
  const { sort, filters } = usePlpStore();
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    plpStore.reset();
    plpStore.set({ query });
    const t = setTimeout(() => setLoading(false), plpTokens.loadingMs);
    return () => clearTimeout(t);
  }, [query]);

  const list = useMemo(() => applySort(applyFilters(searchProducts(query), filters), sort), [query, filters, sort]);
  const nFilters = countFilters(filters);
  const sortLabel = sort === 'recommended' ? 'Sort' : `Sort by : ${sortOptions.find((s) => s.id === sort)!.label}`;

  const header = (
    <div className={styles.header} data-scrolled={scrolled || undefined}>
      <div className={styles.topRow}>
        <IconButton icon="back" onPress={nav.back} label="Back" />
        <Pressable className={styles.searchPill} onClick={() => nav.push('search/search')} scale={0.98}>
          <Icon name="search" size={18} />
          <span className={styles.searchText}>{query}</span>
        </Pressable>
        <IconButton icon="cart" onPress={() => nav.push('cart/cart')} label="Cart" />
      </div>
      <div className="nk-hscroll" style={{ gap: 8, padding: '4px 15px 12px', alignItems: 'center' }}>
        <RevealChip index={0}>
          <Pill icon="filter" selected={nFilters > 0} count={nFilters} onPress={() => nav.sheet('plp/filters')}>
            Filter
          </Pill>
        </RevealChip>
        <RevealChip index={1}>
          <Pill icon="sort" selected={sort !== 'recommended'} onPress={() => nav.sheet('plp/sort')}>
            {sortLabel}
          </Pill>
        </RevealChip>
        <RevealChip index={2}>
          <Divider vertical length={24} margin="0 8px" color={plpTokens.pillDivider} />
        </RevealChip>
        <RevealChip index={3}>
          <Pill
            selected={!!filters.delivery?.length}
            removable
            onPress={() => plpStore.set({ filters: { ...filters, delivery: filters.delivery?.length ? [] : ['express'] } })}
          >
            <MarketplaceTag kind="express" height={16} />
          </Pill>
        </RevealChip>
        {facets
          .filter((f) => f.id !== 'delivery')
          .map((f, i) => {
            const n = filters[f.id]?.length ?? 0;
            return (
              <RevealChip key={f.id} index={4 + i}>
                <Pill dropdown selected={n > 0} count={n} onPress={() => nav.sheet('plp/filters', { facet: f.id })}>
                  {f.label}
                </Pill>
              </RevealChip>
            );
          })}
      </div>
    </div>
  );

  return (
    <Screen header={header} background="bgSurface" onScroll={(y) => setScrolled(y > 4)}>
      <div className={styles.meta}>
        <Text variant="caption" color="textSecondary">
          {loading ? 'Searching…' : `${list.length} results for`} <b style={{ color: 'var(--nk-color-text-primary)' }}>“{query}”</b>
        </Text>
      </div>
      <div className={styles.grid}>
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          : list.map((p, i) => (
              <motion.div
                key={p.id}
                layout
                initial={i < plpTokens.cardRise.animateFirst ? { opacity: 0, y: plpTokens.cardRise.y } : false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...plpTokens.cardRise.spring, delay: i < plpTokens.cardRise.animateFirst ? i * plpTokens.cardRise.stagger : 0, layout: { duration: 0.36, ease: [0.4, 0, 0.2, 1] } }}
              >
                <ProductCard product={p} />
              </motion.div>
            ))}
      </div>
      {!loading && list.length === 0 && (
        <div className={styles.empty}>
          <span style={{ fontSize: 48 }}>🔍</span>
          <Text variant="section">No results match your filters</Text>
          <Pressable onClick={() => plpStore.set({ filters: {} })} style={{ color: 'var(--nk-color-brand-blue)', font: 'var(--nk-type-body-semibold)' }}>
            Clear all filters
          </Pressable>
        </div>
      )}
    </Screen>
  );
}
