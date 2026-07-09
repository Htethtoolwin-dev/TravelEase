import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
  searchParams?: Record<string, string | undefined>;
}

export function ListPagination({
  currentPage,
  totalPages,
  basePath,
  searchParams = {},
}: PaginationProps) {
  if (totalPages <= 1) return null;

  function buildHref(page: number) {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    params.set("page", String(page));
    return `${basePath}?${params.toString()}`;
  }

  return (
    <Pagination className="mt-8">
      <PaginationContent>
        {currentPage > 1 ? (
          <PaginationItem>
            <PaginationPrevious href={buildHref(currentPage - 1)} />
          </PaginationItem>
        ) : null}

        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter(
            (p) =>
              p === 1 ||
              p === totalPages ||
              Math.abs(p - currentPage) <= 1,
          )
          .map((page, idx, arr) => {
            const prev = arr[idx - 1];
            const items = [];
            if (prev && page - prev > 1) {
              items.push(
                <PaginationItem key={`ellipsis-${page}`}>
                  <span className="px-2">…</span>
                </PaginationItem>,
              );
            }
            items.push(
              <PaginationItem key={page}>
                <PaginationLink
                  href={buildHref(page)}
                  isActive={page === currentPage}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>,
            );
            return items;
          })}

        {currentPage < totalPages ? (
          <PaginationItem>
            <PaginationNext href={buildHref(currentPage + 1)} />
          </PaginationItem>
        ) : null}
      </PaginationContent>
    </Pagination>
  );
}
