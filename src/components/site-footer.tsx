import { Container } from "@/components/container";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <Container className="site-footer-inner">
        <p>© {new Date().getFullYear()} Rishi Athanikar</p>
      </Container>
    </footer>
  );
}
