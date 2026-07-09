import { cn } from "@/lib/utils";

export function PageHero({
  title,
  description,
  className,
}: {
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "border-b bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-16 md:py-24",
        className,
      )}
    >
      <div className="container mx-auto px-4">
        <h1 className="font-heading text-4xl font-bold tracking-tight md:text-5xl">
          {title}
        </h1>
        {description ? (
          <p className="text-muted-foreground mt-4 max-w-2xl text-lg">
            {description}
          </p>
        ) : null}
      </div>
    </section>
  );
}
