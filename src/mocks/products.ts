import { categoryPath, type CategoryRef } from './categories';
import img_n70211479v from '../assets/products/iphone-17-pro/card-n70211479v.webp';
import img_n70211592v from '../assets/products/iphone-17-pro/card-n70211592v.webp';
import img_n70211566v from '../assets/products/iphone-17-pro/card-n70211566v.webp';
import img_n70211562v from '../assets/products/iphone-17-pro/card-n70211562v.webp';
import img_n70211680v from '../assets/products/iphone-17-pro/card-n70211680v.webp';
import img_n70211591v from '../assets/products/iphone-17-pro/card-n70211591v.webp';
import img_n70211681v from '../assets/products/iphone-17-pro/card-n70211681v.webp';
import img_n70211564v from '../assets/products/iphone-17-pro/card-n70211534v.webp';
import img_n70211528v from '../assets/products/iphone-17-pro/card-n70211528v.webp';
import img_n70211464v from '../assets/products/iphone-17-pro/card-n70211464v.webp';
import img_n70211534v from '../assets/products/iphone-17-pro/card-n70211534v.webp';
import img_n70211678v from '../assets/products/iphone-17-pro/card-n70211678v.webp';
import img_n70211640v from '../assets/products/iphone-17-pro/card-n70211640v.webp';
import img_n70211574v from '../assets/products/iphone-17-pro/card-n70211574v.webp';
import img_z4e7c13d1c7101937b8cez from '../assets/products/iphone-17-pro/card-z4e7c13d1c7101937b8cez.webp';
import img_n70283860v from '../assets/products/iphone-17-pro/card-n70283860v.webp';
import img_n70283855v from '../assets/products/iphone-17-pro/card-n70283855v.webp';
import img_n70142941v from '../assets/products/iphone-17-pro/card-n70142941v.webp';
import img_n70306064v from '../assets/products/iphone-17-pro/card-n70306064v.webp';
import img_n70140492v from '../assets/products/iphone-17-pro/card-n70140492v.webp';
import img_n70187031v from '../assets/products/iphone-17-pro/card-n70187031v.webp';
import img_n70270614v from '../assets/products/iphone-17-pro/card-n70270614v.webp';
import ip17Gallery1 from '../assets/products/iphone-17-pro/gallery-1.webp';
import ip17Gallery2 from '../assets/products/iphone-17-pro/gallery-2.webp';
import ip17Gallery3 from '../assets/products/iphone-17-pro/gallery-3.webp';
import ip17Gallery4 from '../assets/products/iphone-17-pro/gallery-4.webp';
import fbtCase from '../assets/products/iphone-17-pro/fbt-silicone-case.webp';
import fbtAirpods from '../assets/products/iphone-17-pro/fbt-airpods-max-2.webp';
import fbtSpigen from '../assets/products/iphone-17-pro/fbt-spigen-protector.webp';

/**
 * Shared demo catalogue used by every flow. Edit freely — add `image` URLs to
 * swap the emoji placeholders for real product photos.
 */
export interface Product {
  id: string;
  brand: string;
  title: string;
  price: number;
  was?: number;
  rating: number;
  ratingCount: number;
  emoji: string;
  /** placeholder background tint behind the emoji */
  tint: string;
  image?: string;
  express?: boolean;
  tag?: 'Best Seller' | 'Top Rated' | 'New' | 'Selling out fast';
  delivery: string;
  category: string;
  coupon?: string;
  colors?: string[];
  sizes?: string[];
  highlights?: string[];
  seller?: string;
  /* ── Live-data fields (optional; used by the PDP for real noon products, see src/flows/pdp/MAPPING.md) ── */
  /** noon sku_config, e.g. N70211593V */
  sku?: string;
  /** selected offer code (?o=…) */
  offerCode?: string;
  /** gallery images (real photos); `image` stays the first / card image */
  images?: string[];
  /** leaf category id in src/mocks/categories.ts */
  categoryId?: string;
  /** root → leaf breadcrumb (categoryPath(categoryId)) */
  categoryPath?: CategoryRef[];
  /** best_seller_rank in the leaf category → "#38 in Smartphones" */
  rank?: number;
  /** SD nudges (product box ticker / PDP nudge tag) */
  nudges?: ProductNudge[];
  /** low_stock_nudge_value → "Only 1 left in stock" */
  stockLeft?: number;
  freeDelivery?: boolean;
  /** model / colour / storage / version attributes (variant matrix keys) */
  attributes?: ProductAttributes;
  /** id of the variant matrix this product belongs to (variantFamilies) */
  variantFamily?: string;
  sellerRating?: { value: number; count: number };
  description?: string;
  /** feature_bullets */
  featureBullets?: string[];
  /** specifications (name, value) */
  specs?: [string, string][];
}

export interface ProductNudge {
  text: string;
  kind: 'rank' | 'lowestPrice' | 'freeDelivery' | 'lowStock' | 'sellingFast' | 'soldRecently' | 'info';
}

export interface ProductAttributes {
  model?: string;
  color?: string;
  storage?: string;
  version?: string;
}

/** A product family's variant matrix (noon `groups`): one row per dimension, options in the live page order. */
export interface VariantFamily {
  id: string;
  dimensions: { key: keyof ProductAttributes; name: string; options: string[]; versionGuide?: boolean }[];
}

/** UAE dirham sign: private-use U+E001, drawn by the Noontree font (bappzaar src/constants/CurrencyUnicodes.ts). SAR is U+E000. */
export const currency = '\uE001';

