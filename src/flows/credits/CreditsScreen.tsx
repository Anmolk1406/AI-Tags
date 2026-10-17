import { useEffect, useMemo, useRef, useState } from 'react';
import { HtmlText, Pressable, Screen, Skeleton } from '../../components';
import { useNav } from '../../kit/Navigator';
import { useDemoStore } from '../../kit/DemoStore';
import type { ScreenProps } from '../../kit/types';
import { currency } from '../../data';
import { creditsAssets as a } from './assets';
import { expiringBanner, initialFilters, isDefaultFilters, negativeBalance, negativeBanner, PAGE_SIZE, t, withdrawableBalance, bankConfig, type WalletProvider } from './data';
import { creditsProviders, creditsTokens as ct } from './tokens';
import { creditsStore, queryTransactions, setFilters } from './store';
import { NoteBox, PendingCard, ProviderMark, SkeletonRows, TransactionRow, WalletError } from './components/WalletUI';
import styles from './credits.module.css';

export type CreditsState = 'loading' | 'error' | 'empty' | 'negative' | 'giftcard-only' | 'no-topup' | 'campaign' | 'list-error';
export interface CreditsParams {
  /** demo states: the API responses the landing renders */
  state?: CreditsState;
}

/** WalletScreenHeader: 36 back circle, 18/700 "noon Credits", optional "Withdraw to bank" pill. */
function WalletHeader({ onBack, onWithdraw }: { onBack: () => void; onWithdraw?: () => void }) {
  return (
    <div className={styles.headerWrap}>
      <div className={styles.header}>
        <span className={styles.headerLeft}>
          <Pressable className={styles.back} scale={1} onClick={onBack} aria-label="Back">
            <img className={styles.flip} src={a.backChevron} width={7} height={10} alt="" />
          </Pressable>
          <span className={styles.title}>{t.noonCredits}</span>
        </span>
        {onWithdraw && (
          <Pressable className={styles.withdraw} scale={1} onClick={onWithdraw}>
            {t.withdrawToBank}
          </Pressable>
        )}
      </div>
    </div>
  );
}

/** WalletTotalBalance: "-" 32/500, currency 28/600, integer 40/700, ".XX" 30/700; no thousands separators. */
function TotalBalance({ amount }: { amount: number }) {
  const negative = amount < 0;
  const [int, dec] = Math.abs(amount).toFixed(2).split('.');
  return (
    <div className={styles.balance} data-negative={negative || undefined}>
      <span className={styles.balanceLine}>
        {negative && <span className={styles.sign}>-</span>}
        <span className={styles.currency}>{currency}</span>
        {int}
        <span className={styles.decimal}>.{dec}</span>
      </span>
    </div>
  );
}

/** WalletBanner: pill on a white → tint rim, the dotted glow behind; only the <a> link is tappable. */
function WalletBanner({ banner, onLink }: { banner: { type: 'EXPIRING' | 'NEGATIVE_BALANCE'; text: string }; onLink: () => void }) {
  const negative = banner.type === 'NEGATIVE_BALANCE';
  return (
    <div className={styles.banner} data-type={banner.type}>
      <img className={styles.glow} src={negative ? a.dangerBlur : a.yellowBlur} alt="" />
      <div className={styles.bannerRim}>
        <div
          className={styles.bannerPill}
          onClick={(e) => {
            if ((e.target as HTMLElement).closest('a')) onLink();
          }}
        >
          <HtmlText base value={banner.text} className={styles.bannerText} />
          {!negative && <img className={`${styles.bannerChevron} ${styles.flip}`} src={a.yellowChevron} width={5} height={10} alt="" />}
        </div>
      </div>
    </div>
  );
}

/** WalletTopup: black 48 button, title, overlapping provider logos pill with the + badge; optional campaign strip. */
function TopupButton({ title, providers, campaign, onPress }: { title: string; providers: readonly WalletProvider[]; campaign?: { text: string; gradient: string[] }; onPress: () => void }) {
  const n = providers.length;
  const r = ct.logoSize + ct.logoStep * (n - 1);
  return (
    <Pressable className={styles.topup} scale={1} onClick={onPress}>
      <span className={styles.topupButton}>
        <span className={styles.topupTitle}>{title}</span>
        {n > 0 && (
          <span className={styles.logos} style={{ width: r + 10, borderRadius: (r + 10) / 2 }}>
            <span className={styles.logosRow} style={{ width: r }}>
              {providers.map((p, i) => (
                <ProviderMark key={p.code} provider={p} size={ct.logoSize} round style={{ right: ct.logoStep * i }} />
              ))}
            </span>
            <img className={styles.plus} src={a.topupAdd} alt="" />
          </span>
        )}
      </span>
      {campaign && (
        <span className={styles.campaign} style={{ background: `linear-gradient(to bottom, ${campaign.gradient.join(', ')})` }}>
          {campaign.text}
        </span>
      )}
    </Pressable>
  );
}

