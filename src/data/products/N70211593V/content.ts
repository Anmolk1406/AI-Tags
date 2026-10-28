import figmaBox from '@assets/products/iphone-17-pro/figma-review-box.webp';
import figmaCable from '@assets/products/iphone-17-pro/figma-review-cable.webp';
import figmaCase from '@assets/products/iphone-17-pro/figma-review-case.webp';
import figmaPhone from '@assets/products/iphone-17-pro/figma-review-phone.webp';
import payInstallments from '@assets/products/iphone-17-pro/pay-installments.webp';
import payNoonOne from '@assets/products/iphone-17-pro/pay-noon-one-card.webp';
import paySplit from '@assets/products/iphone-17-pro/pay-split.webp';
import { defineContent } from '../../define';
import { money } from '../../format';
import { reviewTopicSet, type TopicLabel } from '../../reviewTopics';
import type { ReviewTopic } from '../../types';

/** Captured from noon.com/uae-en for iPhone 17 Pro 1TB Silver (offer edbc4677f7e4775c, Oct 2026): specs and offer-level SD content.
 *  The description, highlights and reviews are the family's (families/iphone-17-pro.ts). */
/* ── Reviews: written for the prototype from Figma Or9RuyCtjXRPrnbUJFx7As · 1409:63152 (PDP review topics). They
 *  override the family's captured reviews on this SKU only. ─────────────────────────────────────────────────────── */

/** the reviews behind each sentiment (positive copy from the Figma sheet; neutral / negative written to match it, phone-specific) */
const topicReviews: Record<ReviewTopic['sentiment'], ReviewTopic['reviews']> = {
  positive: [
    {
      name: 'John Anderson',
      helpful: 24,
      rating: 4,
      ago: '8 days ago',
      title: 'Absolutely incredible!',
      body: 'The camera boasted an impressive panoramic lens, perfect for capturing sweeping landscapes.',
    },
    {
      name: 'Sara Malik',
      helpful: 18,
      rating: 4,
      ago: '8 days ago',
      title: 'Truly remarkable!',
      body: 'This camera features a stunning ultra-wide lens, ideal for those breathtaking vistas.',
    },
    {
      name: 'Omar Haddad',
      helpful: 9,
      rating: 3,
      ago: '8 days ago',
      title: 'Good product',
      body: 'Equipped with a remarkable wide-angle lens, this camera excels at photographing expansive scenes.',
    },
    {
      name: 'Priya Nair',
      helpful: 31,
      rating: 4,
      ago: '8 days ago',
      title: 'Unbelievably fantastic!',
      body: 'Featuring a dynamic wide-angle capability, this camera is designed for capturing grand views.',
    },
  ],
  neutral: [
    {
      name: 'Ahmed Saleh',
      helpful: 6,
      rating: 3,
      ago: '2 weeks ago',
      title: 'Decent, nothing special',
      body: "It does the job well enough, but it feels much like last year's model in daily use.",
    },
    {
      name: 'Lina Farouk',
      helpful: 12,
      rating: 3,
      ago: '3 weeks ago',
      title: 'Okay for the price',
      body: 'Comfortable to hold for short sessions, though it gets a little heavy during long calls.',
    },
    {
      name: 'Daniel Cruz',
      helpful: 4,
      rating: 2,
      ago: '1 month ago',
      title: 'Mixed feelings',
      body: 'Some things impressed me and others did not; I expected a bigger step up for this price.',
    },
    {
      name: 'Fatima Zahra',
      helpful: 15,
      rating: 3,
      ago: '1 month ago',
      title: 'Fine overall',
      body: 'No real complaints so far. It is solid, but I have not noticed anything that stands out.',
    },
  ],
  negative: [
    {
      name: 'Rohan Mehta',
      helpful: 7,
      rating: 2,
      ago: '5 days ago',
      title: 'Not what I expected',
      body: 'The design feels dated next to other phones at this price, and the edges are sharp in hand.',
    },
    {
      name: 'Hessa Al Mansoori',
      helpful: 3,
      rating: 1,
      ago: '2 weeks ago',
      title: 'Disappointed',
      body: 'Too big for one-handed use and it slips out of most pockets. I am thinking of returning it.',
    },
    {
      name: 'Michael Lee',
      helpful: 11,
      rating: 2,
      ago: '3 weeks ago',
      title: 'Some features feel unfinished',
      body: 'A few settings are hard to find and some features did not work reliably out of the box.',
    },
    {
      name: 'Noura Khalid',
      helpful: 5,
      rating: 1,
      ago: '1 month ago',
      title: 'Subpar for the money',
      body: 'For this price I expected better; several small issues add up to a frustrating experience.',
    },
  ],
};

/** each topic's AI summary line, written for a phone (mock) */
const topicQuotes: Record<TopicLabel, string> = {
  Quality: '"Customers love the build quality; many say the aluminium body feels solid and premium in hand."',
  'Value for money': '"Most buyers feel the camera and performance justify the price; some call it worth every dirham!"',
  Appearance: '"Customers praise the design and colours; several say it looks even better in person."',
  Durability: '"Customers are split; most say it survives daily drops, but a few noticed scratches early on."',
  Functionality: '"Several customers say features like eSIM setup and Camera Control took time to work smoothly."',
  Size: '"Customers often find it too big for one-handed use and a tight fit in most pockets."',
};

