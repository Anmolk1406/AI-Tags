import accidentalCreative from '@assets/pdp/storefront/c/warranty-accidental.svg';
import extendedCreative from '@assets/pdp/storefront/c/warranty-accidental-extended.svg';
import { productById, products } from '../catalog';
import { bankOffers } from '../promotions';
import { categoryPath, isInCategory, leafName } from '../categories';
import { familyContent, fbtFor, productContent } from '../content';
import { defaultAiSummary, defaultReviewTopics } from '../reviewTopics';
import { sfCopy } from '../copy/pdp';
import type { DeliveryLane, Product, ProductAttributes, ProductContent, ProductFreebie, ProductReview, ReviewTopic, SellerInfo } from '../types';
import { variantFamilies } from '../variants';

/**
 * The product page (PDP) view: everything the PDP renders for one product, assembled from the product card
 * (`products/<id>/product.ts`), its page content (`products/<id>/content.ts`) and its variant family
 * (`families/<family>.ts`). Screens call `pdpView(product)` and render the result; they compute nothing themselves.
 * Field-by-field sources: src/flows/pdp/MAPPING.md → "Live data mapping".
 */

export interface VariantOption {
  name: string;
  /** colour swatch tint for the image tile (stand-in for SD image_url) */
  swatch?: string;
  /** SD image_url (real product photo) */
  image?: string;
  /** product this option opens (noon onSelectOption → load that sku) */
  productId?: string;
  price?: number;
  salePrice?: number;
  available: boolean;
  tag?: string;
}

export interface VariantGroup {
  name: string;
  options: VariantOption[];
  /** has a version guide → "Learn more" */
  versionGuide?: boolean;
  /** option of the current product (family groups); otherwise local selection state */
  selected?: number;
}

/** One combo: this product + one accessory, sold together for `saving` less (bappzaar NoonBundleType.savings). */
export interface PdpCombo {
  items: Product[];
  saving: number;
}

/** An extended-warranty plan (Protect4Less). USP icons are meanings; the screen picks the glyph. */
export interface WarrantyPlan {
  id: string;
  validity: string;
  name: string;
  /** the name as the design breaks it: line 1 full width, line 2 hugging the chevron */
  lines: [string, string];
  creative: string;
  usps: { icon: 'date' | 'liquid' | 'accident' | 'delivery'; text: string }[];
  price: number;
}

/** The delivery card's layouts (PDP Redesign xPr9Ln37JGSBGvNtrsyD0y · 3583:109620). */
export type DeliveryVariant = 'crossSell' | 'noCrossSell' | 'market' | 'express' | 'global';
export const deliveryVariants: DeliveryVariant[] = ['crossSell', 'noCrossSell', 'market', 'express', 'global'];

