import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, ShoppingBag, Search, Sun, Moon, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAppSelector } from '@/app/hooks';
import { useAppDispatch } from '@/app/hooks';
import { switchRole, logout } from '@/features/auth/authSlice';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/shop' },
  { label: 'Account', href: '/account' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const cartItems = useAppSelector((s) => s.cart.items);
  const { user, isAuthenticated } = useAppSelector((s) => s.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme');
      return stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md transition-shadow',
        scrolled && 'shadow-sm'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-semibold text-lg tracking-tight">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-primary-foreground" strokeWidth={1.5} />
            </div>
            <span>Store</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  'px-4 py-2 text-sm font-medium rounded-lg transition-colors hover:bg-accent',
                  location.pathname === link.href && 'bg-accent'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Search toggle */}
            <AnimatePresence>
              {searchOpen && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 'auto', opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <Input
                    placeholder="Search products..."
                    className="w-48 md:w-64 h-9"
                    autoFocus
                    onBlur={() => setSearchOpen(false)}
                    onKeyDown={(e) => e.key === 'Escape' && setSearchOpen(false)}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <Search className="w-4 h-4" strokeWidth={1.5} />
            </Button>

            {/* Theme toggle */}
            <Button variant="ghost" size="icon" className="hidden md:flex" onClick={toggleTheme}>
              {isDark ? (
                <Sun className="w-4 h-4" strokeWidth={1.5} />
              ) : (
                <Moon className="w-4 h-4" strokeWidth={1.5} />
              )}
            </Button>

            {/* Cart */}
            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingBag className="w-4 h-4" strokeWidth={1.5} />
                {totalItems > 0 && (
                  <motion.span
                    key={totalItems}
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center"
                  >
                    {totalItems > 9 ? '9+' : totalItems}
                  </motion.span>
                )}
              </Button>
            </Link>

            {/* User / Role switcher */}
            {isAuthenticated && (
              <Button
                variant="outline"
                size="sm"
                className="hidden md:flex text-xs"
                onClick={() =>{
                  navigate('/')
                  dispatch(logout())
                }}
              >
                <User className="w-3 h-3 mr-1" strokeWidth={1.5} />
                {/* {user?.role === 'admin' ? 'Switch to Store' : 'Switch to Admin'} */}
                Logout
              </Button>
            )}

            {/* Mobile hamburger */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="w-4 h-4" strokeWidth={1.5} />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72">
                <div className="flex flex-col gap-6 pt-6">
                  <Link
                    to="/"
                    className="flex items-center gap-2 font-semibold text-lg"
                    onClick={() => setMobileOpen(false)}
                  >
                    <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
                      <ShoppingBag className="w-4 h-4 text-primary-foreground" strokeWidth={1.5} />
                    </div>
                    <span>Store</span>
                  </Link>
                  <nav className="flex flex-col gap-1">
                    {NAV_LINKS.map((link) => (
                      <Link
                        key={link.href}
                        to={link.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          'px-4 py-3 text-sm font-medium rounded-xl transition-colors hover:bg-accent',
                          location.pathname === link.href && 'bg-accent'
                        )}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </nav>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        dispatch(switchRole(user?.role === 'admin' ? 'customer' : 'admin'));
                        setMobileOpen(false);
                      }}
                    >
                      {user?.role === 'admin' ? 'Switch to Store' : 'Switch to Admin'}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={toggleTheme}>
                      {isDark ? <Sun className="w-4 h-4" strokeWidth={1.5} /> : <Moon className="w-4 h-4" strokeWidth={1.5} />}
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
