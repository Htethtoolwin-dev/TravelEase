import {
  BadgeDollarSign,
  Headphones,
  MapPin,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  MapPin,
  BadgeDollarSign,
  ShieldCheck,
  Headphones,
};

export function WhyChooseUsSection({
  items,
}: {
  items: readonly {
    title: string;
    description: string;
    icon: string;
  }[];
}) {
  return (
    <section className="container mx-auto px-4 py-16">
      <div className="mb-10 text-center">
        <h2 className="font-heading text-3xl font-bold md:text-4xl">Why Choose Us</h2>
        <p className="text-muted-foreground mt-3">
          We go the extra mile to make your journey extraordinary
        </p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => {
          const Icon = iconMap[item.icon] ?? MapPin;
          return (
            <div
              key={item.title}
              className="group rounded-2xl border bg-card p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="bg-primary/10 text-primary mb-4 flex size-12 items-center justify-center rounded-xl transition group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon className="size-6" />
              </div>
              <h3 className="font-heading font-semibold">{item.title}</h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
