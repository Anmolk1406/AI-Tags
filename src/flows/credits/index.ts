import { defineFlow } from '../../kit/registry';
import { lazyScreen } from '../../kit/lazyScreen';
import { creditsFlowTokens } from './tokens';

const CreditsScreen = lazyScreen(() => import('./CreditsScreen'), 'CreditsScreen');
const DetailsSheet = lazyScreen(() => import('./DetailsSheet'), 'DetailsSheet');
const ListSheet = lazyScreen(() => import('./ListSheet'), 'ListSheet');
const NegativeSheet = lazyScreen(() => import('./NegativeSheet'), 'NegativeSheet');
const FiltersSheet = lazyScreen(() => import('./FiltersSheet'), 'FiltersSheet');
const SortSheet = lazyScreen(() => import('./SortSheet'), 'SortSheet');
const TopupSheet = lazyScreen(() => import('./TopupSheet'), 'TopupSheet');
const GiftCardScreen = lazyScreen(() => import('./GiftCardScreen'), 'GiftCardScreen');
const BankTransferScreen = lazyScreen(() => import('./BankScreens'), 'BankTransferScreen');
const BankFormScreen = lazyScreen(() => import('./BankScreens'), 'BankFormScreen');
const BankConfirmSheet = lazyScreen(() => import('./BankScreens'), 'BankConfirmSheet');
const BankOtpScreen = lazyScreen(() => import('./BankScreens'), 'BankOtpScreen');
const BankRequestedScreen = lazyScreen(() => import('./BankScreens'), 'BankRequestedScreen');

const W = 'features/wallet';
/** bappzaar src/components/BottomSheet (gorhom): full width, handle above, black 0.5 backdrop */
const gorhom = (radius: number, height?: number | string) => ({ layout: 'gorhom' as const, radius, ...(height != null && { height }) });

