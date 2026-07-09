import type { Metadata } from "next";
import { SettingsManager } from "@/features/admin/components/settings-manager";
import { SITE_STATS } from "@/constants";
import { getSiteSettings } from "@/services/admin/content.service";

export const metadata: Metadata = { title: "Site Settings" };

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  const stats = (settings.stats as typeof SITE_STATS) ?? {
    happyCustomers: SITE_STATS.happyCustomers,
    toursCompleted: SITE_STATS.toursCompleted,
    destinations: SITE_STATS.destinations,
    yearsExperience: SITE_STATS.yearsExperience,
  };

  const contact = (settings.contact as {
    email: string;
    phone: string;
    address: string;
  }) ?? {
    email: "hello@travelease.com",
    phone: "+66 2 123 4567",
    address: "123 Travel Street, Bangkok",
  };

  return <SettingsManager stats={stats} contact={contact} />;
}
