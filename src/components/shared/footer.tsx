import Link from "next/link";
import { Globe, Mail, MapPin, Phone, Share2 } from "lucide-react";
import { APP_NAME, ROUTES } from "@/constants";
import { Separator } from "@/components/ui/separator";

const footerLinks = {
  explore: [
    { href: ROUTES.destinations, label: "Destinations" },
    { href: ROUTES.tours, label: "Tour Packages" },
    { href: ROUTES.gallery, label: "Gallery" },
    { href: ROUTES.blog, label: "Blog" },
  ],
  company: [
    { href: ROUTES.about, label: "About Us" },
    { href: ROUTES.contact, label: "Contact" },
    { href: ROUTES.faq, label: "FAQ" },
    { href: ROUTES.privacy, label: "Privacy Policy" },
    { href: ROUTES.terms, label: "Terms & Conditions" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-muted/40 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <h3 className="font-heading text-lg font-semibold">{APP_NAME}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Your trusted partner for unforgettable travel experiences. Discover
              the world with curated tours and expert guidance.
            </p>
            <div className="flex gap-3">
              {[Share2, Globe, Mail].map((Icon, i) => (
                <Link
                  key={i}
                  href="#"
                  className="bg-background hover:bg-primary hover:text-primary-foreground flex size-9 items-center justify-center rounded-full border transition-colors"
                >
                  <Icon className="size-4" />
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-4 font-semibold">Explore</h4>
            <ul className="space-y-2">
              {footerLinks.explore.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-primary text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold">Company</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-primary text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold">Contact</h4>
            <ul className="text-muted-foreground space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="text-primary mt-0.5 size-4 shrink-0" />
                <span>123 Travel Street, Bangkok, Thailand</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="text-primary size-4 shrink-0" />
                <span>+66 2 123 4567</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="text-primary size-4 shrink-0" />
                <span>hello@travelease.com</span>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="text-muted-foreground flex flex-col items-center justify-between gap-4 text-sm sm:flex-row">
          <p>&copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
          <p>Crafted with care for travelers worldwide.</p>
        </div>
      </div>
    </footer>
  );
}
