import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { PageHero } from "@/components/shared/page-hero";
import { Card, CardContent } from "@/components/ui/card";
import { ContactForm } from "@/features/contact/components/contact-form";
import { getPublicContact } from "@/services/settings.service";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with our travel experts.",
};

export default async function ContactPage() {
  const contact = await getPublicContact();

  const items = [
    { icon: MapPin, title: "Address", text: contact.address },
    { icon: Phone, title: "Phone", text: contact.phone },
    { icon: Mail, title: "Email", text: contact.email },
  ];

  return (
    <>
      <PageHero
        title="Contact Us"
        description="Have a question or need help planning your trip? We're here for you."
      />
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-12 lg:grid-cols-3">
          <div className="space-y-4">
            {items.map(({ icon: Icon, title, text }) => (
              <Card key={title}>
                <CardContent className="flex items-start gap-4 pt-6">
                  <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-lg">
                    <Icon className="size-5" />
                  </div>
                  <div>
                    <p className="font-medium">{title}</p>
                    <p className="text-muted-foreground text-sm">{text}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="pt-6">
                <h2 className="font-heading mb-6 text-xl font-semibold">Send a Message</h2>
                <ContactForm />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