/**
 * WalletScreen (noon.WalletScreen, pushed from Account → noon Credits): header, the fixed top view (balance, banner,
 * top-up) and the white panel with "Transactions", the filter chips and the transaction list (pending card, rows,
 * expiring separator, pagination, loading / empty / error states).
 */
export function CreditsScreen({ params }: ScreenProps<CreditsParams>) {
  const nav = useNav();
  const state = params.state;
  const credits = useDemoStore((s) => s.credits);
  const entries = useDemoStore((s) => s.creditEntries);
  const { filters, refetch, prefetched, withdrawn } = creditsStore.useStore();
  const [loading, setLoading] = useState(state !== 'error');
  const [failed, setFailed] = useState(state === 'error');
  const [listLoading, setListLoading] = useState(false);
  const [listFailed, setListFailed] = useState(state === 'list-error');
  const [pages, setPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // GET /main + gift card availability + provider list + bank transfer, in parallel
  useEffect(() => {
    if (!loading || state === 'loading') return;
    timer.current = setTimeout(() => setLoading(false), ct.loadDelay);
    return () => clearTimeout(timer.current);
  }, [loading, state]);
  // a fresh visit starts from the initial filters (the screen's own filter state in the app)
  useEffect(() => () => creditsStore.patch({ filters: initialFilters, prefetched: false }), []);
  // quickFilter / sort / refresh → refetch page 1 (the Filters sheet hands its prefetched result back)
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setPages(1);
    scrollRef.current?.scrollTo({ top: 0 });
    if (prefetched) return;
    setListLoading(true);
    const id = setTimeout(() => setListLoading(false), ct.previewDelay);
    return () => clearTimeout(id);
  }, [refetch, prefetched]);

  const negative = state === 'negative';
  const balance = negative ? negativeBalance : credits;
  const banner = negative ? negativeBanner : state === 'empty' ? null : expiringBanner;
  const giftCard = state !== 'no-topup';
  const providers: readonly WalletProvider[] = state === 'giftcard-only' || state === 'no-topup' ? [] : creditsProviders;
  const topupTitle = giftCard && !providers.length ? t.topupGiftcardOnly : giftCard ? t.topupBoth : providers.length ? t.addCredits : null;
  const campaign = state === 'campaign' ? { text: 'Get 10% extra credits on Skywards Miles', gradient: ['var(--nk-color-credits-campaign-from)', 'var(--nk-color-credits-campaign-to)'] } : undefined;
  const canWithdraw = !negative && withdrawableBalance - withdrawn >= bankConfig.minWithdrawLimit && bankConfig.minWithdrawLimit > 0;
  const height = ct.topBase + (banner ? ct.topBanner : 0) + (topupTitle ? ct.topTopup : 0) + (banner && topupTitle ? ct.topBannerAndTopup : 0) + (campaign && topupTitle ? ct.topCampaign : 0);

  const response = useMemo(() => queryTransactions(filters, entries, { empty: state === 'empty' }), [filters, entries, state]);
  const shown = response.transactions.slice(0, pages * PAGE_SIZE);
  const hasMore = shown.length < response.transactions.length;
  const expiringOnly = filters.status === 'EXPIRING';
  const dateSet = !!(filters.startDate || filters.endDate);
  const showChips = response.transactions.length > 0 || expiringOnly || dateSet;
  const separatorAt = filters.sort === 'SOONEST_TO_EXPIRE' && shown.some((x) => x.isExpirable) ? shown.findIndex((x) => !x.isExpirable) : -1;

  const onTopup = () => {
    if (giftCard && !providers.length) nav.push('credits/giftcard');
    else nav.sheet('credits/topup', { giftCard, providers: providers.length > 0 });
  };
  const onWithdraw = () => nav.push('credits/bank');
  const onScroll = () => {
    const el = scrollRef.current;
    if (!el || !hasMore || loadingMore || listLoading) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 80) {
      setLoadingMore(true);
      setTimeout(() => {
        setPages((p) => p + 1);
        setLoadingMore(false);
      }, ct.previewDelay);
    }
  };
  const quick = (patch: Partial<typeof filters>) => setFilters({ ...filters, ...patch });

  const header = (
    <>
      <WalletHeader onBack={() => nav.back()} onWithdraw={!loading && !failed && canWithdraw ? onWithdraw : undefined} />
      {!loading && !failed && (
        <div className={styles.gap}>
          <div className={styles.top} data-campaign={campaign || undefined} style={{ height }}>
            <div className={styles.topPlaceholder} />
            <div className={styles.topFirst}>
              <TotalBalance amount={balance} />
              {banner && <WalletBanner banner={banner} onLink={() => (negative ? nav.sheet('credits/negative-sheet', { topup: providers.length > 0 || giftCard }) : nav.sheet('credits/expiring'))} />}
            </div>
            <div className={styles.topSecond}>{topupTitle && <TopupButton title={topupTitle} providers={providers} campaign={campaign} onPress={onTopup} />}</div>
            <div className={styles.dots} aria-hidden>
              <img src={a.dottedBg} alt="" />
            </div>
          </div>
          <div style={{ height: ct.panelGap }} />
          <div className={styles.panelHead}>
            <div className={styles.txTitle}>{t.transactions}</div>
            {showChips && (
              <div className={styles.chipsWrap}>
                <div className={styles.chips}>
                  <Pressable className={styles.chip} data-active={filters.status !== 'ALL' || dateSet || undefined} scale={1} onClick={() => nav.sheet('credits/filters')}>
                    <img src={a.filterIcon} width={16} height={16} alt="" />
                    <span className={styles.chipLabel}>{t.filters}</span>
                  </Pressable>
                  <Pressable className={styles.chip} data-active={filters.sort === 'SOONEST_TO_EXPIRE' || undefined} scale={1} onClick={() => nav.sheet('credits/sort')}>
                    <img src={a.sortIcon} width={16} height={16} alt="" />
                    <span className={styles.chipLabel}>{filters.sort === 'SOONEST_TO_EXPIRE' ? t.sortSoonest : t.sortRecent}</span>
                    <img src={a.chevronDown} width={8} height={5} alt="" />
                  </Pressable>
                  <Pressable className={styles.chip} data-active={expiringOnly || undefined} scale={1} onClick={() => quick({ status: expiringOnly ? 'ALL' : 'EXPIRING', sort: 'SOONEST_TO_EXPIRE' })}>
                    {t.expiring}
                  </Pressable>
                  {!isDefaultFilters(filters) && (
                    <Pressable className={styles.clear} scale={1} onClick={() => setFilters(initialFilters)}>
                      {t.clear}
                    </Pressable>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );

  if (failed) {
    return (
      <Screen header={<WalletHeader onBack={() => nav.back()} />} background="var(--nk-color-credits-page)" contentStyle={{ display: 'flex' }}>
        <div className={styles.screenError}>
          <WalletError
            image={a.error}
            width={164}
            height={111}
            title={t.errorTitle}
            subtitle={t.homeErrorSubtitle}
            button={t.tryAgain}
            onPress={() => {
              setFailed(false);
              setLoading(true);
            }}
          />
        </div>
      </Screen>
    );
  }

  if (loading) {
    return (
      <Screen header={header} background="var(--nk-color-credits-page)">
        <div className={styles.loading} data-loading>
          <Skeleton height={113} radius={12} />
          <Skeleton height={44} radius={12} style={{ marginTop: 'var(--nk-space-s15)' }} />
          <Skeleton width={160} height={38} radius={12} style={{ marginTop: 25 }} /* design-ignore — bappzaar value */ />
          <Skeleton width={160} height={44} radius={12} style={{ marginTop: 'var(--nk-space-s15)' }} />
          {Array.from({ length: 10 }, (_, i) => (
            <Skeleton key={i} height={44} radius={12} style={{ marginTop: 'var(--nk-space-s15)' }} />
          ))}
        </div>
      </Screen>
    );
  }

  const empty = !listLoading && !listFailed && response.transactions.length === 0;
  return (
    <Screen ref={scrollRef} header={header} background="bgSurface" onScroll={onScroll} contentStyle={{ paddingBottom: 0 }}>
      <div className={styles.list} data-fill={empty || listFailed || undefined}>
        {listLoading ? (
          <SkeletonRows count={8} />
        ) : listFailed ? (
          <div className={styles.listState}>
            <WalletError image={a.error} width={164} height={111} title={t.errorTitle} subtitle={t.apiError} button={t.retry} onPress={() => setListFailed(false)} />
          </div>
        ) : empty ? (
          <div className={styles.listState}>
            {isDefaultFilters(filters) ? (
              <WalletError image={a.emptyTransactions} width={161} height={105} title={t.emptyTitle} subtitle={t.emptySubtitle} button={topupTitle ? t.addCreditsCta : undefined} onPress={onTopup} style={{ width: '100%' }} />
            ) : (
              <WalletError image={a.emptyFilters} width={167} height={111} title={t.emptyFilterTitle} subtitle={t.emptyFilterSubtitle} button={t.emptyFilterCta} onPress={() => setFilters(initialFilters)} style={{ width: '100%' }} />
            )}
          </div>
        ) : (
          <>
            {response.transactionHeader && <PendingCard header={response.transactionHeader} onPress={() => nav.sheet('credits/pending')} />}
            {shown.map((tx, i) => (
              <div key={tx.code} style={{ display: 'contents' }}>
                {i === separatorAt && <NoteBox separator>{t.separator}</NoteBox>}
                <TransactionRow tx={tx} last={i === shown.length - 1} onPress={() => nav.sheet('credits/details', { code: tx.code })} />
              </div>
            ))}
            {loadingMore && (
              <div className={styles.moreLoader}>
                <SkeletonRows count={3} />
              </div>
            )}
          </>
        )}
      </div>
    </Screen>
  );
}

export default CreditsScreen;
