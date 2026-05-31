import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import messagesTr from "@/messages/tr.json";
import { Header } from "@/components/public/Header";

vi.mock("next/navigation", () => ({
  useParams: () => ({ locale: "tr" }),
  usePathname: () => "/tr",
}));

// next-intl v4's localized Link pulls next/navigation internals that don't
// resolve under jsdom; stub the routing wrapper with a plain anchor since this
// test only asserts that the Header renders its links.
vi.mock("@/lib/i18n/routing", () => ({
  Link: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

describe("Header", () => {
  it("renders brand, nav links, and language toggle", () => {
    render(
      <NextIntlClientProvider locale="tr" messages={messagesTr}>
        <Header />
      </NextIntlClientProvider>,
    );
    // Brand link.
    expect(screen.getByRole("link", { name: "The Arc Istanbul" })).toBeInTheDocument();

    // Scope nav-link assertions to the Primary nav (the mobile toggle lives
    // outside it, so this avoids the duplicated language-toggle links that the
    // responsive markup intentionally renders). Exact names also avoid Turkish
    // dotted-capital case-folding issues (İletişim).
    const nav = screen.getByRole("navigation", { name: "Primary" });
    expect(within(nav).getByRole("link", { name: "Hakkımızda" })).toBeInTheDocument();
    expect(within(nav).getByRole("link", { name: "Blog" })).toBeInTheDocument();
    expect(within(nav).getByRole("link", { name: "İletişim" })).toBeInTheDocument();
    // Single language toggle (shows current locale, links to the other).
    expect(within(nav).getByRole("link", { name: /dili değiştir/i })).toBeInTheDocument();
  });
});
