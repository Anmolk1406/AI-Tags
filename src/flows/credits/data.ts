import type { OriginIconName } from '../../components/Icon/originIcons';
import { currency } from '../../data';

/**
 * noon Credits (bappzaar `features/wallet`) copy and mock API responses. Copy: `features/wallet/locale/translations/
 * wallet-en.json` (+ `src/locale/translations/en.json` for the shared keys). The server strings (banner, titles,
 * subtitles, amounts) are HTML styled by tag name, exactly like the wallet APIs send them; the formats are inferred
 * from the client stylesheets (MAPPING.md §6). Amounts use the dirham sign, never "AED".
 */
export const t = {
  noonCredits: 'noon Credits',
  withdrawToBank: 'Withdraw to bank',
  topupGiftcardOnly: 'Redeem Giftcards',
  topupBoth: 'Add Credits or Redeem Giftcards',
  addCredits: 'Add credits',
  addCreditsCta: 'Add Credits',
  transactions: 'Transactions',
  filters: 'Filters',
  sortDefault: 'Sort',
  sortRecent: 'Most Recent',
  sortSoonest: 'Soonest to expire',
  expiring: 'Expiring',
  clear: 'Clear',
  separator: 'All other transactions are sorted by most recent',
  emptyTitle: 'Your transactions will appear here',
  emptySubtitle: 'Add credits or redeem giftcards to top up your balance and start using noon credits at checkout!',
  emptyFilterTitle: 'No Transactions found',
  emptyFilterSubtitle: 'No results found matching your filters, try clearing some filters.',
  emptyFilterCta: 'Clear All Filters',
  errorTitle: 'Something went wrong',
  homeErrorSubtitle: "Something went wrong while loading your wallet. Don't worry, your balance is safe. Please try again.",
  tryAgain: 'Try Again',
  retry: 'Retry',
  apiError: 'Oops! Something went wrong.',
  count: (n: number) => (n === 2 ? '2 Transactions' : n <= 1 ? '1 Transaction' : `${n} Transactions`),
  // details
  viewOrderDetails: 'View Order Details',
  // pending / expiring
  shopNow: 'Shop now',
  viewAllExpiring: 'View all Expiring Credits',
  expiringNote: "Don't worry, we'll automatically use the credit that is soonest to expire first",
  // negative balance
  negativeTitle: 'Negative Credit Balance',
  negativeSubtitle:
    'Your wallet shows a negative balance due to undeliverable cash on delivery food order, using cashback from an order that was later returned, or other related order adjustment reasons.',
  later: "I'll do it later",
  gotIt: 'GOT IT',
  // filters / sort
  sortBy: 'Sort by',
  default: 'Default',
  status: 'Status',
  all: 'All',
  expired: 'Expired',
  transactionDate: 'Transaction date',
  from: 'From',
  to: 'To',
  datePlaceholder: 'DD/MM/YYYY',
  apply: 'Apply',
  zeroTransactions: '0 Transactions',
  // top-up
  topupSubtitle: 'Redeem your Giftcards, Points or Vouchers to noon Credits!',
  giftcardsAndVouchers: 'Giftcards & Vouchers',
  // gift card redeem (features/giftcards)
  giftCard: 'Gift card',
  voucher: 'Voucher',
  voucherInfo: 'If you do not have an accompanying PIN, please use the voucher tab to redeem',
  giftCardNumber: 'Gift card number',
  characterCode: (n: number) => `${n} character code`,
  pin: 'PIN',
  digitPin: (n: number) => `${n} digit pin`,
  voucherCode: 'Voucher code',
  enterVoucherCode: 'Enter Voucher code',
  redeem: 'REDEEM',
  redeemed: 'Successfully Redeemed!',
  giftCardSuccess: 'The Gift card is redeemed successfully and the balance is added to the noon credits.',
  voucherSuccess: (amount: string) => `The Voucher was redeemed to your account. Your credit balance is ${amount}`,
  goBack: 'Go back',
  invalidVoucher: 'Invalid Voucher',
  invalidGiftCard: 'Invalid gift card number or PIN',
  gcEmpty: 'Please enter the gift card number',
  gcLength: (n: number) => `Gift card code must be ${n} characters`,
  pinEmpty: 'Please enter the gift card PIN',
  pinLength: (n: number) => `Gift card pin must be ${n} digits`,
  voucherEmpty: 'Please enter a voucher code',
  voucherLength: (n: number) => `Voucher code must be a minimum of ${n} characters`,
  close: 'Close',
  // bank transfer
  cancel: 'Cancel',
  transferAmount: 'Transfer Amount',
  withdrawAll: (balance: string) => `Withdraw all available ${balance} balance`,
  selectBankAccount: 'Select a bank account',
  addNewAccount: 'Add new Account',
  terms:
    'By clicking on "SUBMIT" you hereby agree that all bank account details and other information provided are complete, accurate and correct and that noon shall not be held liable in any manner whatsoever for any mistakes, inaccuracies and/or typographical errors in the account details.',
  submit: 'SUBMIT',
  required: 'Hold up, this field is required.',
  minTransfer: (n: number) => `The minimum transfer amount allowed is ${n}`,
  maxTransfer: (n: number) => `The maximum transfer amount allowed is ${n}`,
  insufficientFunds: 'Insufficient funds to make transfer',
  backToCredits: 'Back to Noon Credits',
  insufficientBalance: (min: string) =>
    `Sorry, you are unable to make a withdrawal due to an insufficient withdrawable balance. You can only withdraw credits that come from Cash on Delivery refunds. The minimum withdrawable amount is ${min}.`,
  deleteConfirm: 'Are you sure you want to delete this bank account?',
  accountNo: 'AC No:',
  iban: 'IBAN Number',
  accountHolder: 'Account Holder',
  bankName: 'Bank Name',
  swift: 'SWIFT Code',
  accountNumber: 'Account Number',
  mobile: 'Mobile Number',
  delete: 'Delete',
  noAccountsTitle: "You don't have any bank accounts saved",
  noAccountsMessage: 'Add a bank account so you can transfer your credits',
  addNewAccountCta: 'ADD NEW ACCOUNT',
  formTitle: 'New Bank Details',
  holderPlaceholder: 'Enter full name',
  holderHelper: 'Name as per your bank statement.',
  numberPlaceholder: 'Enter Account number',
  numberHelper: 'Account number as per your bank statement.',
  swiftPlaceholder: 'Example: AAAABBCC123',
  swiftHelper: 'SWIFT code should be 8 to 12 characters.',
  ibanPlaceholder: 'Example: AE070331234567890123456',
  ibanHelper: 'IBAN should start with AE.',
  bankPlaceholder: 'Enter bank name',
  bankHelper: 'Bank name as per your bank statement.',
  add: 'ADD',
  noSpecial: "Special characters and spaces aren't allowed",
  validNumber: 'Oh no! Please enter a valid number.',
  min8: 'This field requires at least 8 characters.',
  tooLong: 'Oops! Maximum characters exceeded',
  checkDetails: 'Check Details & Confirm',
  verifyTitle: 'Please verify your mobile number to submit the bank transfer request',
  otpMessage: 'To proceed with the bank transfer, use the OTP & verify your mobile number. We’ve sent the OTP to',
  verify: 'VERIFY',
  didntReceive: "Didn't receive the code? ",
  resend: 'Resend OTP',
  in: ' in ',
  wrongOtp: 'The verification code is incorrect',
  transferRequested: 'Transfer Requested',
  checkEmail: 'Please check your email within an hour and confirm your bank details to proceed with the transfer request',
  whatNext: 'WHAT HAPPENS NEXT?',
  nextStepsTitle: 'What happens next?',
  error: 'Error',
  ok: 'OK',
} as const;

