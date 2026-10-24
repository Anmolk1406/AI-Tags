import { useMemo } from 'react';
import { Header, Screen, Text } from '../../components';
import type { ScreenProps } from '../../kit/types';
import { productById } from '../../data';
import { SfDeliveryCard } from './components/storefront/SfDeliveryCard';
import styles from './pdp.module.css';
import { sfCopy } from '../../data/copy/pdp';
import { deliveryVariants, pdpView } from '../../data/views/pdp';

/** Every `SfDeliveryCard` variant for one product (PDP Redesign xPr9Ln37JGSBGvNtrsyD0y · 3583:109620), for review and snapshots. */
export function DeliveryVariantsScreen({ params }: ScreenProps<{ productId: string }>) {
  const product = productById(params.productId);
  const content = useMemo(() => pdpView(product), [product]);
  return (
    <Screen header={<Header title={sfCopy.deliveryVariants.title} />} background="bgPage">
      <div className={styles.list} style={{ paddingTop: 12 }}>
        {deliveryVariants.map((v) => (
          <section key={v}>
            <Text variant="caption" color="textSecondary" style={{ display: 'block', padding: '0 14px 6px' }}>
              {sfCopy.deliveryVariants.labels[v]}
            </Text>
            <SfDeliveryCard content={content} variant={v} />
          </section>
        ))}
      </div>
    </Screen>
  );
}
