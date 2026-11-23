import { NextRequest, NextResponse } from "next/server";
import { ROUTES } from "@/constants";

const publicRoutes = [
  ROUTES.home,
  ROUTES.about,
  ROUTES.destinations,
  ROUTES.tours,
  ROUTES.gallery,
  ROUTES.blog,
  ROUTES.contact,
  ROUTES.faq,
  ROUTES.privacy,
  ROUTES.terms,
  ROUTES.login,
  ROUTES.register,
  ROUTES.forgotPassword,
  ROUTES.resetPassword,
];

const authRoutes = [
  ROUTES.login,
  ROUTES.register,
  ROUTES.forgotPassword,
  ROUTES.resetPassword,
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const sessionCookie = request.cookies.get("better-auth.session_token");
  const isLoggedIn = !!sessionCookie?.value;

  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  const isDashboardRoute = pathname.startsWith(ROUTES.dashboard);
  const isAdminRoute = pathname.startsWith(ROUTES.admin);

  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL(ROUTES.dashboard, request.url));
  }

  if ((isDashboardRoute || isAdminRoute) && !isLoggedIn) {
    const loginUrl = new URL(ROUTES.login, request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminRoute && isLoggedIn) {
    // Role check happens server-side in admin layout for accuracy
    return NextResponse.next();
  }

  if (!isPublicRoute && !isDashboardRoute && !isAdminRoute && !pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
