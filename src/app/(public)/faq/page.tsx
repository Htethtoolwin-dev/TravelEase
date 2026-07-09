import type { Metadata } from "next";
import { PageHero } from "@/components/shared/page-hero";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about booking and travel with TravelEase.",
};

const faqs = [
  {
    q: "How do I book a tour?",
    a: "Browse our tour packages, select your preferred tour, sign in or create an account, and follow the booking wizard to select your travel date and number of travelers.",
  },
  {
    q: "What is the cancellation policy?",
    a: "Pending bookings can be cancelled from your dashboard at any time. Confirmed bookings are subject to our cancellation terms — contact us for details.",
  },
  {
    q: "Are flights included in tour prices?",
    a: "Flights are generally not included unless specifically stated in the tour's included services. Check each tour detail page for a full breakdown.",
  },
  {
    q: "How do I contact customer support?",
    a: "You can reach us via the Contact page, email us at hello@travelease.com, or call +66 2 123 4567. We respond within 24 hours.",
  },
  {
    q: "Can I customize a tour package?",
    a: "Yes! Contact our team with your requirements and we'll work with you to create a personalized itinerary.",
  },
  {
    q: "Is travel insurance required?",
    a: "We strongly recommend travel insurance for all international trips. It is not included in our standard packages.",
  },
];

export default function FaqPage() {
  return (
    <>
      <PageHero
        title="Frequently Asked Questions"
        description="Find answers to common questions about booking and traveling with us."
      />
      <div className="container mx-auto max-w-3xl px-4 py-12">
        <div className="space-y-4">
          {faqs.map((faq) => (
            <details
              key={faq.q}
              className="group rounded-xl border bg-card p-5 open:shadow-sm"
            >
              <summary className="cursor-pointer list-none font-semibold marker:hidden">
                {faq.q}
              </summary>
              <p className="text-muted-foreground mt-3 text-sm leading-relaxed">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
    </>
  );
}
