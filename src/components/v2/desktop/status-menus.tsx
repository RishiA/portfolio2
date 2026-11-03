// Adapted from github.com/alanagoyal/alanagoyal, Copyright (c) 2024 Alana Goyal, MIT License.
import { Battery, Wifi } from "lucide-react";

const statusIconClass = "flex items-center justify-center w-7 h-5 rounded";

/** Cosmetic battery icon. It reports nothing and has no menu. */
export function BatteryStatus() {
  return (
    <div aria-hidden className={statusIconClass}>
      <Battery className="h-4 w-5 text-black dark:text-white" strokeWidth={1.75} />
    </div>
  );
}

/** Cosmetic Wi-Fi icon. It reports nothing and has no menu. */
export function WifiStatus() {
  return (
    <div aria-hidden className={statusIconClass}>
      <Wifi className="w-4 h-4 text-black dark:text-white" strokeWidth={1.75} />
    </div>
  );
}