export interface PdpContent {
  brand: string;
  officialStore: boolean;
  keyHighlights?: string[];
  dealTag?: string;
  nudges: string[];
  /** SD best_price.tag_v2 */
  bestPrice?: ProductContent['bestPrice'];
  /** SD discount_tags (shown only when there is no best price): title + discount_code_display_text */
  discountTags: NonNullable<ProductContent['discountTags']>;
  /** gallery images (real photos); empty → the gallery's placeholder slides */
  images: string[];
  /** NoonCategoryBestSellerTag (top, SD best_seller_tag): "#38 in Smartphones" */
  bestSellerTag?: { html: string; categoryId: string };
  /** NoonCategoryBestSeller CTA (bottom, SD best_seller_explore_cta) */
  bestSellerCta?: { html: string; subText?: string; categoryId: string };
  /** buying_options → "Other Delivery Options" accordion (NoonBuyingOption) */
  buyingOptions?: ProductContent['buyingOptions'];
  /** fbt_offers (product ids, current product first) */
  fbt?: string[];
  /** mp-trust-api product-reviews/ai-summary */
  aiSummary?: string[];
  /** reviews card numbers + photo rail when the product has its own (else product rating / ratingCount / review photos) */
  reviewSummary?: ProductContent['reviewSummary'];
  /** topic pills under the AI summary (each opens pdp/reviewTopics); defaultReviewTopics when the product has none */
  aiTopics?: ReviewTopic[];
  /** SD was_price_source → info icon */
  wasPriceSource: boolean;
  delivery: string;
  /** ProductFlag image in NoonDeliveryInfoItem: rocket (supermall) or express */
  deliveryLogo?: 'rocket' | 'express';
  /** minutes until estimated_delivery_expires */
  orderWithinMin?: number;
  isMember: boolean;
  payments?: ProductContent['payments'];
  /** NoonSizeVariantSelection (fashion `variants`) */
  sizes?: { options: VariantOption[]; sizeGuide: boolean };
  /** NoonOptionsSelection `groups` */
  groups: VariantGroup[];
  offerBadges: NonNullable<ProductContent['offerBadges']>;
  description: string;
  featureBullets: string[];
  specs: [string, string][];
  additional: NonNullable<ProductContent['additional']>;
  /** absent → no seller card */
  seller?: SellerInfo;
  reviews: ProductReview[];
  commentCount: number;
  /** what a verified buyer bought, for reviews without their own variant chips (model / colour / storage / version) */
  purchasedVariant: string[];
  /** bundles with this product (NoonAvailableBundlesTag), best saving first is not implied */
  combos: PdpCombo[];
  /** the best saving over `combos` ("upto"); 0 without combos */
  comboSaving: number;
  /** faster delivery lanes under the estimate */
  fasterLanes: DeliveryLane[];
  /** the delivery card layout this product's data calls for */
  deliveryVariant: DeliveryVariant;
  /** free shipping threshold the delivery card's strip names */
  freeShippingMin: number;
  /** product overview "Summarised by AI" bullets; absent → the card shows only its accordions */
  aiOverview?: { title: string; description: string }[];
  /** A+ brand creatives (Product Features card) */
  aplusImages: string[];
  freebies: ProductFreebie[];
  /** frequently bought together, resolved (this product first); < 2 → no card */
  fbtItems: Product[];
  /** sponsored product row: the first FBT accessory, else an express product from another category */
  sponsored?: Product;
  /** sponsored brand carousel: same brand, topped up from the same category */
  sponsoredBrand: Product[];
  /** the newer model of this product ("Newer model available") */
  newerModel?: Product;
  /** carousels at the bottom of the page */
  rails: { sameBrand: Product[]; alsoViewed: Product[]; related: Product[] };
  /** extended-warranty plans (products with a warranty row) */
  warrantyPlans: WarrantyPlan[];
  /** size options for the variants sheet: the size picker's, else the product's sizes, all available */
  sizeOptions: VariantOption[];
  /** "more items" in the added-to-cart sheet */
  addedSuggestions: Product[];
}

/** Server colour value → colour name (swatch hex is the server key). */
const colorNames: Record<string, string> = {
  '#2B2B2E': 'Titanium Black', // token-lint-ignore: swatch hex → colour-name lookup (server data key)
  '#C9C8C3': 'Titanium Silver', // token-lint-ignore: swatch hex → colour-name lookup (server data key)
  '#5C6D8A': 'Titanium Blue', // token-lint-ignore: swatch hex → colour-name lookup (server data key)
  '#111111': 'Black', // token-lint-ignore: swatch hex → colour-name lookup (server data key)
  '#F2F2F2': 'White', // token-lint-ignore: swatch hex → colour-name lookup (server data key)
  '#B23A3A': 'Red', // token-lint-ignore: swatch hex → colour-name lookup (server data key)
  '#F5F5F7': 'White', // token-lint-ignore: swatch hex → colour-name lookup (server data key)
  '#1D1D1F': 'Midnight', // token-lint-ignore: swatch hex → colour-name lookup (server data key)
  '#C7D3C2': 'Eucalyptus', // token-lint-ignore: swatch hex → colour-name lookup (server data key)
  '#F2D7D9': 'Rose Quartz', // token-lint-ignore: swatch hex → colour-name lookup (server data key)
};
export const colorName = (c: string) => colorNames[c] ?? c;

/** demo: each larger storage / size option adds this to the price (SD option prices) */
export const storageStep = 400;

