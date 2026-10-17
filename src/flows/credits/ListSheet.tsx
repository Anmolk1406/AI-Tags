import { useEffect, useState } from 'react';
import { useNav } from '../../kit/Navigator';
import type { ScreenProps } from '../../kit/types';
import { creditsAssets as a } from './assets';
import { expiringHeader, pendingHeader, pendingTransactions, t, transactions } from './data';
import { creditsTokens as ct } from './tokens';
import { setFilters } from './store';
import { DefaultView, NoteBox, SkeletonRows, TransactionRow, WalletButton, WalletError } from './components/WalletUI';
import styles from './sheets.module.css';

export interface ListSheetParams {
  type?: 'PENDING' | 'EXPIRING';
}

/**
 * WalletPendingOrExpiringTransactionsScreen: POST /transactions with status PENDING or BANNER_EXPIRING. The default
 * header with the green (pending) / amber (expiring) amount pill, the expiring note, the rows (→ details, stacked as
 * another sheet) and, for EXPIRING, the "Shop now" / "View all Expiring Credits" footer.
 */
export function ListSheet({ params }: ScreenProps<ListSheetParams>) {
  const nav = useNav();
  const type = params.type ?? 'PENDING';
  const expiring = type === 'EXPIRING';
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const id = setTimeout(() => setLoading(false), ct.previewDelay);
    return () => clearTimeout(id);
  }, []);
  const list = expiring ? transactions.filter((x) => x.status === 'EXPIRING') : pendingTransactions;
  const header = expiring ? { ...expiringHeader, count: list.length } : { title: pendingHeader.title, amountText: pendingHeader.amountText, count: list.length };

  return (
    <div className={styles.fill}>
      <div className={`nk-scroll ${styles.scroll}`}>
        {loading ? (
          <div className={styles.listLoading}>
            <SkeletonRows count={8} />
          </div>
        ) : list.length === 0 ? (
          <div className={styles.sheetEmpty}>
            <WalletError image={a.emptyTransactions} width={161} height={105} title={t.emptyTitle} subtitle={t.emptySubtitle} style={{ width: '100%' }} />
          </div>
        ) : (
          <div className={styles.sheetList}>
            <DefaultView sheet title={header.title} count={header.count} amountText={header.amountText} type={type} />
            {expiring && <NoteBox sheet>{t.expiringNote}</NoteBox>}
            {list.map((tx, i) => (
              <TransactionRow key={tx.code} tx={tx} last={i === list.length - 1} onPress={() => nav.sheet('credits/details', { code: tx.code })} />
            ))}
          </div>
        )}
      </div>
      {expiring && !loading && (
        <div className={styles.sheetFooter}>
          <WalletButton
            onPress={() => {
              nav.back();
              nav.switchTab('home');
            }}
          >
            {t.shopNow}
          </WalletButton>
          <WalletButton
            kind="secondary"
            onPress={() => {
              nav.back();
              setFilters({ sort: 'SOONEST_TO_EXPIRE', status: 'EXPIRING', startDate: '', endDate: '' });
            }}
          >
            {t.viewAllExpiring}
          </WalletButton>
        </div>
      )}
    </div>
  );
}

export default ListSheet;
