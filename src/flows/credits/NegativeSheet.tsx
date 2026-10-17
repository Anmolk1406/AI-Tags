import { useNav } from '../../kit/Navigator';
import type { ScreenProps } from '../../kit/types';
import { creditsAssets as a } from './assets';
import { t } from './data';
import { WalletButton, WalletError } from './components/WalletUI';
import styles from './sheets.module.css';

export interface NegativeParams {
  /** isTopupEnabled: providers.length > 0 */
  topup?: boolean;
}

/**
 * WalletNegativeBalanceScreen (content-sized sheet): the error illustration, "Negative Credit Balance" and its
 * explanation; "Add Credits" (opens the top-up, then closes) + "I'll do it later", or a single "GOT IT".
 */
export function NegativeSheet({ params }: ScreenProps<NegativeParams>) {
  const nav = useNav();
  const topup = params.topup ?? true;
  return (
    <div className={styles.negative}>
      <WalletError image={a.error} width={164} height={111} title={t.negativeTitle} subtitle={t.negativeSubtitle} />
      <div className={styles.negativeButtons}>
        {topup && (
          <WalletButton
            pad={12}
            onPress={() => {
              nav.back();
              nav.sheet('credits/topup', { giftCard: true, providers: true });
            }}
          >
            {t.addCreditsCta}
          </WalletButton>
        )}
        <WalletButton pad={12} kind={topup ? 'secondary' : 'primary'} onPress={() => nav.back()}>
          {topup ? t.later : t.gotIt}
        </WalletButton>
      </div>
    </div>
  );
}

export default NegativeSheet;
