import { products } from '../../mocks/products';

export const recentSearches = [
  { id: 'r1', label: 'AirPods Pro', emoji: '🎧', tint: '#EEF2F8' }, // token-lint-ignore: per-item mock tint (server data)
  { id: 'r2', label: 'Running shoes', emoji: '👟', tint: '#F4F1EC' }, // token-lint-ignore: per-item mock tint (server data)
  { id: 'r3', label: 'Perfume men', emoji: '🧴', tint: '#F2EFEA' }, // token-lint-ignore: per-item mock tint (server data)
  { id: 'r4', label: 'PS5', emoji: '🎮', tint: '#EDF0F7' }, // token-lint-ignore: per-item mock tint (server data)
  { id: 'r5', label: 'Coffee machine', emoji: '☕️', tint: '#F3EEEA' }, // token-lint-ignore: per-item mock tint (server data)
  { id: 'r6', label: 'LEGO', emoji: '🏎️', tint: '#FBEEEE' }, // token-lint-ignore: per-item mock tint (server data)
];

export const trending = ['iphone 17', 'air fryer', 'samsung s25', 'perfumes', 'gaming chair', 'watch', 'sneakers', 'skincare'];

const terms = [
  ...products.map((p) => ({ text: `${p.brand} ${p.title.replace(/[()]/g, '').split(' ').slice(0, 3).join(' ')}`.toLowerCase(), category: p.category, product: p })),
  ...['airpods', 'airpods pro', 'air fryer', 'air purifier', 'apple watch', 'iphone 17 pro max', 'iphone case', 'samsung galaxy', 'sauvage dior', 'shoes for men', 'ps5 games', 'laptop bag', 'lego technic', 'espresso machine'].map(
    (t) => ({ text: t, category: undefined, product: undefined }),
  ),
];

export function suggest(q: string) {
  const s = q.trim().toLowerCase();
  if (!s) return [];
  return terms.filter((t) => t.text.includes(s)).slice(0, 8);
}
