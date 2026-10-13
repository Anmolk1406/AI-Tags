import { motion } from 'motion/react';
import { useState } from 'react';
import { Button, Checkbox, DashedDivider, Divider, NeedHelpButton, OriginIcon, Pressable, Screen } from '../../components';
import { ref } from '../../foundations/tokens';
import { useNav } from '../../kit/Navigator';
import { haptic } from '../../motion/haptics';
import { spring, supermall } from '../../motion/presets';
import { currency } from '../../mocks/products';
import { art } from './assets';
import { BillSummary } from './components/BillSummary';
import { ImageStack } from './components/ImageStack';
import { PinTiles } from './components/PinTiles';
import { Stepper } from './components/Stepper';
import { Thumb } from './components/Thumb';
import { WindowPill } from './components/WindowPill';
import { heroVariant, isActive, money2, orderById, type Order } from './data';
import { pressDip, reveal } from './motion';
import styles from './orders.module.css';
import { ordersTokens } from './tokens';

/**
 * Order details / tracking (PDS reference one-flows, details of the active order; tabs V1–V4 → `variant` param):
 * header (back, order number + copy, item count, ⋯), fanned image stack with the express pill, status line, big
 * ETA, delivery-window pill (V2–V4: hot-afternoon pill + advice and a warm backdrop), tracker card (stepper, rider,
 * delivery PIN, Reschedule / See all updates), Delivering to, Order summary (Cancel items → orders/cancel),
 * Bill summary, chat FAB. Delivered / returned / exchanged / cancelled orders reuse the layout without rider and PIN.
 */
