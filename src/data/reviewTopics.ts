import photo1 from '@assets/pdp/review-topics/review-photo-1.webp';
import photo2 from '@assets/pdp/review-topics/review-photo-2.webp';
import photo3 from '@assets/pdp/review-topics/review-photo-3.webp';
import photo4 from '@assets/pdp/review-topics/review-photo-4.webp';
import photo5 from '@assets/pdp/review-topics/review-photo-5.webp';
import type { ReviewTopic } from './types';

/**
 * Review topics (noon AI "Customers frequently talked about", Figma Or9RuyCtjXRPrnbUJFx7As · 1409:63152).
 * Written for the prototype: no noon API returns topics yet. A product's own `aiTopics` win; every other product
 * shows `defaultReviewTopics` (category-neutral copy) and, when it has no AI summary of its own, `defaultAiSummary`.
 */

type Sentiment = ReviewTopic['sentiment'];

/** the AI's one-line summary per sentiment (Figma sheet copy; the fallback when a topic has no quote of its own) */
export const topicQuote: Record<Sentiment, string> = {
  positive: '"Customers really appreciate this product; some even describe it as exceptional!"',
  neutral: '"Customers have varied opinions about the product; some describe it as quite good."',
  negative: '"Customers often express disappointment with this product; some even describe it as subpar!"',
};

