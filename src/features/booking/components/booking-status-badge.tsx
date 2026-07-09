import { Badge } from "@/components/ui/badge";
import type { BookingStatus } from "@/types";

const variants: Record<
  BookingStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  pending: "secondary",
  confirmed: "default",
  cancelled: "destructive",
  completed: "outline",
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return (
    <Badge variant={variants[status]} className="capitalize">
      {status}
    </Badge>
  );
}
