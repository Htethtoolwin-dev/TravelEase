import { SITE_STATS } from "@/constants";
import { getSiteSettings } from "@/services/admin/content.service";

export async function getPublicStats() {
  const settings = await getSiteSettings();
  const stats = settings.stats as typeof SITE_STATS | undefined;
  return stats ?? SITE_STATS;
}

export async function getPublicContact() {
  const settings = await getSiteSettings();
  return (settings.contact as {
    email: string;
    phone: string;
    address: string;
  }) ?? {
    email: "hello@travelease.com",
    phone: "+66 2 123 4567",
    address: "123 Travel Street, Bangkok",
  };
}
