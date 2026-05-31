import Link from "next/link";
import { Container } from "@/components/container";
import { PlaygroundCard } from "@/components/playground-card";
import { Section } from "@/components/section";
import { pageMetadata } from "@/lib/seo/page-metadata";
import { playgroundItems } from "@/content/playground";

export const metadata = pageMetadata({
  title: "Playground",
  description:
    "Side projects and experiments from Rishi Athanikar in product, AI, and software design.",
  path: "/playground"
});

interface PlaygroundPageProps {
  searchParams?: Promise<{ status?: "live" | "wip" | "archived" }>;
}

export default async function PlaygroundPage({ searchParams }: PlaygroundPageProps) {
  const params = (await searchParams) ?? {};
  const selectedStatus = params.status || "all";

  const statuses = ["live", "wip", "archived"] as const;

  const filtered = playgroundItems.filter((item) => (selectedStatus === "all" ? true : item.status === selectedStatus));

  return (
    <Container>
      <Section title="Playground" subtitle="Prototypes and side projects I'm tinkering with.">
        <div className="filter-row">
          <Link className={`filter-chip ${selectedStatus === "all" ? "is-active" : ""}`} href="/playground">
            All
          </Link>
          {statuses.map((status) => (
            <Link
              key={status}
              className={`filter-chip ${selectedStatus === status ? "is-active" : ""}`}
              href={`/playground?status=${status}`}
            >
              {status.toUpperCase()}
            </Link>
          ))}
        </div>
        <div className="grid cols-3">
          {filtered.map((item) => (
            <PlaygroundCard key={item.slug} item={item} />
          ))}
        </div>
      </Section>
    </Container>
  );
}
