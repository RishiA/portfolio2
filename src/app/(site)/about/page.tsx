import { Container } from "@/components/container";
import { Section } from "@/components/section";

export const metadata = {
  title: "About"
};

export default function AboutPage() {
  return (
    <Container>
      <Section title="About" subtitle="Shipping products in industries where getting it wrong has consequences.">
        <div className="prose">
          <p>
            I&apos;m a Senior Product Manager at Rho, where I own realtime payments and the
            data infrastructure underneath our banking platform. The current project:
            making Rho&apos;s financial data queryable and trustworthy enough that AI agents
            can rely on it the same way a CFO would. Before Rho, I spent a decade in
            fintech, retail, and e-commerce &mdash; mostly in regulated industries where
            shipping the wrong thing has actual consequences.
          </p>
          <p>
            At Justworks I shipped an ML underwriting model that automated 85% of
            manual reviews and built a compliance automation system that files regulatory
            responses across 50 states with a 99%+ on-time rate. At Stash I built Reg E
            dispute workflows that cut resolution time from 14 days to 3 and led the
            migration of 92% of active accounts off a legacy BaaS provider &mdash; zero
            downtime, zero lost funds. At Casper I shipped a retail POS system across 72
            stores and led connected hardware prototypes through beta. At Peet&apos;s I
            launched their first mobile loyalty apps and rebuilt the e-commerce platform.
            I started at Wunderman Thompson, spending six years building web and mobile
            products for clients like Microsoft, P&amp;G, AT&amp;T, and BECU.
          </p>
          <p>
            I care about the details that compound &mdash; the edge case that breaks trust,
            the workflow that saves someone twenty minutes a day, the API contract that
            has to survive the next three integrations. I default to building systems
            that scale rather than processes that require more people every quarter.
          </p>
          <p>
            Outside of work, I co-founded Beander, a marketplace for specialty coffee
            sourcing, and bootstrapped it to profitability. This site is built with
            Next.js and Sanity &mdash; I like building things myself when I can.
          </p>
          <p>
            I have a Master&apos;s in Information Systems from the University of Cincinnati
            and a B.S. in Computer Science from the University of Mumbai. I live in
            New York.
          </p>
        </div>
      </Section>
    </Container>
  );
}
