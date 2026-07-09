import Link from "next/link";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { SignOutButton } from "@/features/auth/components/sign-out-button";
import { AdminDashboardNav } from "@/features/dashboard/components/admin-dashboard-nav";
import { APP_NAME, ROUTES } from "@/constants";
import { requireAdmin } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();

  return (
    <div className="bg-muted/20 min-h-screen">
      <header className="bg-background border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link href={ROUTES.home} className="font-heading font-semibold">
              {APP_NAME}
            </Link>
            <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium">
              Admin
            </span>
          </div>
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
        <aside className="hidden w-60 shrink-0 lg:block">
          <AdminDashboardNav />
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
