import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { JournalRow } from "@/components/public/JournalRow";

// next-intl v4's localized Link pulls next/navigation internals that don't
// resolve under jsdom; stub it with a plain anchor that resolves the slug from
// the localized-pathname href object.
vi.mock("@/lib/i18n/routing", () => ({
  Link: ({
    href,
    children,
    className,
  }: {
    href: { pathname: string; params: { slug: string } };
    children: ReactNode;
    className?: string;
  }) => (
    <a href={`/blog/${href.params.slug}`} className={className}>
      {children}
    </a>
  ),
}));

// Render next/image as a plain img in tests.
vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));

describe("JournalRow", () => {
  it("renders title, category, formatted date and excerpt, linking to the slug", () => {
    render(
      <ul>
        <JournalRow
          article={{
            slug: "on-colour-and-concrete",
            title: "On colour and concrete",
            excerpt: "A short excerpt.",
            category: "essay",
            date: "2026-05-18",
            image: null,
            spotifyUrl: null,
          }}
          categoryLabel="Essay"
          locale="en"
        />
      </ul>,
    );
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/blog/on-colour-and-concrete");
    expect(within(link).getByText("On colour and concrete")).toBeInTheDocument();
    expect(within(link).getByText("Essay")).toBeInTheDocument();
    expect(within(link).getByText(/May.*2026/)).toBeInTheDocument();
    expect(within(link).getByText("A short excerpt.")).toBeInTheDocument();
  });
});
