import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchCategories, addCategory, updateCategory, removeCategory } from '@/features/categories/categoriesSlice';
import { categoriesApi } from '@/features/categories/categoriesApi';
import { toast } from 'sonner';
import type { Category } from '@/lib/types';

const EmptyForm = { name: '', image: '' };

export default function CategoriesPage() {
  const dispatch = useAppDispatch();
  const categories = useAppSelector((s) => s.categories.items);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState(EmptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    document.title = 'Categories — Admin';
    dispatch(fetchCategories());
  }, []);

  const handleSave = async () => {
    if (!form.name) return;
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        slug: form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        image: form.image || `https://picsum.photos/seed/${form.name}/600/400`,
        productCount: editing?.productCount ?? 0,
      };
      if (editing) {
        const updated = await categoriesApi.update(editing.id, payload);
        dispatch(updateCategory(updated));
        toast.success('Category updated');
      } else {
        const created = await categoriesApi.create(payload);
        dispatch(addCategory(created));
        toast.success('Category created');
      }
      setModalOpen(false);
      setEditing(null);
      setForm(EmptyForm);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    try {
      await categoriesApi.remove(id);
      dispatch(removeCategory(id));
      toast.success('Category deleted');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground text-sm mt-1">{categories.length} categories</p>
        </div>
        <Button
          className="gap-2"
          onClick={() => { setEditing(null); setForm(EmptyForm); setModalOpen(true); }}
        >
          <Plus className="w-4 h-4" strokeWidth={1.5} /> Add Category
        </Button>
      </div>

      <div className="rounded-2xl border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead className="text-right">Products</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((cat) => (
              <TableRow key={cat.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <img src={cat.image} alt={cat.name} className="w-10 h-10 rounded-lg object-cover bg-muted" />
                    <span className="font-medium">{cat.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-mono text-xs">{cat.slug}</Badge>
                </TableCell>
                <TableCell className="text-right font-mono">{cat.productCount}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => { setEditing(cat); setForm({ name: cat.name, image: cat.image }); setModalOpen(true); }}
                    >
                      <Pencil className="w-3.5 h-3.5" strokeWidth={1.5} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleDelete(cat.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={modalOpen} onOpenChange={(open) => { if (!open) { setModalOpen(false); setEditing(null); setForm(EmptyForm); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Category' : 'Add Category'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Name</Label>
              <Input className="mt-1.5" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Electronics" />
            </div>
            <div>
              <Label>Image URL</Label>
              <Input className="mt-1.5" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setModalOpen(false); setEditing(null); }}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{editing ? 'Save' : 'Add'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