export const products: Product[] = [
  {
    id: 'p1',
    brand: 'Apple',
    title: 'AirPods Pro (2nd generation) with MagSafe Charging Case (USB‑C) White',
    price: 799,
    was: 1029,
    rating: 4.7,
    ratingCount: 12840,
    emoji: '🎧',
    tint: '#EEF2F8', // token-lint-ignore: mock catalog data (product tint / swatch)
    express: true,
    tag: 'Best Seller',
    delivery: 'Get it <b>Tomorrow</b>',
    category: 'Electronics',
    coupon: 'Extra 10% off with coupon',
    colors: ['#F5F5F7', '#1D1D1F'], // token-lint-ignore: mock catalog data (product tint / swatch)
    highlights: ['Active Noise Cancellation', 'Adaptive Audio', 'USB‑C charging'],
    seller: 'noon',
  },
  {
    id: 'p2',
    brand: 'Samsung',
    title: 'Galaxy S25 Ultra Dual SIM Titanium Black 12GB RAM 256GB 5G',
    price: 4299,
    was: 5199,
    rating: 4.6,
    ratingCount: 3240,
    emoji: '📱',
    tint: '#EDEFF5', // token-lint-ignore: mock catalog data (product tint / swatch)
    express: true,
    tag: 'Top Rated',
    delivery: 'Get it <b>Today</b> in 4 hrs',
    category: 'Mobiles',
    colors: ['#2B2B2E', '#C9C8C3', '#5C6D8A'], // token-lint-ignore: mock catalog data (product tint / swatch)
    sizes: ['256 GB', '512 GB', '1 TB'],
    highlights: ['200MP camera', 'Snapdragon 8 Elite', '5000 mAh'],
    seller: 'noon',
  },
  {
    id: 'p3',
    brand: 'Nike',
    title: "Air Max 270 Men's Running Shoes Black/White",
    price: 389,
    was: 599,
    rating: 4.4,
    ratingCount: 912,
    emoji: '👟',
    tint: '#F4F1EC', // token-lint-ignore: mock catalog data (product tint / swatch)
    express: true,
    delivery: 'Get it <b>Mon, Oct 13</b>',
    category: 'Fashion',
    sizes: ['40', '41', '42', '43', '44', '45'],
    colors: ['#111111', '#F2F2F2', '#B23A3A'], // token-lint-ignore: mock catalog data (product tint / swatch)
    seller: 'Sports Corner',
  },
  {
    id: 'p4',
    brand: 'Philips',
    title: 'Series 3000i Air Purifier with HEPA Filter, Smart App Control',
    price: 649,
    was: 899,
    rating: 4.3,
    ratingCount: 455,
    emoji: '🫧',
    tint: '#EEF6F4', // token-lint-ignore: mock catalog data (product tint / swatch)
    delivery: 'Get it <b>Wed, Oct 15</b>',
    category: 'Home',
    tag: 'Selling out fast',
    seller: 'HomeMart',
  },
  {
    id: 'p5',
    brand: 'Sony',
    title: 'PlayStation 5 Slim Console Digital Edition with DualSense',
    price: 1699,
    was: 1899,
    rating: 4.8,
    ratingCount: 7610,
    emoji: '🎮',
    tint: '#EDF0F7', // token-lint-ignore: mock catalog data (product tint / swatch)
    express: true,
    tag: 'Best Seller',
    delivery: 'Get it <b>Tomorrow</b>',
    category: 'Gaming',
    seller: 'noon',
  },
  {
    id: 'p6',
    brand: 'Apple',
    title: 'Watch Series 10 GPS 46mm Jet Black Aluminium Case with Sport Band',
    price: 1599,
    was: 1799,
    rating: 4.7,
    ratingCount: 2210,
    emoji: '⌚️',
    tint: '#F1F1F4', // token-lint-ignore: mock catalog data (product tint / swatch)
    express: true,
    delivery: 'Get it <b>Tomorrow</b>',
    category: 'Electronics',
    sizes: ['42mm', '46mm'],
    seller: 'noon',
  },
  {
    id: 'p7',
    brand: 'Dior',
    title: 'Sauvage Eau De Parfum For Men 100ml',
    price: 489,
    was: 615,
    rating: 4.6,
    ratingCount: 1830,
    emoji: '🧴',
    tint: '#F2EFEA', // token-lint-ignore: mock catalog data (product tint / swatch)
    express: true,
    tag: 'New',
    delivery: 'Get it <b>Tomorrow</b>',
    category: 'Beauty',
    seller: 'Beauty Hub',
  },
  {
    id: 'p8',
    brand: 'De’Longhi',
    title: 'Dedica Arte Espresso Machine EC885 Stainless Steel',
    price: 899,
    was: 1199,
    rating: 4.5,
    ratingCount: 640,
    emoji: '☕️',
    tint: '#F3EEEA', // token-lint-ignore: mock catalog data (product tint / swatch)
    delivery: 'Get it <b>Thu, Oct 16</b>',
    category: 'Home',
    coupon: 'Save  50 with coupon',
    seller: 'KitchenPro',
  },
  {
    id: 'p9',
    brand: 'Lenovo',
    title: 'IdeaPad Slim 5 14" OLED Laptop Ryzen 7 16GB 1TB SSD',
    price: 2999,
    was: 3699,
    rating: 4.4,
    ratingCount: 380,
    emoji: '💻',
    tint: '#EEF0F3', // token-lint-ignore: mock catalog data (product tint / swatch)
    express: true,
    delivery: 'Get it <b>Tomorrow</b>',
    category: 'Electronics',
    seller: 'noon',
  },
  {
    id: 'p10',
    brand: 'LEGO',
    title: 'Technic Ferrari Daytona SP3 42143 Building Set (3778 pcs)',
    price: 1449,
    was: 1799,
    rating: 4.9,
    ratingCount: 210,
    emoji: '🏎️',
    tint: '#FBEEEE', // token-lint-ignore: mock catalog data (product tint / swatch)
    delivery: 'Get it <b>Sat, Oct 18</b>',
    category: 'Toys',
    seller: 'Toy Planet',
  },
  {
    id: 'p11',
    brand: 'Anker',
    title: 'PowerLine III USB-C to USB-C Cable 100W 1.8m Black',
    price: 39,
    was: 59,
    rating: 4.6,
    ratingCount: 5120,
    emoji: '🔌',
    tint: '#EEF0F4', // token-lint-ignore: mock catalog data (product tint / swatch)
    delivery: 'Get it <b>Mon, Oct 13</b>',
    category: 'Electronics',
    seller: 'Global Gadgets',
  },
  {
    id: 'p12',
    brand: 'Stanley',
    title: 'Quencher H2.0 FlowState Tumbler 40oz Stainless Steel',
    price: 179,
    was: 219,
    rating: 4.8,
    ratingCount: 2980,
    emoji: '🥤',
    tint: '#EEF5F1', // token-lint-ignore: mock catalog data (product tint / swatch)
    delivery: 'Get it <b>Sun, Oct 19</b>',
    category: 'Home',
    colors: ['#C7D3C2', '#1D1D1F', '#F2D7D9'], // token-lint-ignore: mock catalog data (product tint / swatch)
    seller: 'Global Store',
  },
  {
    id: 'p13',
    brand: 'De’Longhi',
    title: 'Stainless Steel Milk Frothing Jug 350ml',
    price: 79,
    was: 99,
    rating: 4.5,
    ratingCount: 310,
    emoji: '🥛',
    tint: '#F1F1F4', // token-lint-ignore: mock catalog data (product tint / swatch)
    delivery: 'Get it <b>Thu, Oct 16</b>',
    category: 'Home',
    seller: 'KitchenPro',
  },
  {
    id: 'p14',
    brand: 'De’Longhi',
    title: 'EcoDecalk Natural Descaler for Coffee Machines 500ml',
    price: 49,
    was: 59,
    rating: 4.6,
    ratingCount: 1240,
    emoji: '🧪',
    tint: '#EEF5F1', // token-lint-ignore: mock catalog data (product tint / swatch)
    delivery: 'Get it <b>Thu, Oct 16</b>',
    category: 'Home',
    seller: 'KitchenPro',
  },
];


