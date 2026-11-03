export type SettingsCategory = "appearance" | "wallpaper" | "desktop-dock" | "menu-bar";

const SETTINGS_NAVIGATE_EVENT = "v2:settings-navigate";

let pendingCategory: SettingsCategory | null = null;

/** Asks Settings to show a category. Works whether or not the Settings window is mounted yet. */
export function requestSettingsCategory(category: SettingsCategory) {
  pendingCategory = category;
  window.dispatchEvent(new CustomEvent<SettingsCategory>(SETTINGS_NAVIGATE_EVENT, { detail: category }));
}

/** Returns the category requested before Settings mounted, once. */
export function consumePendingSettingsCategory(): SettingsCategory | null {
  const category = pendingCategory;
  pendingCategory = null;
  return category;
}

/** Subscribes to requests made while Settings is mounted. */
export function onSettingsCategoryRequest(listener: (category: SettingsCategory) => void): () => void {
  const handler = (event: Event) => {
    pendingCategory = null;
    listener((event as CustomEvent<SettingsCategory>).detail);
  };
  window.addEventListener(SETTINGS_NAVIGATE_EVENT, handler);
  return () => window.removeEventListener(SETTINGS_NAVIGATE_EVENT, handler);
}
