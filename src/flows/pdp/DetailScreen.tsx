import { animate, motion, useMotionValueEvent, useScroll } from 'motion/react';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Screen } from '../../components';
import { useIsTop, useNav } from '../../kit/Navigator';
import { useTabBarScrollHide } from '../../kit/tabBarScroll';
import type { ScreenProps } from '../../kit/types';
import { productById } from '../../data';
import type { VariantSelection } from './components/storefront/SfVariantsCard';
import { SfAdditionalInfo } from './components/storefront/SfAdditionalInfo';
import { SfAtcBar } from './components/storefront/SfAtcBar';
import { SfBundleCard } from './components/storefront/SfBundleCard';
import { SfBestsellerRow } from './components/storefront/SfBestsellerRow';
import { SfDeliveryCard } from './components/storefront/SfDeliveryCard';
import { SfExtendedWarranty } from './components/storefront/SfExtendedWarranty';
import { SfFbtCard } from './components/storefront/SfFbtCard';
import { SfFreeGifts } from './components/storefront/SfFreeGifts';
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
import { pdpTokens } from './tokens';
import styles from './pdp.module.css';
import { Deferred } from '../../kit/Deferred';
import { copy, railCopy } from '../../data/copy/pdp';
import { type DeliveryVariant, deliveryVariants, mainInfoView, type PdpContent, pdpView } from '../../data/views/pdp';

/**
 * Product detail page — New PDP (Figma Af34gfmhQ1D0wstXUEHSIF · 64:5571), built on the Storefront PDP
 * (2ldJbjmQq4RkhnrNFCfXQB · 3499:75115, in stock), over the
 * NoonProductDetails (bappzaar master) behaviour: same data, sheets, variant switching in place (first in-stock size
 * preselected, options refetch under a loader), add to cart → `pdp/added`, wishlist / share, accordions, reviews. Section order follows New PDP (All flows
 * Af34gfmhQ1D0wstXUEHSIF · 64:5571): gallery → main info → bundle → sponsored row → delivery → newer model → free gifts →
 * variants → payment offers → trust markers → product overview → additional information → bestseller → seller →
 * A+ features → sponsored brand → extended warranty → FBT → reviews → "More from {brand}" / "Customers Also Viewed"
 * (full-bleed) → "Products related to this"; footer = QTY + Buy now + Add to cart over the tab bar.
 * The header fades to white after 100px. Components: src/flows/pdp/components/storefront (FIGMA-MAPPING.md).
 */
/** NoonProductDetails.scrollAfterAccordionOpen: current offset + 120 over 150ms (Animated.timing default ease). */
const ACCORDION_SCROLL = { by: 120, ms: 150 };
function scrollBy(el: HTMLDivElement | null, { by, ms }: typeof ACCORDION_SCROLL) {
  if (!el) return;
  const from = el.scrollTop;
  const to = Math.min(from + by, el.scrollHeight - el.clientHeight);
  animate(from, to, { duration: ms / 1000, ease: 'easeInOut', onUpdate: (v) => (el.scrollTop = v) });
}

/** Mock CatalogService.getProductBySKU latency for an option tap (the options loader shows meanwhile). */
const OPTION_RELOAD_MS = 600;

/** NoonProductUtil.getVariant: keep the previously selected size when the new SKU has it, else the first in stock. */
function initialSelection(content: PdpContent, prev?: { name?: string }): VariantSelection {
  const sizes = content.sizes?.options ?? [];
  const keep = prev?.name ? sizes.findIndex((o) => o.name === prev.name && o.available) : -1;
  const first = sizes.findIndex((o) => o.available);
  return keep >= 0 ? { size: keep } : first >= 0 ? { size: first } : {};
}

