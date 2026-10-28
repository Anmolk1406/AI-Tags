import { money } from '../format';
import type { DeliveryVariant } from '../views/pdp';
import { currency, formatPrice } from '../money';

/**
 * Product page (PDP) copy: every label, heading and message the PDP screens show. Screens and components render it; they
 * hold no text of their own. Keys follow bappzaar master `marketplaces/noon/locale/translations/noon-en.json`
 * (+ `src/locale/translations/en.json`); Figma-only strings name their frame.
 */
export const copy = {
  search: 'Search', // noon_search
  deliveryInfo: 'Delivery Information', // noon_delivery_info
  member: 'member', // noon_member
  orderIn: 'Order in', // noon_delivery_text_order_in
  hours: (n: number) => `${n}h`, // noon_delivery_text_hours
  minutes: (n: number) => `${n}m`, // noon_delivery_text_minutes
  ratings: 'ratings', // noon_rating (other)
  off: (v: number) => `${v}% OFF`, // off
  vat: '(Incl. VAT)', // vat_message
  size: 'Size', // noon_size
  sizeGuide: 'Size Guide', // noon_size_guide
  learnMore: 'Learn more', // noon_learn_more
  outOfStock: 'Out of stock', // noon_out_of_stock_item
  productOverview: 'Product Overview', // noon_product_overview
  description: 'Description', // noon_description
  highlights: 'Highlights', // noon_highlights
  specifications: 'Specifications', // noon_specifications
  additionalInfo: 'Additional Information', // noon_additional_info
  soldBy: 'Sold by', // noon_sold_by
  positive: (v: number) => `${v}% Positive`, // noon_rating_value_phrase
  sellerRatings: 'Seller Ratings', // noon_seller_ratings_label
  partnerSince: (v: number) => `${v}+ Years`, // noon_partner_since_years
  percent: (v: number) => `${v}%`, // noon_rating_value_percent
  moreOffers: 'More offers from other sellers', // noon_more_offers_from_sellers
  reviewsTitle: 'Ratings & Reviews', // noon_reviews_title
  avgRating: (count: string) => `Avg. rating based on ${count} ratings from trusted sources`, // noon_avg_rating_based_on_reviews
  allReviews: 'All reviews', // noon_reviews_all
  allCustomerReviews: 'All customer reviews', // noon_all_customer_reviews
  verifiedPurchase: 'Verified Purchase', // noon_verified_purchase
  fromTrustedSources: 'from trusted sources', // noon_from_trusted_sources
  helpful: 'Helpful', // noon_helpful
  showMore: 'more', // noon_product_review_show_more_text
  showLess: 'Less', // noon_product_review_show_less
  moreFrom: (brandName: string) => `More from ${brandName}`, // noon_brand_recommendations_title
  customersAlsoViewed: 'Customers Also Viewed', // noon_recommended_products_pdp
  qty: 'QTY', // noon_QTY
  quantity: 'Quantity', // noon_quantity
  buyNow: 'Buy Now', // noon_buy_now
  addToCart: 'Add to cart', // noon_add_to_cart_v2
  addToCartCaps: 'ADD TO CART', // add_to_cart (NoonOfferAddToCartQuantity)
  addedInCart: 'added in your cart', // noon_added_in_your_cart_message
  backToTop: 'Back to top', // noon_back_top
  addedToCart: 'Added to cart', // noon_added_to_cart
  continueShopping: 'CONTINUE SHOPPING', // noon_quick_cart_continue_shopping
  viewCart: 'View cart', // noon_quick_cart_view_cart (uppercased by style)
  sizeMissing: 'Please select the size', // noon_size_missing_add_to_cart
  frequentlyBought: 'Frequently Bought Together', // noon_frequently_bought_together_pdp
  buyTogether: (n: number) => (n === 0 ? 'Buy' : n === 1 ? 'Buy now' : `Buy ${n} items together`), // noon_frequently_bought_buy_together_noon
  aiSummary: (count: string) => `${count} reviews, summarised by noon AI`, // noon_ai_summary_text
  otherDeliveryOptions: 'Other Delivery Options', // noon_other_delivery_options
  linkCopied: 'Link copied to clipboard',
  addedToWishlist: 'Added to Wishlist',
  removedFromWishlist: 'Removed from Wishlist',
} as const;

