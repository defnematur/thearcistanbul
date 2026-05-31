import createMiddleware from "next-intl/middleware";
import { routing } from "./lib/i18n/routing";

// Next.js 16 renamed the `middleware` file convention to `proxy`. The handler
// shape (default export + `config.matcher`) is unchanged. Admin-gate logic is
// added in Plan 2 (DB & Auth).
export default createMiddleware(routing);

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
