import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAppSelector } from '@/app/hooks';
import { useAppDispatch } from '@/app/hooks';
import { removeItem, updateQuantity } from '@/features/cart/cartSlice';
import { formatCurrency } from '@/lib/utils';
import { X, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';

export default function CartDrawer() {
  const items = useAppSelector((s) => s.cart.items);
  const products = useAppSelector((s) => s.products.items);
  const dispatch = useAppDispatch();

  const subtotal = items.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.productId);
    if (!product) return sum;
    const price = product.salePrice ?? product.price;
    return sum + price * item.quantity;
  }, 0);

  return (
    <Sheet>
      <SheetContent className="flex flex-col w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" strokeWidth={1.5} />
            Your Cart ({items.length})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <ShoppingBag className="w-8 h-8 text-muted-foreground" strokeWidth={1.5} />
            </div>
            <div>
              <p className="font-medium">Your cart is empty</p>
              <p className="text-sm text-muted-foreground mt-1">
                Add products to get started
              </p>
            </div>
            <Link to="/shop">
              <Button variant="outline" className="gap-2">
                Browse Products <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-auto py-6 space-y-4">
              {items.map((item) => {
                const product = products.find((p) => p.id === item.productId);
                if (!product) return null;
                const price = product.salePrice ?? product.price;

                return (
                  <motion.div
                    key={`${item.productId}-${item.variant?.value}`}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex gap-4"
                  >
                    <Link to={`/products/${product.id}`}>
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-20 h-20 rounded-xl object-cover bg-muted"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <Link
                            to={`/products/${product.id}`}
                            className="font-medium text-sm leading-snug line-clamp-2 hover:text-primary transition-colors"
                          >
                            {product.name}
                          </Link>
                          {item.variant && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {item.variant.type}: {item.variant.value}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() =>
                            dispatch(removeItem({ productId: item.productId, variant: item.variant }))
                          }
                          className="text-muted-foreground hover:text-destructive transition-colors p-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() =>
                              dispatch(
                                updateQuantity({
                                  productId: item.productId,
                                  quantity: item.quantity - 1,
                                  variant: item.variant,
                                })
                              )
                            }
                            className="w-7 h-7 rounded-lg border flex items-center justify-center hover:bg-accent transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium font-mono">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              dispatch(
                                updateQuantity({
                                  productId: item.productId,
                                  quantity: item.quantity + 1,
                                  variant: item.variant,
                                })
                              )
                            }
                            className="w-7 h-7 rounded-lg border flex items-center justify-center hover:bg-accent transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="font-semibold font-mono text-sm">
                          {formatCurrency(price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="border-t pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold font-mono text-lg">{formatCurrency(subtotal)}</span>
              </div>
              <Separator />
              <Link to="/checkout" className="block">
                <Button className="w-full gap-2" size="lg">
                  Checkout
                  <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                </Button>
              </Link>
              <Link to="/cart" className="block">
                <Button variant="outline" className="w-full">
                  View Cart
                </Button>
              </Link>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
