import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import ProductCard from '@/components/shared/ProductCard';
import { ProductCardSkeleton } from '@/components/ui/skeleton';
import EmptyState from '@/components/shared/EmptyState';
import { useProducts } from '@/hooks/useProducts';
import { cn } from '@/lib/utils';
import { ShoppingBag } from 'lucide-react';
import type { ProductFilters } from '@/lib/types';

const PRICE_RANGES = [
  { label: 'All prices', min: 0, max: 10000 },
  { label: 'Under $50', min: 0, max: 50 },
  { label: '$50 - $150', min: 50, max: 150 },
  { label: '$150 - $300', min: 150, max: 300 },
  { label: 'Over $300', min: 300, max: 10000 },
];

const DEFAULT_FILTERS: ProductFilters = {
  category: '',
  minPrice: 0,
  maxPrice: 10000,
  sortBy: 'newest',
  search: '',
};

function FilterContent({
  filters,
  onFilterChange,
}: {
  filters: ProductFilters;
  onFilterChange: (partial: Partial<ProductFilters>) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold mb-3">Category</p>
        <div className="space-y-1.5">
          {['All', 'Electronics', 'Fashion', 'Home & Living', 'Beauty', 'Sports', 'Books'].map((cat) => (
            <button
              key={cat}
              onClick={() => onFilterChange({ category: cat === 'All' ? '' : cat })}
              className={cn(
                'w-full text-left px-3 py-2 text-sm rounded-lg transition-colors',
                (cat === 'All' ? !filters.category : filters.category === cat)
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'hover:bg-accent'
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <p className="text-sm font-semibold mb-3">Price range</p>
        <div className="space-y-1.5">
          {PRICE_RANGES.map((range) => (
            <button
              key={range.label}
              onClick={() => onFilterChange({ minPrice: range.min, maxPrice: range.max })}
              className={cn(
                'w-full text-left px-3 py-2 text-sm rounded-lg transition-colors',
                filters.minPrice === range.min && filters.maxPrice === range.max
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'hover:bg-accent'
              )}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState<ProductFilters>(DEFAULT_FILTERS);
  const [searchValue, setSearchValue] = useState('');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const { data, isLoading } = useProducts({
    ...filters,
    page: 1,
    limit: 100,
  });

  useEffect(() => {
    document.title = 'Shop — Store';
    const cat = searchParams.get('category');
    if (cat) setFilters((f) => ({ ...f, category: cat }));
  }, []);

  const handleFilterChange = useCallback((partial: Partial<ProductFilters>) => {
    setFilters((f) => ({ ...f, ...partial }));
  }, []);

  const handleSearch = useCallback(() => {
    setFilters((f) => ({ ...f, search: searchValue }));
  }, [searchValue]);

  const handleClearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setSearchValue('');
  }, []);

  const filteredProducts = useMemo(() => {
    const items = data?.items ?? [];
    return items.filter((p) => {
      if (filters.category && p.category !== filters.category) return false;
      const price = p.salePrice ?? p.price;
      if (price < filters.minPrice || price > filters.maxPrice) return false;
      if (filters.search && !p.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
      return true;
    }).sort((a, b) => {
      switch (filters.sortBy) {
        case 'price-asc': return (a.salePrice ?? a.price) - (b.salePrice ?? b.price);
        case 'price-desc': return (b.salePrice ?? b.price) - (a.salePrice ?? a.price);
        case 'rating': return b.rating - a.rating;
        default: return 0;
      }
    });
  }, [data?.items, filters]);

  const activeFilterCount = [
    filters.category,
    filters.minPrice > 0 || filters.maxPrice < 10000 ? 'price' : '',
    filters.search,
  ].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shop</h1>
          <p className="text-muted-foreground mt-1">
            {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
            {filters.category && ` in ${filters.category}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Input
              placeholder="Search products..."
              className="w-48 md:w-64 pr-8"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={handleSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <Search className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>

          <Select
            value={filters.sortBy}
            onValueChange={(v) => handleFilterChange({ sortBy: v as typeof filters.sortBy })}
          >
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="rating">Top Rated</SelectItem>
            </SelectContent>
          </Select>

          <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="relative md:hidden">
                <SlidersHorizontal className="w-4 h-4" strokeWidth={1.5} />
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FilterContent filters={filters} onFilterChange={handleFilterChange} />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="flex gap-8">
        <aside className="hidden md:block w-56 shrink-0">
          <div className="sticky top-24">
            <FilterContent filters={filters} onFilterChange={handleFilterChange} />
          </div>
        </aside>

        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 9 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <EmptyState
              icon={<ShoppingBag className="w-8 h-8" strokeWidth={1.5} />}
              title="No products found"
              description="Try adjusting your filters or search query."
              action={{ label: 'Clear filters', onClick: handleClearFilters }}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
