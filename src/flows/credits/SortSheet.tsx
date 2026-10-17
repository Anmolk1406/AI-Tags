import { useNav } from '../../kit/Navigator';
import type { ScreenProps } from '../../kit/types';
import { t, type SortOption } from './data';
import { creditsStore, setFilters } from './store';
import { RadioRow, SheetTitleRow } from './components/WalletUI';
import styles from './sheets.module.css';

/** WalletSortScreen (content height, r16): "Sort by" + close, two radio rows; a tap on the other row applies and closes. */
export function SortSheet(_: ScreenProps) {
  const nav = useNav();
  const filters = creditsStore.useStore((s) => s.filters);
  const rows: [SortOption, string][] = [
    ['RECENT', t.sortRecent],
    ['SOONEST_TO_EXPIRE', t.sortSoonest],
  ];
  return (
    <div className={styles.content}>
      <SheetTitleRow title={t.sortBy} onClose={() => nav.back()} />
      {rows.map(([id, label]) => (
        <RadioRow
          key={id}
          tight
          label={label}
          selected={filters.sort === id}
          isDefault={id === 'RECENT'}
          disabled={filters.sort === id}
          onPress={() => {
            setFilters({ ...filters, sort: id });
            nav.back();
          }}
        />
      ))}
    </div>
  );
}

export default SortSheet;
