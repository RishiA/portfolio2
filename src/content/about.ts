export interface AboutTextSegment {
  text: string;
  href?: string;
}

export type AboutParagraph = AboutTextSegment[];

export interface AboutContent {
  title: string;
  headline: string;
  paragraphs: AboutParagraph[];
}

export interface PublicLink {
  id: "linkedin" | "github" | "x";
  label: string;
  href: string;
}

export const aboutContent: AboutContent = {
  title: "About",
  headline: "Shipping products where getting it wrong has actual consequences.",
  paragraphs: [
    [
      {
        text:
          "I'm a product manager who keeps ending up where money, software, and regulation intersect — which, it turns out, is where most of the interesting problems live. At Rho, I own payments infrastructure and the data platform underneath the banking product. The current project: making financial data queryable and trustworthy enough that AI agents can operate on it the same way a CFO would. (The bar for “trustworthy enough” is higher than you'd think.)"
      }
    ],
    [
      { text: "I'm also the kind of PM who " },
      { text: "ships code", href: "https://github.com/rishi-rho" },
      {
        text:
          ". At Rho I'm building the public API and developer CLI, and the internal tools and workflows I've shipped are used daily across product, design, finops, and GTM. I'm as comfortable opening PRs in the production codebase as I am writing a product spec — not because PMs need to code (they don't), but because I learn by building, and the fastest way to understand a system is to build something with it."
      }
    ],
    [
      {
        text:
          "Before Rho I spent a decade in fintech and consumer tech. At Justworks I built the ML underwriting model and a compliance system that auto-files across 50 state jurisdictions — the kind of system where “move fast and break things” means “accidentally misfile a regulatory response in Ohio.” At Stash I migrated 92% of active accounts off a legacy banking provider with zero downtime and zero lost funds. At Casper I shipped retail POS across 72 stores and led connected hardware through beta. At Peet's I launched their first mobile loyalty apps from scratch. I started at Wunderman Thompson, spending six years building digital products for Microsoft, P&G, and AT&T."
      }
    ],
    [
      {
        text:
          "I also co-founded Beander, a two-sided marketplace connecting green coffee importers with small-batch roasters. We bootstrapped it to profitability and exited in 2016. It remains the best education in product I've had."
      }
    ],
    [
      {
        text:
          "I have a Master's in Information Systems from the University of Cincinnati and a B.S. in Computer Science from the University of Mumbai. I live in New York."
      }
    ]
  ]
};

export const publicLinks: readonly PublicLink[] = [
  { id: "linkedin", label: "LinkedIn", href: "https://linkedin.com/in/rishiathanikar" },
  { id: "github", label: "GitHub", href: "https://github.com/rishia" },
  { id: "x", label: "X (Twitter)", href: "https://x.com/ARishi_" }
];
