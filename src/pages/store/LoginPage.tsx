import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShoppingBag, UserPlus, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { loginSchema, registerSchema, type LoginFormData, type RegisterFormData } from '@/lib/schemas';
import { useAuthStore } from '@/store/authStore';

type AuthMode = 'login' | 'register';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, register, isLoading, error, clearError } = useAuthStore();
  const [mode, setMode] = useState<AuthMode>('login');

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  const handleModeChange = (next: string) => {
    clearError();
    loginForm.reset();
    registerForm.reset();
    setMode(next as AuthMode);
  };

  const onLogin = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      loginForm.setError('root', {
        message: err instanceof Error ? err.message : 'Invalid email or password',
      });
      clearError();
    }
  };

  const onRegister = async (data: RegisterFormData) => {
    try {
      await register(data.name, data.email, data.password);
      toast.success('Account created. Welcome!');
      navigate('/');
    } catch (err) {
      registerForm.setError('root', {
        message: err instanceof Error ? err.message : 'Could not create account',
      });
      clearError();
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
          <h1 className="text-2xl font-bold tracking-tight">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {mode === 'login' ? 'Sign in to continue shopping' : 'Join us — it only takes a moment'}
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <Tabs value={mode} onValueChange={handleModeChange}>
              <TabsList className="grid grid-cols-2 w-full mb-6">
                <TabsTrigger value="login" className="gap-1.5">
                  <LogIn className="w-4 h-4" strokeWidth={1.75} />
                  Sign in
                </TabsTrigger>
                <TabsTrigger value="register" className="gap-1.5">
                  <UserPlus className="w-4 h-4" strokeWidth={1.75} />
                  Create account
                </TabsTrigger>
              </TabsList>

              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                {mode === 'login' ? (
                  <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        autoComplete="email"
                        {...loginForm.register('email')}
                        className="mt-1.5"
                        placeholder="your@email.com"
                      />
                      {loginForm.formState.errors.email && (
                        <p className="text-xs text-destructive mt-1">
                          {loginForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        autoComplete="current-password"
                        {...loginForm.register('password')}
                        className="mt-1.5"
                      />
                      {loginForm.formState.errors.password && (
                        <p className="text-xs text-destructive mt-1">
                          {loginForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>

                    {loginForm.formState.errors.root && (
                      <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
                        {loginForm.formState.errors.root.message}
                      </p>
                    )}
                    {error && !loginForm.formState.errors.root && (
                      <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
                        {error}
                      </p>
                    )}

                    <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                      {isLoading ? 'Signing in...' : 'Sign in'}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Full name</Label>
                      <Input
                        id="name"
                        type="text"
                        autoComplete="name"
                        {...registerForm.register('name')}
                        className="mt-1.5"
                        placeholder="Jane Doe"
                      />
                      {registerForm.formState.errors.name && (
                        <p className="text-xs text-destructive mt-1">
                          {registerForm.formState.errors.name.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="register-email">Email</Label>
                      <Input
                        id="register-email"
                        type="email"
                        autoComplete="email"
                        {...registerForm.register('email')}
                        className="mt-1.5"
                        placeholder="your@email.com"
                      />
                      {registerForm.formState.errors.email && (
                        <p className="text-xs text-destructive mt-1">
                          {registerForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="register-password">Password</Label>
                      <Input
                        id="register-password"
                        type="password"
                        autoComplete="new-password"
                        {...registerForm.register('password')}
                        className="mt-1.5"
                        placeholder="At least 6 characters"
                      />
                      {registerForm.formState.errors.password && (
                        <p className="text-xs text-destructive mt-1">
                          {registerForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>

                    {registerForm.formState.errors.root && (
                      <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
                        {registerForm.formState.errors.root.message}
                      </p>
                    )}
                    {error && !registerForm.formState.errors.root && (
                      <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
                        {error}
                      </p>
                    )}

                    <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                      {isLoading ? 'Creating account...' : 'Create account'}
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                      By creating an account you agree to our terms of service.
                    </p>
                  </form>
                )}
              </motion.div>
            </Tabs>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          <a href="/" className="hover:text-foreground underline">
            Continue as guest
          </a>
        </p>
      </motion.div>
    </div>
  );
}