/* ─────────────────────────────────────────────────────────────────────────────
 *  LIVE noon products (captured from noon.com/uae-en, Oct 2026)
 *  iPhone 17 Pro 1TB (Nano SIM + eSIM) Silver – N70211593V, its "More from Apple" family,
 *  "Customers also viewed" and Frequently Bought Together accessories.
 *  Source: JSON-LD Product + BreadcrumbList, mp-customer-discovery-api /pdp/carousels.
 *  Images: src/assets/products/iphone-17-pro (f.nooncdn.com, ?width=800 gallery / 320 cards).
 * ───────────────────────────────────────────────────────────────────────────── */

/** iPhone 17 Pro / Pro Max variant matrix (Color · Internal Memory · Model Name · Version), options in live-page order. */
export const variantFamilies: VariantFamily[] = [
  {
    id: 'iphone-17-pro',
    dimensions: [
      { key: 'color', name: 'Color', options: ['Silver', 'Cosmic Orange', 'Deep Blue'] },
      { key: 'storage', name: 'Internal Memory', options: ['1 TB', '256 GB', '512 GB'] },
      { key: 'model', name: 'Model Name', options: ['iPhone 17 Pro', 'iPhone 17 Pro Max'] },
      { key: 'version', name: 'Version', options: ['International Version', 'International Version (eSIM)', 'Middle East Version (eSIM)', 'Physical Dual SIM Version'], versionGuide: true },
    ],
  },
];

const smartphones = categoryPath('smartphones');

/** The live default PDP product. */
export const IPHONE_17_PRO_ID = 'N70211593V';

const iphone17Pro: Product = {
  id: IPHONE_17_PRO_ID,
  brand: 'Apple',
  title: 'iPhone 17 Pro 1TB (Nano SIM + eSIM) Silver 5G With FaceTime - International Version',
  price: 6549,
  rating: 4.5,
  ratingCount: 34297,
  emoji: '📱',
  tint: '#F2F3F7', // token-lint-ignore: mock catalog data (product tint / swatch)
  image: ip17Gallery1,
  images: [ip17Gallery1, ip17Gallery2, ip17Gallery3, ip17Gallery4],
  express: true,
  delivery: 'Get it by <b>12 Oct</b>',
  category: 'Mobiles',
  seller: 'KKGSM',
  sellerRating: { value: 4.9, count: 171 },
  sku: 'N70211593V',
  offerCode: 'edbc4677f7e4775c',
  categoryId: 'smartphones',
  categoryPath: smartphones,
  nudges: [
    { text: 'Free Delivery', kind: 'freeDelivery' },
    { text: 'Only 1 left in stock', kind: 'lowStock' },
  ],
  stockLeft: 1,
  freeDelivery: true,
  attributes: { model: 'iPhone 17 Pro', color: 'Silver', storage: '1 TB', version: 'International Version' },
  variantFamily: 'iphone-17-pro',
  description:
    'The innovative design for iPhone 17 Pro delivers exceptional durability, breakthrough battery life and unlocks the extraordinary power of the A19 Pro chip. The 48MP Pro Fusion camera system has the longest iPhone Telephoto ever with 8x zoom, and a Center Stage front camera for smarter group selfies and Dual Capture video. Ceramic Shield 2 on the front for 3x better scratch resistance, and a forged aluminium unibody that dissipates heat. Helpful Apple Intelligence tools like Clean Up and more.',
  featureBullets: [
    'Super Retina XDR display Footnote 2 Pro Motion technology Always-On display Dynamic Island',
    'Aluminum Unibody Action button Camera Control for faster access to photo and video tools',
    'A19 Pro chip 6-core GPU with Neural Accelerators Hardware-accelerated ray tracing',
    'Up to 39 hours of video playback',
    '18MP Center Stage front camera Tap to zoom and rotate Centre Stage for photos Ultra‑stabilized video Dual Capture Centre Stage for video calls',
    '48MP Pro Fusion camera system 48MP Fusion Main | 48MP Fusion Ultra-Wide | 48MP Fusion Telephoto Super-high‑resolution photos (24MP and 48MP) Next-generation portraits with Focus and Depth Control Macro photography',
    'Dolby Vision up to 4K at 120 fps Latest-generation Photographic Styles',
  ],
  specs: [
    ['Memory Type', 'No Expandable Memory'],
    ['Secondary Camera Resolution', '18 MP'],
    ['SIM Count', 'Dual SIM'],
    ['RAM Size', '12 GB'],
    ['Battery Size', '3988 mAh'],
    ['Internal Memory', '1 TB'],
    ['Screen Size', '6.3 in'],
    ['Version', 'International Version'],
    ['Sim Type', 'Nano + eSIM'],
    ['Primary Camera Resolution', '48 MP'],
    ['Charging Type', 'Type-C'],
    ['Operating System', 'iOS'],
    ['Item Condition', 'New'],
    ['Audio Jack', 'Type-C'],
    ['Network Type', '5G'],
    ['Fast Charging', 'Yes'],
    ['Flash', 'Dual Tone flash'],
    ['Number of Cores', 'Hexa Core'],
    ['Primary Camera Feature', 'Triple'],
    ['Primary Camera (MP)', '48+48+48MP'],
  ],
};

