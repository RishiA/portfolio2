// Adapted from github.com/alanagoyal/alanagoyal, Copyright (c) 2024 Alana Goyal, MIT License.
/**
 * Update the browser URL bar without triggering Next.js App Router re-renders.
 *
 * The App Router patches pushState/replaceState. Unless the state includes
 * `__NA: true`, every call dispatches a router restore action that re-renders
 * the route tree (visible as a flash). Next 15.5 honors `__NA` the same way as
 * Next 16 (see client/components/app-router.js).
 */
export const APP_SHELL_URL_CHANGE_EVENT = "app-shell-url-change";

function dispatchUrlChangeEvent() {
  window.dispatchEvent(new Event(APP_SHELL_URL_CHANGE_EVENT));
}

export function setUrl(url: string) {
  window.history.replaceState({ __NA: true }, "", url);
  dispatchUrlChangeEvent();
}
