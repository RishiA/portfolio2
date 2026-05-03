import type { WorkItem } from "@/types/content";

export const workItems: WorkItem[] = [
  {
    slug: "rho",
    title: "Rho",
    organization: "Rho",
    roleTitle: "Senior Product Manager, Banking & AI",
    role: "Senior Product Manager, Banking & AI",
    period: "present",
    periodLabel: "Present",
    location: "New York, NY",
    summary:
      "Rho is building business banking for founders who'd rather run their company than their banking stack. I'm the banking and AI PM — which means two things: making the core banking experience as seamless as it should have always been, and building the intelligence layer on top so founders know what matters without having to do the analysis themselves.",
    highlights: [
      "Building proactive spend insights that surface what's financially significant — founders see what matters at a glance instead of digging through transaction data to find it.",
      "Developing a public API and developer CLI so technical founders can build their own financial dashboards and automate money movement programmatically.",
      "Owning the core banking experience: payment rails, international transfers, and transaction details — the features that feel invisible when they work and maddening when they don't.",
      "Shipping production code alongside the product work: the internal tools and workflows I've built are used daily across product, design, finops, and GTM."
    ],
    impactPoints: ["Started January 2026 — early innings."],
    evidenceTags: ["self-report:rho", "site-copy:home-about"],
    toolsOrDomains: ["Banking infrastructure", "Payments", "Data platform", "AI"],
    artifacts: [],
    tags: ["product", "banking", "api", "ai"],
    featured: true,
    sortOrder: 1
  },
  {
    slug: "justworks",
    title: "Justworks",
    organization: "Justworks",
    roleTitle: "Senior Product Manager",
    role: "Senior Product Manager",
    period: "2023-2025",
    periodLabel: "2023-2025",
    location: "New York, NY",
    summary:
      "Justworks is a PEO — they run payroll, benefits, and compliance for thousands of small businesses, which means they're also on the hook for all of their regulatory exposure. I owned the systems that decide which businesses to onboard, how to price them, and how to stay on the right side of 50 different state regulators.",
    highlights: [
      "Built an ML-powered underwriting model with human-in-the-loop review that automated 85% of manual decisions at 92% accuracy, enabling risk-based pricing while keeping human judgment on edge cases.",
      "Designed risk diversification across multiple regulated entities, integrating Persona for KYB verification — the due diligence that confirms a business is real before you take on their regulatory exposure. Increased risk-adjusted margins by 8%.",
      "Shipped compliance automation that retrieves structured regulatory data and auto-generates jurisdiction-specific filings across all 50 states. >99% on-time rate, ~90% less ops overhead.",
      "Redesigned financial service infrastructure for tax rate calculation, risk-based premium pricing, and automated compliance workflows — unlocking $5M in new revenue.",
      "Championed AI adoption org-wide: hands-on prototyping with Claude Code, training PMs on AI-assisted workflows, and launching justworks.com/llms.txt."
    ],
    impactPoints: [],
    evidenceTags: ["resume:justworks", "work-page:justworks"],
    toolsOrDomains: ["Underwriting", "Compliance automation", "Pricing", "ML"],
    artifacts: [],
    tags: ["product", "fintech", "risk", "compliance", "ai"],
    featured: true,
    sortOrder: 2
  },
  {
    slug: "stash",
    title: "Stash",
    organization: "Stash",
    roleTitle: "Lead Product Manager",
    role: "Lead Product Manager",
    period: "2021-2023",
    periodLabel: "2021-2023",
    location: "New York, NY",
    summary:
      "Stash had a problem: their entire banking product ran on a third-party BaaS provider that was limiting what they could build and how fast they could move. I led the migration to an in-house platform — the kind of project where \"zero downtime\" and \"zero lost funds\" aren't aspirational goals, they're the only acceptable outcome.",
    highlights: [
      "Migrated 92% of active accounts off the legacy BaaS provider with zero service disruption and zero lost funds, coordinating across engineering, compliance, and operations.",
      "Shipped Reg E-compliant dispute resolution — the federally mandated process for when a customer says \"that charge wasn't me.\" Built the in-app workflow and ops case integration. Resolution time dropped from 14 days to 3; dispute-related support calls dropped 60%.",
      "Launched an optimized direct deposit solution that increased monthly platform deposits by 7% and reduced related support contacts by 95%.",
      "Redesigned onboarding and first-deposit flow, reducing friction in funding source linking. Conversion up 14%, average first deposit up 150%."
    ],
    impactPoints: [],
    evidenceTags: ["resume:stash", "work-page:stash"],
    toolsOrDomains: ["Banking migration", "Disputes", "Growth", "Payments"],
    artifacts: [],
    tags: ["product", "growth", "fintech", "banking"],
    featured: true,
    sortOrder: 3
  },
  {
    slug: "casper",
    title: "Casper",
    organization: "Casper",
    roleTitle: "Senior Product Manager, Retail and Digital Experience",
    role: "Senior Product Manager, Retail and Digital Experience",
    period: "2019-2021",
    periodLabel: "2019-2021",
    location: "New York, NY",
    summary:
      "Casper was expanding from DTC darling to national retail chain, and their stores needed a checkout system that could keep up. I owned the retail POS rollout and led the company's first connected hardware product through beta.",
    highlights: [
      "Shipped a custom POS system with Adyen for payment processing across 72 stores — adopted by 450+ retail employees in the first week, which is about as good as enterprise POS rollouts get.",
      "Integrated Affirm financing into in-store checkout, generating $4M in incremental retail revenue for 2020.",
      "Led 0→1 development for a connected devices (IoT) product, managing hardware, firmware, and mobile app workstreams through successful beta."
    ],
    impactPoints: [],
    evidenceTags: ["resume:casper", "work-page:casper"],
    toolsOrDomains: ["Retail systems", "Payments", "Financing", "Hardware"],
    artifacts: [],
    tags: ["product", "retail", "payments", "iot"],
    featured: false,
    sortOrder: 4
  },
  {
    slug: "peets",
    title: "Peet's Coffee",
    organization: "Peet's Coffee",
    roleTitle: "Product Manager, E-commerce and Mobile",
    role: "Product Manager, E-commerce and Mobile",
    period: "2017-2019",
    periodLabel: "2017-2019",
    location: "San Francisco, CA",
    summary:
      "Peet's had a loyal customer base but no mobile presence and an e-commerce platform that wasn't converting. I built their first mobile loyalty apps from scratch and rebuilt the web purchase funnel.",
    highlights: [
      "Delivered iOS and Android loyalty apps from 0→1 — payments, ordering, rewards — reaching 300K monthly active users and $20M in mobile payment volume within three months of launch.",
      "Led the peets.com redesign across the purchase funnel and subscription flow. Conversion up 12%, monthly subscriptions up 10%, beating the annual revenue target by $800K.",
      "Delivered an enterprise identity management platform migration, unifying login across 1.5M user accounts — the kind of project that sounds straightforward until you're three weeks in."
    ],
    impactPoints: [],
    evidenceTags: ["resume:peets", "work-page:peets"],
    toolsOrDomains: ["Mobile apps", "E-commerce", "Subscriptions", "Identity"],
    artifacts: [],
    tags: ["product", "mobile", "e-commerce", "loyalty"],
    featured: false,
    sortOrder: 5
  },
  {
    slug: "beander",
    title: "Beander",
    organization: "Beander",
    roleTitle: "Technical Cofounder",
    role: "Technical Cofounder",
    period: "2014-2016",
    periodLabel: "2014-2016",
    location: "Seattle, WA",
    summary:
      "Before I got into fintech, I co-founded a marketplace for specialty coffee. Beander connected major US green coffee importers with small-batch roasters who wanted access to great beans but couldn't meet the typical import minimums. We bootstrapped it, made it profitable, and exited in 2016.",
    highlights: [
      "Built the product end-to-end: catalog, search, ordering, and the operational tooling to fulfill mixed-origin small-batch orders.",
      "Signed three major US green coffee importers, giving roasters access to over 150 varietals from 15 countries.",
      "Onboarded 100+ small-batch roasters. Bootstrapped to profitability. This one taught me more about product than any job before or since."
    ],
    impactPoints: [],
    evidenceTags: ["resume:beander", "work-page:beander"],
    toolsOrDomains: ["Marketplace", "E-commerce", "Operations"],
    artifacts: [],
    tags: ["startup", "marketplace", "product"],
    featured: false,
    sortOrder: 6
  },
  {
    slug: "wunderman-possible",
    title: "Wunderman Thompson / POSSIBLE",
    organization: "Wunderman Thompson / POSSIBLE",
    roleTitle: "Associate to Technical Product Analyst",
    role: "Associate to Technical Product Analyst",
    period: "2011-2017",
    periodLabel: "2011-2017",
    location: "Seattle, WA",
    summary:
      "Six years of agency work, building digital products for companies that measure launch-day traffic in the millions. This is where I learned to ship — fast, under constraints, for stakeholders who have opinions.",
    highlights: [
      "Led launch-track work for Microsoft's HoloLens campaign and SDK signup experience; shipped features on Xbox.com.",
      "Redesigned BECU's digital banking experience within the regulatory and accessibility constraints of financial services — my first taste of building in regulated industries.",
      "Architected CMS infrastructure and multi-market rollout programs for AT&T.",
      "Built P&G's first brand Facebook page, grew it to 10M+ followers, and shipped consumer campaigns for J.M. Smucker and other CPG brands."
    ],
    impactPoints: [],
    evidenceTags: ["resume:wunderman", "work-page:wunderman-possible"],
    toolsOrDomains: ["Enterprise web", "Mobile", "CMS", "Consumer"],
    artifacts: [],
    tags: ["agency", "enterprise", "consumer", "product"],
    featured: false,
    sortOrder: 7
  }
];

export const featuredWorkItems = workItems
  .filter((item) => item.featured)
  .sort((a, b) => a.sortOrder - b.sortOrder);