/** The PDP for a product: its card (product.ts), its page content (content.ts over its family's) and what both imply. */
export function pdpView(p: Product): PdpContent {
  const content = productContent(p);
  const base = baseView(p, content);
  const combos = combosFor(p, base.fbt);
  const fasterLanes = fasterLanesFor(base);
  return {
    ...base,
    purchasedVariant: purchasedVariant(p),
    combos,
    comboSaving: combos.reduce((m, c) => Math.max(m, c.saving), 0),
    fasterLanes,
    deliveryVariant: deliveryVariantFor(base, fasterLanes),
    freeShippingMin,
    aiOverview: content?.aiOverview,
    aplusImages: content?.aplusImages ?? [],
    freebies: content?.freebies ?? [],
    fbtItems: (base.fbt ?? []).map((id) => products.find((x) => x.id === id)).filter((x): x is Product => !!x),
    sponsored: sponsoredFor(p, base.fbt),
    sponsoredBrand: sponsoredBrandFor(p),
    newerModel: successorFor(p) ?? undefined,
    rails: railsFor(p),
    warrantyPlans: base.additional.some((a) => a.icon === 'warranty') ? warrantyPlans(p.price) : [],
    sizeOptions: base.sizes?.options ?? (p.sizes ?? []).map((name) => ({ name, available: true })),
    addedSuggestions: products.filter((x) => x.id !== p.id).slice(0, 6),
  };
}

/** What pdpView derives for every product, on top of the product / content base. */
type Derived =
  | 'purchasedVariant'
  | 'combos'
  | 'comboSaving'
  | 'fasterLanes'
  | 'deliveryVariant'
  | 'freeShippingMin'
  | 'aiOverview'
  | 'aplusImages'
  | 'freebies'
  | 'fbtItems'
  | 'sponsored'
  | 'sponsoredBrand'
  | 'newerModel'
  | 'rails'
  | 'warrantyPlans'
  | 'sizeOptions'
  | 'addedSuggestions';
type Base = Omit<PdpContent, Derived>;

/* ── product + content ─────────────────────────────────────────────────────────────────────────────────────────────── */

const rankHtml = (rank: number, categoryId: string) => `<b>#${rank}</b> in <a>${leafName(categoryId) ?? ''}</a>`;

/** Product fields + page content. A field the data doesn't have stays empty, and its section isn't shown. */
function baseView(p: Product, c: ProductContent | undefined): Base {
  const leaf = p.categoryId;
  return {
    brand: p.brand,
    officialStore: c?.officialStore ?? false,
    keyHighlights: c?.highlights,
    dealTag: c?.dealTag,
    nudges: (p.nudges ?? []).filter((n) => n.kind !== 'rank').map((n) => n.text),
    bestPrice: c?.bestPrice,
    discountTags: c?.discountTags ?? [],
    images: p.images ?? (p.image ? [p.image] : []),
    bestSellerTag: p.rank && leaf ? { html: rankHtml(p.rank, leaf), categoryId: leaf } : undefined,
    bestSellerCta: leaf && leafName(leaf) ? { html: `Explore other <b>bestsellers</b> in <a>${leafName(leaf)}</a>`, categoryId: leaf } : undefined,
    buyingOptions: c?.buyingOptions,
    fbt: c?.fbt,
    // every PDP gets the review-topics section: a product's own summary / topics, else the written defaults
    aiSummary: c?.aiSummary ?? defaultAiSummary,
    aiTopics: c?.aiTopics ?? defaultReviewTopics,
    reviewSummary: c?.reviewSummary,
    wasPriceSource: c?.wasPriceSource ?? false,
    delivery: c?.delivery ?? p.delivery,
    deliveryLogo: /GET IN/i.test(p.delivery) ? 'rocket' : 'express',
    orderWithinMin: c?.orderWithinMin,
    isMember: true,
    // noon-wide bank offers lead every product's own payment offers
    payments: c?.payments && { ...c.payments, items: [...bankOffers, ...c.payments.items] },
    sizes: p.category === 'Fashion' && p.sizes ? { sizeGuide: true, options: p.sizes.map((name) => ({ name, available: true })) } : undefined,
    groups: p.variantFamily ? familyGroups(p) : optionGroups(p),
    offerBadges: c?.offerBadges ?? [],
    description: c?.description ?? '',
    featureBullets: c?.featureBullets ?? [],
    specs: c?.specs ?? [],
    additional: c?.additional ?? [],
    seller: c?.seller,
    reviews: c?.reviews ?? [],
    commentCount: c?.commentCount ?? p.ratingCount,
  };
}

