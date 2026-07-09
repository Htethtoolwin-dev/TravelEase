"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Plane } from "lucide-react";
import { useState } from "react";
import { ButtonLink } from "@/components/shared/button-link";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { APP_NAME, ROUTES } from "@/constants";
import { cn } from "@/lib/utils";
import { useSession, signOut, getUserRole } from "@/lib/auth-client";

const navLinks = [
  { href: ROUTES.home, label: "Home" },
  { href: ROUTES.destinations, label: "Destinations" },
  { href: ROUTES.tours, label: "Tours" },
  { href: ROUTES.gallery, label: "Gallery" },
  { href: ROUTES.blog, label: "Blog" },
  { href: ROUTES.about, label: "About" },
  { href: ROUTES.contact, label: "Contact" },
];

export function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  const dashboardHref =
    getUserRole(session?.user) === "admin" ? ROUTES.admin : ROUTES.dashboard;

  return (
    <header className="bg-background/80 sticky top-0 z-50 border-b backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href={ROUTES.home} className="flex items-center gap-2 font-semibold">
          <div className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-lg">
            <Plane className="size-5" />
          </div>
          <span className="font-heading text-xl">{APP_NAME}</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "hover:text-primary rounded-md px-3 py-2 text-sm font-medium transition-colors",
                pathname === link.href
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {session ? (
            <>
              <ButtonLink href={dashboardHref} variant="ghost" className="hidden sm:inline-flex">
                Dashboard
              </ButtonLink>
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut()}
                className="hidden sm:inline-flex"
              >
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <ButtonLink href={ROUTES.login} variant="ghost" className="hidden sm:inline-flex">
                Sign In
              </ButtonLink>
              <ButtonLink href={ROUTES.register} className="hidden sm:inline-flex">
                Get Started
              </ButtonLink>
            </>
          )}

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon" }),
                "lg:hidden",
              )}
            >
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>{APP_NAME}</SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "rounded-md px-3 py-2 text-sm font-medium",
                      pathname === link.href
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted",
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="mt-4 flex flex-col gap-2 border-t pt-4">
                  {session ? (
                    <>
                      <ButtonLink
                        href={dashboardHref}
                        variant="outline"
                        onClick={() => setOpen(false)}
                      >
                        Dashboard
                      </ButtonLink>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          signOut();
                          setOpen(false);
                        }}
                      >
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <>
                      <ButtonLink
                        href={ROUTES.login}
                        variant="outline"
                        onClick={() => setOpen(false)}
                      >
                        Sign In
                      </ButtonLink>
                      <ButtonLink href={ROUTES.register} onClick={() => setOpen(false)}>
                        Get Started
                      </ButtonLink>
                    </>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
