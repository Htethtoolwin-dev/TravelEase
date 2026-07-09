import type { Metadata } from "next";
import { PageHero } from "@/components/shared/page-hero";
import { APP_NAME, SITE_STATS, WHY_CHOOSE_US } from "@/constants";
import {
  BadgeDollarSign,
  Headphones,
  MapPin,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About Us",
  description: `Learn about ${APP_NAME} and our passion for creating unforgettable journeys.`,
};

const iconMap: Record<string, LucideIcon> = {
  MapPin,
  BadgeDollarSign,
  ShieldCheck,
  Headphones,
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        title="About Us"
        description="We're passionate about helping travelers discover the world's most incredible destinations."
      />
      <div className="container mx-auto max-w-4xl px-4 py-16">
        <div className="space-y-6 leading-relaxed">
          <p>
            {APP_NAME} is a modern travel agency dedicated to crafting unforgettable
            experiences for adventurers, families, and solo travelers alike. Founded with
            a simple mission — to make world-class travel accessible — we&apos;ve grown into
            a trusted name in curated tour packages.
          </p>
          <p>
            Our team of expert guides and travel planners work tirelessly to design
            itineraries that go beyond the ordinary. From hidden gems in Southeast Asia
            to iconic landmarks in Europe, every tour is handpicked for quality,
            authenticity, and value.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {Object.entries(SITE_STATS).map(([key, value]) => (
            <div key={key} className="rounded-2xl border bg-card p-6 text-center">
              <p className="text-primary text-3xl font-bold">{value.toLocaleString()}+</p>
              <p className="text-muted-foreground mt-1 capitalize text-sm">
                {key.replace(/([A-Z])/g, " $1").trim()}
              </p>
            </div>
          ))}
        </div>

        <h2 className="font-heading mt-16 mb-6 text-2xl font-semibold">Why Choose Us</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {WHY_CHOOSE_US.map((item) => {
            const Icon = iconMap[item.icon] ?? MapPin;
            return (
              <div key={item.title} className="rounded-xl border p-5">
                <Icon className="text-primary mb-3 size-6" />
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-muted-foreground mt-1 text-sm">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
