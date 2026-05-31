import { createNavigation } from "next-intl/navigation";
import { defineRouting } from "next-intl/routing";
import { defaultLocale, locales, localePrefix, pathnames } from "./config";

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix,
  pathnames,
});

// next-intl v4: createNavigation replaces the v3 createLocalizedPathnamesNavigation.
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
