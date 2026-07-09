"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";
import { CalendarIcon, ChevronLeft, ChevronRight, MapPin, Users } from "lucide-react";
import { toast } from "sonner";
import { submitBooking } from "@/actions/booking.actions";
import { BookingStepIndicator } from "@/features/booking/components/booking-step-indicator";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ROUTES } from "@/constants";
import { formatDate, formatPrice, getEffectivePrice } from "@/utils/format";
import type { TravelerInput } from "@/schemas/booking";
import { cn } from "@/lib/utils";

interface BookingWizardProps {
  tour: {
    id: string;
    slug: string;
    title: string;
    coverImage: string;
    duration: string;
    price: string;
    discountPrice: string | null;
    availableSeats: number;
    maxGuests: number;
    destinationName: string;
    country: string;
  };
  userName: string;
}

function createTravelers(count: number, existing: TravelerInput[], leadName: string) {
  return Array.from({ length: count }, (_, index) => {
    if (existing[index]) return existing[index];
    return { name: index === 0 ? leadName : "", age: undefined };
  });
}

export function BookingWizard({ tour, userName }: BookingWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [travelDate, setTravelDate] = useState<Date | undefined>();
  const [travelers, setTravelers] = useState(1);
  const [travelerInfo, setTravelerInfo] = useState<TravelerInput[]>([
    { name: userName, age: undefined },
  ]);

  const maxTravelers = Math.min(tour.availableSeats, tour.maxGuests);
  const unitPrice = getEffectivePrice(tour.price, tour.discountPrice);
  const totalPrice = Number(unitPrice) * travelers;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  function handleTravelersChange(value: string | null) {
    if (!value) return;
    const count = Number(value);
    setTravelers(count);
    setTravelerInfo((current) => createTravelers(count, current, userName));
  }

  function updateTraveler(index: number, field: keyof TravelerInput, value: string) {
    setTravelerInfo((current) =>
      current.map((traveler, i) => {
        if (i !== index) return traveler;
        if (field === "age") {
          return { ...traveler, age: value ? Number(value) : undefined };
        }
        return { ...traveler, [field]: value };
      }),
    );
  }

  function validateStep1() {
    if (!travelDate) {
      toast.error("Please select a travel date.");
      return false;
    }
    if (travelDate < today) {
      toast.error("Travel date must be in the future.");
      return false;
    }
    return true;
  }

  function validateStep2() {
    const invalid = travelerInfo.some((traveler) => traveler.name.trim().length < 2);
    if (invalid) {
      toast.error("Please enter a name for each traveler.");
      return false;
    }
    return true;
  }

  function goNext() {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep((current) => Math.min(current + 1, 3));
  }

  function goBack() {
    setStep((current) => Math.max(current - 1, 1));
  }

  async function handleConfirm() {
    if (!travelDate) return;

    setIsSubmitting(true);
    const result = await submitBooking({
      tourId: tour.id,
      travelDate: format(travelDate, "yyyy-MM-dd"),
      travelers,
      travelerInfo: travelerInfo.map((traveler) => ({
        name: traveler.name.trim(),
        age: traveler.age,
      })),
    });
    setIsSubmitting(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Booking submitted successfully!");
    router.push(`${ROUTES.bookingConfirmation(result.data.bookingNumber)}?confirmed=true`);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <BookingStepIndicator currentStep={step} />

        {step === 1 ? (
          <Card>
            <CardHeader>
              <CardTitle>Select Date & Travelers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Travel Date</Label>
                <Popover>
                  <PopoverTrigger
                    className={cn(
                      "border-input flex h-8 w-full items-center justify-start gap-2 rounded-lg border bg-transparent px-2.5 text-sm",
                      !travelDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="size-4" />
                    {travelDate ? formatDate(travelDate) : "Pick a date"}
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={travelDate}
                      onSelect={setTravelDate}
                      disabled={{ before: today }}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="travelers">Number of Travelers</Label>
                <Select value={String(travelers)} onValueChange={handleTravelersChange}>
                  <SelectTrigger id="travelers" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: maxTravelers }, (_, i) => i + 1).map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n} traveler{n > 1 ? "s" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-muted-foreground text-xs">
                  {tour.availableSeats} seats available · Max {tour.maxGuests} per booking
                </p>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {step === 2 ? (
          <Card>
            <CardHeader>
              <CardTitle>Traveler Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {travelerInfo.map((traveler, index) => (
                <div key={index} className="space-y-4 rounded-xl border p-4">
                  <p className="text-sm font-medium">
                    Traveler {index + 1}
                    {index === 0 ? " (Lead traveler)" : ""}
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor={`name-${index}`}>Full Name</Label>
                      <Input
                        id={`name-${index}`}
                        value={traveler.name}
                        onChange={(e) => updateTraveler(index, "name", e.target.value)}
                        placeholder="Full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`age-${index}`}>Age (optional)</Label>
                      <Input
                        id={`age-${index}`}
                        type="number"
                        min={1}
                        max={120}
                        value={traveler.age ?? ""}
                        onChange={(e) => updateTraveler(index, "age", e.target.value)}
                        placeholder="Age"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ) : null}

        {step === 3 ? (
          <Card>
            <CardHeader>
              <CardTitle>Review Your Booking</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-muted-foreground">Travel Date</p>
                  <p className="font-medium">{travelDate ? formatDate(travelDate) : "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Travelers</p>
                  <p className="font-medium">{travelers}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <p className="text-sm font-medium">Traveler Details</p>
                {travelerInfo.map((traveler, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>
                      {traveler.name}
                      {traveler.age ? ` (${traveler.age} yrs)` : ""}
                    </span>
                    <span className="text-muted-foreground">Traveler {index + 1}</span>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {formatPrice(unitPrice)} × {travelers} traveler{travelers > 1 ? "s" : ""}
                  </span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-base font-semibold">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(totalPrice)}</span>
                </div>
              </div>

              <p className="text-muted-foreground rounded-lg bg-muted/50 p-3 text-xs">
                Your booking will be submitted with <strong>Pending</strong> status. Our team
                will review and confirm it within 24 hours. Payment is collected after
                confirmation.
              </p>
            </CardContent>
          </Card>
        ) : null}

        <div className="flex justify-between gap-3">
          {step > 1 ? (
            <Button type="button" variant="outline" onClick={goBack}>
              <ChevronLeft className="size-4" />
              Back
            </Button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <Button type="button" onClick={goNext}>
              Continue
              <ChevronRight className="size-4" />
            </Button>
          ) : (
            <Button type="button" onClick={handleConfirm} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Confirm Booking"}
            </Button>
          )}
        </div>
      </div>

      <aside>
        <Card className="sticky top-24">
          <CardContent className="p-0">
            <div className="relative aspect-video overflow-hidden rounded-t-xl">
              <Image
                src={tour.coverImage}
                alt={tour.title}
                fill
                className="object-cover"
                sizes="400px"
              />
            </div>
            <div className="space-y-3 p-5">
              <div>
                <h2 className="font-heading text-lg font-semibold">{tour.title}</h2>
                <p className="text-muted-foreground mt-1 flex items-center gap-1 text-sm">
                  <MapPin className="size-3.5" />
                  {tour.destinationName}, {tour.country}
                </p>
              </div>
              <div className="text-muted-foreground flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <Users className="size-3.5" />
                  {travelers} traveler{travelers > 1 ? "s" : ""}
                </span>
                <span>{tour.duration}</span>
              </div>
              <Separator />
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-muted-foreground text-xs">Estimated total</p>
                  <p className="text-primary text-2xl font-bold">{formatPrice(totalPrice)}</p>
                </div>
                <p className="text-muted-foreground text-xs">{formatPrice(unitPrice)}/person</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