/** category-neutral reviews behind each sentiment */
const defaultReviews: Record<Sentiment, ReviewTopic['reviews']> = {
  positive: [
    {
      name: 'John Anderson',
      helpful: 24,
      rating: 5,
      ago: '6 days ago',
      title: 'Absolutely incredible!',
      body: 'Exactly as described and the quality is even better in person. Arrived well packed and on time.',
    },
    {
      name: 'Sara Malik',
      helpful: 18,
      rating: 4,
      ago: '9 days ago',
      title: 'Truly remarkable!',
      body: 'Feels premium and well made. I have used it every day since it arrived and it still looks new.',
    },
    { name: 'Omar Haddad', helpful: 9, rating: 4, ago: '2 weeks ago', title: 'Good product', body: 'Great value for what you pay; it does everything I needed and a little more.' },
    {
      name: 'Priya Nair',
      helpful: 31,
      rating: 5,
      ago: '3 weeks ago',
      title: 'Unbelievably fantastic!',
      body: 'Bought it as a gift and ended up ordering a second one for myself. Highly recommend.',
    },
  ],
  neutral: [
    {
      name: 'Ahmed Saleh',
      helpful: 6,
      rating: 3,
      ago: '2 weeks ago',
      title: 'Decent, nothing special',
      body: 'It does the job well enough, but it is much like other options at this price.',
    },
    { name: 'Lina Farouk', helpful: 12, rating: 3, ago: '3 weeks ago', title: 'Okay for the price', body: 'Fine for everyday use. A few small details could be better finished.' },
    {
      name: 'Daniel Cruz',
      helpful: 4,
      rating: 2,
      ago: '1 month ago',
      title: 'Mixed feelings',
      body: 'Some things impressed me and others did not; I expected a little more for the price.',
    },
    {
      name: 'Fatima Zahra',
      helpful: 15,
      rating: 3,
      ago: '1 month ago',
      title: 'Fine overall',
      body: 'No real complaints so far. It is solid, but nothing about it really stands out.',
    },
  ],
  negative: [
    {
      name: 'Rohan Mehta',
      helpful: 7,
      rating: 2,
      ago: '5 days ago',
      title: 'Not what I expected',
      body: 'It looks different from the photos and the finish feels cheaper than I hoped.',
    },
    {
      name: 'Hessa Al Mansoori',
      helpful: 3,
      rating: 1,
      ago: '2 weeks ago',
      title: 'Disappointed',
      body: 'The size was not right for me and it was awkward to use. I am thinking of returning it.',
    },
    {
      name: 'Michael Lee',
      helpful: 11,
      rating: 2,
      ago: '3 weeks ago',
      title: 'Some parts feel unfinished',
      body: 'A couple of things did not work properly out of the box and needed fixing.',
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

/** the topic labels, in the Figma order (3 positive · 1 neutral · 2 negative; Lightweight and Classic removed on request, 2026-10-28) */
export type TopicLabel = 'Quality' | 'Value for money' | 'Appearance' | 'Durability' | 'Functionality' | 'Size';

const topicOrder: [TopicLabel, Sentiment][] = [
  ['Quality', 'positive'],
  ['Value for money', 'positive'],
  ['Appearance', 'positive'],
  ['Durability', 'neutral'],
  ['Functionality', 'negative'],
  ['Size', 'negative'],
];

/** the AI's one-line summary per topic, category-neutral (the sentiment card's quote) */
export const defaultTopicQuotes: Record<TopicLabel, string> = {
  Quality: '"Customers love the build quality; many say it feels premium and well made."',
  'Value for money': '"Most buyers feel they got more than they paid for; some even call it a steal!"',
  Appearance: '"Customers praise the look and finish; several say it looks even better in person."',
  Durability: '"Customers are split on durability; most say it holds up, but a few noticed wear early on."',
  Functionality: '"Several customers say some features did not work as expected out of the box."',
  Size: '"Customers often find it bigger than expected and awkward to use or carry."',
};

/** the customer photos on the first review of every topic (Figma AI-Tags 74N3uH2E094EX3hWw7FDVd · 1566:109645), on
 *  request the same set on every product */
export const topicReviewPhotos = [photo1, photo2, photo3, photo4, photo5];

/** the Figma photo review's copy (AI-Tags 1566:109614): the fallback first review; long enough to clamp to two lines */
export const topicPhotoReview = {
  title: 'This is simply amazing!',
  body: 'Imagine a camera equipped with a wide-angle feature specifically designed for portrait mode. This enhancement allows you to capture stunning, expansive backgrounds while still focusing on your subject. With this capability, you can create dynamic and engaging portraits that tell a story, blending the subject seamlessly with their surroundings.',
};

type FirstReview = { title: string; body: string };

/** each topic's first (photo) review, written about that topic, category-neutral; long enough to clamp to two lines */
export const defaultTopicFirstReviews: Record<TopicLabel, FirstReview> = {
  Quality: {
    title: 'Built to last',
    body: 'You can feel the quality the moment you pick it up. The materials are solid, nothing creaks or rattles, and every edge is neatly finished. After a few weeks of daily use it still looks and feels brand new.',
  },
  'Value for money': {
    title: 'Worth every dirham',
    body: 'I compared it with a few options that cost quite a bit more and this one does just as much, if not more. For the price, the quality and the features are hard to beat, and the delivery was quick too.',
  },
  Appearance: {
    title: 'Looks even better in person',
    body: 'The photos do not do it justice. The finish is clean, the colour is rich and it looks far more premium than I expected. A couple of friends asked where I got it within the first week.',
  },
  Durability: {
    title: 'Holding up, mostly',
    body: 'It has survived a few drops and a lot of daily use without any real damage. That said, a small scuff showed up on one corner after a month, so a case is still worth it if you want it to stay perfect.',
  },
  Functionality: {
    title: 'Some features need work',
    body: 'The basics work fine, but a couple of features did not behave as described out of the box. It took a reset and some trial and error to get everything working, which was frustrating for something new.',
  },
  Size: {
    title: 'Bigger than I expected',
    body: 'It is noticeably larger than it looks in the pictures. Using it with one hand is awkward and it does not fit comfortably in most of my pockets or bags. Check the dimensions carefully before you order.',
  },
};

/** One topic: its label, sentiment, quote (default: the sentiment's) and reviews (default: the category-neutral set);
 *  its first review is the topic's photo review (`firstReview`, else the Figma copy, + `topicReviewPhotos`) unless it
 *  has photos of its own. */
export const reviewTopic = (
  label: string,
  sentiment: Sentiment,
  reviews: Record<Sentiment, ReviewTopic['reviews']> = defaultReviews,
  quote = topicQuote[sentiment],
  firstReview: FirstReview = topicPhotoReview,
): ReviewTopic => ({
  label,
  sentiment,
  quote,
  reviews: reviews[sentiment].map((r, i) => (i === 0 && !r.photos ? { ...r, ...firstReview, photos: topicReviewPhotos } : r)),
});

/** The Figma topic set, each with its own quote and its own first review. */
export const reviewTopicSet = (
  reviews?: Record<Sentiment, ReviewTopic['reviews']>,
  quotes: Record<TopicLabel, string> = defaultTopicQuotes,
  firstReviews: Record<TopicLabel, FirstReview> = defaultTopicFirstReviews,
): ReviewTopic[] => topicOrder.map(([label, sentiment]) => reviewTopic(label, sentiment, reviews, quotes[label], firstReviews[label]));

/** what every product without its own topics shows */
export const defaultReviewTopics = reviewTopicSet();

/** AI summary bullets for products that have none of their own */
export const defaultAiSummary = [
  'Customers praise the build quality and the finish.',
  'Most buyers say it is good value for the price.',
  'Some find the size and weight take a little getting used to.',
  'A few reviews mention small issues out of the box.',
];
