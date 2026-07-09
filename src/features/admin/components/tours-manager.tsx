"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { removeTour, saveTour } from "@/actions/admin.actions";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { formatPrice } from "@/utils/format";
import type { categories, destinations, tours } from "@/lib/db/schema";

type TourRow = {
  tour: typeof tours.$inferSelect;
  destination: typeof destinations.$inferSelect;
  category: typeof categories.$inferSelect;
};

interface ToursManagerProps {
  items: TourRow[];
  destinations: (typeof destinations.$inferSelect)[];
  categories: (typeof categories.$inferSelect)[];
}

const emptyForm = {
  destinationId: "",
  categoryId: "",
  title: "",
  slug: "",
  description: "",
  duration: "",
  difficulty: "easy" as "easy" | "moderate" | "hard",
  price: 0,
  discountPrice: null as number | null,
  maxGuests: 10,
  availableSeats: 10,
  featured: false,
  coverImage: "",
  highlights: "",
  included: "",
  excluded: "",
  tourGuide: "",
};

export function ToursManager({ items, destinations, categories }: ToursManagerProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [isPending, startTransition] = useTransition();

  function openCreate() {
    setEditingId(null);
    setForm({ ...emptyForm, destinationId: destinations[0]?.id ?? "", categoryId: categories[0]?.id ?? "" });
    setOpen(true);
  }

  function openEdit(row: TourRow) {
    const t = row.tour;
    setEditingId(t.id);
    setForm({
      destinationId: t.destinationId,
      categoryId: t.categoryId,
      title: t.title,
      slug: t.slug,
      description: t.description,
      duration: t.duration,
      difficulty: t.difficulty,
      price: Number(t.price),
      discountPrice: t.discountPrice ? Number(t.discountPrice) : null,
      maxGuests: t.maxGuests,
      availableSeats: t.availableSeats,
      featured: t.featured,
      coverImage: t.coverImage,
      highlights: ((t.highlights as string[]) ?? []).join(", "),
      included: ((t.included as string[]) ?? []).join(", "),
      excluded: ((t.excluded as string[]) ?? []).join(", "),
      tourGuide: t.tourGuide ?? "",
    });
    setOpen(true);
  }

  function handleSave() {
    startTransition(async () => {
      const result = await saveTour(form, editingId ?? undefined);
      if (!result.success) { toast.error(result.error); return; }
      toast.success(editingId ? "Tour updated" : "Tour created");
      setOpen(false);
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this tour?")) return;
    startTransition(async () => {
      const result = await removeTour(id);
      if (!result.success) toast.error(result.error);
      else { toast.success("Tour deleted"); router.refresh(); }
    });
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Tours"
        description="Create and manage tour packages"
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button onClick={openCreate}><Plus className="size-4" /> Add Tour</Button>} />
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
              <DialogHeader><DialogTitle>{editingId ? "Edit" : "Add"} Tour</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Destination</Label>
                    <Select value={form.destinationId} onValueChange={(v) => v && setForm({ ...form, destinationId: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{destinations.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label>Category</Label>
                    <Select value={form.categoryId} onValueChange={(v) => v && setForm({ ...form, categoryId: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label>Duration</Label><Input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="7 Days / 6 Nights" /></div>
                  <div className="space-y-2"><Label>Difficulty</Label>
                    <Select value={form.difficulty} onValueChange={(v) => v && setForm({ ...form, difficulty: v as typeof form.difficulty })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label>Price ($)</Label><Input type="number" value={form.price || ""} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} /></div>
                  <div className="space-y-2"><Label>Discount Price ($)</Label><Input type="number" value={form.discountPrice ?? ""} onChange={(e) => setForm({ ...form, discountPrice: e.target.value ? Number(e.target.value) : null })} /></div>
                  <div className="space-y-2"><Label>Max Guests</Label><Input type="number" value={form.maxGuests} onChange={(e) => setForm({ ...form, maxGuests: Number(e.target.value) })} /></div>
                  <div className="space-y-2"><Label>Available Seats</Label><Input type="number" value={form.availableSeats} onChange={(e) => setForm({ ...form, availableSeats: Number(e.target.value) })} /></div>
                  <div className="space-y-2 sm:col-span-2"><Label>Cover Image URL</Label><Input value={form.coverImage} onChange={(e) => setForm({ ...form, coverImage: e.target.value })} /></div>
                  <div className="space-y-2 sm:col-span-2"><Label>Description</Label><Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
                  <div className="space-y-2 sm:col-span-2"><Label>Highlights (comma-separated)</Label><Input value={form.highlights} onChange={(e) => setForm({ ...form, highlights: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Included (comma-separated)</Label><Input value={form.included} onChange={(e) => setForm({ ...form, included: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Excluded (comma-separated)</Label><Input value={form.excluded} onChange={(e) => setForm({ ...form, excluded: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Tour Guide</Label><Input value={form.tourGuide} onChange={(e) => setForm({ ...form, tourGuide: e.target.value })} /></div>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: !!v })} />
                  Featured tour
                </label>
                <Button onClick={handleSave} disabled={isPending} className="w-full">{isPending ? "Saving..." : "Save Tour"}</Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />
      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tour</TableHead>
              <TableHead>Destination</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Seats</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map(({ tour, destination, category }) => (
              <TableRow key={tour.id}>
                <TableCell>
                  <p className="font-medium">{tour.title}</p>
                  <p className="text-muted-foreground text-xs">{category.name}</p>
                </TableCell>
                <TableCell>{destination.name}</TableCell>
                <TableCell>{formatPrice(tour.discountPrice ?? tour.price)}</TableCell>
                <TableCell>{tour.availableSeats}/{tour.maxGuests}</TableCell>
                <TableCell>{tour.featured ? <Badge>Featured</Badge> : null}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button size="icon" variant="ghost" onClick={() => openEdit({ tour, destination, category })}><Pencil className="size-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(tour.id)}><Trash2 className="size-4" /></Button>
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
