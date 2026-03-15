import type { WorkItem } from "@/types/content";

export const workItems: WorkItem[] = [
  {
    slug: "rho",
    title: "Rho",
    organization: "Rho",
    roleTitle: "Senior Product Manager",
    role: "Senior Product Manager",
    period: "present",
    periodLabel: "Present",
    location: "New York, NY",
    summary:
      "I own realtime payments and the data infrastructure underneath Rho's banking platform. Current focus: making financial data queryable and trustworthy enough that AI agents can rely on it the same way a CFO would.",
    highlights: [
      "Building payment and treasury APIs for programmatic money movement, approval policies, and realtime reconciliation.",
      "Designing AI-driven automations for invoice matching, vendor payments, and expense routing — auditable by default.",
      "Defining the data platform layer that other product teams build on for reporting, controls, and integrations."
    ],
    impactPoints: ["Early-stage role (started January 2026) — shipping in progress."],
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
      "I owned underwriting, compliance, and pricing. Shipped an ML model that automated 85% of manual underwriting reviews and a compliance system that files across 50 states with a 99%+ on-time rate.",
    highlights: [
      "Shipped an ML underwriting model with human-in-the-loop review — 92% decision accuracy, 85% less manual effort.",
      "Built risk-diversification logic across regulated entities and integrated KYB verification into onboarding.",
      "Built compliance automation that files jurisdiction-specific regulatory responses across all 50 states — 99%+ on-time rate, ~90% less ops overhead.",
      "Led internal AI adoption from prototype to production; launched justworks.com/llms.txt."
    ],
    impactPoints: [
      "92% underwriting accuracy with 85% less manual review.",
      ">99% compliance rate, ~90% less operational overhead.",
      "$5M in new revenue from pricing and compliance platform upgrades."
    ],
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
      "I led the migration of 92% of active accounts off a legacy BaaS provider — zero downtime, zero lost funds. Also shipped Reg E dispute workflows that cut resolution time from 14 days to 3.",
    highlights: [
      "Migrated 92% of active accounts off a legacy BaaS provider to an in-house platform — zero downtime, zero lost funds.",
      "Shipped in-app Reg E dispute workflows connected to ops tooling. Resolution time dropped from 14 days to 3.",
      "Redesigned direct-deposit setup — monthly deposits up 7%, related support contacts down 95%.",
      "Rebuilt onboarding and first-deposit flow. Conversion up 14%, average first deposit up 150%."
    ],
    impactPoints: [
      "Dispute-related support calls dropped 60%; resolution time improved from 14 days to 3.",
      "Monthly direct deposits increased 7%; related support contacts decreased 95%.",
      "Onboarding conversion rose 14%; average first deposit increased 150% ($43)."
    ],
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
      "I shipped Casper's retail POS system across 72 stores and led connected hardware prototypes through beta.",
    highlights: [
      "Rolled out a custom POS platform with Adyen across 72 retail stores, adopted by 450+ employees in the first week.",
      "Integrated Affirm financing into in-store checkout, generating $4M in incremental revenue in 2020.",
      "Led a connected hardware product through beta — hardware, firmware, and mobile app across separate engineering teams."
    ],
    impactPoints: [
      "$4M in incremental retail revenue from in-store financing in 2020.",
      "72-store POS rollout adopted by 450+ retail employees in week one."
    ],
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
      "I launched Peet's first mobile loyalty apps, rebuilt peets.com, and migrated 1.5M accounts to a unified identity platform.",
    highlights: [
      "Shipped iOS and Android loyalty apps from scratch — payments, ordering, rewards — reaching 300K monthly active users and $20M in mobile payment volume within three months.",
      "Led the peets.com redesign across the purchase funnel and subscription flow, improving web conversion 12% and beating the annual subscription target by $800K.",
      "Delivered an enterprise identity-platform migration to unify login across 1.5M user accounts."
    ],
    impactPoints: [
      "300K MAU and $20M in mobile payment volume within three months of launch.",
      "Web conversion up 12%; monthly subscriptions up 10%, beating annual target by $800K.",
      "1.5M accounts migrated to a unified authentication experience."
    ],
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
      "I co-founded a marketplace that made it easy for independent roasters to discover and buy specialty green coffee in the quantities they actually needed.",
    highlights: [
      "Built the product end-to-end: catalog, search, ordering mechanics, and the operational tooling to fulfill mixed-origin small-batch orders.",
      "Signed three major US green coffee importers, giving roasters access to over 150 varietals from 15 countries.",
      "Onboarded 100+ small-batch roasters, bootstrapped to profitability, and exited in 2016."
    ],
    impactPoints: [
      "3 major importer partners, 150+ varietals from 15 countries.",
      "100+ roasters onboarded.",
      "Bootstrapped to profitability and exited in 2016."
    ],
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
      "Six years shipping digital products for Microsoft, P&G, AT&T, and BECU — from campaign launches and CMS architecture to full-scale platform redesigns.",
    highlights: [
      "Led launch-track work for Microsoft's HoloLens campaign site and SDK signup experience, and shipped features on Xbox.com.",
      "Redesigned BECU's digital banking experience, working within the regulatory and accessibility constraints of financial services.",
      "Architected CMS infrastructure and multi-market rollout programs for AT&T.",
      "Built P&G's first brand Facebook page and grew it to over 10M followers; shipped consumer activation campaigns for J.M. Smucker and other CPG brands."
    ],
    impactPoints: [
      "P&G brand page grew from launch to 10M+ followers.",
      "Delivered multi-market releases across enterprise and consumer programs."
    ],
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
