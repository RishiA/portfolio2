// Adapted from github.com/alanagoyal/alanagoyal, Copyright (c) 2024 Alana Goyal, MIT License.
import { getAppById } from "./app-config";

const DEFAULT_MOBILE_FALLBACK_APP_ID = "notes";

export function isAppSupportedOnMobile(appId: string): boolean {
  return getAppById(appId)?.mobile.supported === true;
}

export function getMobileShellFallbackAppId(appId: string): string {
  const app = getAppById(appId);
  if (!app) return DEFAULT_MOBILE_FALLBACK_APP_ID;
  if (app.mobile.supported) return appId;
  return app.mobile.shellFallbackAppId;
}
