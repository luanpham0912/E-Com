import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Tag,
  Settings,
  ChevronLeft,
  Sun,
  Moon,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAppSelector, useAppDispatch } from '@/app/hooks';
import { logout } from '@/features/auth/authSlice';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
  { icon: Package, label: 'Products', href: '/admin/products' },
  { icon: ShoppingCart, label: 'Orders', href: '/admin/orders' },
  { icon: Users, label: 'Customers', href: '/admin/customers' },
  { icon: Tag, label: 'Categories', href: '/admin/categories' },
  { icon: Settings, label: 'Settings', href: '/admin/settings' },
];

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem('theme');
    return stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const location = useLocation();
  const { user } = useAppSelector((s) => s.auth);
  const dispatch = useAppDispatch();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  return (
    <div className="flex min-h-dvh bg-background">
      {/* Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 256 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col border-r bg-card"
      >
        {/* Logo */}
        <div className="flex items-center h-16 px-4 border-b gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0">
            <span className="text-primary-foreground font-bold text-sm">S</span>
          </div>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-semibold text-sm tracking-tight"
            >
              Admin Panel
            </motion.span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.href ||
              (item.href !== '/admin' && location.pathname.startsWith(item.href));

            const NavLink = (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                <item.icon className="w-5 h-5 shrink-0" strokeWidth={1.5} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );

            return collapsed ? (
              <Tooltip key={item.href} delayDuration={0}>
                <TooltipTrigger asChild>{NavLink}</TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            ) : (
              NavLink
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-2 space-y-1 border-t">
          <Button
            variant="ghost"
            size="sm"
            className={cn('w-full justify-start gap-3', collapsed && 'justify-center px-0')}
            onClick={toggleTheme}
          >
            {isDark ? (
              <Sun className="w-5 h-5 shrink-0" strokeWidth={1.5} />
            ) : (
              <Moon className="w-5 h-5 shrink-0" strokeWidth={1.5} />
            )}
            {!collapsed && <span className="text-sm">{isDark ? 'Light Mode' : 'Dark Mode'}</span>}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className={cn('w-full justify-start gap-3 text-destructive hover:text-destructive', collapsed && 'justify-center px-0')}
            onClick={() => dispatch(logout())}
          >
            <LogOut className="w-5 h-5 shrink-0" strokeWidth={1.5} />
            {!collapsed && <span className="text-sm">Logout</span>}
          </Button>
        </div>

        {/* Collapse toggle */}
        <div className="p-2 border-t">
          <Button
            variant="ghost"
            size="icon"
            className="w-full"
            onClick={() => setCollapsed(!collapsed)}
            >
              <motion.div
                animate={{ rotate: collapsed ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
              </motion.div>
          </Button>
        </div>
      </motion.aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 border-b bg-card flex items-center justify-between px-6">
          <div>
            <h2 className="font-semibold">
              {NAV_ITEMS.find((i) =>
                location.pathname === i.href ||
                (i.href !== '/admin' && location.pathname.startsWith(i.href))
              )?.label ?? 'Dashboard'}
            </h2>
            <p className="text-xs text-muted-foreground">
              Welcome back, {user?.name ?? 'Admin'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback>{user?.name?.[0] ?? 'A'}</AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
