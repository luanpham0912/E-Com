import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle2, Package, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOrder } from '@/hooks/useOrders';

export default function OrderConfirmationPage() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading } = useOrder(id ?? '');

  useEffect(() => {
    document.title = 'Order Confirmed — Store';
  }, []);

  if (id === 'new' || !id) {
    return (
      <div className="max-w-2xl mx-auto px-4 md:px-6 py-24 text-center">
        <p className="text-muted-foreground">No recent order found.</p>
        <Link to="/shop" className="text-primary hover:underline mt-2 block">
          Continue shopping
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 md:px-6 py-24 text-center">
        <p className="text-muted-foreground">Loading order...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 md:px-6 py-24 text-center">
        <p className="text-muted-foreground">Order not found.</p>
        <Link to="/shop" className="text-primary hover:underline mt-2 block">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-6 py-24">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="text-center space-y-6"
      >
        <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Order confirmed</h1>
          <p className="text-muted-foreground">
            Thank you for your purchase. Your order is being processed.
          </p>
        </div>
        <div className="rounded-2xl border bg-card p-6 text-left space-y-4">
          <div className="flex items-center gap-3">
            <Package className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
            <span className="text-sm text-muted-foreground">Order number</span>
          </div>
          <p className="text-2xl font-bold font-mono">{order.id}</p>
          <div className="space-y-2 pt-2 border-t">
            {order.items.map((item) => (
              <div key={`${item.productId}-${item.variant?.value}`} className="flex items-center gap-3">
                <img
                  src={`https://images.unsplash.com/photo-1498049794561-7780e7231661?w=100&h=100&fit=crop`}
                  alt=""
                  className="w-10 h-10 rounded-lg object-cover bg-muted"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium line-clamp-1">{item.productId}</p>
                  <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          A confirmation email has been sent to your registered address. You can track your order in the Account page.
        </p>
        <div className="flex gap-3 justify-center">
          <Link to="/account">
            <Button variant="outline">View Orders</Button>
          </Link>
          <Link to="/shop">
            <Button className="gap-2">
              Continue Shopping <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
