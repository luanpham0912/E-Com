import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Minus, Plus, X, ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import EmptyState from '@/components/shared/EmptyState';
import { useAppSelector, useAppDispatch } from '@/app/hooks';
import { removeItem, updateQuantity, clearCart } from '@/features/cart/cartSlice';
import { formatCurrency } from '@/lib/utils';
import { TAX_RATE } from '@/lib/constants';

export default function CartPage() {
  const { items } = useAppSelector((s) => s.cart);
  const products = useAppSelector((s) => s.products.items);
  const dispatch = useAppDispatch();

  type CartLine = {
    productId: string;
    quantity: number;
    variant?: { type: string; value: string };
    product: (typeof products)[number];
  };

  const cartProducts = items
    .map((item) => {
      const product = products.find((p) => p.id === item.productId);
      return product ? ({ ...item, product } as CartLine) : null;
    })
    .filter((line): line is CartLine => line !== null);

  const subtotal = cartProducts.reduce(
    (sum, item) => sum + (item.product.salePrice ?? item.product.price) * item.quantity,
    0
  );
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Shopping Cart</h1>

      {cartProducts.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="w-8 h-8" strokeWidth={1.5} />}
          title="Your cart is empty"
          description="Looks like you have not added anything to your cart yet."
          action={{ label: 'Start shopping', href: '/shop' }}
        />
      ) : (
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">{cartProducts.length} item{cartProducts.length !== 1 ? 's' : ''}</p>
              <Button variant="ghost" size="sm" className="text-destructive" onClick={() => dispatch(clearCart())}>
                Clear cart
              </Button>
            </div>

            {cartProducts.map((item) => (
              <motion.div
                key={`${item.productId}-${item.variant?.value}`}
                layout
                className="flex gap-4 p-4 rounded-2xl border bg-card"
              >
                <Link to={`/products/${item.productId}`}>
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-28 h-28 rounded-xl object-cover bg-muted"
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link
                        to={`/products/${item.productId}`}
                        className="font-medium hover:text-primary transition-colors"
                      >
                        {item.product.name}
                      </Link>
                      {item.variant && (
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {item.variant.type}: {item.variant.value}
                        </p>
                      )}
                      <p className="text-sm font-mono font-semibold mt-1">
                        {formatCurrency(item.product.salePrice ?? item.product.price)}
                      </p>
                    </div>
                    <button
                      onClick={() => dispatch(removeItem({ productId: item.productId, variant: item.variant }))}
                      className="text-muted-foreground hover:text-destructive transition-colors p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center border rounded-xl">
                      <button
                        onClick={() =>
                          dispatch(updateQuantity({ productId: item.productId, quantity: item.quantity - 1, variant: item.variant }))
                        }
                        className="w-8 h-8 flex items-center justify-center hover:bg-accent transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-10 text-center text-sm font-mono font-medium">{item.quantity}</span>
                      <button
                        onClick={() =>
                          dispatch(updateQuantity({ productId: item.productId, quantity: item.quantity + 1, variant: item.variant }))
                        }
                        className="w-8 h-8 flex items-center justify-center hover:bg-accent transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="font-semibold font-mono text-sm">
                      {formatCurrency((item.product.salePrice ?? item.product.price) * item.quantity)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Summary */}
          <div>
            <div className="rounded-2xl border bg-card p-6 sticky top-24">
              <h2 className="font-semibold text-lg mb-4">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-mono">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax ({(TAX_RATE * 100).toFixed(0)}%)</span>
                  <span className="font-mono">{formatCurrency(tax)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span className="font-mono">{formatCurrency(total)}</span>
                </div>
              </div>
              <Link to="/checkout" className="block mt-6">
                <Button className="w-full gap-2" size="lg">
                  Proceed to Checkout <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                </Button>
              </Link>
              <Link to="/shop" className="block mt-3">
                <Button variant="outline" className="w-full">
                  Continue shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
