import { Container } from "@/components/container";
import { Section } from "@/components/section";
import { WorkTimeline } from "@/components/work-timeline";
import { workItems } from "@/content/work";
import { pageMetadata } from "@/lib/seo/page-metadata";

export const metadata = pageMetadata({
  title: "Proof of Work",
  description:
    "Selected work from Rishi Athanikar across product roles at Rho, Justworks, Stash, Casper, Peet's, Beander, and Wunderman Thompson.",
  path: "/work"
});

const sortedAllWork = [...workItems].sort((a, b) => a.sortOrder - b.sortOrder);

export default function WorkPage() {
  return (
    <Container>
      <Section title="Proof of Work" subtitle="What I've shipped, company by company.">
        <WorkTimeline items={sortedAllWork} />
      </Section>
    </Container>
  );
}
