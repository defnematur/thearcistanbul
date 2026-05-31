import { type ReactNode } from "react";
import { clsx } from "clsx";

type Width = "prose" | "editorial" | "gallery";

export function Container({
  children,
  width = "editorial",
  className,
}: {
  children: ReactNode;
  width?: Width;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "mx-auto px-6 md:px-8",
        width === "prose" && "max-w-prose",
        width === "editorial" && "max-w-editorial",
        width === "gallery" && "max-w-gallery",
        className,
      )}
    >
      {children}
    </div>
  );
}
