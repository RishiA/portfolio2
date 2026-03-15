import type { PropsWithChildren } from "react";
import clsx from "clsx";

type SectionProps = PropsWithChildren<{
  title?: string;
  subtitle?: string;
  className?: string;
}>;

export function Section({ title, subtitle, className, children }: SectionProps) {
  return (
    <section className={clsx("section", className)}>
      {(title || subtitle) && (
        <header className="section-header">
          {title && <h2>{title}</h2>}
          {subtitle && <p>{subtitle}</p>}
        </header>
      )}
      {children}
    </section>
  );
}
