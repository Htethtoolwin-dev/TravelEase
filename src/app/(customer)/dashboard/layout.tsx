import Link from "next/link";
import { redirect } from "next/navigation";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { SignOutButton } from "@/features/auth/components/sign-out-button";
import { CustomerDashboardNav } from "@/features/dashboard/components/customer-dashboard-nav";
import { APP_NAME, ROUTES } from "@/constants";
import { requireAuth } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth();

  if (session.user.role === "admin") {
    redirect(ROUTES.admin);
  }

  return (
    <div className="bg-muted/20 min-h-screen">
      <header className="bg-background border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href={ROUTES.home} className="font-heading font-semibold">
            {APP_NAME}
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground hidden text-sm sm:inline">
              {session.user.name}
            </span>
            <ThemeToggle />
            <SignOutButton />
          </div>
        </div>
      </header>

      <div className="container mx-auto flex gap-8 px-4 py-8">
        <aside className="hidden w-56 shrink-0 md:block">
          <CustomerDashboardNav />
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
