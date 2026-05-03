import { Container } from "@/components/container";
import { Section } from "@/components/section";

export const metadata = {
  title: "About"
};

export default function AboutPage() {
  return (
    <Container>
      <Section title="About" subtitle="Shipping products where getting it wrong has actual consequences.">
        <div className="prose">
          <p>
            I&apos;m a product manager who keeps ending up where money, software,
            and regulation intersect &mdash; which, it turns out, is where most of
            the interesting problems live. At Rho, I own payments infrastructure
            and the data platform underneath the banking product. The current
            project: making financial data queryable and trustworthy enough that
            AI agents can operate on it the same way a CFO would. (The bar
            for &ldquo;trustworthy enough&rdquo; is higher than you&apos;d think.)
          </p>
          <p>
            I&apos;m also the kind of PM who{" "}
            <a href="https://github.com/rishi-rho" target="_blank" rel="noopener noreferrer">
              ships code
            </a>
            . At Rho I&apos;m building the public API and developer CLI, and
            the internal tools and workflows I&apos;ve shipped are used daily
            across product, design, finops, and GTM. I&apos;m as comfortable
            opening PRs in the production codebase as I am writing a product
            spec &mdash; not because PMs need to code (they don&apos;t), but
            because I learn by building, and the fastest way to understand
            a system is to build something with it.
          </p>
          <p>
            Before Rho I spent a decade in fintech and consumer tech. At Justworks
            I built the ML underwriting model and a compliance system that auto-files
            across 50 state jurisdictions &mdash; the kind of system
            where &ldquo;move fast and break things&rdquo;
            means &ldquo;accidentally misfile a regulatory response in
            Ohio.&rdquo; At Stash I migrated 92% of active accounts off a legacy
            banking provider with zero downtime and zero lost funds. At Casper I
            shipped retail POS across 72 stores and led connected hardware through
            beta. At Peet&apos;s I launched their first mobile loyalty apps from
            scratch. I started at Wunderman Thompson, spending six years building
            digital products for Microsoft, P&amp;G, and AT&amp;T.
          </p>
          <p>
            I also co-founded Beander, a two-sided marketplace connecting green
            coffee importers with small-batch roasters. We bootstrapped it to
            profitability and exited in 2016. It remains the best education in
            product I&apos;ve had.
          </p>
          <p>
            I have a Master&apos;s in Information Systems from the University of
            Cincinnati and a B.S. in Computer Science from the University of Mumbai.
            I live in New York.
          </p>
        </div>
      </Section>
    </Container>
  );
}
