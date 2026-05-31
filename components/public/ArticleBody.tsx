import { Fragment, type ReactNode } from "react";

// Minimal, safe Markdown subset for placeholder bodies: blank-line paragraphs,
// "## " subheadings, and *italic* spans. All text flows through React (escaped) —
// no raw HTML. Plan 4 replaces this with next-mdx-remote.
function renderInline(text: string): ReactNode {
  return text.split("*").map((part, i) =>
    i % 2 === 1 ? <em key={i}>{part}</em> : <Fragment key={i}>{part}</Fragment>,
  );
}

export function ArticleBody({ markdown }: { markdown: string }) {
  const blocks = markdown.trim().split(/\n\n+/);
  return (
    <div className="space-y-6 text-body">
      {blocks.map((block, i) =>
        block.startsWith("## ") ? (
          <h2 key={i} className="pt-8 font-serif text-h2">
            {renderInline(block.slice(3))}
          </h2>
        ) : (
          <p key={i}>{renderInline(block)}</p>
        ),
      )}
    </div>
  );
}
