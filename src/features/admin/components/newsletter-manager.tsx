"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { adminToggleNewsletter } from "@/actions/admin.actions";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/utils/format";
import type { newsletter } from "@/lib/db/schema";

type Subscriber = typeof newsletter.$inferSelect;

export function NewsletterManager({ items }: { items: Subscriber[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function exportCsv() {
    const header = "email,active,subscribed_at\n";
    const rows = items.map((s) => `${s.email},${s.active},${s.subscribedAt?.toISOString() ?? ""}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "newsletter-subscribers.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  }

  function toggleActive(id: string, active: boolean) {
    startTransition(async () => {
      await adminToggleNewsletter(id, active);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Newsletter"
        description={`${items.length} subscriber${items.length !== 1 ? "s" : ""}`}
        action={<Button variant="outline" onClick={exportCsv}><Download className="size-4" /> Export CSV</Button>}
      />
      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Subscribed</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.email}</TableCell>
                <TableCell>
                  {item.active ? <Badge>Active</Badge> : <Badge variant="secondary">Inactive</Badge>}
                </TableCell>
                <TableCell className="text-muted-foreground">{formatDate(item.subscribedAt)}</TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="outline" disabled={isPending} onClick={() => toggleActive(item.id, !item.active)}>
                    {item.active ? "Deactivate" : "Activate"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