/** Frequently Bought Together accessories (FBT block). Ids are the image pzsku folders: inferred, the live FBT exposes no sku. */
const fbtProducts: Product[] = [
  {
    id: 'Z7D7DFFC169EA7DE817A2Z',
    brand: 'Generic', // inferred: no brand shown in FBT
    title: 'iPhone 17 Pro Silicone Case 6.3 inch',
    price: 24.94,
    rating: 0,
    ratingCount: 0,
    emoji: '📱',
    tint: '#F2F3F7', // token-lint-ignore: mock catalog data (product tint / swatch)
    image: fbtCase,
    images: [fbtCase],
    delivery: 'Get it by <b>12 Oct</b>',
    category: 'Electronics',
    categoryId: 'cases-and-covers', // inferred from title
    categoryPath: categoryPath('cases-and-covers'),
  },
  {
    id: 'Z49C27F88DD3370F190CAZ',
    brand: 'Apple',
    title: 'AirPods Max 2 - Purple',
    price: 1729,
    rating: 0,
    ratingCount: 0,
    emoji: '🎧',
    tint: '#F2F3F7', // token-lint-ignore: mock catalog data (product tint / swatch)
    image: fbtAirpods,
    images: [fbtAirpods],
    delivery: 'Get it by <b>12 Oct</b>',
    category: 'Electronics',
    categoryId: 'over-ear-headphones', // inferred from title
    categoryPath: categoryPath('over-ear-headphones'),
  },
  {
    id: 'ZF1A24406870D3964331CZ',
    brand: 'Spigen',
    title: 'GLAStR EZ Fit iPhone 17 PRO / 17 / 16 PRO PRIVACY Screen Protector [2 PACK] Premium Tempered Glass with Auto Align technology - 2 PACK',
    price: 109.99,
    rating: 0,
    ratingCount: 0,
    emoji: '📱',
    tint: '#F2F3F7', // token-lint-ignore: mock catalog data (product tint / swatch)
    image: fbtSpigen,
    images: [fbtSpigen],
    delivery: 'Get it by <b>12 Oct</b>',
    category: 'Electronics',
    categoryId: 'screen-protectors', // inferred from title
    categoryPath: categoryPath('screen-protectors'),
  },
];

