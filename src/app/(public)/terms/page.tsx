import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/shared/placeholder-page";

export const metadata: Metadata = { title: "Terms & Conditions" };

export default function TermsPage() {
  return (
    <PlaceholderPage
      title="Terms & Conditions"
      description="Terms of service for using TravelEase."
    />
  );
}
