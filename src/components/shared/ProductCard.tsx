import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Star, ShoppingCart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Product } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { useAppDispatch } from '@/app/hooks';
import { addItem } from '@/features/cart/cartSlice';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
  index?: number;
  className?: string;
}

export default function ProductCard({ product, index = 0, className }: ProductCardProps) {
  const dispatch = useAppDispatch();
  const isOnSale = !!product.salePrice;
  const discount = product.salePrice
    ? Math.round((1 - product.salePrice / product.price) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch(addItem({ productId: product.id, quantity: 1 }));
    toast.success(`${product.name} added to cart`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className={cn('group', className)}
    >
      <Link to={`/products/${product.id}`} className="block">
        <div className="rounded-2xl border bg-card overflow-hidden transition-shadow hover:shadow-lg">
          {/* Image */}
          <div className="relative aspect-square overflow-hidden bg-muted">
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              {isOnSale && (
                <Badge variant="destructive" className="text-xs font-bold">
                  -{discount}%
                </Badge>
              )}
              {product.stock === 0 && (
                <Badge variant="secondary" className="text-xs">
                  Out of stock
                </Badge>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-2">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              {product.category}
            </p>
            <h3 className="font-medium text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
              {product.name}
            </h3>

            {/* Rating */}
            <div className="flex items-center gap-1.5">
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'w-3 h-3',
                      i < Math.round(product.rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'fill-muted text-muted'
                    )}
                    strokeWidth={0}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">
                {product.rating} ({product.reviewCount})
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-baseline gap-2">
                <span className="font-semibold text-base font-mono">
                  {formatCurrency(product.salePrice ?? product.price)}
                </span>
                {isOnSale && (
                  <span className="text-sm text-muted-foreground line-through font-mono">
                    {formatCurrency(product.price)}
                  </span>
                )}
              </div>

              {product.stock > 0 && (
                <Button
                  size="sm"
                  className="h-8 px-3 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="w-3.5 h-3.5" strokeWidth={1.5} />
                  Add
                </Button>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
