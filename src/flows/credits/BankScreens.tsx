import { useEffect, useMemo, useRef, useState } from 'react';
import { HtmlText, Pressable, Spinner } from '../../components';
import { useNav, type NavApi } from '../../kit/Navigator';
import type { ScreenProps } from '../../kit/types';
import { useDemoStore } from '../../kit/DemoStore';
import { currency } from '../../data';
import { creditsAssets as a } from './assets';
import { amount2, bankConfig, bankWarning, FAILING_OTP, OTP_MAX_SENDS, OTP_RESEND_SECONDS, t, verifiedPhones, withdrawableBalance, type BankAccount } from './data';
import { creditsStore } from './store';
import { LegacyRadio, NativeAlert, NativeTopBar, PrimaryButton, type AlertSpec } from './components/Legacy';
import styles from './bank.module.css';

/** network latency of the customer-v1 bank-transfer calls in the demo */
const DELAY = 700;

/** navigator.dismissModal() on the WalletBankTransferScreen modal stack: pop every bank-transfer entry. */
function dismissBankModal(nav: Pick<NavApi, 'back' | 'stack'>) {
  const n = [...nav.stack].reverse().findIndex((e) => !e.route.startsWith('credits/bank'));
  for (let i = 0; i < (n < 0 ? nav.stack.length - 1 : n); i++) nav.back();
}

const priceText = (n: number) => `${currency} ${amount2(n)}`;

export interface BankTransferParams {
  /** demo: 'insufficient' (withdrawable < min), 'blocked' (disableOpenRequestMessage), 'no-accounts' */
  state?: 'insufficient' | 'blocked' | 'no-accounts';
}

/** WalletBankAccountCard: radio + "AC No:", five label / value lines, Delete. */
function AccountCard({ account, selected, single, last, deleting, onSelect, onDelete }: { account: BankAccount; selected: boolean; single: boolean; last: boolean; deleting: boolean; onSelect: () => void; onDelete: () => void }) {
  const lines: [string, string][] = [
    [t.iban, account.iban],
    [t.accountHolder, account.accountName],
    [t.bankName, account.bankName],
    [t.swift, account.swiftCode],
    [t.mobile, account.phone],
  ];
  return (
    <div className={styles.card} data-single={single || undefined} data-last={last || undefined} onClick={onSelect} role="radio" aria-checked={selected} data-account={account.code}>
      <div className={styles.cardHead}>
        <img src={selected ? a.radioChecked : a.radioUnchecked} alt="" />
        <span className={styles.cardNo}>
          {t.accountNo} {account.accountNumber}
        </span>
      </div>
      <div className={styles.cardDetails}>
        {lines.map(([label, value]) => (
          <div key={label} className={styles.cardLine}>
            <span className={styles.cardLabel}>{label}</span>
            <span className={styles.cardValue}>{value}</span>
          </div>
        ))}
      </div>
      <div className={styles.cardSeparator} />
      <div className={styles.cardActions}>
        <Pressable
          className={styles.delete}
          scale={1}
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          {deleting ? <Spinner size={18} color="var(--nk-color-cta)" /> : <span>{t.delete}</span>}
        </Pressable>
      </div>
    </div>
  );
}

/**
 * WalletBankTransferScreen (modal, header CLOSE): warning banner, Transfer Amount box (amount + "Withdraw all"),
 * "Select a bank account" + saved accounts, terms radio and SUBMIT (disabled until terms + account). SUBMIT validates
 * the amount (required → min → max → balance) and opens the confirm sheet. Insufficient / blocked / no-accounts states.
 */
