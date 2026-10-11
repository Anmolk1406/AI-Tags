import { useMotionValueEvent, useScroll } from 'motion/react';
import { useMemo, useRef, useState } from 'react';
import { Screen } from '../../components';
import { useNav } from '../../kit/Navigator';
import type { ScreenProps } from '../../kit/types';
import { categoryPath, isInCategory, leafName } from '../../mocks/categories';
import { fbtFor, productById, products, type Product } from '../../mocks/products';
import type { VariantSelection } from './components/Variants';
import { SfAdditionalInfo } from './components/storefront/SfAdditionalInfo';
import { SfAtcBar } from './components/storefront/SfAtcBar';
import { SfBestsellerRow } from './components/storefront/SfBestsellerRow';
import { SfDeliveryCard, deliveryVariants, type DeliveryVariant } from './components/storefront/SfDeliveryCard';
import { SfExtendedWarranty } from './components/storefront/SfExtendedWarranty';
import { SfFbtCard } from './components/storefront/SfFbtCard';
import { SfGallery } from './components/storefront/SfGallery';
import { SfHeader } from './components/storefront/SfHeader';
import { SfMainInfo } from './components/storefront/SfMainInfo';
import { SfNewerModelCard } from './components/storefront/SfNewerModelCard';
import { SfPaymentOffers } from './components/storefront/SfPaymentOffers';
import { SfProductDetails } from './components/storefront/SfProductDetails';
import { SfProductFeatures } from './components/storefront/SfProductFeatures';
import { SfRecommendations } from './components/storefront/SfRecommendations';
import { SfReviewsCard } from './components/storefront/SfReviewsCard';
import { SfSellerCard } from './components/storefront/SfSellerCard';
import { SfSponsoredBrandCard } from './components/storefront/SfSponsoredBrandCard';
import { SfSponsoredRow } from './components/storefront/SfSponsoredRow';
import { SfTrustCard } from './components/storefront/SfTrustCard';
import { SfVariantsCard } from './components/storefront/SfVariantsCard';
import { copy, pdpContent } from './data';
import { pdpTokens } from './tokens';
import styles from './pdp.module.css';

/**
 * Product detail page — Storefront PDP (Figma 2ldJbjmQq4RkhnrNFCfXQB · 3499:75115, in stock) over the
 * NoonProductDetails (bappzaar master) behaviour: same data, sheets, variant switching (`nav.replace`), add to
 * cart → `pdp/added`, size check, wishlist / share, accordions, reviews. Figma section order: gallery → main info →
 * sponsored row → delivery → newer model → variants → trust markers → payment offers → product details →
 * extended warranty → additional information → bestseller → seller → A+ features → sponsored brand → FBT →
 * reviews → "Similar products" → "Top products in {category}"; footer = QTY + Add to cart over the tab bar.
 * The header fades to white after 100px. Components: src/flows/pdp/components/storefront (FIGMA-MAPPING.md).
 */
export function DetailScreen({ params }: ScreenProps<{ productId: string; delivery?: DeliveryVariant }>) {
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
  const category = leafName(product.categoryId) ?? product.category;

  return (
    <Screen
      ref={scrollRef}
      header={<SfHeader product={product} solid={solid} />}
      overlayHeader
      background={solid ? 'bgSurface' : 'bgPage'}
      safeTop={false}
      contentStyle={{ paddingBottom: 0 }}
      footer={
        <SfAtcBar
          product={product}
          showBackToTop={showTop}
          onBackToTop={() => scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
          interceptAdd={needsSize ? () => nav.sheet('pdp/variants', { productId: product.id, sizeMissing: true }) : undefined}
        />
      }
    >
      <div className={styles.list}>
        <SfGallery product={product} scrollY={scrollY} />
        <SfMainInfo product={product} content={content} onReviews={() => reviewsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })} />
        <SfSponsoredRow product={product} content={content} />
        <SfDeliveryCard content={content} variant={deliveryVariants.includes(params.delivery as DeliveryVariant) ? params.delivery : undefined} />
        <SfNewerModelCard product={product} />
        <SfVariantsCard
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
        <SfTrustCard content={content} />
        <SfPaymentOffers content={content} />
        <SfProductDetails content={content} />
        <SfExtendedWarranty content={content} price={product.price} />
        <SfAdditionalInfo content={content} />
        <SfBestsellerRow content={content} />
        <SfSellerCard content={content} onOffers={() => nav.toast(copy.moreOffers)} />
        <SfProductFeatures content={content} product={product} />
        <SfSponsoredBrandCard product={product} />
        <SfFbtCard key={product.id} ids={content.fbt} />
        <div ref={reviewsRef}>
          <SfReviewsCard product={product} content={content} />
        </div>
        <SfRecommendations title="Similar products" items={others.slice(0, 8)} sponsored />
        <SfRecommendations title={`Top products in ${category}`} items={sameBrand.slice(0, 12)} sponsored />
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