/** Variant matrix (noon `groups`) for a family member: exact attribute match → link + price; otherwise the closest member. */
export function familyGroups(p: Product): VariantGroup[] {
  const fam = variantFamilies.find((f) => f.id === p.variantFamily);
  if (!fam || !p.attributes) return [];
  const swatches = familyContent(fam.id)?.swatches ?? {};
  const members = products.filter((m) => m.variantFamily === fam.id && m.attributes);
  const keys = fam.dimensions.map((d) => d.key);
  const score = (m: Product, want: ProductAttributes) => keys.filter((k) => m.attributes?.[k] === want[k]).length;
  return fam.dimensions.map((dim) => {
    const options = dim.options.map((value) => {
      const want: ProductAttributes = { ...p.attributes, [dim.key]: value };
      const exact = members.find((m) => score(m, want) === keys.length);
      const closest = exact ?? members.filter((m) => m.attributes?.[dim.key] === value).sort((a, b) => score(b, want) - score(a, want))[0];
      return {
        name: value,
        productId: closest?.id,
        image: dim.key === 'color' ? (swatches[value] ?? closest?.image) : undefined,
        // NoonOptionsSelection: every option is a SKU with its own price, so show the price of the SKU a tap switches to
        // (exact match, else the closest member) — the tiles keep their content whatever else is selected
        salePrice: closest?.price,
        price: closest?.was,
        available: !!closest,
      };
    });
    return { name: dim.name, options, versionGuide: dim.versionGuide, selected: dim.options.indexOf(p.attributes?.[dim.key] ?? '') };
  });
}

/**
 * Colour / size options of a product outside a variant family (its own `colors` / `sizes`). Each larger storage or size
 * adds `storageStep` to the price (demo rule: SD sends each option's price).
 */
function optionGroups(p: Product): VariantGroup[] {
  const groups: VariantGroup[] = [];
  if (p.colors) groups.push({ name: 'Colour Name', options: p.colors.map((c) => ({ name: colorName(c), swatch: c, available: true })) });
  if (p.sizes && p.category !== 'Fashion') {
    const phone = p.category === 'Mobiles';
    groups.push({
      name: phone ? 'Internal Memory' : 'Size',
      versionGuide: phone,
      options: p.sizes.map((size, i) => ({
        name: size,
        salePrice: p.price + i * storageStep,
        price: p.was ? p.was + i * storageStep : undefined,
        available: true,
      })),
    });
  }
  return groups;
}

/* ── derived for every product ───────────────────────────────────────────────────────────────────────────────────── */

/** What a verified buyer bought: the product's model / colour / storage / version. */
function purchasedVariant(p: Product): string[] {
  const a = p.attributes;
  if (a) return [a.model, a.color, a.storage, a.version].filter((v): v is string => !!v);
  return [p.colors?.[0] ? colorName(p.colors[0]) : undefined, p.sizes?.[0]].filter((v): v is string => !!v);
}

/** A combo saves 15% of the accessory's price (demo rule; SD sends bundle_info.savings). */
const comboRate = 0.15;
const maxCombos = 3;

/** One combo per FBT accessory (the current product first), at most 3. No accessories → no bundle card, no saving banner. */
function combosFor(p: Product, fbt: string[] | undefined): PdpCombo[] {
  return (fbt ?? [])
    .filter((id) => id !== p.id)
    .slice(0, maxCombos)
    .map((id) => {
      const extra = productById(id);
      return { items: [p, extra], saving: Math.max(1, Math.round(extra.price * comboRate)) };
    });
}

/**
 * Faster delivery lanes: the product's rocket buying options when it has them, else (express lane) the Figma pair
 * "Get it Today + 14.00" / "Get it Tomorrow [before 12pm] + 12.00". Picked at checkout, not here.
 */
function fasterLanesFor(content: Pick<Base, 'buyingOptions' | 'deliveryLogo'>): DeliveryLane[] {
  const rocket = (content.buyingOptions ?? []).filter((o) => o.code === 'rocket');
  if (rocket.length) {
    return rocket.map((o) => {
      // "GET IN <b>1 HR 22 MINS</b>" → "in 1 hr 22 mins" (rendered after "Get")
      const text = o.html.replace(/<[^>]+>/g, '').replace(/^Get\s*(it\s*)?/i, '').toLowerCase();
      const m = /^(.*?)(\s*\[.*\])?$/.exec(text);
      return { day: (m?.[1] ?? text).trim(), note: m?.[2]?.trim(), price: o.price, productId: o.productId, offer: true };
    });
  }
  if (content.deliveryLogo === 'rocket') return [];
  return [
    { day: 'Today', price: 14 },
    { day: 'Tomorrow', note: '[before 12pm]', price: 12 },
  ];
}

/**
 * Sponsored accessory (derived; no SD ad slot in the mocks): the first frequently-bought-together item that isn't
 * this product, else the first express product from another category.
 */
