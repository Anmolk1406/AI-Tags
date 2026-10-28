import { defineFlow } from '../../kit/registry';
import { IPHONE_17_PRO_ID } from '../../data';
import { pdpFlowTokens } from './tokens';
import { lazyScreen } from '../../kit/lazyScreen';

const AddedSheet = lazyScreen(() => import('./AddedSheet'), 'AddedSheet');
const DeliveryVariantsScreen = lazyScreen(() => import('./DeliveryVariantsScreen'), 'DeliveryVariantsScreen');
const DetailScreen = lazyScreen(() => import('./DetailScreen'), 'DetailScreen');
const ReviewTopicsSheet = lazyScreen(() => import('./screens/ReviewTopicsSheet'), 'ReviewTopicsSheet');
const VariantsSheet = lazyScreen(() => import('./VariantsSheet'), 'VariantsSheet');

export const pdpFlow = defineFlow({
  id: 'pdp',
  // hand-offs fetched in idle time when one of this flow's screens mounts, so they never slide in empty (Navigator.preloadAround)
  preload: ['cart/cart', 'plp/listing'],
  title: 'Product page (PDP)',
  group: 'Shopping',
  description: 'Product detail page (bappzaar master NoonProductDetails): pinned shrinking gallery, product info with best price, delivery, payments, variants, reinforcement badges, overview accordions, additional info, seller, reviews, recommendations, sticky add-to-cart and the quick-cart sheet.',
  initial: 'detail',
  tokens: pdpFlowTokens,
  screens: [
    {
      id: 'detail',
      title: 'Product detail',
      component: DetailScreen,
      defaultParams: { productId: IPHONE_17_PRO_ID },
      notes: 'Default product is the LIVE noon iPhone 17 Pro 1TB Silver (N70211593V): real photos, coupons, delivery + rocket option, payment discounts, 4-row variant matrix (tap a colour / memory / model / version to open that SKU), FBT, AI review summary, More from Apple / Customers Also Viewed with rank nudges (see MAPPING.md → Live data mapping). ?productId=p2 etc. still opens the mock catalogue. Swipe the gallery; it stays pinned and shrinks as you scroll. Past 100px the header turns white and the search pill expands; past one screen height "Back to top" appears. Tap the title to expand, the rating to jump to reviews, colour / storage chips to select, accordions to open. QTY opens the quantity selector. Add to cart → grey loading + loader lottie → quick-cart sheet, and the yellow "added in your cart" strip appears. On a fashion product (productId p3) the first in-stock size is preselected; the variants sheet opens from a product card + (QuickAdd), not from this page. Values: src/flows/pdp/MAPPING.md.',
      source: 'Figma Af34gfmhQ1D0wstXUEHSIF · 64:5571 (All flows "New PDP"; earlier Storefront 2ldJbjmQq4RkhnrNFCfXQB · 3499:75115; see FIGMA-MAPPING.md) for the look, over marketplaces/noon/components/NoonProductDetails/NoonProductDetails.tsx for behaviour (+ NoonGallery, NoonProductInfo, NoonFrequentlyBoughtTogether, NoonAiProductReviewsSummary, NoonCategoryBestSeller(Tag), NoonBuyingOption, NoonEstimatedDeliveryPdp, NoonPaymentsForYou, NoonSizeVariantSelection, NoonOptionsSelection, NoonPdpReinforcement, NoonProductOverview, NoonShippingInfo, NoonSeller, NoonOffers, NoonCustomerReviews, NoonRecommendations, NoonAddToCartQuantity, NoonExpandableSearch, NoonPDPHeaderRightContent, NoonFreebie, NoonAvailableBundlesTag, NoonAiOverviewSummary)',
      truth: 'mixed',
      verified: '2026-10-12',
    },
    {
      id: 'deliveryVariants',
      title: 'Delivery information variants',
      component: DeliveryVariantsScreen,
      parent: 'pdp/detail',
      defaultParams: { productId: IPHONE_17_PRO_ID },
      notes: 'All five SfDeliveryCard variants (crossSell, noCrossSell, market, express, global) stacked for one product. On the PDP the variant follows the delivery data; force one with pdp/detail?delivery=global.',
      source: 'Figma xPr9Ln37JGSBGvNtrsyD0y · 3583:109620 (PDP Redesign, Delivery information component set)',
    },
    {
      id: 'variants',
      title: 'Variants',
      component: VariantsSheet,
      presentation: 'sheet', sheet: 'classic',
      defaultParams: { productId: IPHONE_17_PRO_ID },
      notes: 'Size picker sheet (opened from a product card + on a sized product): product header, SIZE chips (none preselected, out of stock dashed), 48px QTY + ADD TO CART. ATC without a size shows "Please select the size" and shakes the chips; success closes the sheet with an "Added to cart" toast.',
      source: 'marketplaces/noon/screens/NoonVariantsOverlayScreen (+ NoonProductSizeVariantSelection, NoonProductCartSelectionItem, NoonOfferAddToCartQuantity)',
    },
    {
      id: 'added',
      title: 'Added to cart',
      component: AddedSheet,
      presentation: 'sheet', sheet: 'classic',
      defaultParams: { productId: IPHONE_17_PRO_ID },
      notes: 'Post-ATC quick cart: atc-check Lottie over the product, row slides in from the right and the text fades in, then CONTINUE SHOPPING / VIEW CART. Recommendations are off by default (FeatureFlags.getPDPATCPopupRecommendationsVariant = 0); pass recsVariant: 1 to show them.',
      source: 'marketplaces/noon/screens/NoonQuickCartScreen',
    },
    {
      id: 'reviewTopics',
      title: 'Review topics',
      component: ReviewTopicsSheet,
      presentation: 'sheet',
      sheet: { motion: 'field' }, // Field DS M-BottomSheet motion (github.com/ayaneshu/field-design-system)
      parent: 'pdp/detail',
      defaultParams: { productId: IPHONE_17_PRO_ID, topic: 1 },
      notes: 'Opened from a topic pill under the AI review summary (every product: its own aiTopics, else defaultReviewTopics in src/data/reviewTopics.ts). Opens on the pill row (staggered in), then the topic: the sentiment line ("Great value for money" · "Average durability" · "Poor size") over the quote and review cards, all scrolling together. On open the mark plays the Reveal intro: it pops in at the line\'s centre while it draws on (trim path), then slides left to its slot and the title is uncovered behind it through a feathered mask; the sentiment wash fades after a beat. Tap a pill: its outline fades in on its own border, the row re-centres, and the topic swaps in place (fade out 150 ms → blank 420 ms → fade in 400 ms rising 16 px). A topic seen for the first time shows a 1–1.5 s skeleton before its reviews rise in. The first review of each topic is written about that topic and carries photos: a tap anywhere on it springs the small stack into a large row and opens the text. Sheet motion follows the Field Design System M-BottomSheet. topic = index into aiTopics (1 Value for money · 3 Durability · 5 Size).',
      source: 'Figma Or9RuyCtjXRPrnbUJFx7As · 1421:486 (first state 1421:629 / 676 / 724 → settled 1421:487 / 534 / 582)',
      truth: 'figma',
    },
  ],
});
