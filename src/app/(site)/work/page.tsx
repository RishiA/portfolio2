import Link from "next/link";
import { Container } from "@/components/container";
import { Section } from "@/components/section";
import { WorkCard } from "@/components/work-card";
import { workItems } from "@/content/work";

export const metadata = {
  title: "Proof of Work"
};

const allTags = Array.from(new Set(workItems.flatMap((item) => item.tags))).sort();
const allPeriods = Array.from(new Set(workItems.map((item) => item.periodLabel)));

interface WorkPageProps {
  searchParams?: Promise<{ tag?: string; period?: string }>;
}

export default async function WorkPage({ searchParams }: WorkPageProps) {
  const params = (await searchParams) ?? {};
  const currentTag = params.tag || "all";
  const currentPeriod = params.period || "all";

  const filtered = workItems
    .filter((item) => (currentTag === "all" ? true : item.tags.includes(currentTag)))
    .filter((item) => (currentPeriod === "all" ? true : item.periodLabel === currentPeriod))
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <Container>
      <Section
        title="Proof of Work"
        subtitle="What I've shipped, company by company."
      >
        <div className="section-header">
          <p>Filter by domain</p>
          <div className="filter-row">
            <Link className={`filter-chip ${currentTag === "all" ? "is-active" : ""}`} href="/work">
              All
            </Link>
            {allTags.map((tag) => (
              <Link
                key={tag}
                className={`filter-chip ${currentTag === tag ? "is-active" : ""}`}
                href={`/work?tag=${tag}${
                  currentPeriod !== "all" ? `&period=${encodeURIComponent(currentPeriod)}` : ""
                }`}
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>

        <div className="section-header">
          <p>Filter by period</p>
          <div className="filter-row">
            <Link className={`filter-chip ${currentPeriod === "all" ? "is-active" : ""}`} href={`/work${
              currentTag !== "all" ? `?tag=${currentTag}` : ""
            }`}>
              All
            </Link>
            {allPeriods.map((period) => (
              <Link
                key={period}
                className={`filter-chip ${currentPeriod === period ? "is-active" : ""}`}
                href={`/work?period=${encodeURIComponent(period)}${
                  currentTag !== "all" ? `&tag=${currentTag}` : ""
                }`}
              >
                {period}
              </Link>
            ))}
          </div>
        </div>

        <div className="work-list">
          {filtered.map((item) => (
            <WorkCard key={item.slug} item={item} />
          ))}
        </div>
      </Section>
    </Container>
  );
}
