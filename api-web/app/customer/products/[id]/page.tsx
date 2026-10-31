'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { LoadingScreen } from '@/components/customer/LoadingScreen';
import { ProductMedia } from '@/components/customer/marketplace/ProductMedia';
import { MarketplaceProductCard } from '@/components/customer/marketplace/MarketplaceProductCard';
import { useCart } from '@/contexts/CartContext';
import { useShopToast } from '@/contexts/ShopToastContext';
import { formatINR } from '@/lib/format';
import {
  getDiscountPercent,
  getDisplayMrp,
  getProductRating,
} from '@/lib/marketplace';

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  costPrice?: number | null;
  stock: number;
  sku: string;
  images: string[];
  isActive: boolean;
  category: { id: string; name: string };
};

type Related = {
  id: string;
  name: string;
  price: number;
  stock: number;
  costPrice?: number | null;
  images?: string[];
  category: { id: string; name: string };
};

export default function CustomerProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  const { addToCart } = useCart();
  const { showToast } = useShopToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Related[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState('110001');
  const [activeImage, setActiveImage] = useState(0);
  const [wishlisted, setWishlisted] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [productRes, allRes, wishRes] = await Promise.all([
          fetch(`/api/products/${productId}`),
          fetch('/api/products'),
          fetch('/api/wishlist'),
        ]);
        const productData = await productRes.json();
        const allData = await allRes.json();
        const wishData = await wishRes.json();

        if (!productRes.ok || !productData.product) {
          router.push('/customer/products');
          return;
        }

        setProduct(productData.product);
        const list: Related[] = allData.products ?? [];
        setRelated(
          list
            .filter(
              (p: Related) =>
                p.id !== productId &&
                p.category?.id === productData.product.category?.id
            )
            .slice(0, 6)
        );
        const ids = (wishData.items ?? []).map((i: { productId: string }) => i.productId);
        setWishlisted(ids.includes(productId));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [productId, router]);

  const gallery = useMemo(() => {
    if (!product?.images?.length) return [];
    return product.images.filter((u) => u?.trim());
  }, [product]);

  const mrp = product ? getDisplayMrp(Number(product.price), product.costPrice) : 0;
  const discount = product ? getDiscountPercent(Number(product.price), mrp) : 0;
  const { rating, reviews } = product ? getProductRating(product.id) : { rating: 0, reviews: 0 };
  const inStock = product ? product.stock > 0 && product.isActive : false;

  const addItem = (qty: number) => {
    if (!product || !inStock) return;
    addToCart({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      quantity: qty,
      stock: product.stock,
      image: product.images?.[0],
    });
  };

  const handleAddToCart = () => {
    addItem(quantity);
    showToast(`Added to cart (${quantity})`);
  };

  const handleBuyNow = () => {
    addItem(quantity);
    router.push('/customer/cart');
  };

  const toggleWishlist = async () => {
    if (!product) return;
    try {
      if (wishlisted) {
        const res = await fetch(`/api/wishlist/${product.id}`, { method: 'DELETE' });
        if (res.ok) {
          setWishlisted(false);
          showToast('Removed from wishlist');
        }
      } else {
        const res = await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: product.id }),
        });
        const data = await res.json();
        if (res.ok) {
          setWishlisted(true);
          showToast(data.message || 'Saved to wishlist');
        } else {
          showToast(data.error || 'Could not save', 'error');
        }
      }
    } catch {
      showToast('Wishlist update failed', 'error');
    }
  };

  if (loading) return <LoadingScreen message="Loading product..." />;
  if (!product) return null;

  return (
    <div className="space-y-3">
      <nav className="text-xs text-slate-500 px-1">
        <Link href="/customer/dashboard" className="hover:text-[#2563eb]">Home</Link>
        <span className="mx-1">›</span>
        <Link href="/customer/products" className="hover:text-[#2563eb]">Products</Link>
        <span className="mx-1">›</span>
        <span className="text-slate-700">{product.category.name}</span>
      </nav>

      <div className="store-panel">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-6 p-4 sm:p-6">
          <div className="lg:col-span-5">
            <div className="border border-slate-100 rounded-sm p-4 mb-3">
              <ProductMedia
                name={product.name}
                categoryName={product.category.name}
                images={gallery.length ? [gallery[activeImage] ?? gallery[0]] : null}
                className="aspect-square max-h-[360px] w-full"
                emojiClassName="text-7xl"
              />
            </div>
            {gallery.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {gallery.map((img, i) => (
                  <button
                    key={img + i}
                    type="button"
                    onClick={() => setActiveImage(i)}
                    className={`shrink-0 w-14 h-14 border rounded-sm overflow-hidden ${
                      activeImage === i ? 'border-[#2563eb] ring-1 ring-[#2563eb]' : 'border-slate-200'
                    }`}
                  >
                    <ProductMedia
                      name=""
                      categoryName={product.category.name}
                      images={[img]}
                      className="w-14 h-14"
                      emojiClassName="text-xl"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-7 pt-2 lg:pt-0">
            <h1 className="text-lg sm:text-xl font-medium text-slate-800 leading-snug">
              {product.name}
            </h1>

            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-0.5 rounded-sm bg-[#388e3c] px-2 py-0.5 text-xs font-bold text-white">
                {rating} ★
              </span>
              <span className="text-xs text-slate-500">
                {reviews.toLocaleString('en-IN')} Ratings &amp; Reviews
              </span>
              <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-[#2563eb]">
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3z" />
                </svg>
                Assured
              </span>
            </div>

            <div className="mt-4 flex items-baseline gap-2 flex-wrap">
              <span className="text-3xl font-medium text-slate-900 tabular-nums">
                {formatINR(product.price)}
              </span>
              {discount > 0 && (
                <>
                  <span className="text-sm text-slate-400 line-through tabular-nums">
                    {formatINR(mrp)}
                  </span>
                  <span className="text-sm font-semibold text-[#388e3c]">{discount}% off</span>
                </>
              )}
            </div>

            <div className="mt-4 rounded-sm border border-slate-100 bg-slate-50/80 p-3 text-sm">
              <p className="font-semibold text-slate-800 mb-1">Available offers</p>
              <ul className="space-y-1 text-slate-600 text-xs sm:text-sm">
                <li>🏷️ Bank Offer: 5% instant discount on select cards</li>
                <li>🚚 Free delivery on orders above ₹499</li>
                {discount > 0 && <li>💰 Special price — limited time deal</li>}
              </ul>
            </div>

            <div className="mt-4 flex flex-wrap items-end gap-2">
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">
                  Delivery pincode
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-28 rounded-sm border border-slate-300 px-2 py-1.5 text-sm focus:border-[#2563eb] focus:outline-none"
                />
              </div>
              {pincode.length === 6 && (
                <p className="text-xs text-[#388e3c] font-medium pb-1.5">
                  ✓ Delivery by Tomorrow, {formatINR(0)} — Free
                </p>
              )}
            </div>

            <p className="mt-2 text-xs text-slate-500">
              {inStock ? (
                <span className="text-[#388e3c] font-semibold">{product.stock} in stock</span>
              ) : (
                <span className="text-red-600 font-semibold">Currently unavailable</span>
              )}
              {product.sku && <span className="ml-2">· SKU: {product.sku}</span>}
            </p>

            {inStock && (
              <div className="mt-4 flex items-center gap-3">
                <span className="text-sm font-medium text-slate-700">Qty</span>
                <div className="flex items-center border border-slate-300 rounded-sm">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-1.5 text-lg text-slate-600 hover:bg-slate-50"
                  >
                    −
                  </button>
                  <span className="min-w-[2rem] text-center text-sm font-medium">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    disabled={quantity >= product.stock}
                    className="px-3 py-1.5 text-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <div className="mt-5 flex flex-col sm:flex-row gap-3 max-w-md">
              <button
                type="button"
                disabled={!inStock}
                onClick={handleAddToCart}
                className="flex-1 rounded-sm border border-[#fb641b] bg-[#ff9f00] hover:bg-[#fb641b] text-white py-3 text-sm font-semibold disabled:opacity-50 shadow-sm"
              >
                ADD TO CART
              </button>
              <button
                type="button"
                disabled={!inStock}
                onClick={handleBuyNow}
                className="flex-1 rounded-sm bg-[#fb641b] hover:bg-[#e85a17] text-white py-3 text-sm font-semibold disabled:opacity-50 shadow-sm"
              >
                BUY NOW
              </button>
            </div>

            <button
              type="button"
              onClick={toggleWishlist}
              className="mt-3 text-sm font-semibold text-[#2563eb] hover:underline"
            >
              {wishlisted ? '♥ Saved in wishlist' : '♡ Add to wishlist'}
            </button>
          </div>
        </div>
      </div>

      <section className="store-panel p-4 sm:p-5">
        <h2 className="text-base font-semibold text-slate-800 border-b border-slate-100 pb-2 mb-3">
          Product Details
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          {product.description || 'No description available for this product.'}
        </p>
        <dl className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <div>
            <dt className="text-slate-500 text-xs">Category</dt>
            <dd className="font-medium text-slate-800">{product.category.name}</dd>
          </div>
          <div>
            <dt className="text-slate-500 text-xs">Warranty</dt>
            <dd className="font-medium text-slate-800">1 Year</dd>
          </div>
          <div>
            <dt className="text-slate-500 text-xs">Return</dt>
            <dd className="font-medium text-slate-800">7 Days</dd>
          </div>
          <div>
            <dt className="text-slate-500 text-xs">Seller</dt>
            <dd className="font-medium text-slate-800">TryenoOne Retail</dd>
          </div>
        </dl>
      </section>

      {related.length > 0 && (
        <section className="store-panel overflow-hidden">
          <h2 className="text-base font-medium text-slate-800 px-4 py-3 border-b border-slate-100">
            Similar products
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 p-3 sm:p-4">
            {related.map((p) => (
              <div key={p.id} className="bg-white">
                <MarketplaceProductCard
                  id={p.id}
                  name={p.name}
                  price={Number(p.price)}
                  stock={p.stock}
                  categoryName={p.category.name}
                  costPrice={p.costPrice != null ? Number(p.costPrice) : null}
                  images={p.images}
                  compact
                />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
