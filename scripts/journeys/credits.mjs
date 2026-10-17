// noon Credits (bappzaar features/wallet): account entry, top-up (voucher + loyalty points through checkout's redeem
// sheets), filters / sort / expiring chip, and the withdraw-to-bank modal through OTP back to the wallet.
import { expect, money, nav, open, tap, top, waitFor, waitRoute } from './lib.mjs';

/** the landing balance, e.g. 248.50 (WalletTotalBalance renders sign · currency · integer · .decimals) */
const balance = async (page) => money(await page.locator('[data-route="credits/credits"] [class*=_balanceLine_]').first().textContent());
const rows = (page) => page.locator('[data-route="credits/credits"] [data-code]');

export default [
  {
    name: 'credits-topup',
    area: 'credits',
    title: 'Account → noon Credits; redeem a voucher (+50) and SHARE points (+20) — the balance and the account row follow, the list shows them',
    async run(page, shot) {
      await open(page, 'account/account');
      await tap(page, (await top(page)).getByRole('button', { name: /noon Credits/ }));
      await waitRoute(page, 'credits/credits', 'credits/credits from the account row');
      await page.waitForTimeout(1600);
      const start = await balance(page);
      expect(start === 248.5, `wallet balance is ${start}, expected 248.50`);
      expect((await rows(page).count()) === 8, `first page shows ${await rows(page).count()} transactions, expected 8`);
      await shot('wallet');

      // voucher: top-up sheet → Giftcards & Vouchers (modal) → Voucher tab → REDEEM → success → Go back
      await tap(page, (await top(page)).getByText('Add Credits or Redeem Giftcards'));
      await waitRoute(page, 'credits/topup');
      await page.waitForTimeout(700);
      await shot('topup-sheet');
      await tap(page, (await top(page)).getByRole('button', { name: 'Giftcards & Vouchers' }));
      await waitRoute(page, 'credits/giftcard');
      await page.waitForTimeout(800);
      await tap(page, (await top(page)).getByRole('button', { name: 'Voucher', exact: true }));
      await (await top(page)).getByLabel('Voucher code').fill('NOON2026');
      await tap(page, (await top(page)).getByRole('button', { name: 'REDEEM' }));
      await waitFor(async () => (await (await top(page)).getByText('Successfully Redeemed!').count()) > 0, 'voucher success never showed');
      await shot('voucher-redeemed');
      await tap(page, (await top(page)).getByRole('button', { name: 'Go back' }));
      let n = await waitRoute(page, 'credits/credits', 'back on the wallet after the voucher');
      expect(n.stack.join() === 'account/account,credits/credits', `after Go back the stack is ${n.stack.join(' → ')} (the top-up sheet should close too)`);
      await page.waitForTimeout(1000);
      expect((await balance(page)) === start + 50, `balance after the voucher is ${await balance(page)}, expected ${start + 50}`);
      const firstRow = await rows(page).first().textContent();
      expect(/Voucher redeemed/.test(firstRow), `the newest transaction is "${firstRow}"`);

      // loyalty points: top-up → SHARE points → checkout provider-burn → OTP + amount → Redeem
      await tap(page, (await top(page)).getByText('Add Credits or Redeem Giftcards'));
      await waitRoute(page, 'credits/topup');
      await page.waitForTimeout(700);
      await tap(page, (await top(page)).getByRole('button', { name: 'SHARE points' }));
      await waitRoute(page, 'checkout/provider-burn');
      await page.waitForTimeout(900);
      await tap(page, (await top(page)).getByRole('button', { name: /Continue/ }).last());
      await waitRoute(page, 'checkout/provider-burn-otp', 'OTP sheet', 6000);
      await page.waitForTimeout(900);
      const inputs = (await top(page)).locator('input');
      await inputs.first().fill('20');
      await inputs.last().fill('123456');
      await shot('share-otp');
      await tap(page, (await top(page)).getByRole('button', { name: 'Redeem' }));
      n = await waitRoute(page, 'credits/credits', 'back on the wallet after redeeming points', 6000);
      expect(n.stack.join() === 'account/account,credits/credits', `after Redeem the stack is ${n.stack.join(' → ')}`);
      await page.waitForTimeout(900);
      expect((await balance(page)) === start + 70, `balance after SHARE is ${await balance(page)}, expected ${start + 70}`);
      await shot('after-share');

      // the account row shows the new balance
      await tap(page, (await top(page)).getByRole('button', { name: 'Back', exact: true }), { scroll: false });
      await waitRoute(page, 'account/account');
      await page.waitForTimeout(700);
      const row = await (await top(page)).getByRole('button', { name: /noon Credits/ }).textContent();
      expect(money(row) === start + 70, `account row shows "${row}", expected ${start + 70}`);
    },
  },
  {
    name: 'credits-filters',
    area: 'credits',
    title: 'Wallet list: Expiring chip (soonest first + separator), Sort sheet, Filters sheet (Expired → Apply), Clear; page 2 on scroll',
    async run(page, shot) {
      await open(page, 'credits/credits', { settle: 1800 });
      const list = (await top(page)).locator('.nk-scroll').first();
      await list.evaluate((el) => el.scrollTo({ top: el.scrollHeight }));
      await waitFor(async () => (await rows(page).count()) === 12, 'page 2 never loaded on scroll');
      await list.evaluate((el) => el.scrollTo({ top: 0 }));

      await tap(page, (await top(page)).getByRole('button', { name: 'Expiring', exact: true }), { scroll: false });
      await waitFor(async () => (await rows(page).count()) === 2, `Expiring shows ${await rows(page).count()} rows, expected 2`);
      await page.waitForTimeout(600);
      await shot('expiring-chip');
      // Clear sits at the end of the horizontal chip row (off screen on a 390 phone, as in the app)
      const clear = (await top(page)).getByRole('button', { name: 'Clear', exact: true });
      await clear.evaluate((el) => el.parentElement?.scrollTo({ left: el.parentElement.scrollWidth }));
      await page.waitForTimeout(300);
      await tap(page, clear, { scroll: false });
      await waitFor(async () => (await rows(page).count()) === 8, 'Clear did not restore the list');

      // Sort sheet → Soonest to expire: expirable rows first, then the separator
      await tap(page, (await top(page)).getByRole('button', { name: /Most Recent/ }), { scroll: false });
      await waitRoute(page, 'credits/sort');
      await page.waitForTimeout(600);
      await tap(page, (await top(page)).getByRole('radio', { name: /Soonest to expire/ }));
      await waitRoute(page, 'credits/credits');
      await waitFor(async () => (await page.getByText('All other transactions are sorted by most recent').count()) === 1, 'no expiring separator after sorting soonest first');
      const first = await rows(page).first().getAttribute('data-code');
      expect(first === 'TXN-9F1C2', `soonest to expire starts with ${first}, expected the Oct cashback`);
      await shot('soonest');

      // Filters sheet: Apply is disabled until a change; Expired → Apply → only expired rows
      await tap(page, (await top(page)).getByRole('button', { name: /^Filters/ }), { scroll: false });
      await waitRoute(page, 'credits/filters');
      await page.waitForTimeout(700);
      const apply = (await top(page)).getByRole('button', { name: /Apply|Transactions/ });
      expect(await apply.isDisabled(), 'Apply is enabled before any change');
      await tap(page, (await top(page)).getByRole('radio', { name: /^Expired/ }));
      await waitFor(async () => !(await apply.isDisabled()), 'Apply stayed disabled after choosing Expired');
      await shot('filters-expired');
      await tap(page, apply, { scroll: false });
      await waitRoute(page, 'credits/credits');
      await waitFor(async () => (await rows(page).count()) === 2, `Expired filter shows ${await rows(page).count()} rows, expected 2`);
      await shot('expired-applied');
    },
  },
  {
    name: 'credits-withdraw',
    area: 'credits',
    title: 'Refund details → Withdraw to bank → amount + account + terms → confirm → OTP → Requested → back on the wallet, balance −100',
    async run(page, shot) {
      await open(page, 'credits/credits', { settle: 1800 });
      const start = await balance(page);
      await tap(page, rows(page).first());
      await waitRoute(page, 'credits/details');
      await page.waitForTimeout(1200);
      await shot('refund-details');
      await tap(page, (await top(page)).getByRole('button', { name: 'Withdraw to bank' }));
      await waitRoute(page, 'credits/bank');
      await page.waitForTimeout(1200);
      const t = await top(page);
      const submit = t.getByRole('button', { name: 'SUBMIT' });
      expect(await submit.isDisabled(), 'SUBMIT is enabled before terms and an account');
      await t.getByLabel('Transfer Amount').fill('20');
      await tap(page, t.locator('[data-account="CBA-7Q2K9"]'));
      await tap(page, t.getByRole('checkbox', { name: /By clicking/ }));
      await tap(page, submit);
      await waitFor(async () => (await t.getByText('The minimum transfer amount allowed is 50').count()) === 1, 'no minimum-amount error for 20');
      await t.getByLabel('Transfer Amount').fill('100');
      await shot('bank-transfer');
      await tap(page, submit);
      await waitRoute(page, 'credits/bank-confirm');
      await page.waitForTimeout(800);
      await shot('confirm');
      await tap(page, (await top(page)).getByRole('button', { name: 'SUBMIT' }));
      await waitRoute(page, 'credits/bank-otp');
      const otp = (await top(page)).getByLabel('OTP');
      await waitFor(async () => !(await otp.isDisabled()), 'the OTP was never sent');
      await otp.fill('4321');
      await tap(page, (await top(page)).getByRole('button', { name: 'VERIFY' }));
      await waitRoute(page, 'credits/bank-requested', 'Transfer Requested', 6000);
      await page.waitForTimeout(700);
      await shot('requested');
      await tap(page, (await top(page)).getByRole('button', { name: 'WHAT HAPPENS NEXT?' }));
      const n = await waitRoute(page, (r) => !r.startsWith('credits/bank'), 'the bank modal closed');
      expect(n.stack.join() === 'credits/credits,credits/details', `after the transfer the stack is ${n.stack.join(' → ')} (the details sheet stays, as on master)`);
      await page.waitForTimeout(600);
      expect((await balance(page)) === start - 100, `balance after withdrawing 100 is ${await balance(page)}, expected ${start - 100}`);
      expect(n !== undefined && (await nav(page)).route === 'credits/details', 'not back on the details sheet');
    },
  },
];
