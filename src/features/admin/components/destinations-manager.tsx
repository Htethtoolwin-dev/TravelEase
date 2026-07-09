"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { removeDestination, saveDestination } from "@/actions/admin.actions";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import type { destinations } from "@/lib/db/schema";

type Destination = typeof destinations.$inferSelect;

const empty = {
  name: "",
  slug: "",
  country: "",
  city: "",
  description: "",
  image: "",
  featured: false,
};

export function DestinationsManager({ items }: { items: Destination[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Destination | null>(null);
  const [form, setForm] = useState(empty);
  const [isPending, startTransition] = useTransition();

  function openCreate() {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  }

  function openEdit(item: Destination) {
    setEditing(item);
    setForm({
      name: item.name,
      slug: item.slug,
      country: item.country,
      city: item.city,
      description: item.description,
      image: item.image,
      featured: item.featured,
    });
    setOpen(true);
  }

  function handleSave() {
    startTransition(async () => {
      const result = await saveDestination(form, editing?.id);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(editing ? "Destination updated" : "Destination created");
      setOpen(false);
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this destination?")) return;
    startTransition(async () => {
      const result = await removeDestination(id);
      if (!result.success) toast.error(result.error);
      else {
        toast.success("Destination deleted");
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Destinations"
        description="Manage travel destinations"
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button onClick={openCreate}><Plus className="size-4" /> Add Destination</Button>} />
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>{editing ? "Edit" : "Add"} Destination</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Slug (optional)</Label>
                    <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Country</Label>
                    <Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Image URL</Label>
                  <Input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: !!v })} />
                  Featured on homepage
                </label>
                <Button onClick={handleSave} disabled={isPending} className="w-full">
                  {isPending ? "Saving..." : "Save"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.city}, {item.country}</TableCell>
                <TableCell>
                  {item.featured ? <Badge>Featured</Badge> : <span className="text-muted-foreground">—</span>}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(item)}>
                      <Pencil className="size-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="size-4" />
                    </Button>
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
