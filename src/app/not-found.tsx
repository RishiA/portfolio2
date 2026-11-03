import Link from "next/link";
import { Container } from "@/components/container";
import { Section } from "@/components/section";
import { SiteShell } from "@/components/site-shell";

export default function NotFound() {
  return (
    <SiteShell>
      <Container>
        <Section title="Not found" subtitle="This page does not exist.">
          <p>
            <Link href="/">Go back home →</Link>
          </p>
        </Section>
      </Container>
    </SiteShell>
  );
}
