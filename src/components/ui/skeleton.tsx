import * as React from 'react';
import { cn } from '@/lib/utils';

const Skeleton = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return <div className={cn('animate-pulse rounded-lg bg-muted', className)} {...props} />;
};

const ProductCardSkeleton = () => (
  <div className="rounded-2xl border bg-card overflow-hidden">
    <Skeleton className="h-56 w-full rounded-none" />
    <div className="p-4 space-y-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <div className="flex items-center gap-2 pt-1">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-12" />
      </div>
    </div>
  </div>
);

const TableRowSkeleton = () => (
  <div className="flex items-center gap-4 p-4 border-b">
    <Skeleton className="h-10 w-10 rounded-lg" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-3 w-32" />
    </div>
    <Skeleton className="h-6 w-20 rounded-full" />
    <Skeleton className="h-8 w-16 rounded-xl" />
  </div>
);

const KPICardSkeleton = () => (
  <div className="rounded-2xl border bg-card p-6 space-y-3">
    <Skeleton className="h-4 w-24" />
    <Skeleton className="h-8 w-32" />
    <Skeleton className="h-3 w-16" />
  </div>
);

const HeroSkeleton = () => (
  <div className="grid lg:grid-cols-2 gap-12 items-center py-24">
    <div className="space-y-4">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-4/5" />
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-5 w-4/5" />
      <div className="flex gap-3 pt-4">
        <Skeleton className="h-12 w-32 rounded-xl" />
        <Skeleton className="h-12 w-28 rounded-xl" />
      </div>
    </div>
    <Skeleton className="h-96 rounded-2xl" />
  </div>
);

export { Skeleton, ProductCardSkeleton, TableRowSkeleton, KPICardSkeleton, HeroSkeleton };
