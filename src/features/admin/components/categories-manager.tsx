"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { removeCategory, saveCategory } from "@/actions/admin.actions";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import type { categories } from "@/lib/db/schema";

type Category = typeof categories.$inferSelect;

const empty = { name: "", slug: "", description: "" };

export function CategoriesManager({ items }: { items: Category[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState(empty);
  const [isPending, startTransition] = useTransition();

  function openCreate() {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  }

  function openEdit(item: Category) {
    setEditing(item);
    setForm({ name: item.name, slug: item.slug, description: item.description ?? "" });
    setOpen(true);
  }

  function handleSave() {
    startTransition(async () => {
      const result = await saveCategory(form, editing?.id);
      if (!result.success) { toast.error(result.error); return; }
      toast.success(editing ? "Category updated" : "Category created");
      setOpen(false);
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this category?")) return;
    startTransition(async () => {
      const result = await removeCategory(id);
      if (!result.success) toast.error(result.error);
      else { toast.success("Category deleted"); router.refresh(); }
    });
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Categories"
        description="Manage tour categories"
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button onClick={openCreate}><Plus className="size-4" /> Add Category</Button>} />
            <DialogContent className="sm:max-w-md">
              <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Category</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div className="space-y-2"><Label>Slug (optional)</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></div>
                <div className="space-y-2"><Label>Description</Label><Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
                <Button onClick={handleSave} disabled={isPending} className="w-full">{isPending ? "Saving..." : "Save"}</Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />
      <div className="rounded-xl border">
        <Table>
          <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Slug</TableHead><TableHead>Description</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell className="text-muted-foreground">{item.slug}</TableCell>
                <TableCell className="text-muted-foreground max-w-xs truncate">{item.description}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(item)}><Pencil className="size-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(item.id)}><Trash2 className="size-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