function sponsoredFor(p: Product, fbt: string[] | undefined): Product | undefined {
  const id = fbt?.find((x) => x !== p.id);
  if (id) return productById(id);
  return products.find((x) => x.id !== p.id && x.express && x.category !== p.category);
}

/** Max cards in the sponsored brand row. */
const maxBrandCards = 8;

/** Sponsored products: same brand (not the current product), topped up from the same category. */
function sponsoredBrandFor(p: Product): Product[] {
  const others = products.filter((x) => x.id !== p.id);
  const brand = others.filter((x) => x.brand === p.brand);
  const category = others.filter((x) => x.category === p.category && x.brand !== p.brand);
  return [...brand, ...category].slice(0, maxBrandCards);
}

const TIERS: Record<string, number> = { '': 0, mini: 0, lite: 0, fe: 0, plus: 1, pro: 2, max: 3, 'pro max': 3, ultra: 3, fold: 4 };
type Model = { line: string; gen: number; tier: string };

/** "iPhone 17 Pro" → { line: 'iphone', gen: 17, tier: 'pro' }; "Galaxy S25 Ultra Dual SIM …" → { 'galaxy s', 25, 'ultra' }. */
function parseModel(p: Product): Model | null {
  const src = p.attributes?.model ?? p.title;
  const m = /^(.*?)(\d+)\s*(pro max|pro|plus|ultra|max|mini|lite|fe|fold)?\b/i.exec(src);
  if (!m || m[1].trim().length < 2) return null;
  return { line: m[1].trim().toLowerCase(), gen: Number(m[2]), tier: (m[3] ?? '').toLowerCase() };
}

/**
 * Successor of a product (derived; no `successor` field in the data): same brand + category + model line
 * ("iPhone", "Galaxy S", "Pixel") with a higher generation — same tier first, then the next generation, closest
 * storage / colour. When there is none, the next tier of the same generation (iPhone 17 Pro → 17 Pro Max). Else null.
 */
export function successorFor(product: Product): Product | null {
  const cur = parseModel(product);
  if (!cur) return null;
  const pool = products
    .filter((c) => c.id !== product.id && c.brand === product.brand && c.category === product.category)
    .map((c) => ({ c, m: parseModel(c) }))
    .filter((x): x is { c: Product; m: Model } => !!x.m && x.m.line === cur.line);
  const match = (c: Product) => (c.attributes?.storage === product.attributes?.storage ? 2 : 0) + (c.attributes?.color === product.attributes?.color ? 1 : 0) + (c.image ? 1 : 0);
  const newer = pool
    .filter((x) => x.m.gen > cur.gen)
    .sort((a, b) => Number(b.m.tier === cur.tier) - Number(a.m.tier === cur.tier) || a.m.gen - b.m.gen || match(b.c) - match(a.c));
  if (newer[0]) return newer[0].c;
  const rank = TIERS[cur.tier] ?? 0;
  const upgrade = pool
    .filter((x) => x.m.gen === cur.gen && (TIERS[x.m.tier] ?? 0) > rank)
    .sort((a, b) => (TIERS[a.m.tier] ?? 0) - (TIERS[b.m.tier] ?? 0) || match(b.c) - match(a.c));
  return upgrade[0]?.c ?? null;
}

/**
 * Carousels. Live products (product.sku): "More from {brand}" = live products of the same brand (pdp/carousels
 * same_brand, live order, FBT accessories excluded); "Customers Also Viewed" = other brands in the same level-2
 * category (Mobiles & Accessories → smartphones + cases, like other_brands). Demo products keep brand/category matching.
 * "Products related to this" = both, same category, else the next viewed products.
 */
function railsFor(p: Product): PdpContent['rails'] {
  let sameBrand: Product[];
  let others: Product[];
  if (p.sku) {
    const fbt = new Set(Object.values(fbtFor).flat());
    const live = products.filter((x) => x.sku && x.id !== p.id && !fbt.has(x.id));
    const branch = categoryPath(p.categoryId)[1]?.id;
    sameBrand = live.filter((x) => x.brand === p.brand);
    others = live.filter((x) => x.brand !== p.brand && (!branch || isInCategory(x.categoryId, branch)));
  } else {
    sameBrand = products.filter((x) => !x.sku && x.id !== p.id && (x.brand === p.brand || x.category === p.category));
    others = products.filter((x) => !x.sku && x.id !== p.id && !sameBrand.includes(x));
  }
  const related = [...others, ...sameBrand].filter((x) => x.category === p.category).slice(0, 12);
  return { sameBrand: sameBrand.slice(0, 12), alsoViewed: others.slice(0, 8), related: related.length ? related : others.slice(8, 20) };
}

