/** Storefront pricing & display helpers */

export function getDisplayMrp(sellingPrice: number, costPrice?: number | null): number {
  const price = Number(sellingPrice);
  if (costPrice && costPrice > price) {
    return Math.ceil(costPrice * 1.15);
  }
  return Math.ceil(price * 1.32);
}

export function getDiscountPercent(sellingPrice: number, mrp: number): number {
  const price = Number(sellingPrice);
  if (mrp <= price) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}

/** Stable pseudo-rating from product id (3.6 – 4.9) */
export function getProductRating(productId: string): { rating: number; reviews: number } {
  let hash = 0;
  for (let i = 0; i < productId.length; i++) {
    hash = (hash << 5) - hash + productId.charCodeAt(i);
    hash |= 0;
  }
  const rating = 3.6 + (Math.abs(hash) % 14) / 10;
  const reviews = 12 + (Math.abs(hash >> 4) % 2800);
  return { rating: Math.round(rating * 10) / 10, reviews };
}

export function getDiscountSortValue(price: number, costPrice?: number | null): number {
  const mrp = getDisplayMrp(price, costPrice);
  return getDiscountPercent(price, mrp);
}
