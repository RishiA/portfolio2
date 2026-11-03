import type { Metadata, Viewport } from "next";
import { Terminal } from "@/components/v2/terminal/Terminal";
import "./terminal.css";

export const metadata: Metadata = {
  title: "Terminal",
  description: "Browse Rishi Athanikar's work with slash commands."
};

// Keeps the input visible above the on-screen keyboard on mobile.
export const viewport: Viewport = {
  interactiveWidget: "resizes-content"
};

export default function TerminalPage() {
  return <Terminal />;
}
