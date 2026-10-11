import type { Product } from './products';
import img_n70211914v from '../assets/products/phones/card-n70211914v.webp';
import img_n70338936v from '../assets/products/phones/card-n70338936v.webp';
import img_n70211946v from '../assets/products/phones/card-n70211946v.webp';
import img_n70013289v from '../assets/products/phones/card-n70013289v.webp';
import img_n70270098v from '../assets/products/phones/card-n70270098v.webp';
import img_n70270124v from '../assets/products/phones/card-n70270124v.webp';
import img_n70199709v from '../assets/products/phones/card-n70199709v.webp';
import img_n70312063v from '../assets/products/phones/card-n70312063v.webp';
import img_n70285186v from '../assets/products/phones/card-n70285186v.webp';
import img_n70208284v from '../assets/products/phones/card-n70208284v.webp';
import img_n70137875v from '../assets/products/phones/card-n70137875v.webp';
import img_n70350067v from '../assets/products/phones/card-n70350067v.webp';
import img_n70176926v from '../assets/products/phones/card-n70176926v.webp';
import img_n70190662v from '../assets/products/phones/card-n70190662v.webp';
import img_n70375831v from '../assets/products/phones/card-n70375831v.webp';
import img_n70388999v from '../assets/products/phones/card-n70388999v.webp';
import img_n70189143v from '../assets/products/phones/card-n70189143v.webp';
import img_n70250243v from '../assets/products/phones/card-n70250243v.webp';
import img_n70246224v from '../assets/products/phones/card-n70246224v.webp';
import img_n70223329v from '../assets/products/phones/card-n70223329v.webp';
import img_n70396290v from '../assets/products/phones/card-n70396290v.webp';
import img_n70397162v from '../assets/products/phones/card-n70397162v.webp';
import img_n70164932v from '../assets/products/phones/card-n70164932v.webp';
import img_n70389487v from '../assets/products/phones/card-n70389487v.webp';
import img_n70193813v from '../assets/products/phones/card-n70193813v.webp';
import img_n70380869v from '../assets/products/phones/card-n70380869v.webp';
import img_n70176681v from '../assets/products/phones/card-n70176681v.webp';
import img_n70289965v from '../assets/products/phones/card-n70289965v.webp';
import img_n70278162v from '../assets/products/phones/card-n70278162v.webp';
import img_n70278163v from '../assets/products/phones/card-n70278163v.webp';
import img_n70282196v from '../assets/products/phones/card-n70282196v.webp';
import img_n70396307v from '../assets/products/phones/card-n70396307v.webp';
import img_n70405323v from '../assets/products/phones/card-n70405323v.webp';
import img_n70367024v from '../assets/products/phones/card-n70367024v.webp';
import img_n70320482v from '../assets/products/phones/card-n70320482v.webp';
import img_n70340018v from '../assets/products/phones/card-n70340018v.webp';
import img_n70219733v from '../assets/products/phones/card-n70219733v.webp';
import img_n70396372v from '../assets/products/phones/card-n70396372v.webp';
import img_n70396391v from '../assets/products/phones/card-n70396391v.webp';
import img_n70311978v from '../assets/products/phones/card-n70311978v.webp';
import img_n70367004v from '../assets/products/phones/card-n70367004v.webp';
import img_n70085256v from '../assets/products/phones/card-n70085256v.webp';
import img_n70307986v from '../assets/products/phones/card-n70307986v.webp';
import img_n70250224v from '../assets/products/phones/card-n70250224v.webp';
import img_n70204598v from '../assets/products/phones/card-n70204598v.webp';
import img_n70357052v from '../assets/products/phones/card-n70357052v.webp';
import img_n70370255v from '../assets/products/phones/card-n70370255v.webp';
import img_n70345592v from '../assets/products/phones/card-n70345592v.webp';

/**
 * Phones by brand for the PLP brand widget ("Shop phones by brand"): four live listings per brand from
 * noon.com/uae-en search hits (captured 2026-10-05 for github.com/saswata2002/Brand-Widget-PLP; name, sale
 * price, rating, review count, "Lowest price" nudge). Apple and Samsung phones already live in products.ts.
 * Images: src/assets/products/phones (f.nooncdn.com, 320w cards).
 */
