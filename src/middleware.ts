import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);

const PROTECTED_ROUTES = ["/dashboard", "/users", "/router"];
const ADMIN_ROUTES = ["/users"];
const ADMIN_ROLES = ["SUPER_ADMIN", "TENANT_ADMIN"];

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;

  if (pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  const isLoginRoute = pathname === "/login";
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));

  if (isProtectedRoute && !isLoggedIn) {
    let callbackUrl = pathname;
    if (nextUrl.search) callbackUrl += nextUrl.search;

    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`, nextUrl)
    );
  }

  if (isLoginRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  const isAdminRoute = ADMIN_ROUTES.some((route) => pathname.startsWith(route));
  if (isAdminRoute && (!userRole || !ADMIN_ROLES.includes(userRole))) {
    return NextResponse.redirect(new URL("/dashboard/error/unauthorized", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