/** each topic's first (photo) review, written about that topic for this phone (mock) */
const topicFirstReviews: Record<TopicLabel, { title: string; body: string }> = {
  Quality: {
    title: 'Premium in every way',
    body: 'The titanium frame feels solid and cool in the hand, the buttons click with real precision and there is not a single gap or creak anywhere. After two months without a case it still looks like it came out of the box yesterday.',
  },
  'Value for money': {
    title: 'Worth every dirham',
    body: 'I hesitated at the price, but the camera, the battery life and the speed have replaced my old phone, my point-and-shoot and half my laptop work. With the trade-in offer it felt like a fair deal, and I would buy it again.',
  },
  Appearance: {
    title: 'Stunning in person',
    body: 'The new colour looks far richer in real life than in the photos, and the matte back hides fingerprints really well. The thinner bezels make the screen look edge to edge. People keep asking me which phone it is.',
  },
  Durability: {
    title: 'Tough, with a caveat',
    body: 'It has survived a couple of drops onto tiles without a crack, and the screen still has no scratches. The camera bump did pick up a small scuff within a few weeks though, so I would still put a case on it.',
  },
  Functionality: {
    title: 'Setup was a headache',
    body: 'Moving my eSIM across took three attempts and a call to my carrier, and the new Camera Control button kept opening the camera by accident in my pocket. Once everything was set up it works well, but it should not take this long.',
  },
  Size: {
    title: 'Too big for one hand',
    body: 'I came from a smaller model and this one is a stretch to use with one hand; reaching the top of the screen means shifting my grip every time. It also sticks out of my jeans pocket. Great screen, but try it in a store first.',
  },
};

/** what both reviewers bought: the Figma 'New PDP' chips as drawn (1409:63791) */
const chips = ['Mac OS', '8 GB RAM', 'Internal Version', '256 GB', 'Dual core memory'];

const reviewBody =
  'If the camera had the wide angle feature in the portrait mode. If the camera has more fewer features than than the last one it will be worse better than others.';

export default defineContent({
  source: { kind: 'captured', note: 'noon.com/uae-en, Oct 2026' },
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
  // "Coupons" row (page text) → discount_tags
  discountTags: [
    { title: 'Extra 10% off', code: 'CODE: SALE200' },
    { title: 'Extra 10% off', code: 'CODE: FAB10' },
    { title: 'Extra 15% off', code: 'CODE: RAK50' },
  ],
  // "Get it by 12 Oct · Order in 16h 26m"
  delivery: 'Get it by <b>12 Oct</b>',
  orderWithinMin: 16 * 60 + 26,
  // "or GET IN 1 HR 22 MINS  6549.00 ↗" (supermall / rocket offer) → buying_options
  buyingOptions: [{ code: 'rocket', html: 'GET IN <b>1 HR 22 MINS</b>', price: 6549 }],
  // "Payment Discount"
  payments: {
    title: 'Payment Discount',
    items: [
      { logo: payNoonOne, html: `Earn <b>${money(327.45)}</b> cashback with the noon One Credit Card. <a>Apply now</a>` },
      { logo: payNoonOne, html: `Earn <b>${money(327.45)}</b> cashback with the Mashreq noon Credit Card. <a>Apply now</a>` },
      { logo: paySplit, html: 'Split in up to 6 payments <a>View details</a>' },
      { logo: payInstallments, html: 'Buy now, pay in monthly installments later with select cards. <a>View details</a>' },
    ],
  },
  // reinforcement badges (icons inferred: the page's badge icons were not captured)
  offerBadges: [
    { icon: 'verified', title: 'Delivery by noon' },
    { icon: 'tick', title: 'High Rated Seller' },
    { icon: 'returnable', title: 'Low Returns' },
    { icon: 'verified', title: 'Secure Transaction' },
    { icon: 'warranty', title: '1 year manufacturer warranty' },
    { icon: 'returnable', title: 'Easy and Hassle Free Returns' },
  ],
  // "Sold by KKGSM 4.9 · 98% Positive Ratings · Item as shown 100% · Partner since 2+ Years · Low return seller"
  seller: {
    name: 'KKGSM',
    rating: 4.9,
    ratingCount: 171,
    positive: 98,
    metrics: [
      { kind: 'percent', title: 'Item as shown', value: 100, tone: 'positive' },
      { kind: 'years', title: 'Partner since', value: 2 },
      { kind: 'badge', title: 'Low return seller' },
    ],
  },
  fbt: ['N70211593V', 'Z7D7DFFC169EA7DE817A2Z', 'Z49C27F88DD3370F190CAZ', 'ZF1A24406870D3964331CZ'],
  commentCount: 64,
  // Figma 'New PDP' review header: 4.8 · 64 reviews · Photo Reviews (64), rail phone / case / cable / box
  reviewSummary: { rating: 4.8, reviewCount: 64, photoCount: 64, photos: [figmaPhone, figmaCase, figmaCable, figmaBox] },
  aiSummary: [
    'The portrait mode includes a fantastic wide-angle',
    'Users appreciate the overall performance of phone.',
    'Enjoy the wide-angle capability while using portrait a fantastic wide-angle',
    'Users appreciate the overall performance of this phone.',
  ],
  aiTopics: reviewTopicSet(topicReviews, topicQuotes, topicFirstReviews),
  reviews: [
    {
      name: 'John Anderson',
      rating: 4,
      ago: '8 days ago',
      title: 'This is simply amazing!',
      body: reviewBody,
      verified: true,
      helpful: 15,
      variants: chips,
      images: [figmaPhone, figmaCase],
    },
    {
      name: 'John Anderson',
      rating: 5,
      ago: '6 months ago',
      title: 'This is simply amazing!',
      body: reviewBody,
      verified: false,
      helpful: 0,
      variants: chips,
      images: [figmaPhone, figmaCase],
    },
  ],
});
