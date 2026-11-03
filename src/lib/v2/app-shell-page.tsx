"use client";
// Adapted from github.com/alanagoyal/alanagoyal, Copyright (c) 2024 Alana Goyal, MIT License.

import { Desktop } from "@/components/v2/desktop/desktop";
import { MobileShell } from "@/components/v2/desktop/mobile-shell";
import { SystemSettingsProvider } from "@/lib/v2/system-settings-context";
import { SHELL_DEFAULT_APP_ID } from "@/lib/v2/shell-routing";
import { useShellIsMobile } from "@/lib/v2/use-shell-is-mobile";
import { ShellBootProvider } from "@/lib/v2/shell-boot-context";

interface AppShellPageProps {
  appId?: string;
  initialNoteSlug?: string;
}

/** Renders the desktop shell, or one full-screen app on phones. Every /v2 route renders this. */
export function AppShellPage({ appId, initialNoteSlug }: AppShellPageProps) {
  const isMobile = useShellIsMobile();

  if (isMobile === null) return null;

  return (
    <ShellBootProvider value={{ initialNoteSlug }}>
      <SystemSettingsProvider>
        {isMobile ? (
          <MobileShell initialApp={appId || SHELL_DEFAULT_APP_ID} />
        ) : (
          <Desktop initialAppId={appId} initialNoteSlug={initialNoteSlug} />
        )}
      </SystemSettingsProvider>
    </ShellBootProvider>
  );
}
