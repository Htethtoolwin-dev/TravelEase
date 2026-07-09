"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Category {
  slug: string;
  name: string;
}

export interface TourFilterValues {
  q: string;
  category: string;
  difficulty: string;
  sort: string;
  minRating: string;
}

function SearchField({
  initialQuery,
  isPending,
  onSearch,
}: {
  initialQuery: string;
  isPending: boolean;
  onSearch: (query: string) => void;
}) {
  const [query, setQuery] = useState(initialQuery);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSearch(query);
      }}
      className="flex gap-2"
    >
      <div className="relative flex-1">
        <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          name="q"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tours, destinations..."
          className="pl-9"
        />
      </div>
      <Button type="submit" disabled={isPending}>
        Search
      </Button>
    </form>
  );
}

export function TourFilters({
  categories,
  filters,
}: {
  categories: Category[];
  filters: TourFilterValues;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      startTransition(() => {
        router.push(`/tours?${params.toString()}`);
      });
    },
    [router, searchParams],
  );

  return (
    <div className="bg-card space-y-4 rounded-2xl border p-4 shadow-sm">
      <SearchField
        key={filters.q}
        initialQuery={filters.q}
        isPending={isPending}
        onSearch={(query) => updateParams("q", query)}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Select
          value={filters.category}
          onValueChange={(v) => updateParams("category", v ?? "all")}
        >
          <SelectTrigger>
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.slug} value={c.slug}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.difficulty}
          onValueChange={(v) => updateParams("difficulty", v ?? "all")}
        >
          <SelectTrigger>
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Difficulties</SelectItem>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="moderate">Moderate</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.sort}
          onValueChange={(v) => updateParams("sort", v ?? "newest")}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="popular">Most Popular</SelectItem>
            <SelectItem value="price-asc">Lowest Price</SelectItem>
            <SelectItem value="price-desc">Highest Price</SelectItem>
            <SelectItem value="rating">Highest Rated</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.minRating}
          onValueChange={(v) => updateParams("minRating", v ?? "all")}
        >
          <SelectTrigger>
            <SelectValue placeholder="Min Rating" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any Rating</SelectItem>
            <SelectItem value="3">3+ Stars</SelectItem>
            <SelectItem value="4">4+ Stars</SelectItem>
            <SelectItem value="4.5">4.5+ Stars</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
