import { motion, useMotionValueEvent, useScroll, useTransform } from 'motion/react';
import { useRef, useState } from 'react';
import { DashedDivider, Icon, IconButton, Pill, PillRow, Pressable, Screen, StatusChip } from '../../components';
import { useNav } from '../../kit/Navigator';
import { formatPrice, currency } from '../../mocks/products';
import { activeOrders, historyOrders, orderFilters, type Order } from './data';
import { MarketplaceLogo, StatusTag } from './components/StatusTag';
import { OrderThumbs } from './components/OrderThumbs';
import styles from './orders.module.css';
import { ref } from '../../foundations/tokens';
import { palette } from '../../foundations/palette';

const cardPress = { whileTap: { scale: 0.98 }, transition: { type: 'spring', damping: 18, stiffness: 220 } } as const;
const fade = { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.2, ease: [0.65, 0, 0.35, 1] } } as const;

/** O2DOrdersV2Screen — order list with active + history sections. */
export function OrdersListScreen() {
  const nav = useNav();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll({ container: scrollRef });
  const headerBg = useTransform(scrollY, [0, 16], [palette.antiFlashWhite, palette.white]);
  const headerRadius = useTransform(scrollY, [0, 16], [0, 10]);
  const headerShadow = useTransform(scrollY, [0, 20], [`0 3.2px 3.2px ${palette.slateGrayAlpha0}`, `0 3.2px 3.2px ${palette.slateGrayAlpha10}`]);
  const [filter, setFilter] = useState('all');
  const [month, setMonth] = useState<string | null>(null);

  useMotionValueEvent(scrollY, 'change', (y) => {
    const el = scrollRef.current;
    if (!el || y < 120) return setMonth(null);
    const marks = [...el.querySelectorAll<HTMLElement>('[data-month]')];
    let current: string | null = null;
    for (const m of marks) if (m.offsetTop - y < 140) current = m.dataset.month!;
    setMonth(current);
  });

  const visibleHistory = historyOrders.filter((o) => filter === 'all' || (filter === 'delivered' && o.status === 'delivered') || (filter === 'cancelled' && o.status === 'cancelled'));
  const showActive = filter === 'all' || filter === 'active';

  return (
    <Screen
      ref={scrollRef}
      background="bgPage"
      header={
      <motion.div className={styles.listHeader} style={{ background: headerBg, borderBottomLeftRadius: headerRadius, borderBottomRightRadius: headerRadius, boxShadow: headerShadow }}>
        <div className={styles.searchRow}>
          <IconButton icon="back" onPress={nav.back} />
          <Pressable className={styles.searchPill} scale={0.98} onClick={() => nav.toast('Search orders — demo only')}>
            <Icon name="search" size={20} />
            <span>Search all orders</span>
          </Pressable>
        </div>
        <div style={{ padding: '4px 0 12px' }}>
          <PillRow padding={10}>
            {orderFilters.map((f) => (
              <Pill key={f.id} icon={f.icon} selected={filter === f.id} onPress={() => setFilter(f.id)} size="lg">
                {f.label}
              </Pill>
            ))}
          </PillRow>
        </div>
            <motion.div className={styles.monthPill} initial={false} animate={{ opacity: month ? 1 : 0, y: month ? 0 : -8 }} transition={{ duration: 0.2, ease: [0.65, 0, 0.35, 1] }}>
        {month}
      </motion.div>
      </motion.div>
      }
      contentStyle={{ padding: '0 15px calc(var(--nk-inset-bottom) + 24px)' }}
    >
        {showActive && activeOrders.length > 0 && (
          <motion.section {...fade} className={styles.section} style={{ paddingTop: 6 }}>
            <h2 className={styles.sectionTitle}>Active</h2>
            {activeOrders.map((o) => (
              <ActiveOrderCard key={o.id} order={o} onPress={() => nav.push('orders/tracking', { orderId: o.id })} />
            ))}
          </motion.section>
        )}
        {filter !== 'active' && (
          <motion.section {...fade} className={styles.section} style={{ paddingTop: showActive ? 24 : 12 }}>
            <h2 className={styles.sectionTitle}>Order history</h2>
            {visibleHistory.length === 0 && (
              <div className={styles.empty}>
                <span style={{ fontSize: 64 }}>📭</span>
                <strong>No orders match your filters</strong>
                <span>Try adjusting or clearing your filters to see more orders</span>
                <Pressable className={styles.ctaLight} onClick={() => setFilter('all')}>
                  Clear filters
                </Pressable>
              </div>
            )}
            {visibleHistory.map((o, i) => (
              <div key={o.id} data-month={o.month}>
                {(i === 0 || visibleHistory[i - 1].month !== o.month) && <div className={styles.monthLabel}>{o.month}</div>}
                <HistoryOrderCard order={o} onPress={() => nav.push('orders/tracking', { orderId: o.id })} />
              </div>
            ))}
          </motion.section>
        )}
    </Screen>
  );
}

