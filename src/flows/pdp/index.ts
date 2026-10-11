import { defineFlow } from '../../kit/registry';
import { IPHONE_17_PRO_ID } from '../../mocks/products';
import { AddedSheet } from './AddedSheet';
import { DetailScreen } from './DetailScreen';
import { pdpFlowTokens } from './tokens';
import { VariantsSheet } from './VariantsSheet';

export const pdpFlow = defineFlow({
  id: 'pdp',
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
      notes: 'Default product is the LIVE noon iPhone 17 Pro 1TB Silver (N70211593V): real photos, coupons, delivery + rocket option, payment discounts, 4-row variant matrix (tap a colour / memory / model / version to open that SKU), FBT, AI review summary, More from Apple / Customers Also Viewed with rank nudges (see MAPPING.md → Live data mapping). ?productId=p2 etc. still opens the mock catalogue. Swipe the gallery; it stays pinned and shrinks as you scroll. Past 100px the header turns white and the search pill expands; past one screen height "Back to top" appears. Tap the title to expand, the rating to jump to reviews, colour / storage chips to select, accordions to open. QTY opens the quantity selector. Add to cart → grey loading + loader lottie → quick-cart sheet, and the yellow "added in your cart" strip appears. On a fashion product (productId p3) Add to cart without a size opens the variants sheet. Values: src/flows/pdp/MAPPING.md.',
      source: 'marketplaces/noon/components/NoonProductDetails/NoonProductDetails.tsx (+ NoonGallery, NoonProductInfo, NoonFrequentlyBoughtTogether, NoonAiProductReviewsSummary, NoonCategoryBestSeller(Tag), NoonBuyingOption, NoonEstimatedDeliveryPdp, NoonPaymentsForYou, NoonSizeVariantSelection, NoonOptionsSelection, NoonPdpReinforcement, NoonProductOverview, NoonShippingInfo, NoonSeller, NoonOffers, NoonCustomerReviews, NoonRecommendations, NoonAddToCartQuantity, NoonExpandableSearch, NoonPDPHeaderRightContent)',
    },
    {
      id: 'variants',
      title: 'Variants',
      component: VariantsSheet,
      presentation: 'sheet',
      defaultParams: { productId: IPHONE_17_PRO_ID },
      notes: 'Size picker sheet: product header, SIZE chips, 48px QTY + ADD TO CART. Open with sizeMissing=true to get the "Please select the size" warning and a shake on ATC.',
      source: 'marketplaces/noon/screens/NoonVariantsOverlayScreen (+ NoonProductSizeVariantSelection, NoonProductCartSelectionItem, NoonOfferAddToCartQuantity)',
    },
    {
      id: 'added',
      title: 'Added to cart',
      component: AddedSheet,
      presentation: 'sheet',
      defaultParams: { productId: IPHONE_17_PRO_ID },
      notes: 'Post-ATC quick cart: atc-check Lottie over the product, row slides in from the right and the text fades in, then CONTINUE SHOPPING / VIEW CART. Recommendations are off by default (FeatureFlags.getPDPATCPopupRecommendationsVariant = 0); pass recsVariant: 1 to show them.',
      source: 'marketplaces/noon/screens/NoonQuickCartScreen',
    },
  ],
});