/** bappzaar origin/master features/wallet (noon Credits) — value mapping in MAPPING.md */
export const creditsFlow = defineFlow({
  id: 'credits',
  title: 'noon Credits',
  group: 'Profile',
  description:
    'Account → noon Credits (noon.WalletScreen): balance with the expiring / negative banner, top-up (gift cards & vouchers, loyalty points through the checkout redeem sheets), the transaction list with filters, sort and the pending card, transaction details, and the withdraw-to-bank flow (accounts, new account, confirm, OTP, requested).',
  initial: 'credits',
  parent: 'account/account', // Back target when opened directly (no history)
  tokens: creditsFlowTokens,
  screens: [
    {
      id: 'credits',
      title: 'noon Credits',
      component: CreditsScreen,
      path: ['credits', 'noon-credits', 'wallet'],
      statusBar: 'dark',
      source: `${W}/screens/WalletScreen (+ components/WalletScreenHeader, WalletTotalBalance, Screens/WalletLanding/**, WalletTransaction/**)`,
      notes:
        'Loads for ~1 s (skeleton). The balance follows the demo store: top up and it grows. Tap the yellow banner\'s "View" for the expiring sheet, the black button for the top-up sheet, the "Pending Credits" card, any row for its details. Chips: Filters (sheet), Most Recent ▾ (sort sheet), Expiring (toggles and sorts soonest first — the separator appears), Clear. Scroll to the bottom to load page 2. "Withdraw to bank" opens the bank transfer. ?state=negative | empty | error | list-error | giftcard-only | no-topup | campaign | loading.',
    },
    { id: 'negative', title: 'Negative balance (landing)', component: CreditsScreen, defaultParams: { state: 'negative' }, source: `${W}/screens/WalletScreen (totalCredits.isNegative + banner NEGATIVE_BALANCE)`, notes: 'Balance −42 in dark red, the pink banner; "Learn more" opens the negative-balance sheet.' },
    { id: 'empty', title: 'No transactions', component: CreditsScreen, defaultParams: { state: 'empty' }, source: `${W}/components/WalletError (wallet-empty-transactions)`, notes: 'Empty list with the "Add Credits" CTA (opens the top-up sheet).' },
    { id: 'error', title: 'Wallet error', component: CreditsScreen, defaultParams: { state: 'error' }, source: `${W}/screens/WalletScreen WalletErrorView`, notes: '"Try Again" reloads and succeeds.' },
    {
      id: 'details',
      title: 'Transaction details',
      component: DetailsSheet,
      presentation: 'sheet',
      sheet: { ...gorhom(20, 500), surface: 'transparent' },
      defaultParams: { code: 'TXN-9F21A' },
      source: `${W}/screens/WalletTransactionDetailsScreen, components/Screens/WalletTransactionDetails/**`,
      notes: 'The refund (TXN-9F21A) has "Withdraw to bank" (→ bank transfer) and "View Order Details" (→ order tracking); TXN-9F1C2 shows expiry lots; others show the history timeline. ?state=error → Retry.',
    },
    { id: 'pending', title: 'Pending credits', component: ListSheet, presentation: 'sheet', sheet: gorhom(16, 300), defaultParams: { type: 'PENDING' }, source: `${W}/screens/WalletPendingOrExpiringTransactionsScreen (type PENDING)`, notes: 'Green amount pill; rows open their details on top.' },
    { id: 'expiring', title: 'Expiring credits', component: ListSheet, presentation: 'sheet', sheet: gorhom(16, 450), defaultParams: { type: 'EXPIRING' }, source: `${W}/screens/WalletPendingOrExpiringTransactionsScreen (type EXPIRING)`, notes: '"Shop now" → Home tab; "View all Expiring Credits" filters the wallet list to expiring, soonest first.' },
    { id: 'negative-sheet', title: 'Negative balance', component: NegativeSheet, presentation: 'sheet', sheet: gorhom(16), defaultParams: { topup: true }, source: `${W}/screens/WalletNegativeBalanceScreen`, notes: '"Add Credits" opens the top-up sheet; ?topup=false shows a single GOT IT.' },
    { id: 'filters', title: 'Filters', component: FiltersSheet, presentation: 'sheet', sheet: gorhom(20, '60%'), source: `${W}/screens/WalletFiltersScreen, components/Screens/WalletFilter/**`, notes: 'Every change prefetches (spinner in the button). Pick Expired, or tap two days in the calendar for a period. Apply is grey until something changes; "0 Transactions" when nothing matches.' },
    { id: 'sort', title: 'Sort', component: SortSheet, presentation: 'sheet', sheet: gorhom(16), source: `${W}/screens/WalletSortScreen`, notes: 'Tap "Soonest to expire": the sheet closes and the list re-sorts.' },
    { id: 'topup', title: 'Add credits', component: TopupSheet, presentation: 'sheet', sheet: gorhom(20), source: `${W}/screens/WalletTopupScreen, components/Screens/WalletTopup/**`, notes: 'Giftcards & Vouchers → redeem modal. A provider opens checkout\'s redeem sheets (phone → OTP → amount); Redeem credits the balance and closes back to the wallet.' },
    {
      id: 'giftcard',
      title: 'Redeem gift card',
      component: GiftCardScreen,
      presentation: 'modal',
      source: 'features/giftcards/screens/GiftCardRedeemSceen/GiftCardRedeemScreen (+ src/components/Tabs, FormikTextInput)',
      notes: 'Gift card: any 16-character code + 4-digit PIN; Voucher: any code of 4+. Codes starting 0000 are rejected. Success adds the credits.',
    },
    {
      id: 'bank',
      title: 'Withdraw to bank',
      component: BankTransferScreen,
      presentation: 'modal',
      path: ['bank-transfer'],
      source: `${W}/screens/WalletBankTransferScreen, components/WalletBankAccountCard, hooks/useWalletBankTransfer`,
      notes: 'Type an amount (50–245.50) or tick "Withdraw all", pick an account, tick the terms, SUBMIT → confirm sheet → OTP (any 4 characters; 0000 fails) → Requested. Delete asks for confirmation. ?state=insufficient | blocked | no-accounts.',
    },
    { id: 'bank-form', title: 'New bank account', component: BankFormScreen, presentation: 'modal', source: `${W}/screens/WalletBankFormScreen, components/WalletBankForm (+ validate.ts, constants/WalletIbanConfig.ts)`, notes: 'Errors show after you leave a field. ADD saves and selects the account.' },
    { id: 'bank-confirm', title: 'Check details & confirm', component: BankConfirmSheet, presentation: 'sheet', sheet: { layout: 'gorhom', radius: 5, grabber: false }, source: `${W}/screens/WalletBankTransferDetailsConfirmScreen (src/components/Overlay)`, notes: 'SUBMIT closes and pushes the OTP screen.' },
    { id: 'bank-otp', title: 'Verify mobile number', component: BankOtpScreen, source: `${W}/screens/WalletBankTransferOTPScreen`, notes: 'The code is sent on open; Resend unlocks after 15 s, twice at most.' },
    { id: 'bank-requested', title: 'Transfer requested', component: BankRequestedScreen, source: `${W}/screens/WalletBankTransferRequestedScreen`, notes: 'WHAT HAPPENS NEXT? closes the bank modal back to the wallet (the CMS page /bank-transfer-web is server content and is not ported).' },
  ],
});
