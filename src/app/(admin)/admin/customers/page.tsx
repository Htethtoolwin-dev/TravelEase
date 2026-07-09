import type { Metadata } from "next";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAllCustomersAdmin } from "@/services/admin/content.service";
import { formatDate } from "@/utils/format";

export const metadata: Metadata = { title: "Customers" };

export default async function AdminCustomersPage() {
  const customers = await getAllCustomersAdmin();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Customers"
        description={`${customers.length} registered customer${customers.length !== 1 ? "s" : ""}`}
      />
      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Bookings</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell>{c.email}</TableCell>
                <TableCell>{c.phone ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{c.bookingCount}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{formatDate(c.createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