export function OrderTrackingScreen({ params }: { params: { orderId?: string; variant?: string | number } }) {
  const nav = useNav();
  const order = orderById(params.orderId);
  const variant = heroVariant(params.variant);
  const active = isActive(order);
  const cancelled = order.status === 'cancelled';
  const stack = order.stack ?? order.items.map((it) => ({ image: it.product.image ?? '', title: it.product.title, qty: it.qty, installation: it.installation }));

  const copy = () => {
    navigator.clipboard?.writeText(order.number).catch(() => {});
    haptic('tap');
    nav.toast('Order number copied', { icon: <OriginIcon name="copy" size={18} color={ref.color('textInverse')} /> });
  };

  return (
    <Screen
      background="bgSubtle"
      safeTop={false}
      contentStyle={{ paddingBottom: 0, background: ordersTokens.trackingBg }}
      overlay={<NeedHelpButton collapsed aboveTabBar={false} label="Chat with us" onPress={() => nav.toast('Connecting you to support…')} />}
    >
      <div className={styles.trackPage}>
        {active && variant === 2 && <div className={styles.backdrop} style={{ background: ordersTokens.heatTop, maskImage: 'linear-gradient(black 0px, black 820px, transparent 1100px)' }} />}
        {active && variant === 4 && <div className={styles.backdrop} style={{ top: 307, height: 178, background: ordersTokens.heatGlow, maskImage: 'linear-gradient(black 0px, black 150px, transparent 178px)' }} />}

        <div className={styles.trackTop}>
          <motion.div className={styles.trackHeader} {...reveal(0)}>
            <Pressable className={styles.circleBtn} onClick={nav.back} aria-label="Back">
              <OriginIcon name="chevron-left" size={20} />
            </Pressable>
            <div className={styles.trackTitle}>
              <Pressable className={styles.orderNo} scale={0.96} onClick={copy} aria-label={`Order ${order.number}, copy`}>
                {order.number}
                <OriginIcon name="copy" size={14} />
              </Pressable>
              <span className={styles.itemsCount}>
                {order.itemCount} item{order.itemCount > 1 ? 's' : ''}
              </span>
            </div>
            <Pressable className={styles.circleBtn} onClick={() => nav.toast('Order options — demo only')} aria-label="More">
              <OriginIcon name="horizontal-three-dot-menu" size={20} />
            </Pressable>
          </motion.div>
        </div>

        <div className={styles.trackBody}>
          <div className={styles.hero}>
            <motion.div {...reveal(1)}>
              <ImageStack cards={stack} centre={order.stackCentre ?? Math.floor((stack.length - 1) / 2)} rotate={active && variant !== 1} express={order.marketplace === 'express'} dim={cancelled} />
            </motion.div>
            <motion.div className={styles.heroText} {...reveal(2)}>
              <div className={styles.statusLine}>
                {order.statusLabel}
                <i />
                {cancelled ? <b style={{ color: 'var(--nk-palette-danger-red)' }}>Refunded</b> : <b>{active ? 'On time' : 'Completed'}</b>}
              </div>
              <h1 className={styles.headline}>{order.eta}</h1>
              {active && order.window && <WindowPill variant={variant} text={order.window} heatText={order.heatWindow ?? order.window} onInfo={() => nav.toast('Your rider is on the way — we will share live updates')} />}
            </motion.div>
          </div>

          <motion.section className={styles.tracker} {...reveal(3)}>
            <Stepper step={order.step} dates={order.stepDates} enRoute={order.status === 'out_for_delivery'} gray={cancelled} />
            {order.rider && <RiderBlock order={order} />}
            <div className={styles.ctaRow}>
              <Button variant="secondary" className={styles.ctaBtn} onClick={() => nav.toast(active ? 'Reschedule — demo only' : 'Need help with this order?')}>
                {active ? 'Reschedule' : 'Get help'}
              </Button>
              <Button variant="secondary" className={styles.ctaBtn} onClick={() => nav.toast('All updates — demo only')}>
                See all updates
              </Button>
            </div>
          </motion.section>

          {order.address && <DeliveringTo order={order} />}

          <motion.section className={styles.summary} {...reveal(5)}>
            <div className={styles.summaryHead} style={{ alignSelf: 'stretch' }}>
              <h2 className={styles.blockTitle} style={{ paddingInlineStart: 0 }}>
                Order summary
              </h2>
              {active && (
                <Pressable className={styles.cancelLink} scale={0.96} onClick={() => nav.push('orders/cancel', { orderId: order.id })}>
                  Cancel items
                </Pressable>
              )}
            </div>
            <DashedDivider inset={0} margin="3px 0 4px" />
            <div className={styles.summaryItems} style={{ alignSelf: 'stretch' }}>
              {order.items.map((it, i) => {
                const notes = (it.returnPolicy ? 1 : 0) + (it.warranty ? 1 : 0);
                return (
                  <div key={it.product.id} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {i > 0 && <DashedDivider inset="66px 0" margin="3px 0 4px" />}
                    <div className={styles.summaryItem} data-center={notes < 2 || undefined}>
                      <Thumb src={it.product.image ?? ''} alt={it.product.title} express={it.express} />
                      <div className={styles.summaryText}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <p className={styles.summaryTitle}>{it.product.title}</p>
                          <p className={styles.summaryPrice}>
                            {currency} {money2(it.price)}
                          </p>
                        </div>
                        {notes > 0 && (
                          <div className={styles.notes}>
                            {it.returnPolicy === 'available' && (
                              <p className={styles.note}>
                                <OriginIcon name="rewind-check" size={16} color={ref.color('success')} /> Return &amp; exchange available
                              </p>
                            )}
                            {it.warranty && (
                              <p className={styles.note}>
                                <OriginIcon name="star-shield" size={16} color={ref.color('success')} /> {it.warranty}
                              </p>
                            )}
                            {it.returnPolicy === 'none' && (
                              <p className={styles.note}>
                                <OriginIcon name="rewind-cross" size={16} /> Cannot be exchanged or returned
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.section>

          {order.bill && (
            <motion.div {...reveal(6)}>
              <BillSummary bill={order.bill} />
            </motion.div>
          )}
        </div>
      </div>
    </Screen>
  );
}

/** rider row + share PIN inside the tracker card (inset 4, `#F9F9FB`) */
function RiderBlock({ order }: { order: Order }) {
  const nav = useNav();
  return (
    <div className={styles.riderWrap}>
      <div className={styles.riderBox}>
        <div className={styles.riderRow}>
          <div className={styles.riderInfo}>
            <span className={styles.avatar}>
              <img src={art.riderAvatar} alt="" />
            </span>
            <span className={styles.riderName}>
              <b>{order.rider!.name}</b>
              <span>{order.rider!.deliveries}</span>
            </span>
          </div>
          <div className={styles.riderBtns}>
            <Pressable className={styles.chev} onClick={() => nav.toast('Opening WhatsApp — demo')} aria-label="Chat on WhatsApp">
              <img src={art.whatsapp} alt="" width={18} height={18} />
            </Pressable>
            <Pressable className={styles.chev} onClick={() => nav.toast(`Calling ${order.rider!.name.split(' ')[0]}…`)} aria-label="Call rider">
              <OriginIcon name="call-filled" size={20} />
            </Pressable>
          </div>
        </div>
        <DashedDivider color={ref.color('border')} inset={14} />
        {order.pin && (
          <div className={styles.sharePin}>
            <span className={styles.sharePinLabel}>
              <img src={art.deliveryPin} alt="" />
              Share delivery PIN
            </span>
            <PinTiles pin={order.pin} delay={supermall.reveal.delay + supermall.reveal.stagger * 4} />
          </div>
        )}
      </div>
    </div>
  );
}

/** "Delivering to": address + receiver rows, and the two delivery-instruction checkbox tiles */
function DeliveringTo({ order }: { order: Order }) {
  const nav = useNav();
  const [on, setOn] = useState<Record<string, boolean>>({});
  const [taps, setTaps] = useState<Record<string, number>>({});
  const tiles = [
    { id: 'together', label: <>Get items together</>, icon: <img src={art.itemsTogether} alt="" /> },
    { id: 'door', label: <>Leave at<br />the door</>, icon: <OriginIcon name="door-open-filled" size={20} color={ref.color('textMuted')} /> },
  ];
  return (
    <motion.section className={styles.block} {...reveal(4)}>
      <h2 className={styles.blockTitle}>Delivering to</h2>
      <div className={styles.infoRows}>
        <div className={styles.infoMain}>
          <span className={styles.infoIcon}>
            <OriginIcon name="home" size={20} />
          </span>
          <span className={styles.infoText}>
            <span className={styles.infoTitle}>{order.address!.label}</span>
            <span className={styles.infoSub}>{order.address!.line}</span>
          </span>
        </div>
        {order.receiver && (
          <div className={styles.infoRow}>
            <div className={styles.infoMain}>
              <span className={styles.infoIcon}>
                <OriginIcon name="user-circle" size={20} />
              </span>
              <span className={styles.infoText}>
                <span className={styles.infoTitle}>
                  {order.receiver.name}
                  <Divider vertical length={13} color={ref.color('borderStrong')} />
                  {order.receiver.phone}
                </span>
                <span className={styles.infoSub}>{order.receiver.note}</span>
              </span>
            </div>
            <Pressable className={styles.chev} onClick={() => nav.toast('Edit receiver — demo only')} aria-label="Edit receiver">
              <OriginIcon name="edit-filled" size={20} />
            </Pressable>
          </div>
        )}
      </div>
      <DashedDivider color={ref.color('border')} inset={4} margin="-1px 0 0" />
      <div className={styles.tiles}>
        {tiles.map((t) => (
          <Pressable
            key={t.id}
            className={styles.tile}
            data-on={on[t.id] || undefined}
            role="checkbox"
            aria-checked={!!on[t.id]}
            {...pressDip}
            onClick={() => {
              haptic('tap');
              setOn((s) => ({ ...s, [t.id]: !s[t.id] }));
              setTaps((s) => ({ ...s, [t.id]: (s[t.id] ?? 0) + 1 }));
            }}
          >
            <span className={styles.tileMain}>
              <span className={styles.tileIcon}>{t.icon}</span>
              <span className={styles.tileLabel}>{t.label}</span>
            </span>
            <motion.span key={taps[t.id] ?? 0} className={styles.tileBox} initial={taps[t.id] ? { scale: 0.8 } : false} animate={{ scale: 1 }} transition={spring.bouncy}>
              <Checkbox checked={!!on[t.id]} size={24} color={on[t.id] ? ref.color('primary') : ref.color('textMuted')} />
            </motion.span>
          </Pressable>
        ))}
      </div>
    </motion.section>
  );
}
