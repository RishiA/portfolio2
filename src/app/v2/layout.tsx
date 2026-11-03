import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppSwitch, V2ThemeToggle } from "@/components/v2/top-bar";
import "./v2.css";

export const metadata: Metadata = {
  title: "Rishi Athanikar",
  robots: { index: false, follow: false }
};

export default function V2Layout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="v2">
      <a className="v2-skip" href="#v2-main">
        Skip to content
      </a>
      <header className="v2-topbar">
        <p className="v2-name">Rishi Athanikar</p>
        <AppSwitch />
        <div className="v2-topbar-end">
          <V2ThemeToggle />
          {/* Plain anchor on purpose: v1 and v2 must load as separate pages. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a className="v2-main-link" href="/">
            Main site
          </a>
        </div>
      </header>
      <main id="v2-main" className="v2-main" tabIndex={-1}>
        {children}
      </main>
    </div>
  );
}
