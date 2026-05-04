import { Container } from "@/components/container";
import { Section } from "@/components/section";
import { WorkTimeline } from "@/components/work-timeline";
import { workItems } from "@/content/work";

export const metadata = {
  title: "Proof of Work"
};

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
