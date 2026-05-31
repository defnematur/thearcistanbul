import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import messagesEn from "@/messages/en.json";
import { LanguageToggle } from "@/components/public/LanguageToggle";

vi.mock("next/navigation", () => ({
  useParams: () => ({ locale: "en" }),
  usePathname: () => "/en/blog",
}));

describe("LanguageToggle", () => {
  it("shows the current locale and links to the other locale's equivalent path", () => {
    render(
      <NextIntlClientProvider locale="en" messages={messagesEn}>
        <LanguageToggle />
      </NextIntlClientProvider>,
    );
    const link = screen.getByRole("link");
    expect(link).toHaveTextContent(/en/i);
    expect(link).toHaveAttribute("href", "/tr/blog");
  });
});
