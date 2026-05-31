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
  it("renders both locale labels and marks current locale active", () => {
    render(
      <NextIntlClientProvider locale="en" messages={messagesEn}>
        <LanguageToggle />
      </NextIntlClientProvider>,
    );
    const en = screen.getByRole("link", { name: /english/i });
    const tr = screen.getByRole("link", { name: /türkçe/i });
    expect(en).toHaveAttribute("aria-current", "page");
    expect(tr).not.toHaveAttribute("aria-current");
  });
});
