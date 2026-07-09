"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { adminMarkMessageRead, adminRemoveMessage } from "@/actions/admin.actions";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/utils/format";
import type { messages } from "@/lib/db/schema";

type Message = typeof messages.$inferSelect;

export function MessagesManager({ items }: { items: Message[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function markRead(id: string) {
    startTransition(async () => {
      await adminMarkMessageRead(id);
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this message?")) return;
    startTransition(async () => {
      const result = await adminRemoveMessage(id);
      if (!result.success) toast.error(result.error);
      else { toast.success("Message deleted"); router.refresh(); }
    });
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Messages" description="Contact form inbox" />
      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>From</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id} className={!item.read ? "bg-muted/30" : undefined}>
                <TableCell>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-muted-foreground text-xs">{item.email}</p>
                </TableCell>
                <TableCell>{item.subject}</TableCell>
                <TableCell className="max-w-xs truncate text-sm">{item.message}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{formatDate(item.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    {!item.read ? (
                      <Button size="sm" variant="outline" disabled={isPending} onClick={() => markRead(item.id)}>Mark Read</Button>
                    ) : (
                      <Badge variant="secondary">Read</Badge>
                    )}
                    <Button size="icon" variant="ghost" disabled={isPending} onClick={() => handleDelete(item.id)}>
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