export function BankTransferScreen({ params }: ScreenProps<BankTransferParams>) {
  const nav = useNav();
  const { bankAccounts, selectedAccount, withdrawn } = creditsStore.useStore();
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState('');
  const [full, setFull] = useState(false);
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [alert, setAlert] = useState<AlertSpec | null>(null);
  useEffect(() => {
    const id = setTimeout(() => setLoading(false), DELAY);
    return () => clearTimeout(id);
  }, []);
  const balance = params.state === 'insufficient' ? 20 : withdrawableBalance - withdrawn;
  const withdrawBalance = Math.min(balance, bankConfig.maxWithdrawLimit);
  const insufficient = balance < bankConfig.minWithdrawLimit;
  const accounts = params.state === 'no-accounts' ? [] : bankAccounts;
  const close = () => dismissBankModal(nav);

  const onSubmit = () => {
    const value = full ? String(withdrawBalance) : amount;
    const n = Number(value);
    if (!value.trim()) return setError(t.required);
    if (n < bankConfig.minWithdrawLimit) return setError(t.minTransfer(bankConfig.minWithdrawLimit));
    if (n > bankConfig.maxWithdrawLimit) return setError(t.maxTransfer(bankConfig.maxWithdrawLimit));
    if (n > withdrawBalance) return setError(t.insufficientFunds);
    nav.sheet('credits/bank-confirm', { account: selectedAccount, amount: n });
  };
  const onDelete = (code: string) =>
    setAlert({
      message: t.deleteConfirm,
      buttons: [
        { text: t.cancel, style: 'cancel' },
        {
          text: t.ok,
          onPress: () => {
            setDeleting(code);
            setTimeout(() => {
              setDeleting(null);
              creditsStore.patch((s) => ({ bankAccounts: s.bankAccounts.filter((x) => x.code !== code), selectedAccount: s.selectedAccount === code ? null : s.selectedAccount }));
            }, DELAY);
          },
        },
      ],
    });

  const blocked = (message: string, zero?: boolean) => (
    <>
      <div className={styles.blockedBox}>
        {zero && (
          <>
            <div className={styles.amountRow}>
              <span className={styles.amountCurrency} style={{ padding: '0 5px' }}>
                {currency}
              </span>
              <span className={styles.amountInput} style={{ display: 'inline-block', width: 'auto' }}>
                0
              </span>
            </div>
            <div className={styles.amountSeparator} />
          </>
        )}
        <div className={styles.blockedText}>{message}</div>
      </div>
      <div className={styles.blockedImage}>
        <img src={a.emptyBankTransfers} alt="" />
      </div>
      <div className={styles.blockedButton}>
        <PrimaryButton onPress={close}>{t.backToCredits}</PrimaryButton>
      </div>
    </>
  );

  let body;
  if (loading)
    body = (
      <div className={styles.loader}>
        <Spinner size={37} color="var(--nk-color-cta)" />
      </div>
    );
  else if (params.state === 'blocked') body = blocked('You already have an open bank transfer request. You can raise a new one once it is processed.');
  else if (insufficient) body = blocked(t.insufficientBalance(`${bankConfig.minWithdrawLimit} ${currency}`), true);
  else if (!accounts.length)
    body = (
      <div className={styles.empty}>
        <img src={a.emptyBankTransfers} width={338} alt="" />
        <div className={styles.emptyTitle}>{t.noAccountsTitle}</div>
        <div className={styles.emptyMessage}>{t.noAccountsMessage}</div>
        <PrimaryButton className={styles.emptyButton} onPress={() => nav.push('credits/bank-form')}>
          {t.addNewAccountCta}
        </PrimaryButton>
      </div>
    );
  else
    body = (
      <>
        <div className={styles.warning}>
          <img src={a.importantOrange} alt="" />
          <HtmlText base value={bankWarning} className={styles.warningText} />
        </div>
        <div className={styles.amountBox}>
          <div className={styles.amountTitle}>{t.transferAmount}</div>
          <div className={styles.amountRow}>
            <span className={styles.amountCurrency}>{currency}&nbsp;</span>
            <input
              className={styles.amountInput}
              inputMode="decimal"
              maxLength={4}
              placeholder="0"
              value={full ? String(withdrawBalance) : amount}
              disabled={full}
              onChange={(e) => {
                setAmount(e.target.value.replace(/[^0-9.]/g, ''));
                setError('');
              }}
              aria-label={t.transferAmount}
            />
          </div>
          <div className={styles.amountSeparator} />
          <div className={styles.withdrawAll}>
            <LegacyRadio
              checked={full}
              onPress={() => {
                setFull((f) => !f);
                setAmount('');
                setError('');
              }}
            >
              <span className={styles.radioText}>{t.withdrawAll(priceText(withdrawBalance))}</span>
            </LegacyRadio>
          </div>
          <div className={styles.amountError}>{error}</div>
        </div>
        <div className={styles.selectRow}>
          <span className={styles.selectTitle}>{t.selectBankAccount}</span>
          <Pressable className={styles.link} scale={1} onClick={() => nav.push('credits/bank-form')}>
            {t.addNewAccount}
          </Pressable>
        </div>
        <div className={`nk-scroll ${styles.accounts}`}>
          {accounts.map((acc, i) => (
            <AccountCard
              key={acc.code}
              account={acc}
              selected={selectedAccount === acc.code}
              single={accounts.length === 1}
              last={i === accounts.length - 1}
              deleting={deleting === acc.code}
              onSelect={() => creditsStore.patch({ selectedAccount: acc.code })}
              onDelete={() => onDelete(acc.code)}
            />
          ))}
        </div>
        <div className={styles.terms}>
          <LegacyRadio checked={terms} onPress={() => setTerms((v) => !v)}>
            <span className={styles.termsText}>{t.terms}</span>
          </LegacyRadio>
        </div>
        <div className={styles.submitWrap}>
          <PrimaryButton disabled={!terms || !selectedAccount} onPress={onSubmit}>
            {t.submit}
          </PrimaryButton>
        </div>
      </>
    );

  return (
    <div className={styles.screen} style={{ height: '100%', position: 'relative' }}>
      <NativeTopBar kind="close" onPress={close} />
      {body}
      <NativeAlert spec={alert} onClose={() => setAlert(null)} />
    </div>
  );
}