/** getFormattedPrice(x, cur): "%u %n", precision 2 — the dirham sign then the amount, always two decimals. */
export const amount2 = (n: number) => Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const money = (n: number) => `${currency} ${amount2(n)}`;
/** WalletTransaction amountText: `<semibold><green>+ AED 129.00</green></semibold>` (black for debits). */
export const amountHtml = (n: number) => (n >= 0 ? `<semibold><green>+ ${money(n)}</green></semibold>` : `<semibold><black>- ${money(n)}</black></semibold>`);

// ── filters (features/wallet/constants/WalletConstants.ts) ─────────────────────────────────────────────────────────
export type SortOption = 'RECENT' | 'SOONEST_TO_EXPIRE';
export type StatusOption = 'ALL' | 'EXPIRING' | 'EXPIRED';
export interface WalletFilters {
  sort: SortOption;
  status: StatusOption;
  startDate: string; // YYYY-MM-DD or ''
  endDate: string;
}
export const initialFilters: WalletFilters = { sort: 'RECENT', status: 'ALL', startDate: '', endDate: '' };
export const isDefaultFilters = (f: WalletFilters) => f.sort === 'RECENT' && f.status === 'ALL' && !f.startDate && !f.endDate;

// ── transactions (POST /st-payment-api-wallet-public/transactions) ────────────────────────────────────────────────
export type TxStatus = 'ACTIVE' | 'EXPIRING' | 'EXPIRED' | 'PENDING';
export interface WalletTransaction {
  code: string;
  title: string;
  /** html: <grey> <light> <warning> */
  subtitle: string | null;
  /** remote SVG in the app; an Origin icon here */
  icon: OriginIconName;
  /** html: <green> <black> */
  amountText: string;
  isExpirable: boolean;
  status: TxStatus;
  /** signed amount (the server only sends amountText) */
  amount: number;
  /** YYYY-MM-DD, for the date filter and "Most Recent" */
  date: string;
  /** YYYY-MM-DD, for "Soonest to expire" */
  expiresAt?: string;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
/** "14 Oct 2026" (server date format) */
const day = (iso: string) => `${Number(iso.slice(8, 10))} ${MONTHS[Number(iso.slice(5, 7)) - 1]} ${iso.slice(0, 4)}`;
const sub = (date: string, extra?: string) => `<grey>${day(date)}</grey>${extra ? `<light> | </light>${extra}` : ''}`;

const tx = (code: string, title: string, amount: number, icon: OriginIconName, date: string, o: { extra?: string; status?: TxStatus; expiresAt?: string; noSubtitle?: boolean } = {}): WalletTransaction => ({
  code,
  title,
  subtitle: o.noSubtitle ? null : sub(date, o.extra ?? (o.expiresAt ? `<warning>Expires ${day(o.expiresAt)}</warning>` : undefined)),
  icon,
  amountText: amountHtml(amount),
  isExpirable: !!o.expiresAt && o.status !== 'EXPIRED',
  amount,
  status: o.status ?? (o.expiresAt ? 'EXPIRING' : 'ACTIVE'),
  date,
  expiresAt: o.expiresAt,
});

/** The landing history (status ALL), newest first. Pending ones live behind the pending card. */
export const transactions: WalletTransaction[] = [
  tx('TXN-9F21A', 'Refund for order NAEH40012345', 129, 'return-package', '2026-10-14', { extra: '<grey>Refund</grey>' }),
  tx('TXN-9F1C2', 'Cashback', 25, 'noon-cash', '2026-10-12', { expiresAt: '2026-10-31' }),
  tx('TXN-9E77B', 'Used on order NAEH40011876', -60, 'order-box', '2026-10-09'),
  tx('TXN-9E51D', 'Gift card redeemed', 100, 'gift-card', '2026-10-03', { extra: '<grey>Gift card</grey>' }),
  tx('TXN-9D0A4', 'Emirates Skywards Miles converted', 40, 'star-plus', '2026-09-28', { expiresAt: '2027-03-28' }),
  tx('TXN-9C3E0', 'Used on noon Food order', -35.5, 'bag', '2026-09-21'),
  tx('TXN-9B812', 'Credits expired', -10, 'hourglass', '2026-09-15', { extra: '<grey>Expired</grey>', status: 'EXPIRED' }),
  tx('TXN-9A5F7', 'Withdrawal to bank', -200, 'payment-bank', '2026-09-08', { noSubtitle: true }),
  // page 2 (nextCursor)
  tx('TXN-98E10', 'Promo credits', 10, 'discount-star', '2026-08-30', { expiresAt: '2026-08-31', status: 'EXPIRED', extra: '<grey>Expired</grey>' }),
  tx('TXN-97C44', 'Refund for order NAEH40009921', 249.5, 'return-package', '2026-08-18', { extra: '<grey>Refund</grey>' }),
  tx('TXN-96B02', 'Used on order NAEH40009410', -99, 'order-box', '2026-08-02'),
  tx('TXN-95A71', 'Cashback', 15, 'noon-cash', '2026-07-24'),
];
export const PAGE_SIZE = 8;

export const pendingTransactions: WalletTransaction[] = [
  tx('TXN-P-1', 'Cashback', 12.5, 'noon-cash', '2026-10-15', { extra: '<warning>Pending · expected 20 Oct</warning>', status: 'PENDING' }),
  tx('TXN-P-2', 'Refund for order NAEH40012399', 51.5, 'return-package', '2026-10-13', { extra: '<grey>Refund</grey>', status: 'PENDING' }),
];
export const pendingHeader = {
  type: 'BUTTON_VIEW' as const,
  icons: ['noon-cash', 'return-package'] as OriginIconName[],
  title: 'Pending Credits',
  transactionsCount: pendingTransactions.length,
  amountText: `<span>${money(64)}</span>`,
};
/** BANNER_EXPIRING list + its DEFAULT_VIEW header (WalletPendingOrExpiringTransactionsScreen) */
export const expiringHeader = { title: 'Expiring this month', amountText: `<span>${money(25)}</span>` };

/** GET /main → banner (EXPIRING or NEGATIVE_BALANCE) */
export const expiringBanner = { type: 'EXPIRING' as const, text: `<normal><b>${money(25)}</b> expiring by 31 Oct · <a><underline>View</underline></a></normal>` };
export const negativeBanner = {
  type: 'NEGATIVE_BALANCE' as const,
  text: '<normal><danger>Your balance is negative. </danger><a><underline>Learn more</underline></a></normal>',
};
export const negativeBalance = -42;

// ── transaction details (GET /transaction_details/{code}) ─────────────────────────────────────────────────────────
export type DetailsSection =
  | { type: 'DESCRIPTION'; text: string; note: string; marketplace: string; orderNr: string; isBankWithdrawEnabled: boolean }
  | { type: 'EXPIRY_DETAILS'; expiryLots: { title: string }[]; note: string }
  | { type: 'TRANSACTION_HISTORY'; title: string; transactions: { title: string; subtitle: string; amountText: string; icon: OriginIconName }[] };

export interface TransactionDetails {
  title: string;
  subtitle: string;
  amountText: string;
  icon: OriginIconName;
  sections: DetailsSection[];
}

const hist = (title: string, when: string, amount: number, icon: OriginIconName) => ({ title, subtitle: `<black>${when}</black>`, amountText: amount > 0 ? `<green>+ ${money(amount)}</green>` : amount < 0 ? `<black>- ${money(amount)}</black>` : '', icon });

const detailsByCode: Record<string, TransactionDetails> = {
  'TXN-9F21A': {
    title: 'Refund',
    subtitle: '<grey>14 Oct 2026, 11:03 AM</grey>',
    amountText: amountHtml(129),
    icon: 'return-package',
    sections: [
      { type: 'DESCRIPTION', text: 'Refund for returned item(s) from your Cash on Delivery order', note: 'Refunds from Cash on Delivery orders can be withdrawn to your bank account', marketplace: 'noon', orderNr: 'NAEH40012345', isBankWithdrawEnabled: true },
      { type: 'TRANSACTION_HISTORY', title: 'Transaction history', transactions: [hist('Return received', '13 Oct 2026, 6:40 PM', 0, 'delivery-box-return'), hist('Refund credited', '14 Oct 2026, 11:03 AM', 129, 'noon-cash')] },
    ],
  },
  'TXN-9F1C2': {
    title: 'Cashback',
    subtitle: '<grey>12 Oct 2026, 4:12 PM</grey>',
    amountText: amountHtml(25),
    icon: 'noon-cash',
    sections: [
      { type: 'DESCRIPTION', text: 'Cashback credited for your noon order', note: 'Credits can be used on noon, noon Food and noon Minutes', marketplace: 'noon', orderNr: 'NAEH40011990', isBankWithdrawEnabled: false },
      { type: 'EXPIRY_DETAILS', expiryLots: [{ title: `<normal><b>${money(15)}</b> expires on 31 Dec 2026</normal>` }, { title: `<warning><b>${money(10)}</b> expires in 5 days</warning>` }], note: 'Credits expiring soonest are used first' },
      { type: 'TRANSACTION_HISTORY', title: 'Transaction history', transactions: [hist('Cashback credited', '12 Oct 2026, 4:12 PM', 25, 'noon-cash')] },
    ],
  },
  'TXN-P-1': {
    title: 'Cashback',
    subtitle: '<warning>Pending · expected by 20 Oct 2026</warning>',
    amountText: `<black><b>${money(12.5)}</b></black>`,
    icon: 'noon-cash',
    sections: [{ type: 'DESCRIPTION', text: 'Your cashback will be credited once the order is delivered and the return window closes.', note: 'Pending credits cannot be used yet', marketplace: 'noonfood', orderNr: 'FD-88271', isBankWithdrawEnabled: false }],
  },
  'TXN-9B812': {
    title: 'Credits expired',
    subtitle: '<grey>15 Sep 2026</grey>',
    amountText: amountHtml(-10),
    icon: 'hourglass',
    sections: [{ type: 'EXPIRY_DETAILS', expiryLots: [{ title: `<grey>${money(10)} expired on 15 Sep 2026</grey>` }], note: '' }],
  },
};

/** Any other code: a description built from its list row. */
export function getDetails(code: string): TransactionDetails | null {
  if (detailsByCode[code]) return detailsByCode[code];
  const row = [...transactions, ...pendingTransactions].find((x) => x.code === code);
  if (!row) return null;
  const order = row.title.match(/NAEH\d+/)?.[0] ?? '';
  return {
    title: row.title.replace(/ for order NAEH\d+| order NAEH\d+/, ''),
    subtitle: row.subtitle ?? `<grey>${day(row.date)}</grey>`,
    amountText: row.amountText,
    icon: row.icon,
    sections: [
      { type: 'DESCRIPTION', text: row.title, note: '', marketplace: order ? 'noon' : '', orderNr: order, isBankWithdrawEnabled: false },
      { type: 'TRANSACTION_HISTORY', title: 'Transaction history', transactions: [hist(row.title, `${day(row.date)}, 10:20 AM`, row.amount, row.icon)] },
    ],
  };
}

// ── top-up (get-provider-list-v2 burn.loyalty + burn.voucher; checkout's provider-burn sheets) ─────────────────────
export { day };

export interface WalletProvider {
  /** checkout provider code (checkout/provider-burn) */
  code: string;
  title: string;
  isVoucher: boolean;
  /** stand-in for the remote `icons.wallet` / `icons.rounded` logos: brand colour + wordmark initial */
  color: string;
  ink: string;
  mark: string;
}

// ── bank transfer (customer-v1 bank-transfer + bank-account) ─────────────────────────────────────────────────────
export const bankConfig = { minWithdrawLimit: 50, maxWithdrawLimit: 5000 };
/** Only credits from Cash on Delivery refunds can be withdrawn. */
export const withdrawableBalance = 245.5;
export const bankWarning = 'Only credits from <b>Cash on Delivery refunds</b> can be withdrawn to your bank account.';
export interface BankAccount {
  code: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  iban: string;
  swiftCode: string;
  phone: string;
}
export const seedBankAccounts: BankAccount[] = [
  { code: 'CBA-7Q2K9', accountName: 'Ankit Debnath', accountNumber: '1012345678901', bankName: 'Emirates NBD', iban: 'AE070331234567890123456', swiftCode: 'EBILAEAD', phone: '+971501234567' },
  { code: 'CBA-3M8XD', accountName: 'Ankit Debnath', accountNumber: '0198765432', bankName: 'Abu Dhabi Commercial Bank', iban: 'AE460030000198765432001', swiftCode: 'ADCBAEAA', phone: '+971559876543' },
];
export const verifiedPhones = ['+971 50 123 4567', '+971 55 987 6543'];
/** demo: this OTP is rejected */
export const FAILING_OTP = '0000';
export const OTP_RESEND_SECONDS = 15;
export const OTP_MAX_SENDS = 2;

/** gift card demo: any 16-character code + 4-digit PIN works, except codes starting 0000 */
export const GIFT_CARD_VALUE = 100;
export const VOUCHER_VALUE = 50;
