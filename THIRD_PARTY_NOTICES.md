# Third-party notices

## alanagoyal/alanagoyal

The v2 desktop shell (`/v2`) is adapted from the source of alanagoyal.com, published at
https://github.com/alanagoyal/alanagoyal under the MIT License. Each adapted file starts with the comment
`// Adapted from github.com/alanagoyal/alanagoyal, Copyright (c) 2024 Alana Goyal, MIT License.`

The code was stripped to the desktop, windows, Dock, menu bar and mobile shell, and changed to run on this
site (Next 15, React 19, `/v2` routes, five apps plus Trash, original icons). The Notes app (`src/components/v2/apps/notes`) follows her
Notes sidebar, reading pane, mobile list and note screens and note typography, made read-only and fed by this
site's content instead of Supabase.

### Adapted files

- `src/app/v2/tailwind.css`
- `src/components/v2/apps/notes/collapsible-section.tsx`
- `src/components/v2/apps/notes/desktop-presenter.tsx`
- `src/components/v2/apps/notes/index.tsx`
- `src/components/v2/apps/notes/mobile-presenter.tsx`
- `src/components/v2/apps/notes/nav.tsx`
- `src/components/v2/apps/notes/note-header.tsx`
- `src/components/v2/apps/notes/note-item.tsx`
- `src/components/v2/apps/notes/note-view.tsx`
- `src/components/v2/apps/notes/notes.css`
- `src/components/v2/apps/notes/scroll-area.tsx`
- `src/components/v2/apps/notes/search-bar.tsx`
- `src/components/v2/apps/notes/sidebar.tsx`
- `src/components/v2/apps/terminal/Terminal.tsx`
- `src/components/v2/apps/terminal/index.tsx`
- `src/components/v2/desktop/about-dialog.tsx`
- `src/components/v2/desktop/app-menu.tsx`
- `src/components/v2/desktop/app-placeholder.tsx`
- `src/components/v2/desktop/desktop.tsx`
- `src/components/v2/desktop/dock.tsx`
- `src/components/v2/desktop/menu-bar.tsx`
- `src/components/v2/desktop/mobile-shell.tsx`
- `src/components/v2/desktop/site-menu.tsx`
- `src/components/v2/desktop/status-menus.tsx`
- `src/components/v2/desktop/window-controls.tsx`
- `src/components/v2/desktop/window-nav-shell.tsx`
- `src/components/v2/desktop/window.tsx`
- `src/components/v2/ui/context-menu.tsx`
- `src/lib/v2/app-availability.ts`
- `src/lib/v2/app-config.ts`
- `src/lib/v2/app-shell-page.tsx`
- `src/lib/v2/device-detection.ts`
- `src/lib/v2/dock-preferences.ts`
- `src/lib/v2/dock-thumbnails.ts`
- `src/lib/v2/menu-bar-clock.ts`
- `src/lib/v2/notes/groups.ts`
- `src/lib/v2/notes/search.ts`
- `src/lib/v2/set-url.ts`
- `src/lib/v2/shell-routing.ts`
- `src/lib/v2/system-settings-context.tsx`
- `src/lib/v2/types.ts`
- `src/lib/v2/use-click-outside.ts`
- `src/lib/v2/use-shell-is-mobile.ts`
- `src/lib/v2/use-window-behavior.ts`
- `src/lib/v2/use-window-nav-behavior.ts`
- `src/lib/v2/utils.ts`
- `src/lib/v2/window-context.tsx`
- `src/lib/v2/window-focus-context.tsx`
- `src/lib/v2/window-state-storage.ts`
- `src/components/v2/apps/photos/header.tsx`
- `src/components/v2/apps/photos/index.tsx`
- `src/components/v2/apps/photos/nav.tsx`
- `src/components/v2/apps/photos/photo-viewer.tsx`
- `src/components/v2/apps/photos/photos-grid.tsx`
- `src/components/v2/apps/photos/sidebar.tsx`
- `src/lib/v2/photos/favorites.ts`
- `src/lib/v2/photos/grid-size.ts`
- `src/lib/v2/photos/photo-metadata.ts`
- `src/lib/v2/photos/photo-transition.ts`
- `src/lib/v2/photos/time-groups.ts`
- `src/lib/v2/photos/types.ts`
- `src/lib/v2/photos/use-photos.ts`
- `src/lib/v2/photos/wheel-navigation.ts`
- `tailwind.config.ts`

### License

MIT License

Copyright (c) 2024 Alana Goyal

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
