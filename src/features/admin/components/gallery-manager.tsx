"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { removeGalleryItem, saveGalleryItem } from "@/actions/admin.actions";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { gallery } from "@/lib/db/schema";

type GalleryItem = typeof gallery.$inferSelect;
const empty = { title: "", image: "", category: "", sortOrder: 0 };

export function GalleryManager({ items }: { items: GalleryItem[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<GalleryItem | null>(null);
  const [form, setForm] = useState(empty);
  const [isPending, startTransition] = useTransition();

  function openCreate() { setEditing(null); setForm(empty); setOpen(true); }
  function openEdit(item: GalleryItem) {
    setEditing(item);
    setForm({ title: item.title, image: item.image, category: item.category ?? "", sortOrder: item.sortOrder });
    setOpen(true);
  }

  function handleSave() {
    startTransition(async () => {
      const result = await saveGalleryItem(form, editing?.id);
      if (!result.success) { toast.error(result.error); return; }
      toast.success(editing ? "Image updated" : "Image added");
      setOpen(false); router.refresh();
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this image?")) return;
    startTransition(async () => {
      const result = await removeGalleryItem(id);
      if (!result.success) toast.error(result.error);
      else { toast.success("Image deleted"); router.refresh(); }
    });
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Gallery" description="Manage photo gallery"
        action={<Dialog open={open} onOpenChange={setOpen}><DialogTrigger render={<Button onClick={openCreate}><Plus className="size-4" /> Add Image</Button>} />
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Image</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div className="space-y-2"><Label>Image URL</Label><Input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} /></div>
              <div className="space-y-2"><Label>Category</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
              <div className="space-y-2"><Label>Sort Order</Label><Input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} /></div>
              <Button onClick={handleSave} disabled={isPending} className="w-full">{isPending ? "Saving..." : "Save"}</Button>
            </div>
          </DialogContent></Dialog>} />
      <div className="rounded-xl border">
        <Table>
          <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Category</TableHead><TableHead>Order</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.title}</TableCell>
                <TableCell>{item.category ?? "—"}</TableCell>
                <TableCell>{item.sortOrder}</TableCell>
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