/** "More from Apple" (same_brand, live order) + "Customers also viewed" (other_brands) carousel products. */
const carouselProducts: Product[] = (
  [

  {
    id: "N70211479V",
    brand: "Apple",
    title: "iPhone 17 Pro 1TB (eSIM only) Silver 5G With FaceTime - International Version",
    price: 5699,
    was: 6399,
    rating: 4.5,
    ratingCount: 34297,
    emoji: "📱",
    tint: "#F2F3F7", // token-lint-ignore: mock catalog data (product tint / swatch)
    image: img_n70211479v,
    images: [
      img_n70211479v
    ],
    express: true,
    delivery: "GET IN <b>1 HR 22 MINS</b>",
    category: "Mobiles",
    seller: "Blue Chips UAE",
    sku: "N70211479V",
    offerCode: "d11c536292e90dac",
    categoryId: "smartphones",
    nudges: [
      {
        text: "Lowest price in a year",
        kind: "lowestPrice"
      }
    ],
    freeDelivery: false,
    attributes: {
      model: "iPhone 17 Pro",
      storage: "1 TB",
      color: "Silver",
      version: "International Version (eSIM)"
    },
    variantFamily: "iphone-17-pro"
  },
  {
    id: "N70211592V",
    brand: "Apple",
    title: "iPhone 17 Pro 1TB (Nano SIM + eSIM) Cosmic Orange 5G With FaceTime - International Version",
    price: 6549,
    rating: 4.5,
    ratingCount: 34297,
    emoji: "📱",
    tint: "#F2F3F7", // token-lint-ignore: mock catalog data (product tint / swatch)
    image: img_n70211592v,
    images: [
      img_n70211592v
    ],
    express: false,
    delivery: "Get it by <b>12 Oct</b>",
    category: "Mobiles",
    seller: "Buy Me",
    sku: "N70211592V",
    offerCode: "e880d89bd0b86b9a",
    categoryId: "smartphones",
    nudges: [
      {
        text: "Free Delivery",
        kind: "freeDelivery"
      },
      {
        text: "Only 1 left in stock",
        kind: "lowStock"
      }
    ],
    stockLeft: 1,
    freeDelivery: true,
    attributes: {
      model: "iPhone 17 Pro",
      storage: "1 TB",
      color: "Cosmic Orange",
      version: "International Version"
    },
    variantFamily: "iphone-17-pro"
  },
  {
    id: "N70211566V",
    brand: "Apple",
    title: "iPhone 17 Pro 256GB (Nano SIM + eSIM) Silver 5G With FaceTime - International Version",
    price: 4599,
    rating: 4.5,
    ratingCount: 34297,
    emoji: "📱",
    tint: "#F2F3F7", // token-lint-ignore: mock catalog data (product tint / swatch)
    image: img_n70211566v,
    images: [
      img_n70211566v
    ],
    express: true,
    delivery: "GET IN <b>1 HR 22 MINS</b>",
    category: "Mobiles",
    seller: "Viola-UAE",
    sku: "N70211566V",
    offerCode: "e03d8b088e5c723d",
    categoryId: "smartphones",
    rank: 38,
    nudges: [
      {
        text: "#38 in Smartphones",
        kind: "rank"
      },
      {
        text: "Lowest price in a year",
        kind: "lowestPrice"
      },
      {
        text: "Selling out fast",
        kind: "sellingFast"
      }
    ],
    freeDelivery: false,
    attributes: {
      model: "iPhone 17 Pro",
      storage: "256 GB",
      color: "Silver",
      version: "International Version"
    },
    variantFamily: "iphone-17-pro"
  },
  {
    id: "N70211562V",
    brand: "Apple",
    title: "iPhone 17 Pro 512GB (Nano SIM + eSIM) Silver 5G With FaceTime - International Version",
    price: 5849,
    rating: 4.5,
    ratingCount: 34297,
    emoji: "📱",
    tint: "#F2F3F7", // token-lint-ignore: mock catalog data (product tint / swatch)
    image: img_n70211562v,
    images: [
      img_n70211562v
    ],
    express: true,
    delivery: "Get it by <b>12 Oct</b>",
    category: "Mobiles",
    seller: "KKGSM",
    sku: "N70211562V",
    offerCode: "e28663c29503686f",
    categoryId: "smartphones",
    nudges: [
      {
        text: "Free Delivery",
        kind: "freeDelivery"
      },
      {
        text: "Only 1 left in stock",
        kind: "lowStock"
      }
    ],
    stockLeft: 1,
    freeDelivery: true,
    attributes: {
      model: "iPhone 17 Pro",
      storage: "512 GB",
      color: "Silver",
      version: "International Version"
    },
    variantFamily: "iphone-17-pro"
  },
  {
    id: "N70211680V",
    brand: "Apple",
    title: "iPhone 17 Pro 256 GB (eSIM only) Silver 5G With FaceTime - International Version",
    price: 4189,
    was: 4699,
    rating: 4.5,
    ratingCount: 34297,
    emoji: "📱",
    tint: "#F2F3F7", // token-lint-ignore: mock catalog data (product tint / swatch)
    image: img_n70211680v,
    images: [
      img_n70211680v
    ],
    express: true,
    delivery: "Get it by <b>12 Oct</b>",
    category: "Mobiles",
    seller: "Blue Chips UAE",
    sku: "N70211680V",
    offerCode: "fcc1600fa067cc9a",
    categoryId: "smartphones",
    rank: 34,
    nudges: [
      {
        text: "#34 in Smartphones",
        kind: "rank"
      },
      {
        text: "Lowest price in a year",
        kind: "lowestPrice"
      },
      {
        text: "Free Delivery",
        kind: "freeDelivery"
      },
      {
        text: "Selling out fast",
        kind: "sellingFast"
      }
    ],
    freeDelivery: true,
    attributes: {
      model: "iPhone 17 Pro",
      storage: "256 GB",
      color: "Silver",
      version: "International Version (eSIM)"
    },
    variantFamily: "iphone-17-pro"
  },
  {
    id: "N70211591V",
    brand: "Apple",
    title: "iPhone 17 Pro 1TB (Nano SIM + eSIM) Deep Blue 5G With FaceTime - International Version",
    price: 6549,
    rating: 4.5,
    ratingCount: 34297,
    emoji: "📱",
    tint: "#F2F3F7", // token-lint-ignore: mock catalog data (product tint / swatch)
    image: img_n70211591v,
    images: [
      img_n70211591v
    ],
    express: true,
    delivery: "Get it by <b>12 Oct</b>",
    category: "Mobiles",
    seller: "KKGSM",
    sku: "N70211591V",
    offerCode: "e7a729391b7d167a",
    categoryId: "smartphones",
    nudges: [
      {
        text: "Free Delivery",
        kind: "freeDelivery"
      },
      {
        text: "Selling out fast",
        kind: "sellingFast"
      }
    ],
    freeDelivery: true,
    attributes: {
      model: "iPhone 17 Pro",
      storage: "1 TB",
      color: "Deep Blue",
      version: "International Version"
    },
    variantFamily: "iphone-17-pro"
  },
  {
    id: "N70211681V",
    brand: "Apple",
    title: "iPhone 17 Pro 256 GB (eSIM only) Cosmic Orange 5G With FaceTime - International Version",
    price: 4099,
    was: 4699,
    rating: 4.5,
    ratingCount: 34297,
    emoji: "📱",
    tint: "#F2F3F7", // token-lint-ignore: mock catalog data (product tint / swatch)
    image: img_n70211681v,
    images: [
      img_n70211681v
    ],
    express: true,
    delivery: "Get it by <b>12 Oct</b>",
    category: "Mobiles",
    seller: "Blue Chips UAE",
    sku: "N70211681V",
    offerCode: "b44ce2d081e2945e",
    categoryId: "smartphones",
    rank: 43,
    nudges: [
      {
        text: "#43 in Smartphones",
        kind: "rank"
      },
      {
        text: "Lowest price in a year",
        kind: "lowestPrice"
      },
      {
        text: "Free Delivery",
        kind: "freeDelivery"
      }
    ],
    freeDelivery: true,
    attributes: {
      model: "iPhone 17 Pro",
      storage: "256 GB",
      color: "Cosmic Orange",
      version: "International Version (eSIM)"
    },
    variantFamily: "iphone-17-pro"
  },
  {
    id: "N70211564V",
    brand: "Apple",
    title: "iPhone 17 Pro 512GB (Nano SIM + eSIM) Deep Blue 5G With FaceTime - International Version",
    price: 5849,
    rating: 4.5,
    ratingCount: 34297,
    emoji: "📱",
    tint: "#F2F3F7", // token-lint-ignore: mock catalog data (product tint / swatch)
    image: img_n70211564v,
    images: [
      img_n70211564v
    ],
    express: true,
    delivery: "Get it by <b>12 Oct</b>",
    category: "Mobiles",
    seller: "KKGSM",
    sku: "N70211564V",
    offerCode: "dea80d9ad811d60a",
    categoryId: "smartphones",
    nudges: [
      {
        text: "Free Delivery",
        kind: "freeDelivery"
      },
      {
        text: "Only 1 left in stock",
        kind: "lowStock"
      }
    ],
    stockLeft: 1,
    freeDelivery: true,
    attributes: {
      model: "iPhone 17 Pro",
      storage: "512 GB",
      color: "Deep Blue",
      version: "International Version"
    },
    variantFamily: "iphone-17-pro"
  },
  {
    id: "N70211528V",
    brand: "Apple",
    title: "iPhone 17 Pro 512 GB (eSIM only) Silver 5G With FaceTime - Middle East Version",
    price: 5097,
    was: 5549,
    rating: 4.5,
    ratingCount: 34297,
    emoji: "📱",
    tint: "#F2F3F7", // token-lint-ignore: mock catalog data (product tint / swatch)
    image: img_n70211528v,
    images: [
      img_n70211528v
    ],
    express: true,
    delivery: "Get it by <b>12 Oct</b>",
    category: "Mobiles",
    seller: "Amanah",
    sku: "N70211528V",
    offerCode: "daebc8f5fe02efee",
    categoryId: "smartphones",
    nudges: [
      {
        text: "Lowest price in a year",
        kind: "lowestPrice"
      },
      {
        text: "Free Delivery",
        kind: "freeDelivery"
      }
    ],
    freeDelivery: true,
    attributes: {
      model: "iPhone 17 Pro",
      storage: "512 GB",
      color: "Silver",
      version: "Middle East Version (eSIM)"
    },
    variantFamily: "iphone-17-pro"
  },
  {
    id: "N70211464V",
    brand: "Apple",
    title: "iPhone 17 Pro Max 256 GB (eSIM only) Silver 5G With FaceTime - International Version",
    price: 4515,
    was: 5099,
    rating: 4.5,
    ratingCount: 34297,
    emoji: "📱",
    tint: "#F2F3F7", // token-lint-ignore: mock catalog data (product tint / swatch)
    image: img_n70211464v,
    images: [
      img_n70211464v
    ],
    express: true,
    tag: "Best Seller",
    delivery: "GET IN <b>1 HR 22 MINS</b>",
    category: "Mobiles",
    seller: "callmate",
    sku: "N70211464V",
    offerCode: "df8ca885867d8b5a",
    categoryId: "smartphones",
    rank: 2,
    nudges: [
      {
        text: "#2 in Smartphones",
        kind: "rank"
      },
      {
        text: "Lowest price in a year",
        kind: "lowestPrice"
      },
      {
        text: "Selling out fast",
        kind: "sellingFast"
      }
    ],
    freeDelivery: false,
    attributes: {
      model: "iPhone 17 Pro Max",
      storage: "256 GB",
      color: "Silver",
      version: "International Version (eSIM)"
    },
    variantFamily: "iphone-17-pro"
  },
  {
    id: "N70211534V",
    brand: "Apple",
    title: "iPhone 17 Pro 256 GB (eSIM only) Deep Blue 5G With FaceTime - Middle East Version",
    price: 4099,
    was: 4699,
    rating: 4.5,
    ratingCount: 34297,
    emoji: "📱",
    tint: "#F2F3F7", // token-lint-ignore: mock catalog data (product tint / swatch)
    image: img_n70211534v,
    images: [
      img_n70211534v
    ],
    express: true,
    delivery: "Get it by <b>12 Oct</b>",
    category: "Mobiles",
    seller: "Amanah",
    sku: "N70211534V",
    offerCode: "e1d3efe3c565cc9b",
    categoryId: "smartphones",
    nudges: [
      {
        text: "Lowest price in a year",
        kind: "lowestPrice"
      },
      {
        text: "Free Delivery",
        kind: "freeDelivery"
      }
    ],
    freeDelivery: true,
    attributes: {
      model: "iPhone 17 Pro",
      storage: "256 GB",
      color: "Deep Blue",
      version: "Middle East Version (eSIM)"
    },
    variantFamily: "iphone-17-pro"
  },
  {
    id: "N70211678V",
    brand: "Apple",
    title: "iPhone 17 Pro 512 GB (eSIM only) Deep Blue 5G With FaceTime - International Version",
    price: 5299,
    rating: 4.5,
    ratingCount: 34297,
    emoji: "📱",
    tint: "#F2F3F7", // token-lint-ignore: mock catalog data (product tint / swatch)
    image: img_n70211678v,
    images: [
      img_n70211678v
    ],
    express: false,
    delivery: "Get it by <b>12 Oct</b>",
    category: "Mobiles",
    seller: "Buy Me",
    sku: "N70211678V",
    offerCode: "ad888ab0e9903c0e",
    categoryId: "smartphones",
    nudges: [
      {
        text: "Lowest price in 30 days",
        kind: "lowestPrice"
      },
      {
        text: "Free Delivery",
        kind: "freeDelivery"
      },
      {
        text: "Only 1 left in stock",
        kind: "lowStock"
      }
    ],
    stockLeft: 1,
    freeDelivery: true,
    attributes: {
      model: "iPhone 17 Pro",
      storage: "512 GB",
      color: "Deep Blue",
      version: "International Version (eSIM)"
    },
    variantFamily: "iphone-17-pro"
  },
  {
    id: "N70211640V",
    brand: "Apple",
    title: "iPhone 17 Pro 1TB (eSIM only) Silver 5G With FaceTime - Middle East Version",
    price: 6399,
    rating: 4.5,
    ratingCount: 34297,
    emoji: "📱",
    tint: "#F2F3F7", // token-lint-ignore: mock catalog data (product tint / swatch)
    image: img_n70211640v,
    images: [
      img_n70211640v
    ],
    express: true,
    delivery: "Get it by <b>12 Oct</b>",
    category: "Mobiles",
    seller: "Amanah",
    sku: "N70211640V",
    offerCode: "e2e01590182aaf7a",
    categoryId: "smartphones",
    nudges: [
      {
        text: "Free Delivery",
        kind: "freeDelivery"
      }
    ],
    freeDelivery: true,
    attributes: {
      model: "iPhone 17 Pro",
      storage: "1 TB",
      color: "Silver",
      version: "Middle East Version (eSIM)"
    },
    variantFamily: "iphone-17-pro"
  },
  {
    id: "N70211574V",
    brand: "Apple",
    title: "iPhone 17 Pro Max 512GB (Nano SIM + eSIM) Silver 5G With FaceTime - International Version",
    price: 6399,
    rating: 4.5,
    ratingCount: 34297,
    emoji: "📱",
    tint: "#F2F3F7", // token-lint-ignore: mock catalog data (product tint / swatch)
    image: img_n70211574v,
    images: [
      img_n70211574v
    ],
    express: false,
    delivery: "Get it by <b>13 Oct</b>",
    category: "Mobiles",
    seller: "Nexus Cell",
    sku: "N70211574V",
    offerCode: "d89cd623c1db6deb",
    categoryId: "smartphones",
    nudges: [
      {
        text: "Free Delivery",
        kind: "freeDelivery"
      },
      {
        text: "Only 1 left in stock",
        kind: "lowStock"
      }
    ],
    stockLeft: 1,
    freeDelivery: true,
    attributes: {
      model: "iPhone 17 Pro Max",
      storage: "512 GB",
      color: "Silver",
      version: "International Version"
    },
    variantFamily: "iphone-17-pro"
  },
  {
    id: "Z4E7C13D1C7101937B8CEZ",
    brand: "Generic", // inferred: no brand on the live card
    title: "iPhone 17 Pro Case Liquid Silicone Silky Soft Touch Cover iPhone 17 Pro Full-Body Protection Anti-Scratch Shockproof Phone Case For iPhone 17 Pro 6.3-Inch",
    price: 29,
    rating: 4,
    ratingCount: 79,
    emoji: "📱",
    tint: "#F2F3F7", // token-lint-ignore: mock catalog data (product tint / swatch)
    image: img_z4e7c13d1c7101937b8cez,
    images: [
      img_z4e7c13d1c7101937b8cez
    ],
    express: true,
    delivery: "Get it by <b>12 Oct</b>",
    category: "Electronics",
    seller: "GTaj LLC",
    sku: "Z4E7C13D1C7101937B8CEZ",
    offerCode: "f78dc5bf7805d63d",
    categoryId: "cases-and-covers" /* inferred from title */,
    nudges: [
      {
        text: "Free Delivery",
        kind: "freeDelivery"
      },
      {
        text: "60+ sold recently",
        kind: "soldRecently"
      }
    ],
    freeDelivery: true
  },
  {
    id: "N70283860V",
    brand: "Samsung",
    title: "Galaxy S26 Ultra Dual SIM Cobalt Violet 12GB RAM 512GB 5G - Middle East Version",
    price: 4293,
    was: 5899,
    rating: 4.7,
    ratingCount: 13681,
    emoji: "📱",
    tint: "#F2F3F7", // token-lint-ignore: mock catalog data (product tint / swatch)
    image: img_n70283860v,
    images: [
      img_n70283860v
    ],
    express: true,
    delivery: "Get it by <b>12 Oct</b>",
    category: "Mobiles",
    seller: "Electronic-Mart",
    sku: "N70283860V",
    offerCode: "c7cf3fda076c1a8f",
    categoryId: "smartphones",
    nudges: [
      {
        text: "Free Delivery",
        kind: "freeDelivery"
      },
      {
        text: "Only 1 left in stock",
        kind: "lowStock"
      }
    ],
    stockLeft: 1,
    freeDelivery: true
  },
  {
    id: "N70283855V",
    brand: "Samsung",
    title: "Galaxy S26 Ultra Dual SIM Black 12GB RAM 256GB 5G - Middle East Version",
    price: 3299,
    was: 5099,
    rating: 4.7,
    ratingCount: 13681,
    emoji: "📱",
    tint: "#F2F3F7", // token-lint-ignore: mock catalog data (product tint / swatch)
    image: img_n70283855v,
    images: [
      img_n70283855v
    ],
    express: true,
    tag: "Best Seller",
    delivery: "Get it by <b>12 Oct</b>",
    category: "Mobiles",
    seller: "Cellsavvy",
    sku: "N70283855V",
    offerCode: "a41ce9ef1052760a",
    categoryId: "smartphones",
    rank: 4,
    nudges: [
      {
        text: "#4 in Smartphones",
        kind: "rank"
      },
      {
        text: "Free Delivery",
        kind: "freeDelivery"
      }
    ],
    freeDelivery: true
  },
  {
    id: "N70142941V",
    brand: "Samsung",
    title: "Galaxy S25 Ultra Dual SIM Titanium Black 12GB RAM 1TB 5G - International Version",
    price: 3649,
    rating: 4.7,
    ratingCount: 50774,
    emoji: "📱",
    tint: "#F2F3F7", // token-lint-ignore: mock catalog data (product tint / swatch)
    image: img_n70142941v,
    images: [
      img_n70142941v
    ],
    express: true,
    delivery: "Get it by <b>12 Oct</b>",
    category: "Mobiles",
    seller: "GSM+",
    sku: "N70142941V",
    offerCode: "d5016ba613443dcf",
    categoryId: "smartphones",
    nudges: [
      {
        text: "Free Delivery",
        kind: "freeDelivery"
      }
    ],
    freeDelivery: true
  },
  {
    id: "N70306064V",
    brand: "Samsung",
    title: "Galaxy S26 Ultra Dual SIM Cobalt Violet 12GB RAM 256GB 5G - International Version",
    price: 3598.95,
    rating: 4.7,
    ratingCount: 13681,
    emoji: "📱",
    tint: "#F2F3F7", // token-lint-ignore: mock catalog data (product tint / swatch)
    image: img_n70306064v,
    images: [
      img_n70306064v
    ],
    express: true,
    tag: "Best Seller",
    delivery: "Get it by <b>12 Oct</b>",
    category: "Mobiles",
    seller: "ALAREESH MPT",
    sku: "N70306064V",
    offerCode: "b86067fa6438ec9d",
    categoryId: "smartphones",
    rank: 16,
    nudges: [
      {
        text: "#16 in Smartphones",
        kind: "rank"
      },
      {
        text: "Free Delivery",
        kind: "freeDelivery"
      },
      {
        text: "Only 2 left in stock",
        kind: "lowStock"
      }
    ],
    stockLeft: 2,
    freeDelivery: true
  },
  {
    id: "N70140492V",
    brand: "Samsung",
    title: "Galaxy S25 Ultra AI Dual SIM Titanium Grey 12GB RAM 256GB 5G - Middle East Version",
    price: 2939,
    was: 5099,
    rating: 4.7,
    ratingCount: 50774,
    emoji: "📱",
    tint: "#F2F3F7", // token-lint-ignore: mock catalog data (product tint / swatch)
    image: img_n70140492v,
    images: [
      img_n70140492v
    ],
    express: false,
    tag: "Best Seller",
    delivery: "Get it by <b>13 Oct</b>",
    category: "Mobiles",
    seller: "TECH ORBIT TRADING L.L.C.",
    sku: "N70140492V",
    offerCode: "c15c63dd8d55777b",
    categoryId: "smartphones",
    rank: 5,
    nudges: [
      {
        text: "#5 in Smartphones",
        kind: "rank"
      },
      {
        text: "Free Delivery",
        kind: "freeDelivery"
      },
      {
        text: "Only 1 left in stock",
        kind: "lowStock"
      }
    ],
    stockLeft: 1,
    freeDelivery: true
  },
  {
    id: "N70187031V",
    brand: "Samsung",
    title: "Galaxy Z Fold 7 Dual SIM Blue Shadow 12GB 256GB 5G - International Version",
    price: 4399,
    was: 4800.75,
    rating: 4.6,
    ratingCount: 2025,
    emoji: "📱",
    tint: "#F2F3F7", // token-lint-ignore: mock catalog data (product tint / swatch)
    image: img_n70187031v,
    images: [
      img_n70187031v
    ],
    express: true,
    delivery: "Get it by <b>12 Oct</b>",
    category: "Mobiles",
    seller: "Phones4u LLC",
    sku: "N70187031V",
    offerCode: "a0c927a90d0a036d",
    categoryId: "smartphones",
    nudges: [
      {
        text: "Lowest price in a year",
        kind: "lowestPrice"
      },
      {
        text: "Free Delivery",
        kind: "freeDelivery"
      },
      {
        text: "Only 1 left in stock",
        kind: "lowStock"
      }
    ],
    stockLeft: 1,
    freeDelivery: true
  },
  {
    id: "N70270614V",
    brand: "HUAWEI",
    title: "Mate XT Super Slim Tri-Fold Design Smartphone, 16GB+1TB, Advanced Precision Hinge System, Ultra Aperture XMAGE Camera, 10.2-inch Hi-Res HUAWEI X-True Display + MultiView in One, White + Gifts",
    price: 9299,
    was: 12999,
    rating: 3.2,
    ratingCount: 5,
    emoji: "📱",
    tint: "#F2F3F7", // token-lint-ignore: mock catalog data (product tint / swatch)
    image: img_n70270614v,
    images: [
      img_n70270614v
    ],
    express: true,
    delivery: "Get it by <b>12 Oct</b>",
    category: "Mobiles",
    seller: "Arabian NextTech",
    sku: "N70270614V",
    offerCode: "fa19909749ebbc0c",
    categoryId: "smartphones",
    nudges: [
      {
        text: "Free Delivery",
        kind: "freeDelivery"
      }
    ],
    freeDelivery: true
  }
  ] as Product[]
).map((p) => ({ ...p, categoryPath: categoryPath(p.categoryId) }));

