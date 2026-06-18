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
import { ArrowUpDown, ChevronLeft, ChevronRight, Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { useAppSelector, useAppDispatch } from '@/app/hooks';
import { addProduct, updateProduct, deleteProduct, fetchProducts } from '@/features/products/productsSlice';
import { productsApi } from '@/features/products/productsApi';
import { toast } from 'sonner';
import type { Product } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { CATEGORIES } from '@/lib/constants';

const EmptyForm = {
  name: '',
  description: '',
  price: '',
  salePrice: '',
  category: 'Electronics',
  stock: '',
  tags: '',
};

export default function ProductsPage() {
  const dispatch = useAppDispatch();
  const products = useAppSelector((s) => s.products.items);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState(EmptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    document.title = 'Products — Admin';
    dispatch(fetchProducts({ limit: 100 }));
  }, []);

  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: 'name',
      header: 'Product',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <img
            src={row.original.images[0]}
            alt={row.original.name}
            className="w-10 h-10 rounded-lg object-cover bg-muted"
          />
          <div>
            <p className="font-medium text-sm">{row.original.name}</p>
            <p className="text-xs text-muted-foreground">{row.original.category}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'price',
      header: ({ column }) => (
        <Button variant="ghost" size="sm" className="h-8 px-0" onClick={() => column.toggleSorting()}>
          Price <ArrowUpDown className="w-3 h-3 ml-1" strokeWidth={1.5} />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-mono text-sm">
          {row.original.salePrice ? (
            <span>
              <span className="text-primary">{formatCurrency(row.original.salePrice)}</span>{' '}
              <span className="text-muted-foreground line-through">{formatCurrency(row.original.price)}</span>
            </span>
          ) : (
            formatCurrency(row.original.price)
          )}
        </div>
      ),
    },
    {
      accessorKey: 'stock',
      header: 'Stock',
      cell: ({ row }) => (
        <span className={`font-mono text-sm ${row.original.stock < 20 ? 'text-amber-500' : ''}`}>
          {row.original.stock}
        </span>
      ),
    },
    {
      accessorKey: 'rating',
      header: ({ column }) => (
        <Button variant="ghost" size="sm" className="h-8 px-0" onClick={() => column.toggleSorting()}>
          Rating <ArrowUpDown className="w-3 h-3 ml-1" strokeWidth={1.5} />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="text-sm font-mono">{row.original.rating}</span>
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
            onClick={() => {
              const p = row.original;
              setForm({
                name: p.name,
                description: p.description,
                price: p.price.toString(),
                salePrice: p.salePrice?.toString() ?? '',
                category: p.category,
                stock: p.stock.toString(),
                tags: p.tags.join(', '),
              });
              setEditingProduct(p);
              setModalOpen(true);
            }}
          >
            <Pencil className="w-3.5 h-3.5" strokeWidth={1.5} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={async () => {
              if (!confirm('Delete this product?')) return;
              try {
                await productsApi.remove(row.original.id);
                dispatch(deleteProduct(row.original.id));
                toast.success('Product deleted');
              } catch (err) {
                toast.error(err instanceof Error ? err.message : 'Delete failed');
              }
            }}
          >
            <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
          </Button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: products,
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

  const handleSave = async () => {
    setSaving(true);
    try {
      const baseFields = {
        name: form.name,
        slug: form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: form.description,
        price: parseFloat(form.price),
        salePrice: form.salePrice ? parseFloat(form.salePrice) : undefined,
        category: form.category,
        stock: parseInt(form.stock || '0', 10),
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        variants: editingProduct?.variants ?? [],
        images: editingProduct?.images ?? [`https://picsum.photos/seed/${form.name || 'new'}/800/800`],
        rating: editingProduct?.rating ?? 4.5,
        reviewCount: editingProduct?.reviewCount ?? 0,
      };
      if (editingProduct) {
        const updated = await productsApi.update(editingProduct.id, baseFields);
        dispatch(updateProduct(updated));
        toast.success('Product updated');
      } else {
        const created = await productsApi.create(baseFields);
        dispatch(addProduct(created));
        toast.success('Product created');
      }
      setModalOpen(false);
      setEditingProduct(null);
      setForm(EmptyForm);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground text-sm mt-1">{products.length} products</p>
        </div>
        <Button
          className="gap-2"
          onClick={() => { setEditingProduct(null); setForm(EmptyForm); setModalOpen(true); }}
        >
          <Plus className="w-4 h-4" strokeWidth={1.5} /> Add Product
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
          <Input
            placeholder="Search products..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9"
          />
        </div>
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
                  No products found.
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

      {/* Pagination */}
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

      {/* Add/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={(open) => { if (!open) { setModalOpen(false); setEditingProduct(null); setForm(EmptyForm); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2 max-h-[60vh] overflow-auto">
            <div>
              <Label>Name</Label>
              <Input className="mt-1.5" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <Label>Description</Label>
              <textarea
                className="flex min-h-24 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm mt-1.5"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Price ($)</Label>
                <Input className="mt-1.5" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              </div>
              <div>
                <Label>Sale Price ($)</Label>
                <Input className="mt-1.5" type="number" value={form.salePrice} onChange={(e) => setForm({ ...form, salePrice: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Stock</Label>
                <Input className="mt-1.5" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Tags (comma-separated)</Label>
              <Input className="mt-1.5" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="audio, wireless, noise-cancelling" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setModalOpen(false); setEditingProduct(null); setForm(EmptyForm); }}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : editingProduct ? 'Save Changes' : 'Add Product'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