/** Extended-warranty plan prices: a share of the product price with a floor (Figma 3499:75496 / 75516). */
const warrantyShare = [0.05, 0.08] as const;
const warrantyMin = 49;

/** Demo plans (Figma 3499:75496 / 75516; no SD plans yet). */
function warrantyPlans(price: number): WarrantyPlan[] {
  const at = (share: number) => Math.max(warrantyMin, Math.round(price * share));
  return [
    {
      id: 'adp',
      validity: '1 YEAR',
      name: 'Accidental Damage Protection',
      lines: ['Accidental Damage', 'Protection'],
      creative: accidentalCreative,
      usps: [
        { icon: 'date', text: 'Active from date of purchase' },
        { icon: 'liquid', text: 'Covers liquid damages' },
        { icon: 'delivery', text: 'Free pickup & delivery' },
      ],
      price: at(warrantyShare[0]),
    },
    {
      id: 'adp-ew',
      validity: '1 YEAR ACCIDENTAL + 1 YEAR EXTENDED',
      name: 'Accidental Damage & Extended Warranty',
      lines: ['Accidental Damage &', 'Extended Warranty'],
      creative: extendedCreative,
      usps: [
        { icon: 'date', text: 'Active from date of purchase' },
        { icon: 'accident', text: 'Covers all accidental damages' },
        { icon: 'delivery', text: 'Free pickup & delivery' },
      ],
      price: at(warrantyShare[1]),
    },
  ];
}

/** The price block for the option on screen: coupons, prepaid pill, nudges and the bestseller row (SfMainInfo). */
export interface MainInfoView {
  nudges: string[];
  coupons: { title: string; code?: string }[];
  prepaidOnly: boolean;
  bestseller?: { rank?: number; category?: string };
}

/**
 * `shown` is the product with the selected option's price (an option with a price is its own SKU), so this follows the
 * selection. Coupon rail: SD discount_tags; when the offer has none but a best price (coupon price), one chip is derived.
 * "Prepaid Only": derived (no SD flag in the mocks) — high-value electronics (≥ 3000) are prepaid only.
 */
export function mainInfoView(shown: Product, c: PdpContent): MainInfoView {
  let coupons = c.discountTags;
  if (!coupons.length && c.bestPrice) {
    const pct = Math.round((1 - c.bestPrice.price / shown.price) * 100);
    coupons = pct > 0 ? [{ title: `Extra ${pct}% off` }] : [];
  }
  const tag = c.bestSellerTag;
  return {
    nudges: c.nudges.length ? c.nudges : shown.was ? [sfCopy.mainInfo.lowestPrice] : [],
    coupons,
    prepaidOnly: shown.price >= 3000,
    bestseller: tag ? { rank: shown.rank ?? rankFromHtml(tag.html), category: leafName(tag.categoryId) } : undefined,
  };
}

/** "<b>#38</b> in <a>Smartphones</a>" → 38 (fallback when the product has no `rank`). */
function rankFromHtml(html: string) {
  const m = /#(\d+)/.exec(html);
  return m ? Number(m[1]) : undefined;
}

/** Orders over this ship free (the delivery card's strip). */
const freeShippingMin = 99;

/**
 * The delivery layout a product's data calls for: other-marketplace options → crossSell; faster lanes (rocket options, or
 * the express lane's Today / Tomorrow upgrades — New PDP 64:5590) → noCrossSell; else the single compact lane.
 */
function deliveryVariantFor(content: Pick<Base, 'buyingOptions' | 'deliveryLogo'>, fasterLanes: DeliveryLane[]): DeliveryVariant {
  const options = content.buyingOptions ?? [];
  if (options.some((o) => o.code !== 'rocket')) return 'crossSell';
  if (fasterLanes.length) return 'noCrossSell';
  return content.deliveryLogo === 'rocket' || content.deliveryLogo === 'express' ? 'express' : 'market';
}

/** A rail card's nudges: the product's own, else "Free delivery" when it ships free. */
export function railNudges(p: Product): NonNullable<Product['nudges']> {
  if (p.nudges?.length) return p.nudges;
  return p.freeDelivery ? [{ kind: 'freeDelivery', text: sfCopy.rail.freeDelivery }] : [];
}
