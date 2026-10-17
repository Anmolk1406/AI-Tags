import { useState } from 'react';
import { Pressable } from '../../components';
import { useNav } from '../../kit/Navigator';
import { useDemoStore } from '../../kit/DemoStore';
import type { ScreenProps } from '../../kit/types';
import { creditsAssets as a } from './assets';
import { GIFT_CARD_VALUE, money, t, VOUCHER_VALUE } from './data';
import { creditsStore } from './store';
import { NativeAlert, NativeTopBar, PrimaryButton, type AlertSpec } from './components/Legacy';
import styles from './bank.module.css';

/** demo: codes starting 0000 are rejected (GiftCardsService.redeemGiftCard REJECTED / WalletService.voucher error) */
const REJECTED = /^0000/;
const DELAY = 900;

/**
 * GiftCardRedeemScreen (features/giftcards, a full modal with header CLOSE): Tabs "Gift card" / "Voucher"; the gift
 * card tab has the PIN info box, a 16-character code and a 4-digit PIN, the voucher tab one code (≥ 4). REDEEM is
 * disabled until the form validates; errors are native alerts; success shows "Successfully Redeemed!" + Go back and
 * credits the balance (onSuccess → the wallet refreshes and the top-up sheet closes).
 */
export function GiftCardScreen(_: ScreenProps) {
  const nav = useNav();
  const addCredits = useDemoStore((s) => s.addCredits);
  const credits = useDemoStore((s) => s.credits);
  const [tab, setTab] = useState(0);
  const [values, setValues] = useState({ cardNumber: '', cardPin: '', voucherNumber: '' });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<null | { voucher: boolean; balance: number }>(null);
  const [alert, setAlert] = useState<AlertSpec | null>(null);

  const errors: Record<string, string> = {};
  if (tab === 0) {
    if (!values.cardNumber.trim()) errors.cardNumber = t.gcEmpty;
    else if (values.cardNumber.length !== 16) errors.cardNumber = t.gcLength(16);
    if (!values.cardPin.trim()) errors.cardPin = t.pinEmpty;
    else if (values.cardPin.length !== 4) errors.cardPin = t.pinLength(4);
  } else if (!values.voucherNumber.trim()) errors.voucherNumber = t.voucherEmpty;
  else if (values.voucherNumber.length < 4) errors.voucherNumber = t.voucherLength(4);
  const valid = Object.keys(errors).length === 0;

  // onSuccess: the wallet refreshes and the top-up sheet underneath closes
  const close = () => {
    const stack = nav.stack;
    nav.back();
    if (success && stack[stack.length - 2]?.route === 'credits/topup') nav.back();
  };
  const onSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      const code = tab === 0 ? values.cardNumber : values.voucherNumber;
      if (REJECTED.test(code)) {
        setAlert({ message: tab === 0 ? t.invalidGiftCard : t.invalidVoucher, buttons: [{ text: t.close }] });
        return;
      }
      const value = tab === 0 ? GIFT_CARD_VALUE : VOUCHER_VALUE;
      addCredits(value, tab === 0 ? 'Gift card redeemed' : 'Voucher redeemed', tab === 0 ? 'giftcard' : 'voucher');
      creditsStore.patch((s) => ({ refetch: s.refetch + 1, prefetched: false }));
      setSuccess({ voucher: tab === 1, balance: credits + value });
    }, DELAY);
  };

  const field = (id: keyof typeof values, label: string, placeholder: string, max?: number) => (
    <>
      <div className={styles.gcLabel}>{label}</div>
      <input
        className={styles.gcInput}
        placeholder={placeholder}
        maxLength={max}
        value={values[id]}
        onChange={(e) => setValues((v) => ({ ...v, [id]: e.target.value }))}
        onBlur={() => setTouched((tt) => ({ ...tt, [id]: true }))}
        aria-label={label}
      />
      <div className={styles.gcError}>{touched[id] && values[id] ? errors[id] : ''}</div>
    </>
  );

  return (
    <div className={styles.screen} style={{ height: '100%', position: 'relative' }}>
      <NativeTopBar kind="close" onPress={close} />
      {success ? (
        <>
          <div className={`nk-scroll ${styles.gcSuccess}`}>
            <img src={a.giftCardImage} alt="" />
            <div className={styles.gcSuccessTitle}>{t.redeemed}</div>
            <div className={styles.gcSuccessText}>{success.voucher ? t.voucherSuccess(money(success.balance)) : t.giftCardSuccess}</div>
          </div>
          <div className={styles.gcButton}>
            <PrimaryButton onPress={close}>{t.goBack}</PrimaryButton>
          </div>
        </>
      ) : (
        <>
          <div className="nk-scroll" style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
            <div className={styles.tabs}>
              <div className={styles.tabsLine} />
              {[t.giftCard, t.voucher].map((label, i) => (
                <Pressable key={label} className={styles.tab} data-active={tab === i || undefined} scale={1} onClick={() => setTab(i)}>
                  {label}
                </Pressable>
              ))}
            </div>
            <div className={styles.slide}>
              {tab === 0 ? (
                <>
                  <div className={styles.info}>
                    <img src={a.giftCardInfo} alt="" />
                    <span className={styles.infoText}>{t.voucherInfo}</span>
                  </div>
                  {field('cardNumber', t.giftCardNumber, t.characterCode(16), 16)}
                  {field('cardPin', t.pin, t.digitPin(4), 4)}
                </>
              ) : (
                field('voucherNumber', t.voucherCode, t.enterVoucherCode)
              )}
            </div>
          </div>
          <div className={styles.gcButton}>
            <PrimaryButton disabled={!valid} loading={submitting} onPress={onSubmit}>
              {t.redeem}
            </PrimaryButton>
          </div>
        </>
      )}
      <NativeAlert spec={alert} onClose={() => setAlert(null)} />
    </div>
  );
}

export default GiftCardScreen;
