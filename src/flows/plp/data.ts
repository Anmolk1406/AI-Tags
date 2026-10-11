import { products, type Product } from '../../mocks/products';

export type SortId = 'recommended' | 'priceAsc' | 'priceDesc' | 'rating' | 'new' | 'discount';

export const sortOptions: { id: SortId; label: string }[] = [
  { id: 'recommended', label: 'Recommended' },
  { id: 'priceAsc', label: 'Price: Low to High' },
  { id: 'priceDesc', label: 'Price: High to Low' },
  { id: 'rating', label: 'Best Rated' },
  { id: 'new', label: 'New Arrivals' },
  { id: 'discount', label: 'Biggest Discount' },
];

export type FacetId = 'category' | 'brand' | 'price' | 'rating' | 'delivery';

export interface Facet {
  id: FacetId;
  label: string;
  options: { id: string; label: string; test: (p: Product) => boolean }[];
}

const uniq = <T,>(a: T[]) => [...new Set(a)];

export const facets: Facet[] = [
  { id: 'category', label: 'Category', options: uniq(products.map((p) => p.category)).map((c) => ({ id: c, label: c, test: (p) => p.category === c })) },
  { id: 'brand', label: 'Brand', options: uniq(products.map((p) => p.brand)).map((b) => ({ id: b, label: b, test: (p) => p.brand === b })) },
  {
    id: 'price',
    label: 'Price',
    options: [
      { id: 'u500', label: 'Under  500', test: (p) => p.price < 500 },
      { id: '500-1500', label: ' 500 – 1,500', test: (p) => p.price >= 500 && p.price <= 1500 },
      { id: 'o1500', label: 'Over  1,500', test: (p) => p.price > 1500 },
    ],
  },
  {
    id: 'rating',
    label: 'Product Rating',
    options: [
      { id: '4.5', label: '4.5 & above', test: (p) => p.rating >= 4.5 },
      { id: '4', label: '4 & above', test: (p) => p.rating >= 4 },
    ],
  },
  { id: 'delivery', label: 'Delivery Mode', options: [{ id: 'express', label: 'express', test: (p) => !!p.express }] },
];

export type Filters = Partial<Record<FacetId, string[]>>;

export function applyFilters(list: Product[], filters: Filters) {
  return list.filter((p) =>
    facets.every((f) => {
      const sel = filters[f.id];
      if (!sel?.length) return true;
      return f.options.filter((o) => sel.includes(o.id)).some((o) => o.test(p));
    }),
  );
}

export function applySort(list: Product[], sort: SortId) {
  const l = [...list];
  const off = (p: Product) => (p.was ? (p.was - p.price) / p.was : 0);
  switch (sort) {
    case 'priceAsc':
      return l.sort((a, b) => a.price - b.price);
    case 'priceDesc':
      return l.sort((a, b) => b.price - a.price);
    case 'rating':
      return l.sort((a, b) => b.rating - a.rating);
    case 'new':
      return l.reverse();
    case 'discount':
      return l.sort((a, b) => off(b) - off(a));
    default:
      return l;
  }
}

/** Narrow the catalogue by query when it matches something, otherwise show everything (demo). */
export function searchProducts(query?: string) {
  const q = query?.trim().toLowerCase();
  if (!q) return products;
  const hit = products.filter((p) => `${p.brand} ${p.title} ${p.category}`.toLowerCase().includes(q));
  return hit.length >= 2 ? hit : products;
}

export const countFilters = (f: Filters) => Object.values(f).reduce((n, v) => n + (v?.length ?? 0), 0);
