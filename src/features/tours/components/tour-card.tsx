import Image from "next/image";
import Link from "next/link";
import { Clock, MapPin, Star, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTES } from "@/constants";
import { formatPrice, getEffectivePrice } from "@/utils/format";

interface TourCardProps {
  slug: string;
  title: string;
  coverImage: string;
  duration: string;
  price: string;
  discountPrice: string | null;
  averageRating: string | null;
  reviewCount: number;
  availableSeats: number;
  destinationName: string;
  country: string;
  difficulty: string;
  featured?: boolean;
}

export function TourCard({
  slug,
  title,
  coverImage,
  duration,
  price,
  discountPrice,
  averageRating,
  reviewCount,
  availableSeats,
  destinationName,
  country,
  difficulty,
  featured,
}: TourCardProps) {
  const effectivePrice = getEffectivePrice(price, discountPrice);

  return (
    <Link href={`${ROUTES.tours}/${slug}`}>
      <Card className="group overflow-hidden pt-0 transition-all hover:-translate-y-1 hover:shadow-lg">
        <div className="relative h-48 overflow-hidden">
          <Image
            src={coverImage}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          {featured ? (
            <Badge className="absolute top-3 left-3">Featured</Badge>
          ) : null}
          {discountPrice ? (
            <Badge variant="secondary" className="absolute top-3 right-3">
              Sale
            </Badge>
          ) : null}
        </div>
        <CardContent className="space-y-3">
          <div>
            <p className="text-muted-foreground flex items-center gap-1 text-xs">
              <MapPin className="size-3" />
              {destinationName}, {country}
            </p>
            <h3 className="font-heading group-hover:text-primary mt-1 line-clamp-2 font-semibold">
              {title}
            </h3>
          </div>
          <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-sm">
            <span className="flex items-center gap-1">
              <Clock className="size-3.5" />
              {duration}
            </span>
            <span className="flex items-center gap-1">
              <Star className="size-3.5 fill-amber-400 text-amber-400" />
              {Number(averageRating ?? 0).toFixed(1)} ({reviewCount})
            </span>
            <span className="flex items-center gap-1">
              <Users className="size-3.5" />
              {availableSeats} seats
            </span>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-primary text-lg font-bold">
                {formatPrice(effectivePrice)}
              </p>
              {discountPrice ? (
                <p className="text-muted-foreground text-sm line-through">
                  {formatPrice(price)}
                </p>
              ) : null}
            </div>
            <Badge variant="outline" className="capitalize">
              {difficulty}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
