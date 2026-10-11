import { useMotionValueEvent, useScroll } from 'motion/react';
import { useMemo, useRef, useState } from 'react';
import { Screen } from '../../components';
import { useNav } from '../../kit/Navigator';
import type { ScreenProps } from '../../kit/types';
import { categoryPath, isInCategory } from '../../mocks/categories';
import { fbtFor, productById, products, type Product } from '../../mocks/products';
import { AtcBar } from './components/AtcBar';
import { Gallery } from './components/Gallery';
import { PdpHeader } from './components/PdpHeader';
import { ProductInfo } from './components/ProductInfo';
import { Recommendations, ReviewsCard } from './components/Reviews';
import { AdditionalInfoCard, CategoryBestSellerCta, DeliveryCard, FbtCard, OverviewCard, PaymentsCard, ReinforcementCard, SellerCard } from './components/Sections';
import { VariantsCard, type VariantSelection } from './components/Variants';
import { copy, pdpContent } from './data';
import { pdpTokens } from './tokens';
import styles from './pdp.module.css';

/**
 * NoonProductDetails (bappzaar master). Render order = `renderContent()` compoundData with default flags:
 * gallery → product info → delivery → payments → variants → reinforcement → overview → additional info →
 * seller + offers → reviews → "More from {brand}" → "Customers Also Viewed"; sticky NoonAddToCartQuantity.
 * The header fades to white after 100px and the page background turns white with it (`whiteContainer`).
 */
export function DetailScreen({ params }: ScreenProps<{ productId: string }>) {
  const nav = useNav();
  const product = productById(params.productId);
  const content = useMemo(() => pdpContent(product), [product]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const reviewsRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll({ container: scrollRef });
  const [solid, setSolid] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const [selection, setSelection] = useState<VariantSelection>({});

  useMotionValueEvent(scrollY, 'change', (v) => {
    setSolid(v > pdpTokens.headerChangeAfter - pdpTokens.headerInnerHeight);
    setShowTop(v > pdpTokens.backToTopAfter);
  });

  const { sameBrand, others } = recommendations(product);
  const needsSize = !!content.sizes && selection.size === undefined;

  return (
    <Screen
      ref={scrollRef}
      header={<PdpHeader product={product} solid={solid} />}
      overlayHeader
      background={solid ? 'bgSurface' : 'bgPage'}
      safeTop={false}
      contentStyle={{ paddingBottom: 0 }}
      footer={
        <AtcBar
          product={product}
          showBackToTop={showTop}
          onBackToTop={() => scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
          interceptAdd={needsSize ? () => nav.sheet('pdp/variants', { productId: product.id, sizeMissing: true }) : undefined}
        />
      }
    >
      <div className={styles.list}>
        <Gallery product={product} scrollY={scrollY} />
        <ProductInfo product={product} content={content} onReviews={() => reviewsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })} />
        <DeliveryCard content={content} />
        <PaymentsCard content={content} />
        <VariantsCard
          product={product}
          content={content}
          selection={selection}
          onSelect={(g, i) => {
            const opt = content.groups.find((x) => x.name === g)?.options[i];
            if (opt?.productId && opt.productId !== product.id) nav.replace('pdp/detail', { productId: opt.productId });
            else setSelection((s) => ({ ...s, [g]: i }));
          }}
          onSizeGuide={() => nav.toast(copy.sizeGuide)}
          onLearnMore={() => nav.toast(copy.learnMore)}
        />
        <ReinforcementCard content={content} />
        <OverviewCard content={content} />
        <AdditionalInfoCard content={content} />
        <CategoryBestSellerCta content={content} />
        <SellerCard content={content} onOffers={() => nav.toast(copy.moreOffers)} />
        <FbtCard key={product.id} ids={content.fbt} />
        <div ref={reviewsRef}>
          <ReviewsCard product={product} content={content} />
        </div>
        <Recommendations title={copy.moreFrom(product.brand)} items={sameBrand.slice(0, 12)} />
        <Recommendations title={copy.customersAlsoViewed} items={others.slice(0, 8)} />
      </div>
    </Screen>
  );
}

/**
 * Carousels. Live products (product.sku): "More from {brand}" = live products of the same brand (pdp/carousels
 * same_brand, live order, FBT accessories excluded); "Customers Also Viewed" = other brands in the same level-2
 * category (Mobiles & Accessories → smartphones + cases, like other_brands). Mock products keep brand/category matching.
 */
function recommendations(product: Product) {
  const fbt = new Set(Object.values(fbtFor).flat());
  if (product.sku) {
    const live = products.filter((p) => p.sku && p.id !== product.id && !fbt.has(p.id));
    const branch = categoryPath(product.categoryId)[1]?.id;
    return {
      sameBrand: live.filter((p) => p.brand === product.brand),
      others: live.filter((p) => p.brand !== product.brand && (!branch || isInCategory(p.categoryId, branch))),
    };
  }
  const sameBrand = products.filter((p) => !p.sku && p.id !== product.id && (p.brand === product.brand || p.category === product.category));
  return { sameBrand, others: products.filter((p) => !p.sku && p.id !== product.id && !sameBrand.includes(p)) };
}
