import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/container";
import { pageMetadata } from "@/lib/seo/page-metadata";
import type { HomeLink } from "@/types/content";

const homeLinks: HomeLink[] = [
  { label: "Work", href: "/work" },
  { label: "About", href: "/about" },
  { label: "Notes", href: "/notes" },
  { label: "Blog", href: "/blog" }
];

export const metadata = pageMetadata({
  title: "Rishi Athanikar",
  titleAbsolute: true,
  description:
    "Rishi Athanikar is a product manager in New York building in fintech, banking, and regulated AI. Portfolio, writing, and side projects.",
  path: "/"
});

export default function HomePage() {
  return (
    <Container>
      <section className="home-gateway">
        <div className="home-stack">
          <h1 className="home-intro">Hello, I&apos;m Rishi.</h1>

          <figure className="home-portrait">
            <Image
              src="/images/rishi_sketch.webp"
              alt="Sketch portrait of Rishi Athanikar"
              width={900}
              height={900}
              sizes="(max-width: 768px) 300px, (max-width: 1200px) 500px, 900px"
              priority
            />
          </figure>

          <p className="home-blurb">
            I&apos;m a product leader who keeps ending up where money, software,
            and regulation meet. At{" "}
            <a href="https://rho.co" target="_blank" rel="noopener noreferrer">
              Rho
            </a>
            , I&apos;m the banking and AI PM. I&apos;m making business banking
            seamless and building proactive and programmatic spend insights so
            founders and their AI agents know what&apos;s financially significant
            without doing the analysis themselves.
          </p>

          <p className="home-blurb">
            You can follow me on{" "}
            <a href="https://x.com/ARishi_" target="_blank" rel="noopener noreferrer">
              X
            </a>
            ,{" "}
            <a href="https://linkedin.com/in/rishiathanikar" target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
            , and{" "}
            <a href="https://github.com/rishia" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
            .
          </p>

          <ul className="home-link-row" aria-label="Homepage links">
            {homeLinks.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </Container>
  );
}
