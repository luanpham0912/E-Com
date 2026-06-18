import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Star, ShoppingCart, Minus, Plus, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import ProductCard from '@/components/shared/ProductCard';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { addItem } from '@/features/cart/cartSlice';
import { fetchProduct } from '@/features/products/productsThunks';
import { formatCurrency, cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const products = useAppSelector((s) => s.products.items);
  const product = useMemo(() => products.find((p) => p.id === id), [products, id]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingProduct, setLoadingProduct] = useState(false);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description');

  // Fetch product from API if not in store yet (e.g. direct URL visit)
  useEffect(() => {
    let cancelled = false;
    if (id && !products.some((p) => p.id === id)) {
      setLoadingProduct(true);
      dispatch(fetchProduct(id))
        .unwrap()
        .catch(() => undefined)
        .finally(() => {
          if (!cancelled) setLoadingProduct(false);
        });
    }
    return () => {
      cancelled = true;
    };
  }, [id, products, dispatch]);

  useEffect(() => {
    let cancelled = false;
    if (id) {
      fetch(`/api/v1/products/${id}/reviews`, {
        headers: localStorage.getItem('auth_token')
          ? { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
          : {},
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((json) => {
          if (!cancelled && json?.data) setReviews(json.data as Review[]);
        })
        .catch(() => undefined);
    }
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Reset local state when navigating to a different product
  useEffect(() => {
    setSelectedImage(0);
    setSelectedVariants({});
    setQuantity(1);
  }, [id]);

  useEffect(() => {
    if (product) {
      document.title = `${product.name} — Store`;
    }
  }, [product]);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-24 text-center">
        <p className="text-muted-foreground">
          {loadingProduct ? 'Loading product...' : 'Product not found.'}
        </p>
        <Link to="/shop" className="text-primary hover:underline mt-2 block">
          Back to shop
        </Link>
      </div>
    );
  }

  const isOnSale = !!product.salePrice;
  const productReviews = reviews.filter((r) => r.productId === product.id);
  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleAddToCart = () => {
    const variants = Object.entries(selectedVariants).map(([type, value]) => ({
      type,
      value,
    }));
    dispatch(addItem({ productId: product.id, quantity, variant: variants[0] }));
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link to="/shop" className="hover:text-foreground transition-colors">Shop</Link>
        <ChevronRight className="w-3 h-3" />
        <Link to={`/shop?category=${encodeURIComponent(product.category)}`} className="hover:text-foreground transition-colors">
          {product.category}
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground font-medium truncate">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-12 mb-24">
        {/* Gallery */}
        <div className="space-y-4">
          <motion.div
            key={selectedImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="aspect-square rounded-3xl overflow-hidden bg-muted"
          >
            <img
              src={product.images[selectedImage]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </motion.div>
          {product.images.length > 1 && (
            <div className="flex gap-3">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={cn(
                    'w-20 h-20 rounded-xl overflow-hidden border-2 transition-all',
                    selectedImage === i ? 'border-primary' : 'border-transparent hover:border-muted'
                  )}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-6">
          <div>
            <Badge variant="outline" className="mb-3">{product.category}</Badge>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{product.name}</h1>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'w-4 h-4',
                    i < Math.round(product.rating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'fill-muted text-muted'
                  )}
                  strokeWidth={0}
                />
              ))}
            </div>
            <span className="font-medium text-sm">{product.rating}</span>
            <span className="text-muted-foreground text-sm">({product.reviewCount} reviews)</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold font-mono">
              {formatCurrency(product.salePrice ?? product.price)}
            </span>
            {isOnSale && (
              <span className="text-xl text-muted-foreground line-through font-mono">
                {formatCurrency(product.price)}
              </span>
            )}
            {isOnSale && (
              <Badge variant="destructive">
                Save {Math.round((1 - (product.salePrice ?? 0) / product.price) * 100)}%
              </Badge>
            )}
          </div>

          <p className="text-muted-foreground leading-relaxed">{product.description}</p>

          {/* Variants */}
          {Object.entries(
            product.variants.reduce<Record<string, typeof product.variants[0][]>>((acc, v) => {
              if (!acc[v.type]) acc[v.type] = [];
              acc[v.type].push(v);
              return acc;
            }, {})
          ).map(([type, variantGroup]) => (
            <div key={type}>
              <p className="text-sm font-semibold mb-3 capitalize">{type}</p>
              <div className="flex flex-wrap gap-2">
                {variantGroup.map((v) => (
                  <button
                    key={v.value}
                    disabled={!v.available}
                    onClick={() => setSelectedVariants((prev) => ({ ...prev, [v.type]: v.value }))}
                    className={cn(
                      'px-4 py-2 text-sm rounded-xl border transition-all',
                      !v.available && 'opacity-40 cursor-not-allowed line-through',
                      selectedVariants[type] === v.value
                        ? 'border-primary bg-primary/10 text-primary font-medium'
                        : 'border-input hover:border-foreground/30'
                    )}
                  >
                    {v.value}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Quantity */}
          <div>
            <p className="text-sm font-semibold mb-3">Quantity</p>
            <div className="flex items-center gap-3">
              <div className="flex items-center border rounded-xl">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center hover:bg-accent transition-colors"
                >
                  <Minus className="w-4 h-4" strokeWidth={1.5} />
                </button>
                <span className="w-12 text-center font-mono font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="w-10 h-10 flex items-center justify-center hover:bg-accent transition-colors"
                >
                  <Plus className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>
              <span className="text-sm text-muted-foreground">{product.stock} in stock</span>
            </div>
          </div>

          <Separator />

          <Button
            size="lg"
            className="w-full gap-2"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            <ShoppingCart className="w-5 h-5" strokeWidth={1.5} />
            {product.stock === 0 ? 'Out of stock' : 'Add to cart'}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div>
        <div className="flex gap-6 border-b">
          {(['description', 'reviews'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'pb-3 text-sm font-medium border-b-2 transition-colors capitalize',
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              {tab} {tab === 'reviews' && `(${productReviews.length})`}
            </button>
          ))}
        </div>

        <div className="py-8">
          {activeTab === 'description' ? (
            <div className="max-w-2xl">
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <Badge key={tag} variant="outline">{tag}</Badge>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6 max-w-2xl">
              {productReviews.length === 0 ? (
                <p className="text-muted-foreground">No reviews yet.</p>
              ) : (
                productReviews.map((review) => (
                  <div key={review.id} className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              'w-3 h-3',
                              i < review.rating ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted'
                            )}
                            strokeWidth={0}
                          />
                        ))}
                      </div>
                      <span className="font-medium text-sm">{review.userName}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{review.comment}</p>
                    <Separator />
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Related */}
      {relatedProducts.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold tracking-tight mb-8">You might also like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
