import { useEffect, useState } from 'react';
import { HtmlText, OriginIcon, Pressable, Skeleton } from '../../components';
import { useNav } from '../../kit/Navigator';
import type { ScreenProps } from '../../kit/types';
import { creditsAssets as a } from './assets';
import { getDetails, t, type DetailsSection } from './data';
import { creditsTokens as ct } from './tokens';
import { WalletError } from './components/WalletUI';
import styles from './sheets.module.css';

export interface DetailsParams {
  /** transaction code (passProps.id) */
  code?: string;
  /** demo: 'error' shows the failed fetch */
  state?: 'error';
}

/** marketplaces whose order page the "View Order Details" deep link opens (rocket is listed but its tap is a no-op on master) */
const ORDER_MARKETPLACES = ['noonnownow', 'nooninstant', 'noonfood', 'noon', 'rocket', 'out'];

function Description({ s, onWithdraw, onViewOrder }: { s: Extract<DetailsSection, { type: 'DESCRIPTION' }>; onWithdraw: () => void; onViewOrder: () => void }) {
  const top = !!(s.text || s.isBankWithdrawEnabled || s.note);
  const order = !!s.marketplace && !!s.orderNr && ORDER_MARKETPLACES.includes(s.marketplace);
  return (
    <div className={styles.card} data-flush>
      {top && (
        <div className={styles.sub}>
          {s.text && <div className={styles.descText}>{s.text}</div>}
          {s.isBankWithdrawEnabled && (
            <>
              {s.text && <div className={styles.spacer} />}
              <Pressable className={styles.withdrawPill} scale={1} onClick={onWithdraw}>
                <img src={a.bankGlyph} width={12} height={12} alt="" />
                <span className={styles.withdrawLabel}>{t.withdrawToBank}</span>
                <img className={styles.flip} src={a.bankChevron} width={6} height={10} alt="" />
              </Pressable>
            </>
          )}
          {s.note && (
            <>
              {(s.text || s.isBankWithdrawEnabled) && <div className={styles.spacer} />}
              <div className={styles.noteRow}>
                <img src={a.note} alt="" />
                <span className={styles.noteText}>{s.note}</span>
              </div>
            </>
          )}
        </div>
      )}
      {order && (
        <>
          {top && <div className={styles.dashed} />}
          <div className={styles.orderRow}>
            <span className={styles.orderNr}>{s.orderNr}</span>
            <Pressable className={styles.viewOrder} scale={1} onClick={s.marketplace === 'rocket' ? undefined : onViewOrder}>
              {t.viewOrderDetails}
              <img src={a.orderChevron} width={6} height={11} alt="" />
            </Pressable>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * WalletTransactionDetailsScreen: a fixed 500 snap on #F5F6F8 — pinned header (48 icon box, 16/600 title, html
 * subtitle and amount) and the scrolling section cards (description with Withdraw to bank and the order link, expiry
 * lots, the dashed transaction-history timeline). Skeleton while loading, WalletError + Retry on failure.
 */
export function DetailsSheet({ params }: ScreenProps<DetailsParams>) {
  const nav = useNav();
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [retried, setRetried] = useState(false);
  const data = params.code ? getDetails(params.code) : getDetails('TXN-9F21A');
  useEffect(() => {
    if (!loading) return;
    const id = setTimeout(() => {
      setLoading(false);
      setFailed((params.state === 'error' && !retried) || !data);
    }, ct.previewDelay);
    return () => clearTimeout(id);
  }, [loading, params.state, data, retried]);

  if (loading) {
    return (
      <div className={`${styles.fill} ${styles.detailsRoot}`}>
        <div className={styles.detailsLoading}>
          <div className={styles.loadingHeader}>
            <Skeleton width={65} height={65} radius={8} />
            <div className={styles.loadingLines}>
              <Skeleton height={20} radius={8} />
              <Skeleton height={20} radius={8} />
            </div>
            <Skeleton width={50} height={20} radius={0} />
          </div>
          <div className={styles.loadingBlocks}>
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} height={100} radius={12} style={{ marginTop: i ? 0 : 10 }} />
            ))}
          </div>
        </div>
      </div>
    );
  }
  if (failed || !data) {
    return (
      <div className={`${styles.fill} ${styles.detailsRoot} ${styles.detailsError}`}>
        <WalletError
          image={a.error}
          width={164}
          height={111}
          title={t.errorTitle}
          subtitle={t.apiError}
          button={t.retry}
          onPress={() => {
            setRetried(true);
            setLoading(true);
          }}
        />
      </div>
    );
  }

  return (
    <div className={`${styles.fill} ${styles.detailsRoot}`}>
      <div className={styles.detailsHeader}>
        <span className={styles.detailsIcon}>
          <OriginIcon name={data.icon} size={24} />
        </span>
        <div className={styles.detailsHead}>
          <div className={styles.detailsText}>
            <span className={styles.detailsTitle}>{data.title}</span>
            <HtmlText base value={data.subtitle} className={`${styles.html} ${styles.detailsSubtitle}`} />
          </div>
          <HtmlText base value={data.amountText} className={`${styles.html} ${styles.detailsAmount}`} />
        </div>
      </div>
      <div className={`nk-scroll ${styles.scroll}`}>
        <div className={styles.detailsBody}>
          {data.sections.map((s, i) => {
            if (s.type === 'DESCRIPTION') return <Description key={i} s={s} onWithdraw={() => nav.push('credits/bank')} onViewOrder={() => (nav.back(), nav.push('orders/tracking'))} />;
            if (s.type === 'EXPIRY_DETAILS')
              return (
                <div key={i} className={styles.card}>
                  {s.expiryLots.map((lot, j) => (
                    <HtmlText key={j} base value={lot.title} className={styles.lot} style={{ display: 'block', marginBottom: j === s.expiryLots.length - 1 ? 0 : undefined }} />
                  ))}
                  {s.note && (
                    <div className={styles.noteRow}>
                      <img src={a.note} alt="" />
                      <span className={styles.noteText}>{s.note}</span>
                    </div>
                  )}
                </div>
              );
            return (
              <div key={i} className={styles.card}>
                <div className={styles.historyTitle}>{s.title}</div>
                {s.transactions.map((h, j) => (
                  <div key={j} className={styles.timeline}>
                    <div className={styles.rail}>
                      <OriginIcon name={h.icon} size={18} />
                      {j < s.transactions.length - 1 && <span className={styles.railLine} />}
                    </div>
                    <div className={styles.timelineContent}>
                      <div className={styles.timelineTop}>
                        <span className={styles.timelineTitle}>{h.title}</span>
                        <HtmlText base value={h.amountText} className={`${styles.html} ${styles.detailsAmount}`} />
                      </div>
                      <HtmlText base value={h.subtitle} className={`${styles.html} ${styles.timelineSubtitle}`} style={{ display: 'block' }} />
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default DetailsSheet;
