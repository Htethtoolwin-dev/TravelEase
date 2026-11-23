import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/shared/legal-page";

export const metadata: Metadata = { title: "Privacy Policy" };

const sections: LegalSection[] = [
  {
    heading: "Information we collect",
    paragraphs: [
      "When you create an account, book a tour, or contact us, we collect the details you provide, such as your name, email address, phone number, traveler details, and booking preferences.",
      "We also collect basic technical data, such as your browser type and pages visited, to keep the site secure and working well.",
    ],
  },
  {
    heading: "How we use your information",
    paragraphs: [
      "We use your information to manage your account, process and confirm bookings, respond to enquiries, send service messages about your trips, and improve our services.",
      "If you subscribe to our newsletter, we use your email to send travel news and offers. You can unsubscribe at any time.",
    ],
  },
  {
    heading: "Sharing your information",
    paragraphs: [
      "We share booking details only with the tour operators and service providers needed to deliver your trip, and with providers that host our platform. We do not sell your personal information.",
      "We may disclose information where required by law or to protect the rights and safety of our customers and staff.",
    ],
  },
  {
    heading: "Cookies",
    paragraphs: [
      "We use essential cookies to keep you signed in and remember your preferences, such as light or dark theme. These cookies are required for the site to function.",
    ],
  },
  {
    heading: "Data security and retention",
    paragraphs: [
      "We protect your data with encryption in transit, access controls, and secure password hashing. We keep personal information only as long as needed for the purposes above or as required by law.",
    ],
  },
  {
    heading: "Your rights",
    paragraphs: [
      "You can view and update your profile from your dashboard at any time. You may also ask us to access, correct, or delete your personal information by contacting us.",
    ],
  },
  {
    heading: "Changes to this policy",
    paragraphs: [
      "We may update this policy from time to time. When we do, we will revise the date at the top of this page.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      description="How we collect, use, and protect your personal information."
      lastUpdated="November 23, 2026"
      sections={sections}
    />
  );
}
