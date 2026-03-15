import { notFound } from "next/navigation";
import { Container } from "@/components/container";
import { Section } from "@/components/section";
import { Tag } from "@/components/tag";
import { workItems } from "@/content/work";

interface WorkDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return workItems.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: WorkDetailPageProps) {
  const { slug } = await params;
  const item = workItems.find((entry) => entry.slug === slug);

  if (!item) {
    return { title: "Work" };
  }

  return {
    title: item.organization,
    description: item.summary,
    openGraph: {
      type: "profile" as const,
      title: item.organization,
      description: item.summary
    }
  };
}

export default async function WorkDetailPage({ params }: WorkDetailPageProps) {
  const { slug } = await params;
  const item = workItems.find((entry) => entry.slug === slug);

  if (!item) {
    notFound();
  }

  return (
    <Container>
      <Section
        title={item.organization}
        subtitle={`${item.roleTitle} · ${item.periodLabel}${item.location ? ` · ${item.location}` : ""}`}
      >
        <div className="prose">
          <p>{item.summary}</p>

          {item.impactPoints?.length ? (
            <>
              <h3>Impact</h3>
              <ul>
                {item.impactPoints.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </>
          ) : null}

          <h3>Highlights</h3>
          <ul>
            {item.highlights.map((highlight) => (
              <li key={highlight}>{highlight}</li>
            ))}
          </ul>

          {item.toolsOrDomains?.length ? (
            <>
              <h3>Domains</h3>
              <ul>
                {item.toolsOrDomains.map((domain) => (
                  <li key={domain}>{domain}</li>
                ))}
              </ul>
            </>
          ) : null}

          {item.artifacts?.length ? (
            <>
              <h3>Artifacts</h3>
              <ul>
                {item.artifacts.map((artifact) => (
                  <li key={artifact.url}>
                    <a href={artifact.url} target="_blank" rel="noopener noreferrer">
                      {artifact.label} ({artifact.type}) ↗
                    </a>
                  </li>
                ))}
              </ul>
            </>
          ) : null}

          <div className="tag-row">
            {item.tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </div>
        </div>
      </Section>
    </Container>
  );
}
