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
import { useAuthStore } from '@/store/authStore';
import { useOrders } from '@/hooks/useOrders';
import { profileSchema, type ProfileFormData } from '@/lib/schemas';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export default function AccountPage() {
  const { user, updateProfile } = useAuthStore();
  const { data: orders = [] } = useOrders();

  const userOrders = orders.filter((o) => o.userId === user?.id);

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
  }, [user, profileForm]);

  const handleProfileUpdate = profileForm.handleSubmit(async (data) => {
    try {
      await updateProfile({ name: data.name });
      toast.success('Profile updated');
    } catch {
      toast.error('Failed to update profile');
    }
  });

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Account</h1>

      <div className="grid lg:grid-cols-3 gap-8">
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

        <div className="lg:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-xl font-semibold">Order History</h2>
          </div>

          {userOrders.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="w-10 h-10 mx-auto mb-3 opacity-30" strokeWidth={1.5} />
              <p>No orders yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {userOrders.map((order) => (
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
                    {order.items.slice(0, 4).map((item, i) => (
                      <div
                        key={i}
                        className="w-12 h-12 rounded-lg bg-muted overflow-hidden"
                      >
                        <img
                          src={`https://picsum.photos/seed/${item.productId}/100/100`}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
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
