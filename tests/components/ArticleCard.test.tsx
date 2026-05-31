import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { ArticleCard } from "@/components/public/ArticleCard";

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

vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));

describe("ArticleCard", () => {
  it("renders title, category, date and excerpt, linking to the slug", () => {
    render(
      <ArticleCard
        article={{
          slug: "sublime",
          title: "Sublime",
          excerpt: "Where intellectual conversations meet aesthetic refinement.",
          category: "field",
          date: "2024-01-15",
          image: "/images/journal/sublime.jpg",
        }}
        categoryLabel="Field"
        locale="en"
      />,
    );
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/blog/sublime");
    expect(within(link).getByText("Sublime")).toBeInTheDocument();
    expect(within(link).getByText("Field")).toBeInTheDocument();
    expect(within(link).getByText(/January.*2024/)).toBeInTheDocument();
    expect(
      within(link).getByText(/intellectual conversations meet aesthetic refinement/i),
    ).toBeInTheDocument();
  });
});