/** New PDP (Figma Af34gfmhQ1D0wstXUEHSIF · 64:5571) copy for section group A (header, gallery, main info, bundle card, footer). */
export const npaCopy = {
  /** Figma "Buy now" (bappzaar noon_buy_now is "Buy Now") */
  buyNow: 'Buy now',
  /** gallery catalog tag (Figma 64:5584 "noon's Pick") */
  noonsPick: 'noon’s Pick',
  /** NoonBundleBanner banner_text: "Saving Đ45 with Combo" */
  comboSaving: (n: number) => `Saving ${currency}${formatPrice(n)} with Combo`,
  /** NoonBundleHelpScreen title / body (noon_bundle_you_are_saving) */
  comboHelp: (n: number) => `You are saving ${currency}${formatPrice(n)} when you buy this as a combo`,
  /** NoonAvailableBundlesTag title "Bundle up & Save upto <b>Đ20 off</b>" + subtitle */
  bundleTitle: 'Bundle up & Save upto',
  bundleOff: (n: number) => `${currency}${formatPrice(n)} off`,
  bundleSubtitle: (n: number) => `${n} ${n === 1 ? 'combo' : 'combos'} available`,
  bundleOpen: (n: number) => `${n} ${n === 1 ? 'combo' : 'combos'} with this product`,
} as const;

/** Group B: free gifts (64:5591) and the "Faster Delivery Options" lanes of the delivery card (64:5590). */
export const npbCopy = {
  /** noon_free_gifts_freebie */
  freeGifts: 'Free gifts for you',
  /** noon_free_freebie */
  free: 'Free',
  /** noon_view_eligible_products_text */
  viewEligible: 'View eligible products',
  fasterDeliveryOptions: 'Faster Delivery Options',
  selectOnCheckout: 'Select these options on checkout',
  getBy: 'Get by',
} as const;

/** Group C: product overview (64:5596). */
export const npcCopy = {
  productOverview: 'Product Overview', // noon_product_overview
  description: 'Description', // noon_description
  aiTitle: 'Summarised by AI', // ai_overview.title.text (Figma 84:8038)
} as const;

/** Group D: AI review summary and review comments (64:5733). */
export const npdCopy = {
  /** AI review summary title: "{n} reviews," + "summarised by" (solid indigo) + " noon AI" (gradient) */
  aiSummarisedBy: 'summarised by',
  aiNoonAi: ' noon AI',
  /** review comment toggle: 12/500 brand blue after the clamped text */
  more: 'More',
  less: 'Less',
} as const;

/** Group E: product rails. */
export const railCopy = {
  relatedSponsored: 'Products related to this', // noon_recommended_sponsored_pdp
};

