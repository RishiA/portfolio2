"use client";
// Adapted from github.com/alanagoyal/alanagoyal, Copyright (c) 2024 Alana Goyal, MIT License.

import { useEffect, useState } from "react";
import { APP_SHELL_URL_CHANGE_EVENT, setUrl } from "@/lib/v2/set-url";
import { getShellAppIdForContext, parseShellLocation, SHELL_DEFAULT_APP_ID } from "@/lib/v2/shell-routing";
import { getAppById } from "@/lib/v2/app-config";
import { AppPlaceholder } from "./app-placeholder";

interface MobileShellProps {
  initialApp?: string;
}

export function MobileShell({ initialApp }: MobileShellProps) {
  const [activeAppId, setActiveAppId] = useState<string>(
    getShellAppIdForContext(initialApp || SHELL_DEFAULT_APP_ID, "mobile")
  );

  // Sync the active app from the URL on hydration and navigation.
  useEffect(() => {
    const syncFromLocation = () => {
      const path = window.location.pathname;
      const { normalizedPathname, appId } = parseShellLocation(path, {
        fallbackAppId: initialApp || SHELL_DEFAULT_APP_ID,
        context: "mobile"
      });

      if (path !== normalizedPathname) {
        setUrl(normalizedPathname);
      }

      setActiveAppId(appId);
    };

    syncFromLocation();

    window.addEventListener("popstate", syncFromLocation);
    window.addEventListener(APP_SHELL_URL_CHANGE_EVENT, syncFromLocation);

    return () => {
      window.removeEventListener("popstate", syncFromLocation);
      window.removeEventListener(APP_SHELL_URL_CHANGE_EVENT, syncFromLocation);
    };
  }, [initialApp]);

  const app = getAppById(activeAppId);

  return (
    <div className="h-dvh flex flex-col bg-background">
      {app && <AppPlaceholder key={app.id} name={app.name} isMobile />}
    </div>
  );
}
