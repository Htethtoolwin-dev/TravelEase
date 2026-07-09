import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ROUTES, USER_ROLES } from "@/constants";
import type { UserRole } from "@/types";

export async function getSession() {
  return auth.api.getSession({
    headers: await headers(),
  });
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) redirect(ROUTES.login);
  return session;
}

export async function requireRole(role: UserRole) {
  const session = await requireAuth();
  if (session.user.role !== role) redirect(ROUTES.home);
  return session;
}

export async function requireAdmin() {
  return requireRole(USER_ROLES.ADMIN as UserRole);
}

export async function requireCustomer() {
  const session = await requireAuth();
  if (session.user.role === USER_ROLES.ADMIN) return session;
  if (session.user.role !== USER_ROLES.CUSTOMER) redirect(ROUTES.home);
  return session;
}
