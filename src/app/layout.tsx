import type { Metadata } from "next";
import { Crimson_Pro, Manrope, Shadows_Into_Light } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ThemeProvider } from "@/lib/theme/theme-provider";
import "@/app/globals.css";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const crimsonPro = Crimson_Pro({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
  variable: "--font-head"
});
const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-body"
});
const shadowsIntoLight = Shadows_Into_Light({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
  variable: "--font-script"
});

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Rishi Athanikar",
    template: "%s | Rishi Athanikar"
  },
  description:
    "Rishi Athanikar is a product manager in New York who builds for complex, regulated systems. Work history, writing, and side projects.",
  openGraph: {
    type: "website",
    siteName: "Rishi Athanikar",
    title: "Rishi Athanikar",
    description: "Product manager in New York. Work history, writing, and side projects.",
    url: baseUrl,
    images: [
      {
        url: "/images/rishi_sketch.webp",
        width: 900,
        height: 900,
        alt: "Rishi Athanikar"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Rishi Athanikar",
    description: "Product manager in New York. Work history, writing, and side projects."
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${crimsonPro.variable} ${manrope.variable} ${shadowsIntoLight.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <div className="site-shell">
            <a href="#main-content" className="skip-link">Skip to main content</a>
            <SiteHeader />
            <main id="main-content">{children}</main>
            <SiteFooter />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
