import { Pressable } from '../../components';
import { useNav } from '../../kit/Navigator';
import type { ScreenProps } from '../../kit/types';
import { creditsAssets as a } from './assets';
import { t } from './data';
import { creditsProviders } from './tokens';
import { ProviderMark } from './components/WalletUI';
import styles from './sheets.module.css';

export interface TopupParams {
  /** GiftCardsService.getAvailability isAvailable */
  giftCard?: boolean;
  /** get-provider-list-v2 returned providers */
  providers?: boolean;
}

/**
 * WalletTopupScreen (content height, r20): "Add credits", the WalletPoints card — subtitle, "Giftcards & Vouchers"
 * (→ GiftCardRedeemScreen, a full modal over the sheet) and one row per loyalty / voucher provider (→ checkout's
 * NoonProviderBurnOverlayScreen with plx page_wallet; success credits the balance and closes this sheet).
 */
export function TopupSheet({ params }: ScreenProps<TopupParams>) {
  const nav = useNav();
  const giftCard = params.giftCard ?? true;
  const providers = params.providers === false ? [] : creditsProviders;
  return (
    <div className={styles.content}>
      <div className={styles.topupTitle}>{t.addCredits}</div>
      <div className={styles.points}>
        <div className={styles.pointsSubtitle}>{t.topupSubtitle}</div>
        {giftCard && (
          <Pressable className={styles.option} scale={1} onClick={() => nav.push('credits/giftcard')}>
            <span className={styles.optionIcon}>
              <img src={a.giftcardTopup} width={45} height={45} alt="" />
            </span>
            <span className={styles.optionMain}>
              <span className={styles.optionTitle}>{t.giftcardsAndVouchers}</span>
              <img className={styles.flip} src={a.optionChevron} width={14} height={15} alt="" />
            </span>
          </Pressable>
        )}
        {providers.map((p) => (
          <Pressable key={p.code} className={styles.option} scale={1} onClick={() => nav.sheet('checkout/provider-burn', { code: p.code, isVouchersProvider: p.isVoucher, plx: 'page_wallet' })}>
            <span className={styles.optionIcon}>
              <ProviderMark provider={p} size={45} style={{ borderStartStartRadius: 'var(--nk-radius-r6)', borderEndStartRadius: 'var(--nk-radius-r6)' }} />
            </span>
            <span className={styles.optionMain}>
              <span className={styles.optionTitle}>{p.title}</span>
              <img className={styles.flip} src={a.optionChevron} width={14} height={15} alt="" />
            </span>
          </Pressable>
        ))}
      </div>
    </div>
  );
}

export default TopupSheet;