/** Storefront / New PDP components (Figma 3499:* Storefront, 64:* New PDP): one section per component. */
export const sfCopy = {
  /** SfNewerModelCard */
  newerModel: { newerModel: 'Newer model available', viewNewer: 'View newer model' } as const,
  /** SfSellerCard */
  seller: {
    positiveLabel: 'Positive',
    offersFrom: (n: number) => `${n} ${n === 1 ? 'offer' : 'offers'} from other sellers from`,
    officialPartner: (brand: string) => `Official ${brand} partner on noon`,
  } as const,
  /** SfProductDetails */
  details: {
    title: npcCopy.productOverview, // New PDP 84:8034 (noon_product_overview); was "Product Details" in Storefront 3499:75478
    overview: npcCopy.description, // New PDP 84:8059 (noon_description); was "Overview"
  },
  /** SfDeliveryCard */
  delivery: {
    fasterDeliveryOptions: 'Faster Delivery Options',
    freeTodayWith: 'Get it today for free with',
    getBy: 'Get by',
    /** a faster lane: "Get in 1 hr 22 mins" (another offer) / "Get it Today" (a delivery upgrade) */
    get: 'Get',
    getIt: 'Get it',
    freeShippingOver: (min: number) => `Free Shipping over ${money(min).replace(/\s+/g, '')}`,
    /** the compact rows' chip: "Order in 21 hrs" / "Order in 45 mins" */
    orderIn: (min: number) => `${copy.orderIn} ${min >= 60 ? `${Math.floor(min / 60)} hrs` : `${min} mins`}`,
  } as const,
  /** DeliveryVariantsScreen: title and one label per delivery layout */
  deliveryVariants: {
    title: 'Delivery information',
    labels: {
      crossSell: 'crossSell — Variant6',
      noCrossSell: 'noCrossSell — No MP cross sell',
      market: 'market',
      express: 'express — express only',
      global: 'global — Global',
    } satisfies Record<DeliveryVariant, string>,
  },
  /** SfMainInfo */
  mainInfo: {
    visitStore: 'Visit Store',
    reviews: (n: number) => `(${n} reviews)`,
    prepaidOnly: 'Prepaid Only',
    vat: '(incl. of VAT)',
    pct: (n: number) => `${n}% OFF`,
    lowestPrice: 'Lowest Price in 30 days',
    bestseller: 'Bestseller',
    in: 'in',
    codeCopied: (code: string) => `${code} copied`,
    priceInfo: 'Price info',
  } as const,
  /** SfReviewsCard */
  reviews: {
    avgRating: (count: string) => `Avg. rating based on ${count} reviews from trusted sources`,
    aiTitle: (count: string) => `${count} reviews,`,
    photoReviews: (n: number) => `Photo Reviews (${n})`,
    topReviews: (n: string) => `Top Reviews (${n})`,
    verifiedBuy: 'Verified Buy',
    /** pdp/reviewTopics: an opened review's collapse link (Figma AI-Tags 1566:109616) */
    less: 'less',
    fromTrustedSource: 'from trusted source',
    viewProduct: 'View product',
    translate: 'Translate to عربي',
    /** pdp/reviewTopics (Figma 1409:63152) */
    topicsTitle: 'Customers frequently\ntalked about',
    /** the sheet's sentiment line, named after the open topic ("Great value for money" · "Average durability" · "Poor size") */
    sentiment: {
      positive: (topic: string) => `Great ${topic.toLowerCase()}`,
      neutral: (topic: string) => `Average ${topic.toLowerCase()}`,
      negative: (topic: string) => `Poor ${topic.toLowerCase()}`,
    },
  },
  /** SfSponsoredBrandCard */
  brandRow: { tagline: 'Top quality products', shop: (brand: string) => `Shop ${brand}`, ad: 'Ad' } as const,
  /** SfFbtCard */
  fbt: { title: 'Frequently bought together', buyAll: (price: string) => `Buy all for ${price}` } as const,
  /** SfBestsellerRow */
  bestseller: {
    bestseller: (rank?: number) => (rank ? `Bestseller #${rank}` : 'Bestseller'), // Figma 3499:75642
    in: 'in', // 3499:75643
    explore: 'Explore other bestsellers', // 3499:75645 (Figma typo "bestellers")
  },
  /** SfProductFeatures */
  features: { title: 'Product Features', viewMore: 'View More', viewLess: 'View Less' } as const,
  /** SfPaymentOffers */
  payments: {
    title: 'Payment offers', // Figma 3499:75414
  },
  /** SfExtendedWarranty */
  warranty: {
    title: 'Extended warranty', // Figma 3499:75493
    by: 'by', // I3499:75494;1222:216670
    usps: ['Chosen by 100+ people', 'Authorised repair centers', 'Genuine parts guaranteed'], // USPs animation_final
    select: 'Select', // I3499:75515;1473:261409
    selected: 'Selected', // kit state (not in the Figma)
    added: (name: string) => `${name} added`,
    removed: (name: string) => `${name} removed`,
  },
  /** accessibility labels and image alt texts across the PDP */
  a11y: {
    back: 'Back',
    share: 'Share',
    close: 'Close',
    addToWishlist: 'Add to wishlist',
    removeFromWishlist: 'Remove from wishlist',
    expressToday: 'express Today',
    protect4less: 'Protect4Less',
  },
  /** product rails (SfRecommendations) */
  rail: { freeDelivery: 'Free delivery' },
};