export function DetailScreen({ params }: ScreenProps<{ productId: string; delivery?: DeliveryVariant }>) {
  const nav = useNav();
  // bappzaar onSelectOption refetches the SKU and updates this same page in place (no navigation, scroll kept)
  const [productId, setProductId] = useState(params.productId);
  useEffect(() => setProductId(params.productId), [params.productId]);
  const product = productById(productId);
  const content = useMemo(() => pdpView(product), [product]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const reviewsRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll({ container: scrollRef });
  const [solid, setSolid] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const [selection, setSelection] = useState<VariantSelection>(() => initialSelection(content));
  const [optionsLoading, setOptionsLoading] = useState(false);
  // BottomTabScrollVisibilityProvider (NoonProductDetails onScroll / onScrollEndDrag): the tab bar hides on scroll down
  // and the sticky bar follows it down
  const isTop = useIsTop();
  const tabs = useTabBarScrollHide(scrollRef, isTop);
  // In-place SKU switch keeps the variant picker where the finger is: the sections above it differ in height between
  // SKUs (bundle, sponsored, delivery, gifts), so the page would otherwise jump. Record its screen top before the
  // switch and correct the scroll after the new SKU has laid out (RN keeps the tapped row in view the same way).
  const variantsRef = useRef<HTMLDivElement>(null);
  const anchorTop = useRef<number | null>(null);
  useLayoutEffect(() => {
    const el = variantsRef.current;
    const scroller = scrollRef.current;
    if (anchorTop.current == null || !el || !scroller) return;
    const delta = el.getBoundingClientRect().top - anchorTop.current;
    anchorTop.current = null;
    if (!delta) return;
    scroller.scrollTop += delta;
    tabs.rebase(scroller.scrollTop); // not a user scroll: the tab bar / sticky bar stay as they are
  }, [productId]);
  const reloadTimer = useRef<number>(undefined);
  useEffect(() => () => window.clearTimeout(reloadTimer.current), []);

  // NoonNativeStickyBar (QTY · Buy now · Add to cart) floats over the list; measured for the list's bottom padding
  const footerRef = useRef<HTMLDivElement>(null);
  const [footerH, setFooterH] = useState(0);
  useEffect(() => {
    const el = footerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setFooterH(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useMotionValueEvent(scrollY, 'change', (v) => {
    setSolid(v > pdpTokens.headerChangeAfter - pdpTokens.headerInnerHeight);
    setShowTop(v > pdpTokens.backToTopAfter);
  });

  // The selected SKU's own price (an option with a price is its own SKU in master, so the price block follows it)
  const shown = useMemo(() => {
    for (const g of content.groups) {
      const o = g.options[g.selected ?? selection[g.name] ?? 0];
      if (!o?.productId && o?.salePrice != null) return { ...product, price: o.salePrice, was: o.price && o.price > o.salePrice ? o.price : undefined };
    }
    return product;
  }, [content, product, selection]);
  const info = useMemo(() => mainInfoView(shown, content), [shown, content]);

  return (
    <Screen
      ref={scrollRef}
      header={<SfHeader product={product} solid={solid} />}
      overlayHeader
      background={solid ? 'bgSurface' : 'bgPage'}
      safeTop={false}
      // ScreenView bottomOffset: the list scrolls under the floating sticky bar
      contentStyle={{ paddingBottom: footerH }}
      onScroll={tabs.onScroll}
      overlay={
        <motion.div ref={footerRef} className={styles.stickyBar} style={{ '--pdp-tab-hide': tabs.tabHide } as never}>
          <SfAtcBar
            product={product}
            showBackToTop={showTop}
            onBackToTop={() => {
              tabs.reveal();
              scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </motion.div>
      }
    >
      <div className={styles.list}>
        <SfGallery product={product} scrollY={scrollY} />
        {/* bottomWrapper (marginTop −20) + galleryBottomBackground: the page slides up over the pinned gallery as one
            opaque sheet from the gallery's bottom edge, so the image never shows between the cards */}
        <div className={styles.rest}>
          <SfMainInfo product={shown} content={content} info={info} onReviews={() => reviewsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })} />
          <SfBundleCard content={content} />
          <SfSponsoredRow item={content.sponsored} />
          {/* below the first viewport: mounted one beat after the push, so the slide starts on a light frame */}
          <Deferred minHeight={2400}>
          <SfDeliveryCard content={content} variant={deliveryVariants.includes(params.delivery as DeliveryVariant) ? params.delivery : undefined} />
          <SfNewerModelCard newer={content.newerModel} />
          <SfFreeGifts items={content.freebies} />
          <div ref={variantsRef}>
            <SfVariantsCard
              product={product}
              content={content}
              selection={selection}
              loading={optionsLoading}
              onSelect={(g, i) => {
                // NoonSizeVariantSelection → onSelectVariant: local switch, no fetch
                if (g === 'size') return setSelection((s) => ({ ...s, size: i }));
                // NoonOptionsSelection → onSelectOption: fetch the option's SKU (loader over the options), then update in place
                if (optionsLoading) return;
                const opt = content.groups.find((x) => x.name === g)?.options[i];
                const prevSize = selection.size != null ? content.sizes?.options[selection.size] : undefined;
                setOptionsLoading(true);
                reloadTimer.current = window.setTimeout(() => {
                  setOptionsLoading(false);
                  if (opt?.productId && opt.productId !== product.id) {
                    anchorTop.current = variantsRef.current?.getBoundingClientRect().top ?? null;
                    setProductId(opt.productId);
                    setSelection(initialSelection(pdpView(productById(opt.productId)), prevSize));
                  } else setSelection((s) => ({ ...s, [g]: i }));
                }, OPTION_RELOAD_MS);
              }}
              onSizeGuide={() => nav.toast(copy.sizeGuide)}
              onLearnMore={() => nav.toast(copy.learnMore)}
            />
          </div>
          <SfPaymentOffers content={content} />
          <SfTrustCard content={content} />
          <SfProductDetails content={content} onAccordionOpen={() => scrollBy(scrollRef.current, ACCORDION_SCROLL)} />
          <SfAdditionalInfo content={content} />
          <SfBestsellerRow content={content} />
          <SfSellerCard content={content} onOffers={() => nav.toast(copy.moreOffers)} />
          <SfProductFeatures content={content} />
          <SfSponsoredBrandCard brand={product.brand} items={content.sponsoredBrand} />
          <SfExtendedWarranty content={content} />
          <SfFbtCard key={product.id} items={content.fbtItems} />
          <div ref={reviewsRef}>
            <SfReviewsCard product={product} content={content} />
          </div>
          <SfRecommendations variant="bleed" title={copy.moreFrom(product.brand)} items={content.rails.sameBrand} sponsored />
          <SfRecommendations variant="bleed" title={copy.customersAlsoViewed} items={content.rails.alsoViewed} sponsored />
          <SfRecommendations title={railCopy.relatedSponsored} items={content.rails.related} sponsored />
          </Deferred>
        </div>
      </div>
    </Screen>
  );
}

