import createIntlMiddleware from "next-intl/middleware";
import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { routing } from "./lib/i18n/routing";
import { authConfig } from "./lib/auth.config";

// Next.js 16 renamed the `middleware` file convention to `proxy`. We compose
// two concerns: next-intl locale routing for public pages, and an auth gate for
// `/admin/*`. The auth instance is built from the edge-safe `authConfig` (no DB
// / bcrypt / Upstash imports) so this proxy stays lightweight.
const intl = createIntlMiddleware(routing);
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") return NextResponse.next();
    if (!req.auth?.user) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  return intl(req);
});

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
