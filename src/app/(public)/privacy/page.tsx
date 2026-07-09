import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/shared/placeholder-page";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <PlaceholderPage
      title="Privacy Policy"
      description="How we collect, use, and protect your personal information."
    />
  );
}
