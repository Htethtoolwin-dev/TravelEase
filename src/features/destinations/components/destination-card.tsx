import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTES } from "@/constants";

interface DestinationCardProps {
  slug: string;
  name: string;
  country: string;
  city: string;
  image: string;
  tourCount: number;
}

export function DestinationCard({
  slug,
  name,
  country,
  city,
  image,
  tourCount,
}: DestinationCardProps) {
  return (
    <Link href={`${ROUTES.destinations}/${slug}`}>
      <Card className="group overflow-hidden pt-0 transition-all hover:-translate-y-1 hover:shadow-lg">
        <div className="relative h-48 overflow-hidden">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-4 left-4 text-white">
            <p className="flex items-center gap-1 text-sm text-white/80">
              <MapPin className="size-3.5" />
              {country}
            </p>
            <h3 className="font-heading text-xl font-semibold">{city}</h3>
            <p className="text-sm text-white/80">{tourCount} tours available</p>
          </div>
        </div>
        <CardContent className="py-4">
          <p className="text-muted-foreground line-clamp-2 text-sm">{name}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
