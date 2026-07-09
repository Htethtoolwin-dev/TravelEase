"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Search } from "lucide-react";
import { ButtonLink } from "@/components/shared/button-link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/constants";

const suggestions = ["Bali", "Paris", "Tokyo", "Swiss Alps", "Santorini"];

export function HeroSection() {
  return (
    <section className="relative flex min-h-[85vh] items-center overflow-hidden">
      <div className="from-primary/90 via-primary/70 to-secondary/60 absolute inset-0 bg-gradient-to-br" />
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&q=80')] bg-cover bg-center opacity-20 mix-blend-overlay" />

      <div className="relative container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center text-white"
        >
          <h1 className="font-heading text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
            Discover Your Next
            <span className="block text-orange-300">Adventure</span>
          </h1>
          <p className="mt-6 text-lg text-white/90 md:text-xl">
            Explore breathtaking destinations and book curated tour packages with
            expert guides and seamless planning.
          </p>

          <div className="mt-10 rounded-2xl bg-white/95 p-2 shadow-2xl backdrop-blur dark:bg-gray-900/95">
            <form
              action={ROUTES.tours}
              className="flex flex-col gap-2 sm:flex-row"
            >
              <div className="relative flex-1">
                <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                <Input
                  name="q"
                  placeholder="Search destinations, tours, or cities..."
                  className="border-0 bg-transparent pl-10 shadow-none focus-visible:ring-0"
                />
              </div>
              <Button type="submit" size="lg" className="sm:px-8">
                Search Tours
              </Button>
            </form>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <span className="text-sm text-white/80">Popular:</span>
            {suggestions.map((item) => (
              <Link
                key={item}
                href={`${ROUTES.tours}?q=${item}`}
                className="rounded-full bg-white/20 px-3 py-1 text-sm text-white backdrop-blur transition hover:bg-white/30"
              >
                {item}
              </Link>
            ))}
          </div>

          <div className="mt-10">
            <ButtonLink href={ROUTES.tours} size="lg" variant="secondary">
              Explore Tours
              <ArrowRight className="ml-2 size-4" />
            </ButtonLink>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