/** Live products, in live order: the PDP product, its carousels, FBT accessories. */
export const liveProducts: Product[] = [iphone17Pro, ...carouselProducts, ...fbtProducts];

/** FBT offer ids for the iPhone (`fbt_offers`), in live order. */
export const fbtFor: Record<string, string[]> = {
  [IPHONE_17_PRO_ID]: fbtProducts.map((p) => p.id),
};

// Append-only: existing indices (products[0…]) are unchanged; DemoStore / PLP / cart see the live items too.
products.push(...liveProducts);

export const productById = (id: string) => products.find((p) => p.id === id) ?? products[0];

export const discountPct = (p: Product) => (p.was ? Math.round(((p.was - p.price) / p.was) * 100) : 0);

export const formatPrice = (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: 2 });

export const user = {
  firstName: 'Ankit',
  lastName: 'Debnath',
  email: 'ankit@example.com',
  phone: '+971 50 123 4567',
  noonOne: false,
  credits: 25.5,
  address: { label: 'Home', line: 'Marina Gate 2, Dubai Marina', city: 'Dubai' },
};

export const categories = [
  { id: 'electronics', name: 'Electronics', emoji: '🎧' },
  { id: 'mobiles', name: 'Mobiles', emoji: '📱' },
  { id: 'fashion', name: 'Fashion', emoji: '👗' },
  { id: 'beauty', name: 'Beauty', emoji: '💄' },
  { id: 'home', name: 'Home & Kitchen', emoji: '🛋️' },
  { id: 'grocery', name: 'Grocery', emoji: '🥑' },
  { id: 'gaming', name: 'Gaming', emoji: '🎮' },
  { id: 'toys', name: 'Toys', emoji: '🧸' },
  { id: 'sports', name: 'Sports', emoji: '⚽️' },
  { id: 'baby', name: 'Baby', emoji: '🍼' },
  { id: 'books', name: 'Books', emoji: '📚' },
  { id: 'auto', name: 'Automotive', emoji: '🚗' },
];
