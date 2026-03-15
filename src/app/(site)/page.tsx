import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/container";
import type { HomeLink } from "@/types/content";

const homeLinks: HomeLink[] = [
  { label: "Work", href: "/work" },
  { label: "About", href: "/about" },
  { label: "Notes", href: "/notes" },
  { label: "Blog", href: "/blog" }
];

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
            I&apos;m a product leader who&apos;s spent over a decade in complex,
            regulated spaces. I love shipping simple solutions that resonate with
            users and work for the business. Currently, I&apos;m a Senior Product
            Manager at{" "}
            <a href="https://rho.co" target="_blank" rel="noopener noreferrer">
              Rho
            </a>
            , rebuilding the banking platform for an agent-first world.
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
