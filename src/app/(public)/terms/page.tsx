import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/shared/legal-page";

export const metadata: Metadata = { title: "Terms & Conditions" };

const sections: LegalSection[] = [
  {
    heading: "Acceptance of terms",
    paragraphs: [
      "By using TravelEase or making a booking, you agree to these terms. If you do not agree, please do not use our services.",
    ],
  },
  {
    heading: "Accounts",
    paragraphs: [
      "You are responsible for keeping your login details secure and for all activity under your account. Information you provide must be accurate and up to date.",
    ],
  },
  {
    heading: "Bookings and payment",
    paragraphs: [
      "A booking is confirmed once you receive a confirmation from us. Prices are shown per person unless stated otherwise and may change until a booking is confirmed.",
      "You must provide correct traveler details. We are not responsible for issues caused by incorrect information supplied at booking.",
    ],
  },
  {
    heading: "Cancellations and changes",
    paragraphs: [
      "You can request a cancellation from your dashboard. Refunds depend on how far in advance you cancel and on the cancellation terms of the specific tour.",
      "We may change or cancel a tour due to circumstances beyond our control, such as weather or safety concerns. In that case we will offer an alternative or a refund.",
    ],
  },
  {
    heading: "Traveler responsibilities",
    paragraphs: [
      "You are responsible for having valid travel documents, visas, and any required vaccinations, and for following the guidance of tour leaders and local laws.",
    ],
  },
  {
    heading: "Reviews and content",
    paragraphs: [
      "Reviews you submit must be honest and relate to your own experience. We may moderate or remove content that is offensive, misleading, or unrelated.",
    ],
  },
  {
    heading: "Limitation of liability",
    paragraphs: [
      "To the extent permitted by law, TravelEase is not liable for indirect losses or for events outside our reasonable control. Nothing in these terms limits rights you have under applicable consumer law.",
    ],
  },
  {
    heading: "Changes to these terms",
    paragraphs: [
      "We may update these terms from time to time. Continued use of the service after changes means you accept the updated terms.",
    ],
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms & Conditions"
      description="Terms of service for using TravelEase."
      lastUpdated="November 23, 2026"
      sections={sections}
    />
  );
}
