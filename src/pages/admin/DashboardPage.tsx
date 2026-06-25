import { useEffect, useMemo } from 'react';
import { DollarSign, ShoppingBag, Users, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import KPICard from '@/components/admin/KPICard';
import StatusBadge from '@/components/admin/StatusBadge';
import { useOrders } from '@/hooks/useOrders';
import { useUsers } from '@/hooks/useUsers';
import { useProducts } from '@/hooks/useProducts';
import { formatCurrency } from '@/lib/utils';



export default function DashboardPage() {

  const { data: orders = [] } = useOrders();
  const { data: users = [] } = useUsers();
  const { data: productsData } = useProducts({ limit: 100 });
  const products = productsData?.items ?? [];

  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0);
  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
  useEffect(() => {
    document.title = 'Dashboard — Admin';
  }, []);

  const REVENUE_DATA = useMemo(() =>
    Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      const base = 800 + Math.random() * 600;
      return {
        day: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: Math.round(base),
      };
    }), []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Overview of your store performance.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          change={12.5}
          changeLabel="vs last month"
          icon={<DollarSign className="w-5 h-5" strokeWidth={1.5} />}
        />
        <KPICard
          title="Orders"
          value={orders.length.toString()}
          change={8.2}
          changeLabel="vs last month"
          icon={<ShoppingBag className="w-5 h-5" strokeWidth={1.5} />}
        />
        <KPICard
          title="Avg Order Value"
          value={formatCurrency(avgOrderValue)}
          change={-2.1}
          changeLabel="vs last month"
          icon={<TrendingUp className="w-5 h-5" strokeWidth={1.5} />}
        />
        <KPICard
          title="Customers"
          value={users.filter((u) => u.role === 'customer').length.toString()}
          change={5.7}
          changeLabel="vs last month"
          icon={<Users className="w-5 h-5" strokeWidth={1.5} />}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Revenue (Last 30 days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end gap-1">
              {REVENUE_DATA.map((d, i) => (
                <motion.div
                  key={d.day}
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(8, (d.revenue / 1400) * 100)}%` }}
                  transition={{ duration: 0.5, delay: i * 0.01, ease: [0.16, 1, 0.3, 1] }}
                  className="flex-1 bg-primary/20 hover:bg-primary/40 rounded-t transition-colors group relative"
                >
                  <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-popover border rounded px-2 py-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap font-mono">
                    {formatCurrency(d.revenue)}
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>30 days ago</span>
              <span>Today</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.slice(0, 5).map((order) => {
                  const customer = users.find((u) => u.id === order.userId);
                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono font-medium text-xs">{order.id.slice(-6).toUpperCase()}</TableCell>
                      <TableCell className="text-sm">{customer?.name ?? 'Guest'}</TableCell>
                      <TableCell><StatusBadge status={order.status} /></TableCell>
                      <TableCell className="text-right font-mono font-medium">{formatCurrency(order.total)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Products</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="text-right">Reviews</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.slice(0, 5).map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img src={p.images[0]} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-muted" />
                      <span className="font-medium text-sm">{p.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{p.category}</TableCell>
                  <TableCell className={`text-right font-mono text-sm ${p.stock < 20 ? 'text-amber-500' : ''}`}>
                    {p.stock}
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">{p.reviewCount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
