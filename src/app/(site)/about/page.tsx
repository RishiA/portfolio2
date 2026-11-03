import { Container } from "@/components/container";
import { Section } from "@/components/section";
import { aboutContent } from "@/content/about";
import { pageMetadata } from "@/lib/seo/page-metadata";

export const metadata = pageMetadata({
  title: "About",
  description:
    "About Rishi Athanikar, a product manager in New York shipping in fintech, banking, and regulated AI software.",
  path: "/about"
});

export default function AboutPage() {
  return (
    <Container>
      <Section title={aboutContent.title} subtitle={aboutContent.headline}>
        <div className="prose">
          {aboutContent.paragraphs.map((segments, index) => (
            <p key={index}>
              {segments.map((segment, segmentIndex) =>
                segment.href ? (
                  <a key={segmentIndex} href={segment.href} target="_blank" rel="noopener noreferrer">
                    {segment.text}
                  </a>
                ) : (
                  segment.text
                )
              )}
            </p>
          ))}
        </div>
      </Section>
    </Container>
  );
}
