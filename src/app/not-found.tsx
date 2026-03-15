import Link from "next/link";
import { Container } from "@/components/container";
import { Section } from "@/components/section";

export default function NotFound() {
  return (
    <Container>
      <Section title="Not found" subtitle="This page does not exist.">
        <p>
          <Link href="/">Go back home →</Link>
        </p>
      </Section>
    </Container>
  );
}