const phone = ({ low, ...p }: Pick<Product, 'id' | 'brand' | 'title' | 'price' | 'rating' | 'ratingCount' | 'image'> & { low?: string }): Product => ({
  ...p,
  sku: p.id,
  emoji: '📱',
  tint: '#F2F3F7', // token-lint-ignore: mock catalog data (product tint / swatch)
  images: p.image ? [p.image] : undefined,
  express: true,
  delivery: 'Get it <b>Tomorrow</b>',
  category: 'Mobiles',
  categoryId: 'smartphones',
  seller: 'noon',
  freeDelivery: true,
  nudges: [low ? { text: low, kind: 'lowestPrice' } : { text: 'Free Delivery', kind: 'freeDelivery' }],
});

export const phoneProducts: Product[] = [
  phone({ id: "N70211914V", brand: "Google", title: "Google Pixel 10 Pro Dual SIM 5G Jade 16GB RAM 256GB - International Version", price: 3698.95, rating: 5, ratingCount: 1, image: img_n70211914v }),
  phone({ id: "N70338936V", brand: "Google", title: "Google Pixel 10a 5G – Lavender | 8GB RAM, 256GB Storage - International Version", price: 1959.65, rating: 4.6, ratingCount: 11, image: img_n70338936v }),
  phone({ id: "N70211946V", brand: "Google", title: "Google Pixel 10 Pro Fold Dual SIM 5G Moonstone 16GB RAM 256GB - International Version", price: 4739.15, rating: 5, ratingCount: 3, image: img_n70211946v, low: "Lowest price in 30 days" }),
  phone({ id: "N70013289V", brand: "Google", title: "Google Pixel 8 Obsidian 8GB RAM 256GB 5G - International Version", price: 1799, rating: 3.4, ratingCount: 5, image: img_n70013289v, low: "Lowest price in a year" }),
  phone({ id: "N70270098V", brand: "Xiaomi", title: "Xiaomi Redmi Note 15 Pro Dual SIM 5G Glacier Blue 8GB RAM 256GB - Global Version", price: 1059, rating: 4.5, ratingCount: 484, image: img_n70270098v, low: "Lowest price in 7 days" }),
  phone({ id: "N70270124V", brand: "Xiaomi", title: "Xiaomi Redmi Note 15 Dual SIM 4G Black 8G RAM 256GB - Global Version", price: 799, rating: 4.4, ratingCount: 535, image: img_n70270124v }),
  phone({ id: "N70199709V", brand: "Xiaomi", title: "Xiaomi Redmi 15 5G Dual SIM Ripple Green 8GB RAM 256GB - Global Version", price: 948.9, rating: 4.3, ratingCount: 2582, image: img_n70199709v }),
  phone({ id: "N70312063V", brand: "Xiaomi", title: "Xiaomi REDMI A7 Pro Black 4GB RAM 64GB ROM 4G - Global Version", price: 389, rating: 4.2, ratingCount: 420, image: img_n70312063v }),
  phone({ id: "N70285186V", brand: "Honor", title: "Honor Magic8 Pro 5G Dual SIM 12GB RAM 512GB ROM Black - International Version", price: 3299, rating: 5, ratingCount: 1, image: img_n70285186v, low: "Lowest price in a year" }),
  phone({ id: "N70208284V", brand: "Honor", title: "Honor Magic V5 Dual SIM 5G Ivory White 16GB 512GB - International Version", price: 4199, rating: 4.5, ratingCount: 58, image: img_n70208284v, low: "Lowest price in 30 days" }),
  phone({ id: "N70137875V", brand: "Honor", title: "Honor Magic7 Pro Dual SIM Black 12GB RAM 512 GB 5G - Middle East Version", price: 2839, rating: 4.4, ratingCount: 246, image: img_n70137875v }),
  phone({ id: "N70350067V", brand: "Honor", title: "Honor 600 Pro 5G Dual SIM 12GB RAM 512GB Orange - Middle East Version", price: 2646, rating: 4.5, ratingCount: 2857, image: img_n70350067v, low: "Lowest price in 30 days" }),
  phone({ id: "N70176926V", brand: "OnePlus", title: "OnePlus 13s Dual SIM Black Velvet with AI 16GB RAM 512GB 5G - Indian Version", price: 2149, rating: 4.3, ratingCount: 223, image: img_n70176926v }),
  phone({ id: "N70190662V", brand: "OnePlus", title: "OnePlus Nord CE5 Dual SIM Marble Mist 8GB RAM 256GB 5G - International Version", price: 1049, rating: 4.3, ratingCount: 875, image: img_n70190662v }),
  phone({ id: "N70375831V", brand: "OnePlus", title: "OnePlus Nord CE6 Dual SIM Pitch Black 8GB RAM 256GB 5G - International Version", price: 1299, rating: 4.2, ratingCount: 100, image: img_n70375831v }),
  phone({ id: "N70388999V", brand: "OnePlus", title: "OnePlus N6 Dual SIM Midnight Green 4GB RAM 128GB 5G - International Version", price: 858.95, rating: 4.4, ratingCount: 6, image: img_n70388999v }),
  phone({ id: "N70189143V", brand: "HUAWEI", title: "HUAWEI Pura 80 Ultra Dual SIM Smartphone Prestige Gold 16GB RAM 512GB - Middle East Version", price: 3299, rating: 4.4, ratingCount: 68, image: img_n70189143v }),
  phone({ id: "N70250243V", brand: "HUAWEI", title: "HUAWEI Nova 14 Dual SIM Black 12GB RAM 256 GB with 100W HUAWEI SuperCharge Turbo - Middle East Version", price: 1099, rating: 4.6, ratingCount: 46, image: img_n70250243v }),
  phone({ id: "N70246224V", brand: "HUAWEI", title: "HUAWEI nova 14i Smartphone Dual SIM Black 8GB RAM 256GB - Middle East Version", price: 749, rating: 4, ratingCount: 285, image: img_n70246224v }),
  phone({ id: "N70223329V", brand: "HUAWEI", title: "HUAWEI Nova 14 Pro Dual SIM White 12GB 512GB 4G - Middle East Version", price: 1289, rating: 4.2, ratingCount: 37, image: img_n70223329v, low: "Lowest price in a year" }),
  phone({ id: "N70396290V", brand: "motorola", title: "motorola Edge 70 Pro Dual SIM 5.5G PANTONE Chicory Coffee 12GB RAM 512GB + 1 Year Screen Damage Protection - Middle East Version", price: 2499, rating: 4.7, ratingCount: 7, image: img_n70396290v }),
  phone({ id: "N70397162V", brand: "motorola", title: "motorola Edge 70 Max Dual SIM 5G PANTONE Dark Shadow 8GB RAM 256GB - Middle East Version", price: 1999, rating: 4.5, ratingCount: 8, image: img_n70397162v }),
  phone({ id: "N70164932V", brand: "motorola", title: "motorola Edge 60 Fusion 5G Dual SIM Pantone Amazonite(Blue) 12GB RAM 256GB - Middle East Version", price: 899, rating: 4.3, ratingCount: 2767, image: img_n70164932v, low: "Lowest price in 30 days" }),
  phone({ id: "N70389487V", brand: "motorola", title: "motorola G06 Dual SIM 4G PANTONE Laurel Oak 4GB RAM 64GB - Middle East Version", price: 486.2, rating: 4.4, ratingCount: 138, image: img_n70389487v }),
  phone({ id: "N70193813V", brand: "Nothing", title: "Nothing Phone 3 Dual SIM 5G Black 12GB RAM 256GB - Middle East Version", price: 2098, rating: 4.6, ratingCount: 13, image: img_n70193813v, low: "Lowest price in a year" }),
  phone({ id: "N70380869V", brand: "Nothing", title: "Nothing Phone (4b) Dual SIM 5G Black 8GB 128GB - Middle East Version", price: 1499, rating: 4.6, ratingCount: 193, image: img_n70380869v }),
  phone({ id: "N70176681V", brand: "Nothing", title: "Nothing Phone 3a Pro 5G Dual SIM Grey 12GB RAM 256GB - Middle East Version", price: 1449, rating: 4.4, ratingCount: 995, image: img_n70176681v }),
  phone({ id: "N70289965V", brand: "Nothing", title: "Nothing Phone 4a 5G Dual SIM White 12GB RAM 256GB - Middle East Version", price: 1799, rating: 4.6, ratingCount: 193, image: img_n70289965v, low: "Lowest price in 7 days" }),
  phone({ id: "N70278162V", brand: "OPPO", title: "OPPO A6x 5G Dual SIM Ice Blue 4GB RAM 128GB - Middle East Version", price: 799, rating: 4.3, ratingCount: 200, image: img_n70278162v }),
  phone({ id: "N70278163V", brand: "OPPO", title: "OPPO A6 5G Dual SIM Sapphire Blue 8GB RAM 256GB With Oppo Wired Earphones - Middle East Version", price: 1149, rating: 4.1, ratingCount: 81, image: img_n70278163v }),
  phone({ id: "N70282196V", brand: "OPPO", title: "OPPO A6t Dual SIM 5G Crystal Violet 6GB RAM 256GB - Middle East Version", price: 1099, rating: 4.7, ratingCount: 35, image: img_n70282196v }),
  phone({ id: "N70396307V", brand: "OPPO", title: "OPPO A2 5G Mobile Phone 12Gb(+4GB Extended RAM)+256Gb Violet Purple - Global Version", price: 788, rating: 5, ratingCount: 1, image: img_n70396307v }),
  phone({ id: "N70405323V", brand: "vivo", title: "vivo Y21 AI 5G Dual SIM Black 4GB RAM 128GB - Middle East Version", price: 649, rating: 4.4, ratingCount: 301, image: img_n70405323v }),
  phone({ id: "N70367024V", brand: "vivo", title: "vivo X300 FE 5G Dual SIM Black 12GB RAM 256GB With Exclusive Lens kit with vivo TWS Air And 24 Months Warranty + 1 Year Screen Replacement - Middle East Version", price: 3139, rating: 4.6, ratingCount: 132, image: img_n70367024v, low: "Lowest price in 30 days" }),
  phone({ id: "N70320482V", brand: "vivo", title: "vivo Y05 4G AI Dual SIM Black 4GB RAM 128GB With Exclusive Neckband - Middle East Version", price: 539, rating: 4.1, ratingCount: 37, image: img_n70320482v }),
  phone({ id: "N70340018V", brand: "vivo", title: "vivo V70 Dual SIM Dune Gray 12GB RAM 256GB 5G- Middle East Version", price: 2499, rating: 4.8, ratingCount: 4, image: img_n70340018v }),
  phone({ id: "N70219733V", brand: "TECNO", title: "TECNO POVA Slim 5G Dual SIM Cool Black 8GB RAM 256GB 5G - Middle East Version", price: 949, rating: 4.3, ratingCount: 2292, image: img_n70219733v }),
  phone({ id: "N70396372V", brand: "TECNO", title: "TECNO POVA 8 5G Dual Sim Graphite Black 8GB RAM 256 GB - Global version", price: 1399, rating: 5, ratingCount: 2, image: img_n70396372v }),
  phone({ id: "N70396391V", brand: "TECNO", title: "TECNO SPARK 50 5G Dual Sim TITANIUM GREY 4GB RAM 256GB - Global Version", price: 799, rating: 3.5, ratingCount: 4, image: img_n70396391v }),
  phone({ id: "N70311978V", brand: "TECNO", title: "TECNO Pova Curve 2 5G 12GB RAM 256GB Melting Silver - Middle East Version", price: 1599, rating: 3.9, ratingCount: 18, image: img_n70311978v }),
  phone({ id: "N70367004V", brand: "realme", title: "realme C100i 4G Dual SIM Dawn Purple 4GB RAM 128GB - Middle East Version", price: 529, rating: 4.1, ratingCount: 969, image: img_n70367004v }),
  phone({ id: "N70085256V", brand: "realme", title: "realme GT6 Dual SIM Fluid Silver 12+12GB RAM 256GB 5G - Middle East Version", price: 1750, rating: 4.5, ratingCount: 304, image: img_n70085256v }),
  phone({ id: "N70307986V", brand: "realme", title: "realme 16 Pro 5G Dual SIM 12GB RAM 256GB Pebble Grey - International Version", price: 1299, rating: 4.4, ratingCount: 267, image: img_n70307986v, low: "Lowest price in a year" }),
  phone({ id: "N70250224V", brand: "realme", title: "realme 15 5G AI Dual SIM Suit Titanium 12GB RAM 256GB - Middle East Version", price: 1049, rating: 4.3, ratingCount: 185, image: img_n70250224v, low: "Lowest price in 7 days" }),
  phone({ id: "N70204598V", brand: "Infinix", title: "Infinix Hot 60 Pro + Dual SIM Misty Violet 8+8GB RAM 256 GB 4G - Middle East Version", price: 880, rating: 4.4, ratingCount: 214, image: img_n70204598v }),
  phone({ id: "N70357052V", brand: "Infinix", title: "Infinix Smart 20 Dual SIM Sunlike Orange 8GB(4+4)RAM 128GB 4G LTE- Middle East Version", price: 520, rating: 4.3, ratingCount: 579, image: img_n70357052v }),
  phone({ id: "N70370255V", brand: "Infinix", title: "Infinix Note 60 Pro Dual SIM Solar Orange 8GB RAM 256GB 5G - Middle East Version", price: 1399, rating: 4.2, ratingCount: 91, image: img_n70370255v, low: "Lowest price in 7 days" }),
  phone({ id: "N70345592V", brand: "Infinix", title: "Infinix Note 60 5G Smartphone 8GB RAM 256GB Storage, Dual SIM Android Mobile Phone – Rose Gold", price: 1149, rating: 4.3, ratingCount: 33, image: img_n70345592v }),
];
