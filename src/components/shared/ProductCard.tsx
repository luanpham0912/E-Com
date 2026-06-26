import { memo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Star} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Product } from '@/lib/types';
import { formatCurrency, cn } from '@/lib/utils';
interface ProductCardProps {
  product: Product;
  index?: number;
  className?: string;
}

const ProductCard = memo(function ProductCard({ product, index = 0, className }: ProductCardProps) {
  const isOnSale = !!product.salePrice;
  const discount = product.salePrice
    ? Math.round((1 - product.salePrice / product.price) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className={cn('group', className)}
    >
      <div className="rounded-2xl border bg-card overflow-hidden transition-shadow hover:shadow-lg">
        <Link to={`/products/${product.id}`} className="block">
          <div className="relative aspect-square overflow-hidden bg-muted">
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
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
        </Link>

        <div className="p-4 space-y-2">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
            {product.category}
          </p>
          <Link to={`/products/${product.id}`}>
            <h3 className="font-medium text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
          </Link>

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

          </div>
        </div>
      </div>
    </motion.div>
  );
});


export default ProductCard;