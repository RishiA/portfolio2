import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./tailwind.css";
import "./v2.css";

export const metadata: Metadata = {
  title: "Rishi Athanikar",
  robots: { index: false, follow: false }
};

export default function V2Layout({ children }: Readonly<{ children: ReactNode }>) {
  return <div className="v2">{children}</div>;
}
