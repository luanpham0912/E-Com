import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { loginSchema, type LoginFormData } from '@/lib/schemas';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { loginAsync } from '@/features/auth/authSlice';
import { fetchOrders } from '@/features/orders/ordersSlice';

export default function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((s) => s.auth);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginFormData) => {
    const result = await dispatch(loginAsync(data));
    if (loginAsync.fulfilled.match(result)) {
      dispatch(fetchOrders());
      navigate('/');
    } else {
      form.setError('root', {
        message: result.payload ?? 'Invalid email or password',
      });
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-7 h-7 text-primary-foreground" strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-muted-foreground mt-1">Sign in to your account</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...form.register('email')} className="mt-1.5" placeholder="your@email.com" />
                {form.formState.errors.email && (
                  <p className="text-xs text-destructive mt-1">{form.formState.errors.email.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" {...form.register('password')} className="mt-1.5" />
                {form.formState.errors.password && (
                  <p className="text-xs text-destructive mt-1">{form.formState.errors.password.message}</p>
                )}
              </div>

              {form.formState.errors.root && (
                <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
                  {form.formState.errors.root.message}
                </p>
              )}

              {error && !form.formState.errors.root && (
                <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>

            <div className="mt-6 p-4 rounded-xl bg-muted/50 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Demo credentials</p>
              <div className="space-y-1 text-xs">
                <p>
                  <span className="font-medium">Customer:</span>{' '}
                  <span className="font-mono">customer@store.com / customer123</span>
                </p>
                <p>
                  <span className="font-medium">Admin:</span>{' '}
                  <span className="font-mono">admin@store.com / admin123</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          <Link to="/" className="hover:text-foreground underline">Continue as guest</Link>
        </p>
      </motion.div>
    </div>
  );
}
