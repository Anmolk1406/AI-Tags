import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { DashedDivider, Icon, IconButton, ProductImage, Pressable, Screen, type IconName } from '../../components';
import { useNav } from '../../kit/Navigator';
import { currency, formatPrice, user } from '../../mocks/products';
import { ImageStack } from './components/ImageStack';
import { Timeline } from './components/Timeline';
import { orderById } from './data';
import { ordersTokens } from './tokens';
import styles from './orders.module.css';
import { ref } from '../../foundations/tokens';

/** O2DOrderTrackingScreen — hero (image stack + date), status card w/ timeline, info sections. */
export function OrderTrackingScreen({ params }: { params: { orderId?: string } }) {
  const nav = useNav();
  const order = orderById(params.orderId);
  const [pinned, setPinned] = useState(false);
  const cancelled = order.status === 'cancelled';
  const delivered = order.status === 'delivered';
  const itemsCount = order.items.reduce((n, i) => n + i.qty, 0);
  const subtotal = order.items.reduce((n, i) => n + i.price * i.qty, 0);
  const saved = order.items.reduce((n, i) => n + ((i.product.was ?? i.price) - i.price) * i.qty, 0);
  const dates = ['Oct 7', order.step >= 1 ? 'Oct 8' : '', order.step >= 2 ? 'Today' : '', delivered ? order.date : ''];
  const headline = cancelled ? 'Cancelled' : delivered ? `Delivered ${order.etaShort}` : order.etaShort;

  const copy = () => {
    navigator.clipboard?.writeText(order.number).catch(() => {});
    nav.toast('Order number copied', { icon: <Icon name="copy" size={18} /> });
  };

  const titleBlock = (
    <div className={styles.pageTitle}>
      Order details
      <small>
        {itemsCount} item{itemsCount > 1 ? 's' : ''}
      </small>
    </div>
  );

  return (
    <Screen
      background="bgPage"
      overlayHeader
      onScroll={(y) => setPinned(y > 220)}
      header={
        <>
      <AnimatePresence>
        {pinned && (
          <motion.div className={styles.pinned} initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} transition={{ duration: 0.2 }}>
            <div className={styles.pageHeader} style={{ padding: '0 12px' }}>
              <IconButton icon="back" onPress={nav.back} />
              {titleBlock}
              <IconButton icon="more" onPress={copy} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
        </>
      }
      contentStyle={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 'var(--nk-inset-top) 12px calc(var(--nk-inset-bottom) + 24px)', background: ordersTokens.trackingBg }}
    >
        <div className={styles.pageHeader}>
          <IconButton icon="back" onPress={nav.back} />
          {titleBlock}
          <IconButton icon="more" onPress={copy} />
        </div>

        <div className={styles.hero}>
          <ImageStack items={order.items} dim={cancelled} />
          <div>
            <div className={styles.statusLine}>
              {order.statusLabel}
              <i />
              {cancelled ? (
                <span style={{ color: ordersTokens.late, fontWeight: 800 }}>Refund initiated</span>
              ) : (
                <span style={{ color: ordersTokens.onTime, fontWeight: 800 }}>{delivered ? 'Completed' : 'On time'}</span>
              )}
            </div>
            <div className={styles.headline}>{headline}</div>
          </div>
        </div>

        <motion.div className={styles.statusCard} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.1 }}>
          <div className={styles.statusMsg}>
            {cancelled ? (
              <>
                Your order was cancelled. <b>{currency} {formatPrice(order.total)}</b> will be refunded to {order.paidWith}.
              </>
            ) : delivered ? (
              <>
                Delivered to <b>{user.address.label}</b>. We hope you love it!
              </>
            ) : (
              <>
                Your order is <b>{order.statusLabel.toLowerCase()}</b> and on its way to <b>{user.address.label}</b>.
              </>
            )}
          </div>
          <Timeline step={order.step} dates={dates} gray={cancelled} />
          {order.pin && (
            <div style={{ margin: '0 12px', background: ref.color('bgSubtle'), borderRadius: 8, padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', font: ref.type('text13SemiboldLh16') }}>
              <span>Share this code with the rider</span>
              <span style={{ letterSpacing: 4, color: 'var(--nk-color-primary)', fontWeight: 700, fontSize: 16 }}>{order.pin}</span>
            </div>
          )}
          <div className={styles.ctaRow}>
            {!cancelled && !delivered && (
              <Pressable className={styles.ctaBtn} onClick={() => nav.push('orders/cancel', { orderId: order.id })}>
                Cancel items
              </Pressable>
            )}
            {delivered && (
              <Pressable className={styles.ctaBtn} onClick={() => nav.push('returns/submit', { orderId: order.id, productId: order.items[0].product.id })}>
                <Icon name="returns" size={16} /> Return item
              </Pressable>
            )}
            <Pressable className={`${styles.ctaBtn} ${styles.ctaDark}`} onClick={() => nav.toast('Connecting you to support…')}>
              <Icon name="chat" size={16} /> Get help
            </Pressable>
          </div>
        </motion.div>

        <section className={styles.block}>
          <span className={styles.blockTitle}>Delivery information</span>
          <div className={styles.infoRow}>
            <span className={styles.infoIcon}>
              <Icon name="pin" size={16} />
            </span>
            <span className={styles.infoText}>
              <strong>Saved address · {user.address.label}</strong>
              {user.address.line}, {user.address.city}
            </span>
          </div>
          <DashedDivider color={ref.color('borderSubtle')} inset={0} />
          <div className={styles.infoRow}>
            <span className={styles.infoIcon}>
              <Icon name="phone" size={16} />
            </span>
            <span className={styles.infoText}>
              <strong>
                {user.firstName} {user.lastName}
              </strong>
              {user.phone}
            </span>
          </div>
        </section>

        <section className={styles.block}>
          <span className={styles.blockTitle}>Order summary</span>
          {order.items.map((it) => (
            <div key={it.product.id} className={styles.sumRow}>
              <ProductImage product={it.product} width={48} height={64} radius={8} />
              <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ font: ref.type('text16BoldLh20') }}>
                  {currency} {formatPrice(it.price)}
                </span>
                <span style={{ font: ref.type('text13MediumLh17'), color: ref.color('textSecondary'), display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{it.product.title}</span>
              </span>
            </div>
          ))}
          <DashedDivider color={ref.color('borderSubtle')} inset={0} />
          <Pressable onClick={copy} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', font: ref.type('text13MediumLh18'), color: ref.color('textSecondary'), width: '100%' }}>
            <span>Order no. {order.number}</span>
            <Icon name="copy" size={16} color="var(--nk-color-primary)" />
          </Pressable>
        </section>

        <section className={styles.block}>
          <span className={styles.blockTitle}>Bill summary</span>
          <span style={{ font: ref.type('text13RegularLh18'), color: ref.color('textSecondary') }}>Paid with {order.paidWith}</span>
          <div className={styles.billRow}>
            <span>Subtotal</span>
            <span>
              {currency} {formatPrice(subtotal)}
            </span>
          </div>
          <div className={styles.billRow}>
            <span>Shipping fee</span>
            <span style={{ color: ref.color('bestPriceInk'), fontWeight: 700 }}>FREE</span>
          </div>
          {saved > 0 && (
            <div className={styles.billRow}>
              <span>Savings</span>
              <span style={{ color: ref.color('bestPriceInk'), fontWeight: 700 }}>
                −{currency} {formatPrice(saved)}
              </span>
            </div>
          )}
          <DashedDivider color={ref.color('borderSubtle')} inset={0} />
          <div className={styles.billTotal}>
            <span>Total</span>
            <span>
              {currency} {formatPrice(order.total)}
            </span>
          </div>
          <Pressable onClick={() => nav.toast('Invoice downloaded')} style={{ font: ref.type('bodySemibold'), color: 'var(--nk-color-primary)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <Icon name="file" size={16} /> Download invoice
          </Pressable>
        </section>

        <section className={styles.block}>
          <span className={styles.blockTitle}>Quick actions</span>
          <div className={styles.quick}>
            {(
              [
                ['receipt', 'Invoice'],
                ['chat', 'Chat with us'],
                ['returns', 'Return policy'],
              ] as [IconName, string][]
            ).map(([icon, label]) => (
              <Pressable key={label} className={styles.quickBtn} onClick={() => nav.toast(label)}>
                <Icon name={icon} size={20} />
                {label}
              </Pressable>
            ))}
          </div>
        </section>
    </Screen>
  );
}
