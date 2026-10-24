# Data layer

Everything a screen shows comes from here; screens and components are templates that render it. Flows and components
import from `src/data` (`import { getProduct, products, currency } from '../../data'`), a flow's copy from
`src/data/copy/<flow>` and what a screen renders from `src/data/views/<flow>`. The PDP is fully on this model; the other
flows still keep their copy and layout feeds in their own `data.ts` until they are moved the same way.

```
src/data/
  products/<id>/       one folder per product
    product.ts         the card: export default defineProduct({ … })
    content.ts         the product page: export default defineContent({ … })  (description, specs, reviews, seller, offers …)
    card.webp          card / first image   (optional; emoji + tint are the fallback)
    gallery-1.webp …   more gallery images  (optional)
  families/<family>.ts content a variant family shares (page text, reviews, AI summary, swatches): defineFamily({ … })
  catalog.ts           finds every product folder, attaches photos; products, getProduct, productById, listProducts
  content.ts           finds every content.ts and family file; productContent(product), familyContent, fbtFor
  promotions.ts        noon-wide offers (bank cards) every product page shows
  copy/<flow>.ts       every label, heading and message of a flow's screens (copy/pdp.ts)
  views/<flow>.ts      what a flow's screens render, assembled from the above (views/pdp.ts → pdpView(product))
  types.ts             Product, ProductContent, FamilyContent, ProductReview, SellerInfo, …
  categories.ts        noon taxonomy (categoryById, categoryPath) + the category tiles
  variants.ts          variant families (iPhone 17 Pro matrix)
  users.ts             the signed-in demo user
  money.ts · format.ts currency (dirham sign U+E001), formatPrice, discountPct · money, abbreviate, score, discountPercent
```

Rules: data says what something *is* (a seller metric has `tone: 'positive'`, a warranty USP an icon *meaning*), never how
it looks (no colours, no Origin icon names, no layout). A field the data doesn't have stays empty and its section hides;
nothing invents filler. Content you write for the prototype is marked `source: { kind: 'written' }`; content copied
from noon.com is `kind: 'captured'` with its date.

## Add a product

1. Create `src/data/products/<id>/product.ts`. Use the noon SKU as the id for real products (`N…V`, `Z…Z`) and a
   readable slug for invented ones. The folder name must equal `id`.

   ```ts
   import { defineProduct } from '../../define';

   export default defineProduct({
     id: 'N70999999V',
     brand: 'Apple',
     title: 'AirPods 4 with Active Noise Cancellation',
     price: 699,
     was: 799,
     rating: 4.6,
     ratingCount: 1820,
     emoji: '🎧',
     tint: '#EEF2F8', // token-lint-ignore: mock catalog data (product tint / swatch)
     express: true,
     delivery: 'Get it <b>Tomorrow</b>',
     category: 'Electronics',
     categoryId: 'headphones', // optional: a taxonomy id (categories.ts) → breadcrumb
     collection: 'demo',       // demo | live | home | phones | orders
   });
   ```
2. Put its photos next to it: `card.webp` (and `gallery-1.webp`, `gallery-2.webp`, …) at about 3× display size, then
   run `npm run assets:optimize`. The catalogue attaches them as `image` / `images`. No import lines needed.
3. Write its product page in `src/data/products/<id>/content.ts` (`defineContent`, type `ProductContent`; reference
   `N70211593V/content.ts`). Every field is optional and a missing one hides its PDP section. Mark it
   `source: { kind: 'written' }` unless it was captured from noon.com. A variant family's shared text and reviews go in
   `src/data/families/<family>.ts`.
4. The product now appears in its collection's list (`products` for demo / live / home, `phoneProducts`,
   `orderProducts`) and `getProduct('<id>')` finds it. Open it at `/pdp?productId=<id>`.

`order` sets the position in its list (existing products keep the positions they had; new ones without `order` go
last). `getProduct` returns `undefined` for an unknown id; `productById` falls back to the first product and warns in
dev, so typos are visible.

`src/mocks/products.ts`, `phones.ts` and `categories.ts` re-export from here so old imports and the package's public
names keep working.
