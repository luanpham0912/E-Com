import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, ChevronRight, Lock, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import EmptyState from '@/components/shared/EmptyState';
import { shippingSchema, paymentSchema, type ShippingFormData, type PaymentFormData } from '@/lib/schemas';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useCreateOrder } from '@/hooks/useOrders';
import { useProducts } from '@/hooks/useProducts';
import { formatCurrency } from '@/lib/utils';
import { TAX_RATE } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const STEPS = ['Shipping', 'Payment', 'Review'];

export default function CheckoutPage() {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const { items, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const { data: productsData } = useProducts({ limit: 100 });
  const createOrder = useCreateOrder();
  const products = productsData?.items ?? [];

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  const shippingForm = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      fullName: user?.name ?? '',
      email: user?.email ?? '',
      line1: '',
      city: '',
      state: '',
      zip: '',
      country: 'United States',
    },
  });

  const paymentForm = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { cardNumber: '', expiry: '', cvc: '', nameOnCard: '' },
  });

  const subtotal = items.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.productId);
    if (!product) return sum;
    return sum + (product.salePrice ?? product.price) * item.quantity;
  }, 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  const handlePlaceOrder = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (items.length === 0) {
      toast.error('Your cart is empty');
      navigate('/cart');
      return;
    }
    const data = shippingForm.getValues();
    try {
      const order = await createOrder.mutateAsync({
        fullName: data.fullName,
        line1: data.line1,
        line2: data.line2,
        city: data.city,
        state: data.state,
        zip: data.zip,
        country: data.country,
      });
      clearCart();
      navigate(`/order/${order.id}`);
    } catch {
      toast.error('Failed to place order. Please try again.');
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-24">
        <EmptyState
          icon={<ShoppingBag className="w-8 h-8" strokeWidth={1.5} />}
          title="Your cart is empty"
          description="Add some items to your cart before checking out."
          action={{ label: 'Start shopping', href: '/shop' }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Checkout</h1>

      <div className="flex items-center gap-2 mb-12">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors',
                i <= step
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              {i < step ? <Check className="w-4 h-4" strokeWidth={2} /> : i + 1}
            </div>
            <span className={cn('text-sm font-medium', i <= step ? '' : 'text-muted-foreground')}>
              {s}
            </span>
            {i < STEPS.length - 1 && (
              <ChevronRight className="w-4 h-4 text-muted-foreground mx-1" strokeWidth={1.5} />
            )}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="shipping"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h2 className="text-lg font-semibold">Shipping Information</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <Label htmlFor="fullName">Full name</Label>
                    <Input id="fullName" {...shippingForm.register('fullName')} className="mt-1.5" />
                    {shippingForm.formState.errors.fullName && (
                      <p className="text-xs text-destructive mt-1">{shippingForm.formState.errors.fullName.message}</p>
                    )}
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" {...shippingForm.register('email')} className="mt-1.5" />
                    {shippingForm.formState.errors.email && (
                      <p className="text-xs text-destructive mt-1">{shippingForm.formState.errors.email.message}</p>
                    )}
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="line1">Address</Label>
                    <Input id="line1" {...shippingForm.register('line1')} className="mt-1.5" placeholder="Street address" />
                    {shippingForm.formState.errors.line1 && (
                      <p className="text-xs text-destructive mt-1">{shippingForm.formState.errors.line1.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input id="city" {...shippingForm.register('city')} className="mt-1.5" />
                    {shippingForm.formState.errors.city && (
                      <p className="text-xs text-destructive mt-1">{shippingForm.formState.errors.city.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input id="state" {...shippingForm.register('state')} className="mt-1.5" />
                    {shippingForm.formState.errors.state && (
                      <p className="text-xs text-destructive mt-1">{shippingForm.formState.errors.state.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="zip">ZIP code</Label>
                    <Input id="zip" {...shippingForm.register('zip')} className="mt-1.5" />
                    {shippingForm.formState.errors.zip && (
                      <p className="text-xs text-destructive mt-1">{shippingForm.formState.errors.zip.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input id="country" {...shippingForm.register('country')} className="mt-1.5" />
                  </div>
                </div>
                <Button
                  className="w-full mt-4"
                  size="lg"
                  onClick={shippingForm.handleSubmit(() => setStep(1))}
                >
                  Continue to Payment <ChevronRight className="w-4 h-4 ml-2" strokeWidth={1.5} />
                </Button>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="payment"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h2 className="text-lg font-semibold">Payment Details</h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Lock className="w-4 h-4" strokeWidth={1.5} />
                  <span>All transactions are secure and encrypted</span>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label>Card number</Label>
                    <Input
                      {...paymentForm.register('cardNumber')}
                      className="mt-1.5"
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                    />
                    {paymentForm.formState.errors.cardNumber && (
                      <p className="text-xs text-destructive mt-1">{paymentForm.formState.errors.cardNumber.message}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Expiry</Label>
                      <Input {...paymentForm.register('expiry')} className="mt-1.5" placeholder="MM/YY" maxLength={5} />
                      {paymentForm.formState.errors.expiry && (
                        <p className="text-xs text-destructive mt-1">{paymentForm.formState.errors.expiry.message}</p>
                      )}
                    </div>
                    <div>
                      <Label>CVC</Label>
                      <Input {...paymentForm.register('cvc')} className="mt-1.5" placeholder="123" maxLength={4} />
                      {paymentForm.formState.errors.cvc && (
                        <p className="text-xs text-destructive mt-1">{paymentForm.formState.errors.cvc.message}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label>Name on card</Label>
                    <Input {...paymentForm.register('nameOnCard')} className="mt-1.5" />
                    {paymentForm.formState.errors.nameOnCard && (
                      <p className="text-xs text-destructive mt-1">{paymentForm.formState.errors.nameOnCard.message}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <Button variant="outline" className="flex-1" onClick={() => setStep(0)}>
                    Back
                  </Button>
                  <Button
                    className="flex-1"
                    size="lg"
                    onClick={paymentForm.handleSubmit(() => setStep(2))}
                  >
                    Review Order <ChevronRight className="w-4 h-4 ml-2" strokeWidth={1.5} />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="review"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-lg font-semibold">Review Your Order</h2>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Shipping to</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{shippingForm.getValues('fullName')}</p>
                    <p className="text-sm text-muted-foreground">
                      {shippingForm.getValues('line1')}, {shippingForm.getValues('city')},{' '}
                      {shippingForm.getValues('state')} {shippingForm.getValues('zip')}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Payment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">Card ending in {paymentForm.getValues('cardNumber').slice(-4)}</p>
                  </CardContent>
                </Card>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button
                    className="flex-1"
                    size="lg"
                    onClick={handlePlaceOrder}
                    disabled={createOrder.isPending}
                  >
                    {createOrder.isPending ? 'Placing order...' : 'Place Order'}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="text-base">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {items.map((item) => {
                const product = products.find((p) => p.id === item.productId);
                if (!product) return null;
                return (
                  <div key={item.productId} className="flex gap-3 text-sm">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-12 h-12 rounded-lg object-cover bg-muted"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-xs line-clamp-1">{product.name}</p>
                      <p className="text-muted-foreground text-xs">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-mono font-medium text-xs">
                      {formatCurrency((product.salePrice ?? product.price) * item.quantity)}
                    </span>
                  </div>
                );
              })}
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-mono">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span className="font-mono">{formatCurrency(tax)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span className="font-mono">{formatCurrency(total)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
