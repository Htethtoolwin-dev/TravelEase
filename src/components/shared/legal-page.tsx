import Link from "next/link";
import { PageHero } from "@/components/shared/page-hero";
import { ROUTES } from "@/constants";

export interface LegalSection {
  heading: string;
  paragraphs: string[];
}

export function LegalPage({
  title,
  description,
  lastUpdated,
  sections,
}: {
  title: string;
  description: string;
  lastUpdated: string;
  sections: LegalSection[];
}) {
  return (
    <>
      <PageHero title={title} description={description} />
      <div className="container mx-auto px-4 py-16">
        <article className="mx-auto max-w-3xl space-y-10">
          <p className="text-muted-foreground text-sm">Last updated: {lastUpdated}</p>
          {sections.map((section, i) => (
            <section key={section.heading} className="space-y-3">
              <h2 className="font-heading text-2xl font-semibold">
                {i + 1}. {section.heading}
              </h2>
              {section.paragraphs.map((p) => (
                <p key={p} className="text-muted-foreground leading-relaxed">
                  {p}
                </p>
              ))}
            </section>
          ))}
          <p className="text-muted-foreground border-t pt-6">
            Questions? Reach us through our{" "}
            <Link href={ROUTES.contact} className="text-primary underline-offset-4 hover:underline">
              contact page
            </Link>
            .
          </p>
        </article>
      </div>
    </>
  );
}
