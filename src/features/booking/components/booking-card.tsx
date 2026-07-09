import Image from "next/image";
import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { BookingStatusBadge } from "@/features/booking/components/booking-status-badge";
import { formatDate, formatPrice } from "@/utils/format";
import type { BookingStatus } from "@/types";

interface BookingCardProps {
  bookingNumber: string;
  tourTitle: string;
  coverImage: string;
  destinationName: string;
  country: string;
  travelDate: string;
  travelers: number;
  totalPrice: string;
  status: BookingStatus;
}

export function BookingCard({
  bookingNumber,
  tourTitle,
  coverImage,
  destinationName,
  country,
  travelDate,
  travelers,
  totalPrice,
  status,
}: BookingCardProps) {
  return (
    <Link href={`/dashboard/bookings/${bookingNumber}`}>
      <Card className="group overflow-hidden pt-0 transition-all hover:-translate-y-0.5 hover:shadow-md">
        <div className="flex flex-col sm:flex-row">
          <div className="relative h-40 w-full shrink-0 sm:h-auto sm:w-44">
            <Image
              src={coverImage}
              alt={tourTitle}
              fill
              className="object-cover"
              sizes="176px"
            />
          </div>
          <CardContent className="flex flex-1 flex-col justify-between gap-3 py-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-muted-foreground text-xs">{bookingNumber}</p>
                  <h3 className="font-heading group-hover:text-primary font-semibold">
                    {tourTitle}
                  </h3>
                </div>
                <BookingStatusBadge status={status} />
              </div>
              <p className="text-muted-foreground flex items-center gap-1 text-sm">
                <MapPin className="size-3.5" />
                {destinationName}, {country}
              </p>
            </div>
            <div className="text-muted-foreground flex flex-wrap items-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                <CalendarDays className="size-3.5" />
                {formatDate(travelDate)}
              </span>
              <span>{travelers} traveler{travelers > 1 ? "s" : ""}</span>
              <span className="text-foreground font-medium">{formatPrice(totalPrice)}</span>
            </div>
          </CardContent>
        </div>
      </Card>
    </Link>
  );
}