function ActiveOrderCard({ order, onPress }: { order: Order; onPress: () => void }) {
  const nav = useNav();
  return (
    <motion.article className={styles.card} onClick={onPress} {...cardPress}>
      <div className={styles.cardStrip}>
        <StatusTag order={order} />
        <MarketplaceLogo kind={order.marketplace} />
      </div>
      <div className={styles.cardBody}>
        <OrderThumbs items={order.items} />
        <div className={styles.cardText}>
          <span className={styles.eta}>{order.eta}</span>
          <span className={styles.meta}>
            {order.items.length} item{order.items.length > 1 ? 's' : ''}
            <i className={styles.dot} />
            {order.statusLabel}
          </span>
        </div>
        <span className={styles.chev}>
          <Icon name="chevronRight" size={18} flipRtl />
        </span>
      </div>
      <div className={styles.actions}>
        <Pressable
          className={styles.actionBtn}
          onClick={(e) => {
            e.stopPropagation();
            nav.push('orders/tracking', { orderId: order.id });
          }}
        >
          <Icon name="pin" size={16} /> Track order
        </Pressable>
        <Pressable
          className={styles.actionBtn}
          onClick={(e) => {
            e.stopPropagation();
            nav.toast('Calling support — demo');
          }}
        >
          <Icon name="help" size={16} /> Need help?
        </Pressable>
      </div>
      {order.pin && (
        <div className={styles.pinBar}>
          <span>Delivery code</span>
          <span style={{ display: 'flex', gap: 4 }}>
            {order.pin.split('').map((d, i) => (
              <span key={i} className={styles.pinDigit}>
                {d}
              </span>
            ))}
          </span>
        </div>
      )}
      {order.alert && (
        <div className={styles.alert}>
          <div>
            <div className={styles.alertTitle}>{order.alert.title}</div>
            <div className={styles.alertSub}>{order.alert.subtitle}</div>
          </div>
          <Pressable
            className={styles.alertCta}
            onClick={(e) => {
              e.stopPropagation();
              nav.toast('Verified — thanks!', { tone: 'success' });
            }}
          >
            {order.alert.cta}
          </Pressable>
        </div>
      )}
    </motion.article>
  );
}

function HistoryOrderCard({ order, onPress }: { order: Order; onPress: () => void }) {
  return (
    <motion.article className={styles.card} onClick={onPress} {...cardPress}>
      <div className={styles.cardStrip}>
        <StatusTag order={order} />
        <MarketplaceLogo kind={order.marketplace} />
      </div>
      {order.items.map((it) => (
        <div key={it.product.id}>
          <div className={styles.historyRow}>
            <OrderThumbs items={[it]} dim={order.status === 'cancelled'} />
            <div className={styles.cardText} style={{ gap: 6 }}>
              <span className={styles.itemTitle}>{it.product.title}</span>
              <span className={styles.itemPrice}>
                {currency} {formatPrice(it.price)}
              </span>
              {it.returnable === 'open' && (
                <StatusChip tone="success" icon="returns">
                  Returnable until Oct 17
                </StatusChip>
              )}
              {it.returnable === 'closed' && (
                <StatusChip tone="neutral" icon="lock">
                  Return window closed
                </StatusChip>
              )}
            </div>
          </div>
          {order.status === 'delivered' && <RatingRow initial={it.rating ?? 0} />}
        </div>
      ))}
      <div style={{ height: 10 }} />
    </motion.article>
  );
}

function RatingRow({ initial }: { initial: number }) {
  const [value, setValue] = useState(initial);
  const [popped, setPopped] = useState(0);
  return (
    <div onClick={(e) => e.stopPropagation()}>
      <DashedDivider color={ref.color('border')} inset={12} margin="12px 0 0" />
      <div className={styles.ratingRow}>
        <span className={styles.ratingLabel}>{value ? 'Rating submitted. Thanks!' : 'What would you rate it?'}</span>
        <span style={{ display: 'flex', gap: 6 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <motion.button
              key={i}
              type="button"
              className={styles.star}
              onClick={() => {
                setValue(i);
                setPopped(i);
              }}
              animate={popped === i ? { scale: [1, 1.25, 1] } : { scale: 1 }}
              transition={{ type: 'spring', mass: 0.6, damping: 12, stiffness: 320 }}
              onAnimationComplete={() => setPopped(0)}
            >
              <Icon name="star" size={22} strokeWidth={i <= value ? 0 : 1.5} color={i <= value ? palette.kitAmber49 : palette.lightGrey} fill={i <= value ? palette.kitAmber49 : 'none'} />
            </motion.button>
          ))}
        </span>
      </div>
    </div>
  );
}

