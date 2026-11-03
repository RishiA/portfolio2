"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useMounted } from "@/lib/theme/use-mounted";

export function AppSwitch() {
  const pathname = usePathname() ?? "";
  const inTerminal = pathname.startsWith("/v2/terminal");
  const inNotes = pathname.startsWith("/v2/notes");
  return (
    <nav className="v2-switch" aria-label="App">
      <Link href="/v2/notes/about-me" aria-current={inNotes ? "page" : undefined}>
        Notes
      </Link>
      {/* Plain anchor: the terminal ships as its own bundle and loads as a fresh page. */}
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
      <a href="/v2/terminal" aria-current={inTerminal ? "page" : undefined}>
        Terminal
      </a>
    </nav>
  );
}

export function V2ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();
  if (!mounted) return <span className="v2-icon-btn" aria-hidden="true" />;
  const isDark = resolvedTheme === "dark";
  return (
    <button
      type="button"
      className="v2-icon-btn"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      {isDark ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
    </button>
  );
}
