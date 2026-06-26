import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Star, Truck, ShieldCheck, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import ProductCard from '@/components/shared/ProductCard';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { formatCurrency } from '@/lib/utils';

const PROMISES = [
  {
    icon: <Truck className="w-5 h-5" strokeWidth={1.5} />,
    title: 'Free shipping',
    description: 'On all orders over $50',
  },
  {
    icon: <ShieldCheck className="w-5 h-5" strokeWidth={1.5} />,
    title: 'Secure checkout',
    description: '256-bit SSL encryption',
  },
  {
    icon: <RefreshCw className="w-5 h-5" strokeWidth={1.5} />,
    title: 'Easy returns',
    description: '30-day return policy',
  },
];

export default function HomePage() {
  useEffect(() => {
    document.title = 'Store — Curated Goods for Thoughtful Living';
  }, []);

  const { data: productsData } = useProducts({ limit: 8 });
  const { data: categories } = useCategories();
  const products = productsData?.items ?? [];
  const featuredProducts = products.slice(0, 8);
  const bestSeller = products[0];

  return (
    <div>
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-24 grid lg:grid-cols-2 gap-16 items-center w-full">
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Curated collection
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05]"
            >
              Goods that earn their place.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base md:text-lg text-muted-foreground max-w-md leading-relaxed"
            >
              Every product is chosen with care. No noise, no clutter. Just things that work and last.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-3"
            >
              <Link to="/shop">
                <Button size="lg" className="gap-2">
                  Shop now <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                </Button>
              </Link>
              <Link to="/shop?category=Electronics">
                <Button variant="outline" size="lg">
                  Explore Electronics
                </Button>
              </Link>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-muted">
              <img
                src="https://res.cloudinary.com/dy3qtjmuy/image/upload/v1782456934/samples/ecommerce/accessories-bag.jpg"
                alt="Featured collection"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-card rounded-2xl border p-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" strokeWidth={0} />
                  ))}
                </div>
                <span className="text-sm font-medium">4.9/5</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Trusted by 50,000+ customers</p>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-y bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PROMISES.map((promise, i) => (
              <motion.div
                key={promise.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex items-center gap-4 p-4 rounded-2xl bg-background"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  {promise.icon}
                </div>
                <div>
                  <p className="font-semibold text-sm">{promise.title}</p>
                  <p className="text-xs text-muted-foreground">{promise.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Featured</h2>
            <p className="text-muted-foreground mt-2">Our most-loved products this season.</p>
          </div>
          <Link to="/shop">
            <Button variant="ghost" className="gap-2 hidden md:flex">
              View all <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
        <div className="mt-8 text-center md:hidden">
          <Link to="/shop">
            <Button variant="outline" className="gap-2">
              View all products <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
            </Button>
          </Link>
        </div>
      </section>

      <section className="py-24 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-12">
            Browse by category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories?.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
              >
                <Link
                  to={`/shop?category=${encodeURIComponent(cat.name)}`}
                  className="group block"
                >
                  <Card className="overflow-hidden group-hover:shadow-lg transition-shadow">
                    <div className="aspect-[4/3] overflow-hidden">
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <CardContent className="p-3 text-center">
                      <p className="font-medium text-sm">{cat.name}</p>
                      <p className="text-xs text-muted-foreground">{cat.productCount} items</p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Best seller
            </span>
            {bestSeller ? (
              <>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mt-3 mb-4">
                  {bestSeller.name}
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  {bestSeller.description}
                </p>
                <div className="flex items-center gap-4 mb-8">
                  <span className="text-3xl font-bold font-mono">
                    {formatCurrency(bestSeller.salePrice ?? bestSeller.price)}
                  </span>
                  {bestSeller.salePrice && (
                    <span className="text-lg text-muted-foreground line-through font-mono">
                      {formatCurrency(bestSeller.price)}
                    </span>
                  )}
                </div>
                <Link to={`/products/${bestSeller.id}`}>
                  <Button size="lg" className="gap-2">
                    Shop now <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                  </Button>
                </Link>
              </>
            ) : (
              <p className="text-muted-foreground">Loading best seller...</p>
            )}
          </div>
          <div className="order-1 md:order-2">
            {bestSeller && (
              <div className="aspect-square rounded-3xl overflow-hidden bg-muted">
                <img
                  src={bestSeller.images[0]}
                  alt={bestSeller.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-24 bg-primary text-primary-foreground">
        <div className="max-w-3xl mx-auto px-4 md:px-6 text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Ready to find your next favorite thing?
          </h2>
          <p className="text-primary-foreground/80 text-lg max-w-lg mx-auto">
            New arrivals every week. Join our newsletter to stay in the loop.
          </p>
          <div className="flex gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 h-12 rounded-xl bg-primary-foreground/10 border-primary-foreground/20 px-4 text-primary-foreground placeholder:text-primary-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary-foreground/50"
            />
            <Button size="lg" variant="secondary">
              Subscribe
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
