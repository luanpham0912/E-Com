import { useEffect, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { ArrowUpDown, ChevronLeft, ChevronRight, Eye, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import StatusBadge from '@/components/admin/StatusBadge';
import { useAppSelector, useAppDispatch } from '@/app/hooks';
import { fetchOrders, updateOrderStatusAsync } from '@/features/orders/ordersSlice';
import { fetchUsers } from '@/features/users/usersSlice';
import { toast } from 'sonner';
import type { Order, OrderStatus } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function OrdersPage() {
  const dispatch = useAppDispatch();
  const orders = useAppSelector((s) => s.orders.orders);
  const users = useAppSelector((s) => s.users.items);
  const products = useAppSelector((s) => s.products.items);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);

  useEffect(() => {
    document.title = 'Orders — Admin';
    dispatch(fetchOrders());
    dispatch(fetchUsers());
  }, []);

  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: 'id',
      header: ({ column }) => (
        <Button variant="ghost" size="sm" className="h-8 px-0" onClick={() => column.toggleSorting()}>
          Order <ArrowUpDown className="w-3 h-3 ml-1" strokeWidth={1.5} />
        </Button>
      ),
      cell: ({ row }) => <span className="font-mono text-sm font-medium">{row.original.id.slice(-6).toUpperCase()}</span>,
    },
    {
      accessorKey: 'userId',
      header: 'Customer',
      cell: ({ row }) => {
        const user = users.find((u) => u.id === row.original.userId);
        return <span className="text-sm">{user?.name ?? 'Guest'}</span>;
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'total',
      header: ({ column }) => (
        <Button variant="ghost" size="sm" className="h-8 px-0" onClick={() => column.toggleSorting()}>
          Total <ArrowUpDown className="w-3 h-3 ml-1" strokeWidth={1.5} />
        </Button>
      ),
      cell: ({ row }) => <span className="font-mono font-medium">{formatCurrency(row.original.total)}</span>,
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <Button variant="ghost" size="sm" className="h-8 px-0" onClick={() => column.toggleSorting()}>
          Date <ArrowUpDown className="w-3 h-3 ml-1" strokeWidth={1.5} />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{formatDate(row.original.createdAt)}</span>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setDetailOrder(row.original)}
          >
            <Eye className="w-3.5 h-3.5" strokeWidth={1.5} />
          </Button>
          <Select
            value={row.original.status}
            onValueChange={async (v) => {
              try {
                await dispatch(
                  updateOrderStatusAsync({ orderId: row.original.id, status: v as OrderStatus })
                ).unwrap();
                toast.success('Status updated');
              } catch (err) {
                toast.error(err instanceof Error ? err.message : 'Update failed');
              }
            }}
          >
            <SelectTrigger className="h-8 w-32 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(['pending', 'processing', 'shipped', 'delivered', 'cancelled'] as OrderStatus[]).map((s) => (
                <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: orders,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
        <p className="text-muted-foreground text-sm mt-1">{orders.length} total orders</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
        <Input
          placeholder="Search orders..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="rounded-2xl border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
          </Button>
          <Button variant="outline" size="icon" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
          </Button>
        </div>
      </div>

      {/* Order Detail Modal */}
      <Dialog open={!!detailOrder} onOpenChange={() => setDetailOrder(null)}>
        <DialogContent className="max-w-lg">
          {detailOrder && (
            <>
              <DialogHeader>
                <DialogTitle>Order {detailOrder.id}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Status</p>
                    <StatusBadge status={detailOrder.status} />
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="font-mono font-semibold">{formatCurrency(detailOrder.total)}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Shipping Address</p>
                  <div className="text-sm text-muted-foreground">
                    <p>{detailOrder.shippingAddress.fullName}</p>
                    <p>{detailOrder.shippingAddress.line1}</p>
                    {detailOrder.shippingAddress.line2 && <p>{detailOrder.shippingAddress.line2}</p>}
                    <p>{detailOrder.shippingAddress.city}, {detailOrder.shippingAddress.state} {detailOrder.shippingAddress.zip}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Items</p>
                  <div className="space-y-2">
                    {detailOrder.items.map((item, i) => {
                      const product = products.find((p) => p.id === item.productId);
                      return (
                        <div key={i} className="flex items-center gap-3 text-sm">
                          {product && (
                            <img src={product.images[0]} alt={product.name} className="w-10 h-10 rounded object-cover" />
                          )}
                          <div className="flex-1">
                            <p className="font-medium">{product?.name ?? item.productId}</p>
                            {item.variant && (
                              <p className="text-xs text-muted-foreground">{item.variant.type}: {item.variant.value}</p>
                            )}
                          </div>
                          <span className="font-mono text-xs">x{item.quantity}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
