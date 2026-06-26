import { Link } from 'react-router-dom';
import { ShoppingBag, Twitter, Instagram, Github, Linkedin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const FOOTER_LINKS = {
  Shop: [
    { label: 'All Products', href: '/shop' },
    { label: 'Electronics', href: '/shop?category=Electronics' },
    { label: 'Fashion', href: '/shop?category=Fashion' },
    { label: 'Home & Living', href: '/shop?category=Home+%26+Living' },
  ],
  Account: [
    { label: 'My Orders', href: '/account' },
    { label: 'Cart', href: '/cart' },
    { label: 'Login', href: '/login' },
  ],
  Support: [
    { label: 'FAQ', href: '#' },
    { label: 'Shipping', href: '#' },
    { label: 'Returns', href: '#' },
    { label: 'Contact', href: '#' },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t bg-card mt-auto">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2 font-semibold text-lg tracking-tight">
              <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-primary-foreground" strokeWidth={1.5} />
              </div>
              <span>LuanP Store</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Curated goods for thoughtful living. Every product we carry has earned its place.
            </p>
            <div className="flex gap-3">
              {[
                { icon: Twitter, href: '#' },
                { icon: Instagram, href: '#' },
                { icon: Github, href: '#' },
                { icon: Linkedin, href: '#' },
              ].map(({ icon: Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  className="w-9 h-9 rounded-lg border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
                >
                  <Icon className="w-4 h-4" strokeWidth={1.5} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading} className="space-y-4">
              <h4 className="text-sm font-semibold">{heading}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-sm font-semibold">Stay in the loop</h4>
            <p className="text-sm text-muted-foreground">
              New arrivals, thoughtful drops. No noise.
            </p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="your@email.com"
                className="h-10"
              />
              <Button className="h-10">Subscribe</Button>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            2026 Store. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Privacy
            </a>
            <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Terms
            </a>
            <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
