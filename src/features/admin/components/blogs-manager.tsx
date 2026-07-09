"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { removeBlog, saveBlog } from "@/actions/admin.actions";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/utils/format";
import type { blogs } from "@/lib/db/schema";

type Blog = typeof blogs.$inferSelect;
const empty = { title: "", slug: "", excerpt: "", content: "", coverImage: "", published: false };

export function BlogsManager({ items }: { items: Blog[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Blog | null>(null);
  const [form, setForm] = useState(empty);
  const [isPending, startTransition] = useTransition();

  function openCreate() { setEditing(null); setForm(empty); setOpen(true); }
  function openEdit(item: Blog) {
    setEditing(item);
    setForm({ title: item.title, slug: item.slug, excerpt: item.excerpt ?? "", content: item.content, coverImage: item.coverImage, published: item.published });
    setOpen(true);
  }

  function handleSave() {
    startTransition(async () => {
      const result = await saveBlog(form, editing?.id);
      if (!result.success) { toast.error(result.error); return; }
      toast.success(editing ? "Blog updated" : "Blog created");
      setOpen(false); router.refresh();
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this blog post?")) return;
    startTransition(async () => {
      const result = await removeBlog(id);
      if (!result.success) toast.error(result.error);
      else { toast.success("Blog deleted"); router.refresh(); }
    });
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Blog Posts" description="Create and publish travel articles"
        action={<Dialog open={open} onOpenChange={setOpen}><DialogTrigger render={<Button onClick={openCreate}><Plus className="size-4" /> Add Post</Button>} />
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Blog Post</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div className="space-y-2"><Label>Cover Image URL</Label><Input value={form.coverImage} onChange={(e) => setForm({ ...form, coverImage: e.target.value })} /></div>
              <div className="space-y-2"><Label>Excerpt</Label><Textarea rows={2} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} /></div>
              <div className="space-y-2"><Label>Content</Label><Textarea rows={6} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} /></div>
              <label className="flex items-center gap-2 text-sm"><Checkbox checked={form.published} onCheckedChange={(v) => setForm({ ...form, published: !!v })} />Published</label>
              <Button onClick={handleSave} disabled={isPending} className="w-full">{isPending ? "Saving..." : "Save"}</Button>
            </div>
          </DialogContent></Dialog>} />
      <div className="rounded-xl border">
        <Table>
          <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Status</TableHead><TableHead>Created</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.title}</TableCell>
                <TableCell>{item.published ? <Badge>Published</Badge> : <Badge variant="secondary">Draft</Badge>}</TableCell>
                <TableCell className="text-muted-foreground">{formatDate(item.createdAt)}</TableCell>
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
