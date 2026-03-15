"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container } from "@/components/container";
import { ThemeToggle } from "@/components/theme-toggle";

const navItems = [
  { href: "/work", label: "Proof of Work" },
  { href: "/about", label: "About" },
  { href: "/notes", label: "Notes" },
  { href: "/blog", label: "Blog" }
];

export function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <header className="site-header">
      <Container className={`site-header-inner ${isHome ? "is-home" : ""}`}>
        {isHome ? null : (
          <Link className="brand" href="/">
            Rishi Athanikar
          </Link>
        )}
        {isHome ? null : (
          <nav aria-label="Primary navigation">
            <ul className="site-nav">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={isActive ? "page" : undefined}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}
        {isHome ? <div className="site-header-spacer" aria-hidden="true" /> : null}
        <ThemeToggle />
      </Container>
    </header>
  );
}
