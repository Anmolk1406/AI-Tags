import { createStore } from '../../kit/createStore';
import type { CreditEntry } from '../../kit/DemoStore';
import type { OriginIconName } from '../../components/Icon/originIcons';
import { amountHtml, day, initialFilters, pendingHeader, pendingTransactions, seedBankAccounts, transactions, type BankAccount, type WalletFilters, type WalletTransaction } from './data';

/**
 * Flow-local stand-in for the wallet APIs. The landing, its sheets and the bank-transfer modal are separate stack
 * entries, so the filters (WalletTransactions filterItems), the prefetched filter result (onSubmitFiltersPress) and the
 * saved bank accounts live here. The balance and the session's own credit movements are cross-flow: `useDemoStore()`.
 */
export const creditsStore = createStore({
  filters: initialFilters as WalletFilters,
  /** bumps when a sheet asks the landing to refetch page 1 (quickFilter / refreshAllApis) */
  refetch: 0,
  /** the Filters sheet already fetched this result: show it without a skeleton (onSubmitFiltersPress) */
  prefetched: false,
  bankAccounts: seedBankAccounts as BankAccount[],
  selectedAccount: null as string | null,
  /** a bank transfer was requested in this session (the withdrawable balance is spent) */
  withdrawn: 0,
});

export const setFilters = (filters: WalletFilters, prefetched = false) => creditsStore.patch((s) => ({ filters, prefetched, refetch: s.refetch + 1 }));

const entryIcon: Record<string, OriginIconName> = { giftcard: 'gift-card', voucher: 'gift-card', bank: 'payment-bank' };
/** a credit movement made in this demo session, as the server would list it */
export const entryToTransaction = (e: CreditEntry): WalletTransaction => {
  const date = e.at.slice(0, 10);
  return {
    code: e.id,
    title: e.title,
    subtitle: `<grey>${day(date)}</grey>`,
    icon: entryIcon[e.source] ?? 'star-plus',
    amountText: amountHtml(e.amount),
    isExpirable: false,
    status: 'ACTIVE',
    amount: e.amount,
    date,
  };
};

export interface TransactionsResponse {
  transactions: WalletTransaction[];
  transactionHeader: typeof pendingHeader | null;
}

/** POST /transactions {dateRange, status, sortBy} — the whole result; the screen pages it by PAGE_SIZE. */
export function queryTransactions(filters: WalletFilters, entries: CreditEntry[], opts: { empty?: boolean } = {}): TransactionsResponse {
  if (opts.empty) return { transactions: [], transactionHeader: null };
  let list = [...entries.map(entryToTransaction), ...transactions];
  if (filters.status === 'EXPIRING') list = list.filter((x) => x.status === 'EXPIRING');
  if (filters.status === 'EXPIRED') list = list.filter((x) => x.status === 'EXPIRED');
  if (filters.startDate) list = list.filter((x) => x.date >= filters.startDate);
  if (filters.endDate) list = list.filter((x) => x.date <= filters.endDate);
  const recent = (a: WalletTransaction, b: WalletTransaction) => b.date.localeCompare(a.date);
  if (filters.sort === 'SOONEST_TO_EXPIRE') {
    const exp = list.filter((x) => x.isExpirable).sort((a, b) => (a.expiresAt ?? '').localeCompare(b.expiresAt ?? ''));
    list = [...exp, ...list.filter((x) => !x.isExpirable).sort(recent)];
  } else list.sort(recent);
  const showPending = filters.status === 'ALL' && !filters.startDate && !filters.endDate && pendingTransactions.length > 0;
  return { transactions: list, transactionHeader: showPending ? pendingHeader : null };
}
