import { useNav } from '../../kit/Navigator';
import { openProviderBurn } from './components/BurnSection';
import { ProviderCallout } from './components/RewardsPrimitives';
import { rt, voucherProviders } from './data.rewards';
import styles from './rewardsSheets.module.css';

/**
 * NoonCheckoutBurnProvidersListOverlayScreen — "Financing Options": sticky header (18/700) and the expanded
 * voucher provider callouts (45px logo, title, description, chevron). Tapping one opens the provider burn overlay.
 */
export function BurnProvidersScreen() {
  const nav = useNav();
  return (
    <div className={styles.scroll}>
      <div className={styles.listHeader}>
        <span className={styles.listTitle}>{rt.noon_provider_financing_options}</span>
      </div>
      <div className={styles.listContent}>
        {voucherProviders.map((p) => (
          <ProviderCallout key={p.code} provider={p} isExpanded onPress={() => openProviderBurn(nav, p, true)} />
        ))}
      </div>
    </div>
  );
}
