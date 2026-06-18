import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'motion/react';
import { Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatusBadge from '@/components/admin/StatusBadge';
import { useAppSelector, useAppDispatch } from '@/app/hooks';
import { updateProfile } from '@/features/auth/authSlice';
import { fetchOrders } from '@/features/orders/ordersSlice';
import { profileSchema, type ProfileFormData } from '@/lib/schemas';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function AccountPage() {
  const { user } = useAppSelector((s) => s.auth);
  const allOrders = useAppSelector((s) => s.orders.orders);
  const orders = allOrders.filter((o) => o.userId === user?.id);
  const products = useAppSelector((s) => s.products.items);
  const dispatch = useAppDispatch();

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? '',
      email: user?.email ?? '',
    },
  });

  useEffect(() => {
    document.title = 'Account — Store';
    profileForm.reset({ name: user?.name ?? '', email: user?.email ?? '' });
    if (user) dispatch(fetchOrders());
  }, [user]);

  const handleProfileUpdate = profileForm.handleSubmit((data) => {
    dispatch(updateProfile({ name: data.name, email: data.email }));
  });

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Account</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Profile */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div>
                  <Label>Full name</Label>
                  <Input {...profileForm.register('name')} className="mt-1.5" />
                  {profileForm.formState.errors.name && (
                    <p className="text-xs text-destructive mt-1">{profileForm.formState.errors.name.message}</p>
                  )}
                </div>
                <div>
                  <Label>Email</Label>
                  <Input type="email" {...profileForm.register('email')} className="mt-1.5" />
                  {profileForm.formState.errors.email && (
                    <p className="text-xs text-destructive mt-1">{profileForm.formState.errors.email.message}</p>
                  )}
                </div>
                <Button type="submit" className="w-full">Save Changes</Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Orders */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-xl font-semibold">Order History</h2>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="w-10 h-10 mx-auto mb-3 opacity-30" strokeWidth={1.5} />
              <p>No orders yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border bg-card p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-mono font-semibold text-sm">{order.id}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>
                  <Separator />
                  <div className="flex gap-3">
                    {order.items.slice(0, 4).map((item, i) => {
                      const product = products.find((p) => p.id === item.productId);
                      if (!product) return null;
                      return (
                        <img
                          key={i}
                          src={product.images[0]}
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover bg-muted"
                        />
                      );
                    })}
                    {order.items.length > 4 && (
                      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                        +{order.items.length - 4}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </span>
                    <span className="font-semibold font-mono">{formatCurrency(order.total)}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
