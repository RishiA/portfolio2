"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuPanelId = useId();

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileOpen]);

  const closeMobile = () => setMobileOpen(false);
  const toggleMobile = () => setMobileOpen((o) => !o);

  const navLink = (item: (typeof navItems)[number]) => {
    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
    return (
      <li key={item.href}>
        <Link
          href={item.href}
          className="site-nav-mobile-link"
          aria-current={isActive ? "page" : undefined}
          onClick={closeMobile}
        >
          {item.label}
        </Link>
      </li>
    );
  };

  return (
    <header className="site-header">
      <Container className={`site-header-inner ${isHome ? "is-home" : ""}`}>
        {isHome ? (
          <div className="site-header-spacer" aria-hidden="true" />
        ) : (
          <Link className="brand" href="/">
            Rishi Athanikar
          </Link>
        )}

        {!isHome ? (
          <nav className="site-nav site-nav--desktop" aria-label="Primary navigation">
            <ul>
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <li key={item.href}>
                    <Link href={item.href} aria-current={isActive ? "page" : undefined}>
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        ) : null}

        <div className="site-header-actions">
          <ThemeToggle />
          <button
            type="button"
            className="site-header-menu-btn"
            aria-expanded={mobileOpen}
            aria-controls={menuPanelId}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={toggleMobile}
          >
            {mobileOpen ? <X size={22} strokeWidth={2} aria-hidden="true" /> : <Menu size={22} strokeWidth={2} aria-hidden="true" />}
          </button>
        </div>
      </Container>

      <div
        className={`site-header-drawer-backdrop ${mobileOpen ? "is-open" : ""}`}
        aria-hidden="true"
        onClick={closeMobile}
      />

      <div
        id={menuPanelId}
        className={`site-header-drawer ${mobileOpen ? "is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        aria-hidden={!mobileOpen}
        inert={!mobileOpen ? true : undefined}
      >
        <div className="site-header-drawer-top">
          <button
            type="button"
            className="site-header-drawer-close"
            aria-label="Close menu"
            onClick={closeMobile}
          >
            <X size={26} strokeWidth={2} aria-hidden="true" />
          </button>
        </div>
        <nav aria-label="Primary navigation">
          <ul className="site-nav-mobile-list">{navItems.map((item) => navLink(item))}</ul>
        </nav>
      </div>
    </header>
  );
}