const validators = {
  accountName: (v: string) => (!v.trim() ? t.required : ''),
  accountNumber: (v: string) => (!v ? t.required : !/^[0-9]\d*(\.\d+)?$/.test(v) ? t.validNumber : v.length < 8 ? t.min8 : v.length > 20 ? t.tooLong : ''),
  swiftCode: (v: string) => (!v ? t.required : /[ `!@#$%^&*()_+|\-~=\\{}[\]:";'<>?,./]/.test(v) ? t.noSpecial : v.length < 8 ? t.min8 : v.length > 11 ? t.tooLong : ''),
  iban: (v: string) => (!v ? t.required : /[ `!@#$%^&*()_+|\-~=\\{}[\]:";'<>?,./]/.test(v) ? t.noSpecial : ''),
  bankName: (v: string) => (!v.trim() ? t.required : ''),
};
type FormKey = keyof typeof validators;

/**
 * WalletBankFormScreen (second modal, header CLOSE): "New Bank Details", five TextFields (errors after blur, the
 * helper text otherwise), the verified-phone Picker and ADD (disabled until every field is valid).
 */
export function BankFormScreen(_: ScreenProps) {
  const nav = useNav();
  const [values, setValues] = useState<Record<FormKey, string>>({ accountName: '', accountNumber: '', swiftCode: '', iban: '', bankName: '' });
  const [touched, setTouched] = useState<Partial<Record<FormKey, boolean>>>({});
  const [phone, setPhone] = useState(0);
  const [saving, setSaving] = useState(false);
  const errors = useMemo(() => Object.fromEntries((Object.keys(validators) as FormKey[]).map((k) => [k, validators[k](values[k])])) as Record<FormKey, string>, [values]);
  const valid = Object.values(errors).every((e) => !e);
  const fields: { key: FormKey; title: string; placeholder: string; helper: string; numeric?: boolean; max?: number }[] = [
    { key: 'accountName', title: t.accountHolder, placeholder: t.holderPlaceholder, helper: t.holderHelper },
    { key: 'accountNumber', title: t.accountNumber, placeholder: t.numberPlaceholder, helper: t.numberHelper, numeric: true },
    { key: 'swiftCode', title: t.swift, placeholder: t.swiftPlaceholder, helper: t.swiftHelper, max: 11 },
    { key: 'iban', title: t.iban, placeholder: t.ibanPlaceholder, helper: t.ibanHelper },
    { key: 'bankName', title: t.bankName, placeholder: t.bankPlaceholder, helper: t.bankHelper },
  ];
  const onAdd = () => {
    setSaving(true);
    setTimeout(() => {
      const code = `CBA-${Date.now().toString(36).toUpperCase().slice(-5)}`;
      creditsStore.patch((s) => ({ bankAccounts: [...s.bankAccounts, { code, ...values, phone: verifiedPhones[phone].replace(/\s/g, '') }], selectedAccount: code }));
      nav.back();
    }, DELAY);
  };
  return (
    <div className={styles.screen} style={{ height: '100%' }}>
      <NativeTopBar kind="close" onPress={() => nav.back()} />
      <div className={`nk-scroll ${styles.form}`}>
        <div className={styles.formInner}>
          <div className={styles.formTitle}>{t.formTitle}</div>
          <div className={styles.formSeparator} />
          {fields.map((f) => {
            const err = touched[f.key] ? errors[f.key] : '';
            return (
              <div key={f.key} className={styles.field}>
                <div className={styles.fieldTitle}>{f.title}</div>
                <div className={styles.fieldBox}>
                  <input
                    className={styles.fieldInput}
                    placeholder={f.placeholder}
                    inputMode={f.numeric ? 'numeric' : undefined}
                    maxLength={f.max}
                    autoCapitalize="none"
                    autoCorrect="off"
                    value={values[f.key]}
                    onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                    onBlur={() => setTouched((tt) => ({ ...tt, [f.key]: true }))}
                    aria-label={f.title}
                  />
                </div>
                <div className={styles.fieldBelow} data-error={err || undefined}>
                  {err || f.helper}
                </div>
              </div>
            );
          })}
          <div className={styles.fieldTitle}>{t.mobile}</div>
          <Pressable className={styles.picker} scale={1} onClick={() => setPhone((p) => (p + 1) % verifiedPhones.length)}>
            <span className={styles.pickerValue}>{verifiedPhones[phone]}</span>
            <img src={a.pickerArrow} width={9} height={6} alt="" />
          </Pressable>
        </div>
        <div className={styles.formButton}>
          <PrimaryButton disabled={!valid} loading={saving} onPress={onAdd}>
            {t.add}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

export interface BankConfirmParams {
  account?: string | null;
  amount?: number;
}

/** WalletBankTransferDetailsConfirmScreen (legacy Overlay: r5, floating X): amount and the six account lines; SUBMIT → OTP. */
export function BankConfirmSheet({ params }: ScreenProps<BankConfirmParams>) {
  const nav = useNav();
  const accounts = creditsStore.useStore((s) => s.bankAccounts);
  const account = accounts.find((x) => x.code === params.account) ?? accounts[0];
  const amount = params.amount ?? 150;
  if (!account) return null;
  const lines: [string, string][] = [
    [t.accountHolder, account.accountName],
    [t.accountNumber, account.accountNumber],
    [t.swift, account.swiftCode],
    [t.iban, account.iban],
    [t.bankName, account.bankName],
    [t.mobile, account.phone],
  ];
  return (
    <div className={styles.confirm}>
      <Pressable className={styles.overlayClose} scale={1} onClick={() => nav.back()} aria-label="Close">
        <img src={a.closeOverlay} alt="" />
      </Pressable>
      <div className={styles.confirmTop}>{t.checkDetails}</div>
      <div className={styles.confirmAmount}>
        <span className={styles.confirmAmountLabel}>{t.transferAmount}</span>
        <span className={styles.confirmAmountValue}>{priceText(amount)}</span>
      </div>
      <div className="nk-scroll" style={{ overflowY: 'auto', minHeight: 0 }}>
        <div className={styles.confirmDetails}>
          {lines.map(([label, value]) => (
            <div key={label} className={styles.detailLine}>
              <span className={styles.detailLabel}>{label}</span>
              <span className={styles.detailValue}>{value}</span>
            </div>
          ))}
        </div>
      </div>
      <PrimaryButton
        onPress={() => {
          nav.back();
          nav.push('credits/bank-otp', { account: account.code, amount });
        }}
      >
        {t.submit}
      </PrimaryButton>
    </div>
  );
}

/**
 * WalletBankTransferOTPScreen (push, header BACK): sends the OTP on open; 4-character code, VERIFY, "Resend OTP"
 * locked for 15 s with an orange countdown, at most 2 sends per visit. Verify → create the transfer → Requested.
 */
export function BankOtpScreen({ params }: ScreenProps<BankConfirmParams>) {
  const nav = useNav();
  const accounts = creditsStore.useStore((s) => s.bankAccounts);
  const account = accounts.find((x) => x.code === params.account) ?? accounts[0];
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [tries, setTries] = useState(0);
  const [left, setLeft] = useState(0);
  const [alert, setAlert] = useState<AlertSpec | null>(null);
  const t1 = useRef<ReturnType<typeof setTimeout>>(undefined);
  const send = () => {
    setLoading(true);
    setCode('');
    t1.current = setTimeout(() => {
      setLoading(false);
      setTries((n) => n + 1);
      setLeft(OTP_RESEND_SECONDS);
    }, DELAY);
  };
  useEffect(() => {
    send();
    return () => clearTimeout(t1.current);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (left <= 0) return;
    const id = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [left]);
  const verify = () => {
    setLoading(true);
    t1.current = setTimeout(() => {
      setLoading(false);
      if (code === FAILING_OTP) {
        setAlert({ title: t.error, message: t.wrongOtp, buttons: [{ text: t.ok }] });
        return;
      }
      creditsStore.patch((s) => ({ withdrawn: s.withdrawn + (params.amount ?? 0) }));
      nav.push('credits/bank-requested', { amount: params.amount });
    }, DELAY);
  };
  const resendDisabled = loading || tries >= OTP_MAX_SENDS || left > 0;
  return (
    <div className={styles.screen} style={{ height: '100%', position: 'relative' }}>
      <NativeTopBar kind="back" onPress={() => nav.back()} />
      <div className={`nk-scroll ${styles.otp}`}>
        <div className={styles.otpTitle}>{t.verifyTitle}</div>
        <div className={styles.otpText}>{t.otpMessage}</div>
        <div className={styles.otpPhone}>{account?.phone}</div>
        <input className={styles.otpInput} maxLength={4} placeholder="0000" value={code} disabled={loading} onChange={(e) => setCode(e.target.value)} aria-label="OTP" autoComplete="one-time-code" />
        <PrimaryButton disabled={code.length !== 4} loading={loading} onPress={verify}>
          {t.verify}
        </PrimaryButton>
        <div className={styles.resendRow}>
          {t.didntReceive}
          <Pressable className={styles.resend} scale={1} disabled={resendDisabled} onClick={send}>
            {t.resend}
          </Pressable>
          {left > 0 && tries < OTP_MAX_SENDS && (
            <>
              {t.in}
              <span className={styles.timer}>{String(left).padStart(2, '0')}</span>
            </>
          )}
        </div>
      </div>
      <NativeAlert spec={alert} onClose={() => setAlert(null)} />
    </div>
  );
}

/**
 * WalletBankTransferRequestedScreen (push, no header, no swipe back): illustration, "Transfer Requested", the email
 * note and WHAT HAPPENS NEXT? — closes the whole modal and refreshes the wallet (the app then opens the CMS page
 * /bank-transfer-web, which is not part of the repo).
 */
export function BankRequestedScreen({ params }: ScreenProps<{ amount?: number }>) {
  const nav = useNav();
  const addCredits = useDemoStore((s) => s.addCredits);
  return (
    <div className={styles.screen} style={{ height: '100%', paddingTop: 'var(--nk-inset-top)' }}>
      <div className={styles.requested}>
        <img src={a.transferRequested} alt="" />
        <div className={styles.requestedTitle}>{t.transferRequested}</div>
        <div className={styles.requestedText}>{t.checkEmail}</div>
        <PrimaryButton
          className={styles.requestedButton}
          onPress={() => {
            dismissBankModal(nav);
            if (params.amount) addCredits(-params.amount, 'Withdrawal to bank', 'bank');
            creditsStore.patch((s) => ({ refetch: s.refetch + 1, prefetched: false }));
          }}
        >
          {t.whatNext}
        </PrimaryButton>
      </div>
    </div>
  );
}
