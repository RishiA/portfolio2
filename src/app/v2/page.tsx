import { AppShellPage } from "@/lib/v2/app-shell-page";
import { loadNotesBoot } from "@/lib/v2/notes/boot";

export const revalidate = 60;

export default async function V2Page() {
  const boot = await loadNotesBoot();
  return <AppShellPage {...boot} />;
}
