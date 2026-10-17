import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, Spinner } from '../../components';
import { useNav } from '../../kit/Navigator';
import { useDemoStore } from '../../kit/DemoStore';
import type { ScreenProps } from '../../kit/types';
import { creditsAssets as a } from './assets';
import { t, type SortOption, type StatusOption, type WalletFilters } from './data';
import { creditsTokens as ct } from './tokens';
import { creditsStore, queryTransactions, setFilters } from './store';
import { RadioRow, SheetTitleRow } from './components/WalletUI';
import styles from './sheets.module.css';

const pad = (n: number) => String(n).padStart(2, '0');
const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const ddmmyyyy = (s: string) => (s ? `${s.slice(8, 10)}/${s.slice(5, 7)}/${s.slice(0, 4)}` : '');
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * react-native-calendars `Calendar` as WalletDateSection themes it: month title between two chevrons (centred),
 * weekday row (10/700 uppercase), 6 weeks with adjacent-month days greyed, `markingType="period"` — start / end in
 * #0076FF with rounded outer caps, the days between in #E8F0FE, a lone start in #CFD9E7. Future dates are selectable.
 */
function PeriodCalendar({ start, end, onDay }: { start: string; end: string; onDay: (day: string) => void }) {
  const today = iso(new Date());
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const weeks = useMemo(() => {
    const first = new Date(month);
    first.setDate(1 - first.getDay());
    const days = Array.from({ length: 42 }, (_, i) => new Date(first.getFullYear(), first.getMonth(), first.getDate() + i));
    const rows = [];
    for (let i = 0; i < 6; i++) rows.push(days.slice(i * 7, i * 7 + 7));
    // the library drops a sixth week that is entirely next month
    return rows.filter((r) => r.some((d) => d.getMonth() === month.getMonth()));
  }, [month]);
  const title = month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const shift = (n: number) => setMonth((m) => new Date(m.getFullYear(), m.getMonth() + n, 1));
  return (
    <div className={styles.calendar}>
      <div className={styles.calHeader}>
        <Pressable className={styles.calArrow} scale={1} onClick={() => shift(-1)} aria-label="Previous month">
          <img className={styles.flip} src={a.calendarLeft} width={6} height={10} alt="" />
        </Pressable>
        <span className={styles.calMonth}>{title}</span>
        <Pressable className={styles.calArrow} scale={1} onClick={() => shift(1)} aria-label="Next month">
          <img className={styles.flip} src={a.calendarRight} width={6} height={10} alt="" />
        </Pressable>
      </div>
      <div className={styles.calWeekdays}>
        {WEEKDAYS.map((d) => (
          <span key={d} className={styles.calWeekday}>
            {d}
          </span>
        ))}
      </div>
      {weeks.map((w, i) => (
        <div key={i} className={styles.calWeek}>
          {w.map((d) => {
            const key = iso(d);
            const single = !!start && (!end || start === end) && key === start;
            const isStart = !!start && !!end && start !== end && key === start;
            const isEnd = !!start && !!end && start !== end && key === end;
            const between = !!start && !!end && key > start && key < end;
            return (
              <Pressable
                key={key}
                scale={1}
                className={styles.calDay}
                data-other={d.getMonth() !== month.getMonth() || undefined}
                data-today={key === today || undefined}
                data-single={single || undefined}
                data-start={isStart || undefined}
                data-end={isEnd || undefined}
                data-between={between || undefined}
                data-day={key}
                onClick={() => onDay(key)}
              >
                <span className={styles.calDayText}>{d.getDate()}</span>
              </Pressable>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/**
 * WalletFiltersScreen (60% snap, r20, grabber + close X): Sort by, Status, Transaction date (From / To + period
 * calendar). Every change prefetches POST /transactions; the footer reads Apply / "0 Transactions" / Retry and is
 * grey until something changed. Apply hands the prefetched result to the landing (onSubmitFiltersPress).
 */
export function FiltersSheet(_: ScreenProps) {
  const nav = useNav();
  const entries = useDemoStore((s) => s.creditEntries);
  const [f, setF] = useState<WalletFilters>(() => creditsStore.get().filters);
  const [changed, setChanged] = useState(false);
  const [loading, setLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const count = useMemo(() => queryTransactions(f, entries).transactions.length, [f, entries]);

  const change = (next: WalletFilters) => {
    setF(next);
    setChanged(true);
    setLoading(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setLoading(false), ct.previewDelay);
  };
  const onDay = (day: string) => {
    if (!f.startDate || (f.startDate && f.endDate)) change({ ...f, startDate: day, endDate: '' });
    else if (day < f.startDate) change({ ...f, startDate: day });
    else change({ ...f, endDate: day });
  };
  const empty = !loading && count === 0;
  const sorts: [SortOption, string][] = [
    ['RECENT', t.sortRecent],
    ['SOONEST_TO_EXPIRE', t.sortSoonest],
  ];
  const statuses: [StatusOption, string][] = [
    ['ALL', t.all],
    ['EXPIRING', t.expiring],
    ['EXPIRED', t.expired],
  ];

  return (
    <div className={styles.fill} style={{ position: 'relative' }}>
      <div className={styles.filtersHeader}>
        <SheetTitleRow title={t.filters} onClose={() => nav.back()} />
      </div>
      <div className={`nk-scroll ${styles.scroll}`}>
        <div className={styles.filtersBody}>
          <div className={styles.sectionTitle}>{t.sortBy}</div>
          {sorts.map(([id, label]) => (
            <RadioRow key={id} label={label} selected={f.sort === id} isDefault={id === 'RECENT'} onPress={() => change({ ...f, sort: id })} />
          ))}
          <div className={styles.divider} />
          <div className={styles.sectionTitle}>{t.status}</div>
          {statuses.map(([id, label]) => (
            <div key={id}>
              {id === 'EXPIRED' && <div className={styles.gap8} />}
              <RadioRow label={label} selected={f.status === id} isDefault={id === 'ALL'} onPress={() => change({ ...f, status: id })} />
            </div>
          ))}
          <div className={styles.divider} />
          <div className={styles.dateTitleRow}>
            <span className={styles.sectionTitle}>{t.transactionDate}</span>
            {(f.startDate || f.endDate) && (
              <Pressable className={styles.clearDates} scale={1} onClick={() => change({ ...f, startDate: '', endDate: '' })}>
                {t.clear}
              </Pressable>
            )}
          </div>
          <div className={styles.inputs}>
            {[
              [t.from, f.startDate],
              [t.to, f.endDate],
            ].map(([label, value]) => (
              <div key={label} className={styles.inputCol}>
                <div className={styles.inputLabel} data-filled={value || undefined}>
                  {label}
                </div>
                <div className={styles.dateInput} data-empty={!value || undefined}>
                  {value ? ddmmyyyy(value) : t.datePlaceholder}
                </div>
              </div>
            ))}
          </div>
          <PeriodCalendar start={f.startDate} end={f.endDate} onDay={onDay} />
        </div>
      </div>
      <div className={styles.filtersFooter}>
        <Pressable
          className={styles.apply}
          data-changed={changed || undefined}
          scale={1}
          disabled={loading || !changed || empty}
          onClick={() => {
            setFilters(f, true);
            nav.back();
          }}
        >
          {loading ? <Spinner variant="ios" color="var(--nk-color-text-inverse)" /> : empty ? t.zeroTransactions : t.apply}
        </Pressable>
      </div>
    </div>
  );
}

export default FiltersSheet;
