import { memo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Star, ShoppingCart, Minus, Plus, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { Product, Variant } from '@/lib/types';
import { formatCurrency, cn } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
  index?: number;
  className?: string;
}

const ProductCard = memo(function ProductCard({ product, index = 0, className }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const isOnSale = !!product.salePrice;
  const discount = product.salePrice
    ? Math.round((1 - product.salePrice / product.price) * 100)
    : 0;

  const hasVariants = product.variants.length > 0;
  const variantTypes = Array.from(new Set(product.variants.map((v) => v.type)));
  const variantGroups = variantTypes.map((type) => ({
    type,
    values: product.variants.filter((v) => v.type === type),
  }));

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({ productId: product.id, quantity: 1 });
    toast.success(`${product.name} added to cart`);
  };

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

            {product.stock > 0 && (
              hasVariants ? (
                <VariantPopover
                  product={product}
                  variantGroups={variantGroups}
                  onAdd={(variant, quantity) => {
                    addItem({ productId: product.id, quantity, variant });
                    toast.success(`${product.name} added to cart`);
                  }}
                />
              ) : (
                <Button
                  size="sm"
                  className="h-8 px-3 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={handleQuickAdd}
                >
                  <ShoppingCart className="w-3.5 h-3.5 mr-1" strokeWidth={1.5} />
                  Add
                </Button>
              )
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
});

function VariantPopover({
  product,
  variantGroups,
  onAdd,
}: {
  product: Product;
  variantGroups: { type: string; values: Variant[] }[];
  onAdd: (variant: { type: string; value: string } | undefined, quantity: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);

  const allSelected = variantGroups.every((g) => selected[g.type]);
  const primaryType = variantGroups[0]?.type ?? 'option';
  const primaryValue = selected[primaryType];

  const handleSelect = (type: string, value: string) => {
    setSelected((prev) => ({ ...prev, [type]: value }));
  };

  const handleConfirm = () => {
    if (!allSelected) return;
    const variant =
      variantGroups.length === 1
        ? { type: primaryType, value: primaryValue }
        : undefined;
    onAdd(variant, quantity);
    setOpen(false);
    setSelected({});
    setQuantity(1);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          size="sm"
          className="h-8 px-3 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.preventDefault()}
        >
          <ShoppingCart className="w-3.5 h-3.5 mr-1" strokeWidth={1.5} />
          Add
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72">
        <div className="space-y-3">
          <div>
            <p className="text-sm font-semibold leading-tight line-clamp-1">{product.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {formatCurrency(product.salePrice ?? product.price)}
            </p>
          </div>

          <Separator />

          {variantGroups.map((group) => (
            <div key={group.type}>
              <p className="text-xs font-semibold mb-1.5 capitalize">
                {group.type}
                {selected[group.type] && (
                  <span className="ml-1.5 text-muted-foreground font-normal">— {selected[group.type]}</span>
                )}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {group.values.map((v) => (
                  <button
                    key={v.value}
                    type="button"
                    disabled={!v.available}
                    onClick={() => handleSelect(group.type, v.value)}
                    className={cn(
                      'min-w-[2rem] h-8 px-2.5 text-xs rounded-lg border transition-all flex items-center justify-center gap-1',
                      !v.available && 'opacity-40 cursor-not-allowed line-through',
                      selected[group.type] === v.value
                        ? 'border-primary bg-primary/10 text-primary font-medium'
                        : 'border-input hover:border-foreground/30'
                    )}
                  >
                    {selected[group.type] === v.value && (
                      <Check className="w-3 h-3" strokeWidth={2.5} />
                    )}
                    {v.value}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <Separator />

          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold">Quantity</p>
            <div className="flex items-center border rounded-lg">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-7 h-7 flex items-center justify-center hover:bg-accent transition-colors rounded-l-lg"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-8 text-center text-xs font-mono font-medium">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                className="w-7 h-7 flex items-center justify-center hover:bg-accent transition-colors rounded-r-lg"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          <Button
            size="sm"
            className="w-full"
            onClick={handleConfirm}
            disabled={!allSelected}
          >
            <ShoppingCart className="w-3.5 h-3.5 mr-1.5" strokeWidth={1.5} />
            {allSelected ? 'Add to cart' : 'Select options'}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function Separator() {
  return <div className="h-px bg-border" />;
}

export default ProductCard;